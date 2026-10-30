# Idea Bank — Demo

A tiny app for capturing content ideas and the brain-dump context behind each one. Phone-first, one accent color, four screens, no more.

**[Live demo →](https://idea-bank-demo.vercel.app)**

This is a public demo. Your data stays in your browser (localStorage); nothing is sent to a server.

---

## The problem

Creator ideas live in six places at once: phone notes, voice memos, Google Docs, a Notion page nobody opens, a half-written tweet, and whatever AI chat the real thinking happened in. The *idea* survives in your head as one line. The *context*, the back-and-forth where you worked out what the video is really about, is gone the next time you look.

I wanted one place to capture both: the title in one tap, and the brain dump that produced it, right next to it. Searchable later. Phone and laptop. No team, no sharing, no features that get in the way of hitting "save."

## My approach: spec before code

I wrote the full product spec before any code was written: the problem, who it's for, the screens, the single data model, the explicit "don't build" list. Then I handed the spec to Claude Code and worked as the PM/designer while it implemented.

The spec is the thing that made the project shippable in a week. Features were cut on paper, not during review.

## Key decisions and tradeoffs

**One accent color, system fonts, no animations.** Phone-first and one-handed. The brief was "calm and plain," so every decision that would add visual noise lost by default. One forest-green accent, system fonts, generous whitespace.

**Five screens in the full app, four in this demo.** The spec capped it at five: sign in, main list, paste a capture, idea detail, settings. This demo omits sign in (data stays in your browser), so you see four. Anything that needed another screen got cut, not added.

**localStorage first, auth later.** Milestone 1 shipped as a single-user, browser-local app. The data layer sits behind a small storage interface so swapping to a hosted database later doesn't touch any UI code. This demo is that Milestone 1.

**Email + password over magic links.** Magic links break inside iPhone home-screen apps (they open in Safari and lose the app session). Password + Keychain autofill is lower-friction in practice than it sounds.

**Paste-driven capture.** The capture flow is: brain-dump in an AI chat, ask the AI to format the result, paste the whole thing into one text box. One field, one tap. No required fields on new ideas except a title. Everything else is parsed from the paste if present, or stays blank.

**No AI inside the app.** The AI chat happens *outside* the app, in whatever tool the user already uses. The app is a bank, not a chatbot. This removes an API dependency, an API key, a cost, and a product-scope rabbit hole.

## What I cut (and why)

- **Reminders, notifications, dashboards, analytics.** Not what a bank is for.
- **Sharing, teams, comments.** Single-user by design.
- **Importers (ChatGPT, Notion, Drive, email).** Each one adds a required integration path. Paste is universal.
- **Extra fields** (pillars, hooks, thumbnails, publish dates, published links). Every added field is a tax on capture speed. If it isn't needed to find the idea again, it doesn't belong on the model.
- **Custom theming, illustrations, fancy UI.** Every styling choice got pushed toward "calm and plain."

The guiding rule from the spec: *if a feature doesn't serve "one easy place to capture every idea and find it later, from laptop or phone," don't build it.*

## What I caught in review

- **Security gaps in the database plan, before build.** The proposed schema included a view that would have exposed all data to anyone holding the public API key, plus incomplete row-level access policies. I flagged both and we rewrote the plan before any code touched the database.
- **A sign-in flow that would have broken on iPhone.** The initial plan was magic-link email. Those links open in Safari, not the installed home-screen app, so the session is lost on return. Caught it in the spec review and switched to email + password before writing a line of auth code.
- **A pivot when a free-tier rule changed mid-build.** Supabase changed its free-tier email rules during the auth milestone, which would have required a rate-limited SMTP workaround for the planned OTP flow. I chose email + password over the workaround and we kept moving.

## Built with Claude Code, from my spec

I wrote the PRD, the design rules, and the milestone plan. Claude Code wrote the Next.js app against that spec and committed after every meaningful step. My job during build was PM and reviewer: approve the plan, test each screen on phone and laptop, flag anything that didn't match the spec, decide the trade-offs when Claude surfaced them.

Working this way shortens the loop between "I know what I want" and "I can click it." The spec is the leverage; the engineering is downstream of it.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **localStorage** behind a data-access layer (so a hosted database can swap in without touching the UI)
- **Vercel** for hosting

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Clearing site data in your browser resets the demo to the five seed ideas.

## Links

- Live demo: [idea-bank-demo.vercel.app](https://idea-bank-demo.vercel.app)
- Source: [github.com/RachelElizabethW90/idea-bank-demo](https://github.com/RachelElizabethW90/idea-bank-demo)

The real version of this app (with auth and a hosted database) lives privately.
