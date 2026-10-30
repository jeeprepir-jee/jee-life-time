# AI Classroom MVP

A tablet-friendly, installable lecture organiser for English/Telugu NSEP study.

## Current MVP
- Lecture intake: paste permitted class notes/transcripts or upload TXT/MD/CSV.
- Local organisation: extracts candidate takeaways, revision prompts and subject keywords.
- Lecture library, revision notes and recall cards.
- Local browser storage, dark mode and offline PWA shell.

## Important limitations
This MVP does not use an AI model yet. Its organiser is a lightweight local text heuristic, not an accurate bilingual summariser. It does not record Google Meet, capture other participants, or transcribe system audio. Recording/transcription must be enabled only with the teacher's permission and with platform/account support. PDF/audio import, cloud AI processing, sign-in, database sync and Hjarni Notes integration remain future milestones.

## Deploy
Open the repository's `ai-classroom/` folder as the Vercel project root (static/Other framework, no build command, output directory `.`). Or serve this folder with any static HTTPS host. On Android Chrome, open the deployed URL and choose Install app / Add to Home screen.

Data is stored in localStorage on this device/browser. Export/backup and cross-device sync are not included in this MVP; do not use a shared/public device for private notes.
