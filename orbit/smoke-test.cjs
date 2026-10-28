'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname;
const app = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const build = fs.readFileSync(path.join(root, 'build.cjs'), 'utf8');
const handler = require(path.join(root, 'api', 'chat.js'));

function mockResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(body) { this.body = String(body ?? ''); },
    json() { return JSON.parse(this.body); }
  };
}

test('Orbit inline JavaScript parses and core app views exist', () => {
  const match = app.match(/<script>([\s\S]*?)<\/script>/i);
  assert.ok(match, 'inline app script exists');
  assert.doesNotThrow(() => new vm.Script(match[1], { filename: 'app.html inline script' }));
  for (const id of ['view-home', 'view-tasks', 'view-notes', 'view-chat', 'view-videos', 'view-planner', 'view-settings']) {
    assert.ok(app.includes('id="' + id + '"'), 'missing view ' + id);
  }
  assert.ok(app.includes("orbit-command-center-v1"), 'legacy local-data migration remains present');
  assert.ok(!app.includes('fake-api-key-for-unit-test'), 'no test secret is embedded in the app');
});

test('PWA build keeps navigation fresh online and has an offline shell fallback', () => {
  assert.ok(build.includes("const CACHE='orbit-shell-v3'"), 'service worker cache version is bumped');
  assert.ok(build.includes("if(req.mode==='navigate')"), 'navigation has a dedicated network-first path');
  assert.ok(build.includes('fetch(req)'), 'online navigation uses the network');
  assert.ok(build.includes("caches.match('./')"), 'offline navigation falls back to the cached shell');
});

test('Chat API method, configuration, validation and mocked Responses API success', async () => {
  const oldKey = process.env.OPENAI_API_KEY;
  const oldModel = process.env.OPENAI_MODEL;
  const oldFetch = global.fetch;
  try {
    delete process.env.OPENAI_API_KEY;
    const getRes = mockResponse();
    await handler({ method: 'GET', headers: {} }, getRes);
    assert.equal(getRes.statusCode, 405);
    assert.equal(getRes.headers.allow, 'POST');

    const missingKeyRes = mockResponse();
    await handler({ method: 'POST', headers: {}, body: { messages: [{ role: 'user', content: 'hello' }] } }, missingKeyRes);
    assert.equal(missingKeyRes.statusCode, 503);
    assert.match(missingKeyRes.json().error, /OPENAI_API_KEY/);

    process.env.OPENAI_API_KEY = 'fake-api-key-for-unit-test';
    const invalidRes = mockResponse();
    await handler({ method: 'POST', headers: {}, body: { messages: [] } }, invalidRes);
    assert.equal(invalidRes.statusCode, 400);

    let captured;
    global.fetch = async (url, init) => {
      captured = { url, init, body: JSON.parse(init.body) };
      return { ok: true, status: 200, json: async () => ({ output_text: 'Smoke-test reply' }) };
    };
    delete process.env.OPENAI_MODEL;
    const successRes = mockResponse();
    const longHistory = Array.from({ length: 8 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(2500) }));
    await handler({ method: 'POST', headers: { 'x-forwarded-for': 'smoke-test-ip' }, body: { messages: longHistory } }, successRes);
    assert.equal(successRes.statusCode, 200);
    assert.equal(successRes.json().reply, 'Smoke-test reply');
    assert.equal(captured.url, 'https://api.openai.com/v1/responses');
    assert.equal(captured.init.headers.Authorization, 'Bearer fake-api-key-for-unit-test');
    assert.equal(captured.body.model, 'gpt-6-luna');
    assert.equal(captured.body.store, false);
    assert.ok(captured.body.input.reduce((sum, m) => sum + m.content.length, 0) <= 12000, 'context is trimmed to the configured budget');
    assert.ok(captured.init.signal, 'upstream request has an abort signal');
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldKey;
    if (oldModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = oldModel;
  }
});
