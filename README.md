# Website DNA Analyzer

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Premium%20UI-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Website%20Analysis-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

**Website DNA Analyzer reveals the design culture, visual system, and brand maturity behind any website.**

Website DNA Analyzer is a deterministic premium audit tool that opens a website with Playwright, extracts real computed design signals, classifies design culture, analyzes visual layout behavior, compares websites side by side, and generates exportable audit reports.

It is built to feel like an elite design intelligence instrument rather than a generic SaaS dashboard.

## 🖼️ Screenshots

<img width="1879" height="850" alt="Image" src="https://github.com/user-attachments/assets/3ec6b0f4-54e3-48ac-8df5-4a089d9f394f" />

<img width="1883" height="855" alt="Image" src="https://github.com/user-attachments/assets/1cac1fbf-660e-48f1-892e-de23650be4eb" />

<img width="956" height="857" alt="Image" src="https://github.com/user-attachments/assets/ee5c530a-25c9-4147-84bc-0ed840dc0661" />

<img width="1010" height="858" alt="Image" src="https://github.com/user-attachments/assets/60348fb8-7e00-4b25-9926-06712e0765ca" />

---

## Product Highlights

| Capability | Description |
| --- | --- |
| **Single-Site Analysis** | Analyze typography, colors, spacing, radii, shadows, motion, screenshots, and visual metrics from a real website. |
| **Design Culture Classifier** | Deterministically maps extracted signals to culture profiles such as Linear, Vercel, Apple, Stripe, Swiss editorial, Luxury editorial, Brutalist startup, Web3 maximalist, Agency portfolio, and YC B2B SaaS. |
| **Visual DNA** | Captures desktop and mobile screenshots, then scores whitespace, hierarchy, symmetry, CTA prominence, navigation complexity, section rhythm, density, and contrast distribution. |
| **Brand Maturity Score** | Scores design-system maturity from typography consistency, color discipline, spacing rhythm, radius usage, motion behavior, and component density. |
| **Compare Mode** | Compare two websites side by side with deterministic winner labels for maturity, minimalism, hierarchy, and product/design-system discipline. |
| **Exportable Reports** | Generate polished browser-printable audit reports for single-site and comparison workflows. |

---

## Feature Overview

- Real Playwright-powered website analysis
- Computed style extraction from visible DOM elements
- Typography system detection
- Color palette extraction
- Spacing, radius, shadow, and motion token aggregation
- Visual DNA screenshot analysis
- Rules-based design culture classifier
- Deterministic editorial DNA report generator
- Compare Mode for two websites
- Export report route for browser Save as PDF
- Session-level analysis caching
- Robust URL validation and graceful error states
- Premium dark editorial dashboard UI

---

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Website automation:** Playwright
- **Testing:** Playwright Test
- **Report persistence:** Browser `localStorage` for current-session exports

---

## How It Works

```text
User URL
  -> Next.js API route
  -> Playwright browser session
  -> Computed style extraction
  -> Visual screenshot analysis
  -> Token normalization and aggregation
  -> Rules-based culture classifier
  -> Deterministic report generator
  -> Dashboard / exportable report
```

The project does **not** use AI vision APIs or paid external services. All classifications, reports, scores, and observations are deterministic.

---

## Local Setup

```bash
npm install
npx playwright install chromium
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

---

## Demo Script

Use this flow for a clean product demo:

1. Open the app.
2. Analyze `linear.app`.
3. Review:
   - Design DNA match
   - Visual DNA
   - Brand Maturity Score
   - DNA Report
4. Switch to **Compare Mode**.
5. Compare `linear.app` vs `vercel.com`.
6. Review deterministic winner labels.
7. Click **Export Report**.
8. Use browser print / Save as PDF.

---

## Environment Notes

No environment variables are required for the current version.

See:

```text
.env.example
```

Playwright requires a Chromium browser binary during local development:

```bash
npx playwright install chromium
```

---

## Deployment Notes

The frontend can be deployed like a standard Next.js application, but the analysis engine uses Playwright inside a server-side API route. This has real production implications.

### Vercel Notes

Deploying the UI to Vercel is straightforward, but running Playwright inside Vercel serverless functions may require additional work:

- Serverless functions may not include the required Chromium runtime by default.
- Playwright browser binaries can exceed deployment size or runtime constraints.
- Browser launch may require additional configuration depending on the environment.
- Function timeout and memory limits can affect larger website audits.
- Some production deployments should move analysis to a container, worker, queue-backed job, or dedicated browser service.

For the most reliable demo, run the project locally or deploy it to an environment that explicitly supports Playwright browser execution.

---

## Known Limitations

- Some websites block automated browsers or bot-like traffic.
- Some websites hide styles behind scripts, authentication, geolocation, consent walls, or delayed rendering.
- Screenshots are temporary and session-based.
- Report export uses browser print / Save as PDF rather than a server-side PDF renderer.
- Single-site and comparison export data is stored in browser `localStorage` for the current session.
- Visual analysis uses deterministic DOM and screenshot heuristics, not AI vision APIs.
- Culture classification is rules-based and deterministic, not an AI interpretation.

---

## Project Status

This project is feature-complete as a deterministic MVP and ready for demo use. The next production step would be separating Playwright analysis into a dedicated worker or browser-capable runtime. 
