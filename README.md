# JEE Life Time — Study OS

A lightweight browser-based preparation workspace for JEE Advanced 2028, JEE Main, AP IPE and AP EAPCET.

## V1 features
- Dashboard with JEE progress
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
This is a static site. Open `index.html` directly, or deploy the repository with GitHub Pages, Netlify or Vercel.

## Important
The question bank contains original practice prompts, not copied copyrighted PYQs. Add/import only resources you have permission to use. Do not commit API keys, passwords, tokens or private credentials. If an external AI provider is added later, keep its key in a server-side environment variable rather than browser code.

## Next production upgrades
Optional future work includes a protected AI backend, accounts/cloud sync, calendar sync, reliable notifications, permitted official resource feeds, and PWA/offline support. The current app is local-first: tasks and notes remain in this browser unless the user exports them. Static frontend code cannot safely hold API secrets or control other installed apps without explicit integrations and permissions.\n\n### Vercel deployment\nImport this GitHub repository into Vercel and select the **Other** framework preset with no build command and `.` as the output directory. A connected Vercel project will normally redeploy after each push to the production branch. Add a `vercel.json` file with clean static rewrites only if needed; no server-side secrets are required for this static version.
