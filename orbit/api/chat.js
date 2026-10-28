'use strict';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;
const requestsByIp = new Map();

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Use POST to send a chat message.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return send(res, 503, {
      error: 'ChatGPT is not configured yet. Add OPENAI_API_KEY to the Orbit project Environment Variables in Vercel, then redeploy.'
    });
  }

  const now = Date.now();
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : 'unknown').trim().slice(0, 100);
  const entry = requestsByIp.get(ip);
  if (entry && now - entry.start < WINDOW_MS && entry.count >= MAX_REQUESTS) {
    return send(res, 429, { error: 'Too many messages too quickly. Please wait a minute and try again.' });
  }
  if (!entry || now - entry.start >= WINDOW_MS) requestsByIp.set(ip, { start: now, count: 1 });
  else entry.count += 1;

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = null; }
    }
    if (!body || !Array.isArray(body.messages)) {
      return send(res, 400, { error: 'Send a messages array to chat.' });
    }

    const messages = body.messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-16)
      .map(m => ({ role: m.role, content: m.content.trim().slice(0, 4000) }))
      .filter(m => m.content.length > 0);

    if (!messages.length || !messages.some(m => m.role === 'user')) {
      return send(res, 400, { error: 'Type a message before sending.' });
    }

    const model = (process.env.OPENAI_MODEL || 'gpt-6-luna').trim();
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        instructions: 'You are Orbit AI, a helpful assistant inside a personal planning and study app. Be clear, encouraging, and practical. Help with JEE/IPE study planning, explanations, note summaries, and task organisation. Do not claim to have accessed the user’s Orbit tasks, notes, calendar, or videos unless their contents were explicitly included in the chat. Do not claim to create reminders or change app data. For a teen student, support balanced study, sleep, breaks, and safe choices.',
        input: messages,
        max_output_tokens: 900,
        store: false
      }),
      signal: AbortSignal.timeout(45000)
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('OpenAI Responses API returned status', upstream.status);
      if (upstream.status === 401 || upstream.status === 403) {
        return send(res, 502, { error: 'The OpenAI API key was rejected. Check the key in Vercel Environment Variables.' });
      }
      if (upstream.status === 429) {
        return send(res, 429, { error: 'The AI service is temporarily rate-limited or its API quota is unavailable. Check API usage and billing settings.' });
      }
      return send(res, 502, { error: 'The AI service could not complete that request. Please try again shortly.' });
    }

    const reply = typeof result.output_text === 'string' ? result.output_text.trim() : '';
    if (!reply) return send(res, 502, { error: 'The AI service returned no text. Please try again.' });
    return send(res, 200, { reply, model });
  } catch (error) {
    console.error('Orbit chat request failed:', error && error.name ? error.name : 'unknown error');
    return send(res, 502, { error: 'Could not reach the AI service. Check your connection and try again.' });
  }
};
