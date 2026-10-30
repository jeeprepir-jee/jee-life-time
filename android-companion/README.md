# AI Classroom Android Companion

Target device confirmed: Samsung Galaxy Tab A7 Lite (SM-T220), Android 12, One UI Core 4.1.

## Purpose
A visible, opt-in companion for the AI Classroom PWA. The first Android milestone is user-started screen sharing through Android's official MediaProjection consent flow.

## Privacy and capture rules
- Screen capture starts only after the Android system consent dialog is accepted.
- A persistent foreground-service notification must remain visible while capture is active.
- The user can stop capture from the app or notification.
- Do not record or transcribe a teacher or classmates without the teacher's permission and applicable school/Meet permissions.
- This first milestone does not capture microphone or internal Meet audio. Earphones mean the tablet microphone cannot reliably hear the teacher.
- Teacher speech should be supplied through an authorised Google Meet transcript/recording or another permitted source.
- No hidden capture, accessibility abuse, or bypass of Android/Meet restrictions.

## Device/build target
- Device: SM-T220
- Android: 12 (API 31)
- Minimum SDK planned: 26
- Compile/target SDK planned: 35
- Build with JDK 17 and Gradle via GitHub Actions; Android Studio is not required on the user's low-RAM laptop.

## Milestones
1. Native Android project and reproducible CI build.
2. Explicit MediaProjection permission, foreground notification, and stop control.
3. Safely export user-approved slide frames to the PWA.
4. Connect authorised lecture transcripts and bilingual AI note generation.
5. Test on the physical SM-T220 before sharing an APK.

## Current status
Planning/specification only. No APK has been built or device-tested yet.
