# Presence

A mobile-first virtual companion. Presence is a calm, ambient app — your
companion is a light in the room you can talk to face-to-face. It's built on
[**Vidu S1** (Vidu Stream)](https://www.vidu.com/vidu-stream), a real-time
interactive video model: a live character that sees you, hears you, and answers
in real time.

This is the **Lumen** design direction — quiet, light-forward, restraint over
immersion — built as a universal Expo app that runs on **iOS, Android, and the
web** from one codebase.

> Design exploration. Not affiliated with Vidu / ShengShu.

## What it does

- **Ambient home** — your companion as a breathing orb; one tap to connect.
- **Live two-way call** — the companion (an ambient orb, or the live AliRTC
  video once you're connected) plus **your own front camera**, because Presence
  is a companion that can see you.
- **Hold to talk** — press to speak, release to listen. Real barge-in.
- **Streaming captions** — the companion's words stream in; your turn is echoed.
- **Shape your companion** — name, persona, one of Vidu's 50+ voices and 28
  languages. Persisted across launches.
- **Honest metering** — a live timer, because Vidu bills per live minute.

It runs **out of the box in Preview mode** against a built-in mock companion, so
you can feel the whole flow with no API key. Add a key to go live.

## Run it

```bash
npm install
npm run web        # open http://localhost:8081
npm run ios        # or a simulator / device via Expo Go
npm run android
```

The web build is a real, installable target; the same code compiles to native
iOS/Android.

Prefer a task runner? [Task](https://taskfile.dev) ships as a devDependency, so
`npm install` brings it along. A [`Taskfile.yml`](Taskfile.yml) wraps the common
flows — run them with `npx task <name>` (or `npm run task -- <name>`):

```bash
npx task            # list every task
npx task web        # run on web
npx task ios        # run on iOS
npx task check      # typecheck + lint
npx task build:web  # static web export
```

## Go live with Vidu S1

Create a `.env` (see `.env.example`):

```bash
EXPO_PUBLIC_VIDU_API_KEY=sk-your-key
EXPO_PUBLIC_VIDU_BASE_URL=https://api.vidu.com   # optional override
```

With a key present the app switches from `mock` to `live` automatically (see the
badge on the call screen and the note in Settings).

## Architecture

Everything talks to one seam — `AvatarTransport` — so the UI never knows whether
it's driving a real session or the mock.

```
src/
  app/                     expo-router screens
    _layout.tsx            providers + stack (home / call / settings)
    index.tsx              ambient home
    call.tsx               live two-way call
    settings.tsx           companion: name, voice, language, persona
  components/               PresenceOrb, AvatarStage, SelfCamera (front camera),
                            HoldToTalk, Captions, Waveform, Icon, ui, Screen
  lib/
    companion-store.tsx     persisted CompanionConfig (AsyncStorage)
    vidu/
      types.ts             AvatarTransport + event contracts
      client.ts            LIVE Vidu S1: POST /session, WebSocket control,
                           AliRTC media seam (attachMedia)
      mockTransport.ts     offline scripted companion (same interface)
      transport.ts         picks live vs mock from config
      useCompanionSession.ts   React state machine for a call
      catalog.ts           voices / languages / default companion
      config.ts            reads EXPO_PUBLIC_VIDU_* → mode
  theme.ts                 Lumen tokens (light + dark)
```

### The Vidu S1 flow, mapped to the UI

| Vidu S1 step | Where it lives |
| --- | --- |
| `POST /v1/sessions` (avatar, voice, language, persona) | `client.ts › createSession` — fed by Settings |
| AliRTC two-way audio + video | `client.ts › attachMedia` (SDK seam) + `SelfCamera` |
| WebSocket control (mute, interrupt, text, captions) | `client.ts › openControlSocket` + call controls |
| Per-minute metering | `meter` event → the call-screen timer |

The one piece that needs the real SDK + a key to fully activate is the AliRTC
media join, isolated in `client.attachMedia()`. Until then the ambient orb
stands in for the companion's video and captions/turns still flow over the
control socket — which is exactly Lumen's intent: presence as a light, not a
literal face.

## Design directions

The three original design directions (Aurora, Hearth, Lumen) are preserved as a
static pitch page in [`_design/design-directions.html`](_design/design-directions.html).
This app builds out **Lumen**.
