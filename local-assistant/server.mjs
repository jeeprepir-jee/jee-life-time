import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const ollama = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon' };

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-store' });
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}
async function bodyJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 2_000_000) throw new Error('Request too large');
  }
  return JSON.parse(data || '{}');
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (req.method === 'POST' && url.pathname === '/api/explain') {
      let data;
      try { data = await bodyJson(req); } catch (e) { return send(res, 400, { error: e.message || 'Invalid JSON' }); }
      const prompt = String(data.prompt || '').slice(0, 100000);
      if (!prompt.trim()) return send(res, 400, { error:'A prompt is required.' });
      let upstream;
      try {
        upstream = await fetch(ollama.replace(/\/$/, '') + '/api/generate', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ model, prompt, stream:false, options:{ temperature:0.3 } }),
          signal:AbortSignal.timeout(180000)
        });
      } catch (e) {
        return send(res, 503, { error:'Could not reach Ollama. Start Ollama and download a model first.', detail:e.message });
      }
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return send(res, 502, { error:result.error || 'Local AI request failed.' });
      return send(res, 200, { text:result.response || 'The local model returned an empty response.', model });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error:'Method not allowed' });
    let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    if (pathname.includes('..') || pathname.startsWith('/.') || pathname.startsWith('/local-assistant/')) return send(res, 404, { error:'Not found' });
    let file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) return send(res, 404, { error:'Not found' });
    let stat;
    try { stat = await fs.promises.stat(file); if (stat.isDirectory()) file = path.join(file, 'index.html'); }
    catch { return send(res, 404, { error:'Not found' }); }
    let content;
    try { content = await fs.promises.readFile(file); } catch { return send(res, 404, { error:'Not found' }); }
    const ext = path.extname(file).toLowerCase();
    let type = types[ext] || 'application/octet-stream';
    if (path.basename(file) === 'index.html') {
      let html = content.toString('utf8');
      html = html.replace('<script src="ai-engine.js"></script>', '<script>window.JEE_AI_ENDPOINT="/api/explain";</script><script src="ai-engine.js"></script>');
      content = Buffer.from(html);
    }
    res.writeHead(200, { 'Content-Type':type, 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-store' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (e) {
    send(res, 500, { error:'Local assistant server error', detail:e.message });
  }
});
server.listen(port, host, () => {
  console.log('JEE Life Time is running at http://' + host + ':' + port);
  console.log('Local AI endpoint: Ollama model "' + model + '" at ' + ollama);
  console.log('If Ollama is not installed/running, the app still works without AI generation.');
});
