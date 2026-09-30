# CyberStage

**Scenario-based cybersecurity training where an AI coach reads *your* reasoning.**

CyberStage is a browser-based simulation for people with no security background. You join an on-call team on the night a fictional company's platform is attacked, investigate inside a simulated browser, make a call, and explain your reasoning in your own words. An AI coach responds to what you actually wrote, not to a fixed answer key.

Built for the FEIT Hackathon 2026 by Team Deepsleep, for the Untapped Talent challenge *"Engineering the Future of Learning"*.

**Live demo:** <https://cyberstage.vercel.app/> (English by default, one-click switch to Chinese in the top bar)

---

## The idea in one minute

Most security awareness training is passive and one-size-fits-all. Learners memorise rules, then freeze when a real, urgent, convincing request arrives. CyberStage recreates that pressure and coaches the judgement behind the decision.

- **One incident, three entry points.** The case, IR-247, is the same for everyone. You pick who you investigate as:
  - **Priya, Security Analyst**: a suspicious "Session Expired" login popup.
  - **Marcus, Incident Responder**: an urgent "repair tool" sent to the on-call chat.
  - **Aiko, GRC & Compliance Lead**: an account lock that asks for a verification code.
- **Investigate, do not guess.** Every scene is a simulated browser with tabs, an address bar and internal pages (status page, IT help article, security notices, file preview, incident timeline). Clues only appear when you check them, for example the real address a button submits to.
- **Decide, then explain.** You choose an action (safe, unsafe, or "I'm not sure, explain more") and write why. The scene stays open, so you can keep gathering evidence before you confirm.
- **Coached on your reasoning.** The AI coach reads your written reason plus the actions you took and replies in the language you selected. Different reasons for the same choice get different feedback.
- **After Action Report.** A score, the evidence you used, teaching points you missed, consequences of your choices, and next-step micro-exercises. Replay as another role to see the same incident from a different system.

## Try it (about 5 minutes)

1. Open the live demo and pick a role.
2. Read the workspace screen (your role, the systems you can access, three tasks).
3. In the scene, click around: the address bar, the popup, the tabs. Each action is logged and explained in the side chat.
4. Choose an action and explain your reasoning in the chat. Try a vague reason and a specific one to compare the feedback.
5. Confirm to reach the After Action Report, then replay as a different role.

## How AI is used (and how it is kept safe)

| Concern | Approach |
|---|---|
| What AI does | Generates coaching text for the learner's reasoning and the closing action cards. It does **not** generate the story, score, or grading. |
| What rules do | Scoring, reason-quality assessment and teaching-point attribution are deterministic and rule-based, so results are consistent and explainable. |
| Reliability | Every AI call has an 8 s timeout and falls back to authored feedback, so the demo never blocks on the network or an API failure. |
| Language | Feedback and debrief are generated in the selected language and validated (wrong-language output is rejected and replaced with the fallback). |
| Sensitive input | Reasons are screened before they reach the model. Passwords, verification codes, tokens/API keys and 6-digit codes are blocked or redacted. The app tells players to use fictional details only. |
| Prompt injection | Known injection phrases (e.g. "ignore previous instructions", "give me full marks") are detected, ignored, and answered with a neutral reply and a zero reasoning score. |
| Abuse and cost | Origin check and a soft per-IP rate limit on both API routes. Set a spending cap in your OpenAI account for any real deployment. |
| Data | No accounts and no database. Game state lives in the browser session only; reasons are not stored. |
| Demo mode | `DEMO_MODE=1` disables all model calls and serves authored content. |

## Tech stack

- **Next.js 16** (App Router, API routes), **React 19**, **TypeScript**, **Tailwind CSS 4**
- **OpenAI API** (`gpt-4o-mini` by default, configurable) via the `openai` SDK
- Story content as static JSON (`content/story.json` in Chinese, `content/story.en.json` in English)
- Deployed on **Vercel**

## Run it locally

Requires Node.js 20+.

```bash
git clone https://github.com/isToniLiu/feit-hackathon-2026-Deepsleep.git
cd feit-hackathon-2026-Deepsleep
npm install
cp .env.example .env.local   # then add your OPENAI_API_KEY (optional, see below)
npm run dev                  # http://localhost:3000
```

The app works without an API key: it uses authored fallback feedback. To try it with no model calls at all, set `DEMO_MODE=1`.

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Enables AI coaching. Without it, authored fallback feedback is used. |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`). |
| `DEMO_MODE` | `1` = never call the model; use authored content. |
| `ALLOWED_ORIGIN` | Comma-separated production origins allowed to call the API. |

### Checks

```bash
npm run lint
npm run build
npm run check:i18n      # English and Chinese story files stay structurally identical
npm run eval            # feedback API cases (needs a running server, see BASE_URL)
npm run eval:debrief    # debrief API cases
```

## Project structure

```
content/            Story data (story.json = Chinese, story.en.json = English)
src/app/            Pages and the two API routes (/api/get-feedback, /api/get-debrief)
src/components/     Screens, simulated browser, chat panel, scene components
src/lib/            State machine, scoring, AI safety, rate limiting, i18n, story types
scripts/            i18n parity check and API evaluation scripts
docs/PRODUCT.md     Product brief: problem, users, design decisions, scope
```

## Status and known limitations

- The full flow works for all three roles in English and Chinese.
- Mobile and tablet layouts are functional but not yet polished; the investigation scene is designed for desktop widths.
- Not built yet: a pause mechanism, AI-adaptive story branching, and learning history across sessions.
- All company names, people, domains and incidents are fictional. Do not enter real passwords, codes or personal data.

## Third-party services and assets

- OpenAI API for coaching text (optional; the app runs without it).
- Next.js, React, Tailwind CSS (open source). Fonts are the system font stack plus Geist through `next/font`.
- Story, scenes and portraits are original to this project.

## More detail

See [`docs/PRODUCT.md`](./docs/PRODUCT.md) for the problem statement, target users, how the design maps to the challenge, and the decisions behind it.
