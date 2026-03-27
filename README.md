# DayDreamers Social Promo Generator

AI-powered tool for generating promotional content across multiple channels. Describe your project and get tailored content for LinkedIn, Instagram, Twitter/X, and email — plus branded HTML image templates.

**Live:** https://socials.daydreamers-academy.com
**GitHub:** https://github.com/cyu60/daydreamers-social-promo

## Features

- **Multi-channel content generation** — LinkedIn, Instagram, Twitter/X, Email
- **Markdown-formatted output** — Bold, lists, headings render properly
- **HTML image templates** — Generate branded social images for LinkedIn (1200x627), Instagram (1080x1080), Twitter (1200x675)
- **Copy to clipboard** — One-click copy for each channel
- **User accounts** — Sign in with email or Google to save generations
- **Mobile responsive** — Works on all screen sizes

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + DayDreamers design system (DM Serif Display, DM Sans, DM Mono)
- **AI SDK** + OpenAI (GPT-5.4) for content generation
- **InsForge** — Auth, database (profiles + generations tables), storage
- **Vercel** — Hosting + deployment
- **react-markdown** + remark-gfm for content rendering

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-5.4 |
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous key |

## Development

```bash
npm install
npm run dev
```

## Part of DayDreamers Academy

This tool is used in **Session 4: AI-Powered Go-to-Market** of the DayDreamers Mastering Vibe Coding course.

- Course materials: https://www.daydreamers-academy.com
- Session 4 slides: https://www.daydreamers-academy.com/cohort1/sessions/session4-ai-gtm.html
