# Reel Intelligence module

This module adds a Reel library to the existing static JEE Life Time PWA without migrating the app to Next.js.

## Current behavior
- `/reels.html` provides a capture form, local library, transcript analysis action, and Notes export into the existing `jeeOS` local state.
- `extension/` contains a Chrome Manifest V3 companion. It observes Instagram's rendered page and only attempts capture when it finds a Reel/post link inside an element that carries a clear outgoing-message marker. Instagram changes its DOM frequently; uncertain messages are ignored. This is best-effort, not a guaranteed Instagram integration.
- `api/reels/capture.js` stores a Reel URL and metadata.
- `api/reels/analyze.js` sends user-provided transcript text to OpenAI, then saves the summary to Supabase `reels` and a corresponding row in `notes`.
- `supabase/reel-analyzer.sql` creates the tables.

## Personal Instagram limitation
The module does not log into Instagram, request an Instagram password, call undocumented private APIs, or download private DM media. A personal account has no general official API that exposes all sent DM shared-Reel video content. Detection depends on the visible page DOM and may stop working if Instagram changes its markup. AI analysis requires a transcript/captions or other text supplied by the user; a Reel URL alone is not treated as video access.

## Setup
1. Run `supabase/reel-analyzer.sql` in the Supabase SQL editor.
2. In Vercel project settings, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose in client code)
   - `OPENAI_API_KEY` (server only)
   - `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)
   - `JEE_REEL_INGEST_TOKEN` (a long random private token shared only with the Reel page and extension)
3. Redeploy the Vercel project. The API routes require Node.js 18+ and the root `package.json` dependency.
4. Open `/reels.html`, enter the deployed app URL and ingest token.
5. Load the unpacked Chrome extension from the repository's `extension/` directory at `chrome://extensions`, enable Developer mode, and configure the same app URL/token in its popup.

## Privacy and security
- Do not put Supabase service-role or OpenAI keys into the extension, HTML, or browser storage.
- The ingest token is a bearer secret. Use a long random value, keep it private, and rotate it if exposed.
- This first implementation uses one private ingest token rather than per-user authentication. Do not deploy it for multiple users as-is.
- Reel links and transcripts may contain personal information. Store only what you intend to keep.
- The browser companion does not read message text or process incoming messages; it only attempts to identify visible outgoing Reel/post links.
- Automatic outgoing-message detection is heuristic and fails closed when it cannot confidently identify the sender.

## Current limitations / next steps
- Add authenticated per-user Supabase sessions and row-level ownership before multi-user release.
- Add an explicit status/health check and retry queue.
- Add optional transcript upload and a supported video-file transcription path, with file-size limits and consent.
- Improve outgoing-message selectors only after testing against the user's actual Instagram UI; never widen collection to all DMs.
