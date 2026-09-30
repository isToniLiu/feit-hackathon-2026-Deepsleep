# CyberStage: Product Brief

This document explains what CyberStage is for, who it serves, how the design responds to the challenge, and the decisions behind it. For setup and a quick tour, see the [README](../README.md).

## 1. The challenge

**Track:** Untapped Talent, *"Engineering the Future of Learning"* (Future Work theme).

The brief asks how AI and emerging technologies can create learning that is smarter, more engaging and more impactful, helping learners stay motivated, practise and apply knowledge, receive meaningful feedback, build confidence, collaborate, and achieve better outcomes.

**Our reading:** AI is changing the skills the workplace needs faster than passive, one-size-fits-all training can keep up, and generic training cannot respond to how an individual learner actually thinks. We did not want another AI question-answering tool. We wanted learners to make a judgement inside a high-pressure, realistic situation, and an AI coach that responds to the learner's own reasoning the way a human mentor would.

**Form:** a scenario-based cybersecurity simulation (the "Simulations and Virtual Environments" focus area).

## 2. Who it is for

Learners with **little or no cybersecurity background**: students, early-career workers, and people considering a move into security. The audience includes neurodivergent learners, who often bring strengths such as pattern recognition and attention to detail, and who are often poorly served by jargon-heavy, time-pressured, blame-oriented training.

**The problem we address:** conventional awareness training is passive and generic. Learners memorise rules, but when an urgent, plausible request arrives ("your session expired", "run this fix", "verify to unlock") they do not know how to check it, and training rarely tells them where their own reasoning went wrong.

## 3. The solution

### 3.1 The story

Northlight Digital is a fictional company that builds EduFlow, a course-submission platform used by several universities. At 23:47, during the midnight submission peak, EduFlow's authentication starts behaving strangely. The learner is an intern who has just been added to the on-call roster. Attackers do not need to break the core system; they only need a stressed on-call worker to log in, run a file, or hand over a verification code.

### 3.2 One incident, three entry points

The learner chooses *where they look from*, not a difficulty level. All three roles investigate the same incident (IR-247) through different systems and evidence:

| Role | Scenario | What the learner must notice |
|---|---|---|
| **Priya**, Security Analyst | An unexpected "Session Expired" popup over the admin console | The login button submits to a look-alike domain that is not in the on-call log |
| **Marcus**, Incident Responder | An urgent "repair tool" (`fix_deploy_issue.exe`) posted by an unknown external sender | Unknown sender, unsigned executable, timing two minutes after the first anomaly |
| **Aiko**, GRC & Compliance Lead | The learner's own account is locked and a page demands an employee ID and phone code | A code request that formal IT process never makes, and a verify button pointing to another domain |

Replaying as a different role reveals more of the same incident chain.

### 3.3 The learner loop

1. **Workspace:** the role, mentor, systems in scope, and three investigation tasks.
2. **Investigate:** a simulated managed browser with tabs, address bar and internal pages. Each meaningful action (checking an address, opening a status page or file preview, reading the incident timeline) is logged, explained by the mentor in a side chat, and can be added to a case file that carries across scenes.
3. **Decide:** choose an action, or choose "I'm not sure, can you explain more?" for a simpler explanation without penalty.
4. **Explain:** write why. The scene stays open, so the learner can keep exploring before confirming.
5. **Coaching:** the AI coach responds to the specific reasoning and the actions taken.
6. **After Action Report:** score, evidence used, missed teaching points, consequences of the choice, micro-exercises, and one-click replay as another role.

### 3.4 Design principles

- **Jargon last.** Technical terms never appear as a prerequisite for understanding a scene; they arrive in feedback after the learner has decided. A learner who cannot tell an "Incident Responder" from a "GRC lead" can still make a good call.
- **No penalty for asking for help.** "I'm not sure" is a first-class action, not a wrong answer. Hints come in three levels and point to *where* to look, never to the answer.
- **Visible next step.** A collapsible objectives panel shows three tasks, progress and an optional hint, driven by the learner's real actions, which supports executive function.
- **Exploration is separate from leaving.** Making a decision does not eject the learner from the scene.
- **Non-shaming tone.** Feedback names what the learner did well before what they missed.
- **Realism over decoration.** Believability comes from browser chrome, domains, timestamps, logs, internal systems and clues that can be cross-checked. The surrounding interface is deliberately calm and editorial rather than "hacker" themed.

