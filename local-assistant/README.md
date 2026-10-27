# Optional local AI assistant

This folder adds an optional local Node.js server that serves the Study OS and connects the explainer to a local Ollama model. No API key is needed and prompts are sent to the Ollama service you run.

## Requirements
- Node.js 18 or newer
- [Ollama](https://ollama.com/) installed locally
- A model downloaded in Ollama, for example `ollama pull qwen2.5:3b`

## Run
From the repository root:

```bash
node local-assistant/server.mjs
```

Open http://127.0.0.1:4173. The web app and `/api/explain` run on the same local server. The default model is `qwen2.5:3b`; change it with environment variables:

- macOS/Linux: `OLLAMA_MODEL=your-model node local-assistant/server.mjs`
- PowerShell: `$env:OLLAMA_MODEL="your-model"; node local-assistant/server.mjs`

If Ollama is not running, tasks, schedules, timers, notes, video inbox and offline explanations still work; full local model explanations will show a connection error and the frontend falls back to its built-in explainer.

## Network safety
The server binds to `127.0.0.1` by default and is intended for your own computer. Do not expose it directly to the public internet. The Vercel deployment is a static frontend; this local Ollama service does not run on Vercel.
