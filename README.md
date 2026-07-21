# Christian Vavuris — Natural Candidate Site

A single public page: name, LinkedIn, one-line positioning, and a chat panel
that answers questions about Christian's fit for Natural's Founding GTM,
Startups role — backed by Claude and `content/skill-system-prompt.md`.

## Stack

- Next.js (App Router) + Tailwind, deployed on Vercel
- One serverless route: `app/api/chat/route.ts`, calling the Anthropic API
- No database, no auth — each page load starts a fresh conversation

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating the knowledge base

`content/skill-system-prompt.md` is the source of truth for this app's chat
responses. Edit it directly to update Christian's background or the framing
of his fit for Natural.

## Deployment

1. Push to GitHub, connect the repo to Vercel.
2. Set `ANTHROPIC_API_KEY` in Vercel project settings (Environment
   Variables) — server-side only, never exposed to the client.
3. Set a hard monthly spend cap / alert in the Anthropic Console before
   sharing the link publicly.
4. Deploy to a Vercel subdomain first for testing; point a custom domain at
   it once verified.

## Rate limiting

`lib/rate-limit.ts` caps each IP to ~20 messages per rolling 24 hours,
in-memory. It resets on redeploy/cold start — fine for v1 traffic; swap for
Upstash Redis if that becomes a problem.