## 4. How AI is used

AI is scoped to the part it is genuinely good at: reading free-text reasoning and responding to it. Everything that needs to be consistent or safe is handled by rules.

- **AI:** coaching text for the learner's reasoning, and the closing action cards in the report.
- **Rules:** scoring, reason-quality assessment, teaching-point attribution, and which clues the learner has actually seen.
- **Inputs to the model:** the scenario context, the mentor persona, the chosen action, the learner's reasoning, and the actions and evidence gathered so far.
- **Not used:** live-generated story content (it would make the experience unpredictable), and real-time hints while typing.

**Safety and reliability**

- Reasons are screened before any model call; passwords, verification codes, tokens/API keys and 6-digit codes are blocked or redacted.
- Prompt-injection attempts are detected and answered neutrally with no reward.
- Output language is validated against the selected language; a mismatch triggers the authored fallback.
- Every AI call has an 8 second timeout with authored fallback feedback, so the experience never stalls.
- Origin checks and a soft per-IP rate limit protect the API routes.
- Synthetic content only; the app instructs learners to use fictional details.
- `DEMO_MODE=1` runs the entire experience without calling a model.

## 5. How the design maps to the challenge

| The brief asks AI to help learners | How CyberStage responds |
|---|---|
| Stay motivated | Narrative stakes, immediate explanation of each action, visible task progress, replayable roles |
| Practise and apply knowledge | The learner must actually check evidence, choose an action and justify it |
| Receive meaningful feedback | The coach reads the learner's own reasoning and action history, so different reasons get different responses |
| Build confidence | Non-shaming feedback, a no-penalty "I'm not sure" option, three-level hints |
| Collaborate | The correct path is to escalate through a known internal channel, which models real collaboration |
| Better outcomes | The report shows the learner exactly which evidence they used and which they missed, with a targeted next exercise |

## 6. Comparison with alternatives

| Approach | Strength | Gap | CyberStage |
|---|---|---|---|
| AI Q&A and quiz tools | Personalised explanations | Answers questions rather than testing judgement under pressure | Situational decisions; the coach responds to the learner's reasoning |
| Content-generation learning tools | Custom material from source documents | No consequence or decision loop | Choice, evidence and feedback in one loop |
| Capture-the-flag competitions | Highly engaging for technical students | High barrier for beginners | No security background needed |
| Enterprise phishing-simulation training | Commercially proven | Fixed templates and generic feedback | Feedback generated from the learner's own reasoning |

## 7. Scope

**Built and working**
- Three role entry points, each with a workspace, a simulated-browser investigation scene and a debrief
- Side chat with action narration, three-level hints and the "I'm not sure" path
- Case file with evidence carried across scenes; dynamic objectives panel; quick-reference card
- AI coaching and AI action cards with safety screening, language validation, timeouts and fallbacks
- Full English and Chinese interface with a structural parity check between the two story files
- Score and After Action Report; role replay; session restore on refresh
- Automated checks for i18n parity and for the feedback and debrief APIs

**Not built yet**
- Pause mechanism for the narrative timer
- AI-adaptive story branching based on performance
- Learning history across sessions
- AI-driven highlighting of missed clues on the page
- Polished mobile and tablet layouts (the investigation scene targets desktop widths)

## 8. Extensibility

The story engine is data-driven: scenes, evidence, teaching points, hints and follow-ups live in JSON, and scoring is independent of the model. New high-pressure, social-engineering-style scenarios, or other "decide under pressure" learning topics, can reuse the same simulated-browser, coaching and report pipeline.

## 9. Data and third-party services

| Item | Use | Notes |
|---|---|---|
| OpenAI API (`gpt-4o-mini` default) | Coaching text and action cards | Optional; authored fallback when unavailable |
| Next.js, React, Tailwind CSS | Application framework | Open source |
| Vercel | Hosting | |
| Story, scenes, portraits | Core content | Original to this project; all names, companies and domains are fictional |
