# Orbit local-AI setup checklist (pending device/model choice)

Do not configure a model until the hardware and intended runtime are known. Orbit currently uses the OpenAI API connector; this checklist is preparation only.

## Before choosing a model

- [ ] Decide where inference should run: on the Android device itself, on a personal computer on the same Wi-Fi network, or on a separate private server.
- [ ] Record device/host OS, processor, RAM, free storage, and GPU/NPU details if available.
- [ ] Decide whether the model must work fully offline or can require the local network.
- [ ] Choose a model only after checking its license, supported runtime, context size, quantization, download size, and memory requirements.
- [ ] Record the exact model name/version and runtime version after installation.
- [ ] Run the runtime's own local test prompt before connecting Orbit.

## Connector details to collect tomorrow

- [ ] Runtime name and version.
- [ ] Exact model identifier and quantization.
- [ ] Local API base URL and supported request format (for example, whether it accepts an OpenAI-compatible chat or Responses-style request).
- [ ] Whether the endpoint is bound to loopback only or reachable on the private LAN.
- [ ] Authentication method, if supported.
- [ ] A short successful test response from the runtime itself.

## Safety and browser constraints

- Do not expose a local model port directly to the public internet or add router port forwarding.
- A hosted Vercel function cannot directly reach a private device on your home network. Browser-to-LAN calls from an HTTPS PWA can also be blocked by mixed-content and CORS rules; do not assume a plain HTTP LAN URL will work from the deployed site.
- Once the device and runtime are known, choose an architecture that keeps the endpoint private and handles browser security correctly. The integration is intentionally pending until that choice is made.
- Keep the OpenAI API key and any local-runtime credentials out of the client bundle and GitHub.
- Test offline behavior, slow responses, model-not-running errors, and switching between cloud/local providers before treating the connector as complete.

## Acceptance checklist

- [ ] Orbit clearly shows which provider is active (cloud or local).
- [ ] The local provider sends a test prompt and receives a response without exposing secrets.
- [ ] A stopped runtime produces a readable error and leaves the chat history intact.
- [ ] The app remains usable when the model is unavailable.
- [ ] No local-model integration is marked complete until it has been tested on the selected hardware.
