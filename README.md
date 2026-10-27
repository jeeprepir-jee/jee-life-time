# JEE Life Time — Study OS

A lightweight browser-based preparation workspace for JEE Advanced 2028, JEE Main, AP IPE and AP EAPCET.

## V1 features
- Dashboard with JEE progress
- Daily task scheduler with due dates, start times, priority, categories, and completion tracking
- Focus session timer that logs real study minutes, daily study goals, and seven-day subject totals
- JSON backup/restore and CSV study-log export
- Installable, offline-capable PWA shell for Android/desktop browsers
- Daily study tasks and session planner
- PCM progress tracking for JEE/IPE/EAPCET
- Class 11/12-style chapter checklist
- Test score and time logging
- Revision queue
- Formula vault
- Original practice question bank
- Local study coach that creates a plan from available time, energy and weakest subjects
- Notes with local persistence
- 25-minute focus timer
- Responsive mobile layout
- Dark/light mode

- YouTube Video Inbox: save video links, paste transcript/captions or rough notes, split them into takeaways, and convert takeaways into study tasks or revision notes. Caption extraction is intentionally user-driven because YouTube caption access is not reliably available from a static browser app.\n\n## Run / deploy
The hosted frontend is static and can be deployed to Vercel. Import this repository in Vercel, keep the static/Other framework preset, use no build command, and set the output directory to `.`. A Vercel project linked to this GitHub repository normally redeploys after pushes to its production branch.

For local use, open `index.html` in a browser. For offline install support, use the HTTPS Vercel deployment, open it in Chrome on Android, then use the browser menu's **Install app** or **Add to Home screen** action. Local data is stored per browser/device, so use Export backup to move it.

## Optional local AI assistant
A no-dependency Node.js server is included in `local-assistant/`. With Node.js 18+ and Ollama installed, run `node local-assistant/server.mjs` from the repository root and open `http://127.0.0.1:4173`. The server connects the explainer to a local Ollama model without embedding an API key. See `local-assistant/README.md`. This optional local model does not run on Vercel; the deployed site uses the built-in offline explainer unless a secure AI backend is configured.

## Important
The question bank contains original practice prompts, not copied copyrighted PYQs. Add/import only resources you have permission to use. Do not commit API keys, passwords, tokens or private credentials. If an external AI provider is added later, keep its key in a server-side environment variable rather than browser code.

## Remaining integrations
Optional future work includes a protected AI backend, accounts/cloud sync, calendar sync, reliable background notifications, and permitted official resource feeds. The current app is local-first: tasks and notes remain in this browser unless the user exports them. Static frontend code cannot safely hold API secrets or control other installed apps without explicit integrations and permissions.\n\n### Vercel deployment\nImport this GitHub repository into Vercel and select the **Other** framework preset with no build command and `.` as the output directory. A connected Vercel project will normally redeploy after each push to the production branch. Add a `vercel.json` file with clean static rewrites only if needed; no server-side secrets are required for this static version.
