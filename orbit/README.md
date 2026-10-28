# Orbit — Personal Command Center

Orbit lives in this subdirectory so the existing JEE Life Time app at the repository root remains untouched.

## Build and smoke tests

The project has no runtime npm dependencies. It uses Node's built-in test runner.

```sh
npm test
npm run build
```

The build runs smoke tests first. They parse the app's inline JavaScript, check core views and local-data migration, verify the PWA's online/offline navigation strategy, and exercise the chat API with a mocked OpenAI response. These tests do not make paid API calls and do not replace real Android-device QA.

## Deploy on Vercel

1. Import `jeeprepir-jee/jee-life-time`.
2. Set **Root Directory** to `orbit`.
3. Build command: `npm run build`; output directory: `dist`.
4. Deploy the `main` branch.

## Configure the ChatGPT/OpenAI API connector

1. With a parent/guardian's help, review API billing and usage limits before enabling paid usage. ChatGPT subscription billing and API billing are separate.
2. Create an API key in the OpenAI API platform. Do not paste it into Orbit chat, source code, GitHub, or a browser field.
3. In Vercel → `orbit-personal-command-center` → **Settings → Environment Variables**, add `OPENAI_API_KEY` as an encrypted/sensitive value for **Production**.
4. Optionally add `OPENAI_MODEL` to select a model your API project can access. If omitted, Orbit uses `gpt-6-luna`.
5. Save and redeploy the latest `main` commit so the function receives the new environment variable.
6. Open the live app → **AI assistant** and send a short test message. Confirm a reply arrives. A successful page load alone does not prove the AI connector works.

The API key is read only by the serverless function. The browser stores the chat history locally; messages sent in the AI assistant are sent to the OpenAI API. Orbit does not automatically attach your saved tasks, notes, or video inbox to those requests.

## Current limits

- Tasks, notes and video entries are stored in the current browser/device; there is no cross-device sync.
- Reminders are best-effort and require Orbit to be open; they are not reliable native Android notifications.
- Video captions/transcripts are not fetched automatically.
- Full Android install, offline, storage-quota and notification QA still needs to be performed on the actual device.
- Local AI is not installed or integrated yet. Follow `LOCAL_AI_SETUP.md` after choosing the device and model.
