# Orbit — Personal Command Center

Orbit is stored in this subdirectory so it does not replace the existing JEE Life Time app at the repository root.

## Deploy on Vercel
1. Import the repository `jeeprepir-jee/jee-life-time` into Vercel.
2. Set **Root Directory** to `orbit`.
3. Use the default build settings from `vercel.json` (build command: `npm run build`; output directory: `dist`).
4. Deploy.

The build script reconstructs the supplied `Orbit_Vercel_Deploy.zip` package from the numbered Base64 parts and extracts the static PWA into `dist/`.

## Current limits
Orbit is a local-first PWA. Tasks and notes are stored in the browser on the current device. It does not yet provide cross-device sync, reliable background reminders, automatic video transcript retrieval, or a connected ChatGPT/local-model backend. Full Android-device QA is still required.
