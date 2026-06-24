# EnrollMate

EnrollMate is a multi-tenant AI enrolment concierge for schools, training centres, and education providers. It helps prospective learners discover institution-approved courses, ask questions in a guided chat, request human follow-up, and become trackable admissions leads.

The project is built as a SaaS-ready portfolio application. Public student experiences do not require login, while school staff use an authenticated dashboard to manage courses, leads, settings, members, billing, integrations, analytics, and evaluation workflows.

## What The App Does

- Provides a public AI chat for each organization at `/o/[organizationSlug]/chat`.
- Recommends only courses retrieved from the organization's own catalogue.
- Supports Italian, English, and French in the chat and platform UI.
- Captures course-specific enquiries and human handoff requests as leads.
- Tracks admissions stages: new, contacted, qualified, applied, enrolled, and lost.
- Offers an embeddable widget through `/widget/v1.js` and `/embed/[organizationSlug]`.
- Records attribution and funnel events such as chat opened, recommendation shown, lead created, booking clicked, applied, enrolled, and lost.
- Lets staff import and manage structured course catalogues.
- Provides a dashboard for leads, conversations, usage, analytics, members, settings, billing, integrations, and evaluations.
- Supports signed outbound webhooks for lead and handoff events.
- Includes evaluation workflows for recommendation quality, handoff behavior, language, required terms, forbidden terms, latency, and errors.
- Supports self-service registration with a 14-day trial organization flow.

The AI does not decide admission, eligibility, funding entitlement, or acceptance. It provides guided information and escalates uncertain or sensitive cases to the institution.

## Stack

- Next.js 16 App Router with React and TypeScript strict mode
- Supabase Postgres, Auth, RLS, and pgvector
- Gemini for user-facing chat and tool-calling
- OpenAI embeddings for retrieval and Whisper for voice transcription
- Tailwind CSS with shadcn/ui-style primitives
- Zustand for focused frontend UI state
- Zod validation
- Stripe billing
- Resend for product notification emails
- Vitest and Testing Library

All AI, database service-role, billing, and email calls run server-side. Secrets are never exposed to the browser.

## Application Model

EnrollMate is a multi-page application built with Next.js App Router.

Server-rendered pages handle navigation-heavy flows such as landing, authentication, onboarding, and dashboards. Client components handle interactive forms, chat, course cards, lead boards, settings, theme switching, language switching, widgets, and local UI state.

The main SaaS flow is:

1. A school admin starts a 14-day trial from the landing page.
2. `/auth/register` creates a Supabase Auth account with email and password.
3. If email confirmation is enabled, the user sees a confirmation toast and must verify the email.
4. After login, `/onboarding` creates the organization and assigns the user as `org_admin`.
5. A trial subscription is created for the organization.
6. The admin imports or manages courses.
7. Students use the hosted chat or embedded widget.
8. Leads, conversations, attribution, and funnel events appear in the dashboard.

Set `NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED=true` for the school/demo trial flow. Later, this can be set to `false` for managed-pilot-only deployments.

## Frontend State With Zustand

Zustand is used for client-side UI state where React local state would become awkward, but where the data should not be treated as server data.

Current stores:

- `src/stores/chat-ui-store.ts`
  - Selected chat language
  - Per-organization message drafts
  - Voice recording/transcription state
  - Thinking and streaming state
  - Local persistence for the selected language

- `src/stores/onboarding-store.ts`
  - Multi-step onboarding progress
  - Organization name draft
  - Generated organization slug
  - Manual slug editing state

Server-owned data such as users, organizations, courses, conversations, leads, subscriptions, and analytics remains in Supabase and is loaded through server routes, Server Actions, or API endpoints. Zustand is used only for frontend interaction state, not as a replacement for the database or authentication session.

## Auth And Account Features

Supabase Auth handles:

- Registration
- Login
- Logout
- Magic-link login
- Email confirmation
- Email change confirmation
- Password update

REST endpoints are also available for the school project requirements:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Users can manage their personal profile at `/dashboard/profile`, including:

- Display name
- Preferred language
- Email change
- Password change with current-password verification

Passwords must include at least:

- 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character
- No spaces

The UI also recommends 12 or more characters for a stronger password.

Cloudflare Turnstile can be enabled for login, magic-link login, and registration by setting `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and configuring the matching secret in Supabase Auth CAPTCHA settings.

## Email Sending

There are two email systems:

1. Supabase Auth sends authentication and security emails:
   - Registration confirmation
   - Magic links
   - Email-change confirmation

2. Resend sends EnrollMate product notifications:
   - Welcome email after onboarding
   - New lead notifications
   - Member invite notifications

`EMAIL_FROM` is only used by the Resend notification system. It must be an address on a domain verified in Resend, for example:

```env
EMAIL_FROM=contact@cruuwhub.it
```

If `RESEND_API_KEY` is not configured, product notification emails are skipped in development and tests. Supabase Auth emails are still controlled by Supabase.

To send Supabase Auth emails through Resend, configure Resend SMTP inside the Supabase Auth email settings. That is separate from the app's `RESEND_API_KEY`.

## Main Routes

```txt
/                               Marketing landing page
/auth/register                  Self-service account registration
/auth/login                     Login and magic-link login
/auth/callback                  Supabase email/OAuth callback
/onboarding                     Organization creation after signup
/dashboard                      Redirects user to their organization dashboard
/dashboard/profile              User profile and account security
/dashboard/[organizationSlug]   Organization dashboard overview
/dashboard/[organizationSlug]/courses
/dashboard/[organizationSlug]/leads
/dashboard/[organizationSlug]/conversations
/dashboard/[organizationSlug]/settings
/dashboard/[organizationSlug]/members
/dashboard/[organizationSlug]/billing
/dashboard/[organizationSlug]/integrations
/dashboard/[organizationSlug]/evaluations
/o/[organizationSlug]/chat      Public hosted student chat
/o/[organizationSlug]/courses   Public course catalogue
/embed/[organizationSlug]       Widget iframe experience
/demo/widget-host               External-looking widget demo page
```

## Public And API Interfaces

Public chat and lead APIs:

- `POST /api/chat`
- `GET /api/conversations/[id]`
- `POST /api/leads`
- `POST /api/widget/chat`
- `GET /api/widget/conversations/[id]`
- `POST /api/funnel-events`

Versioned API endpoints:

- `POST /api/v1/chat`
- `GET /api/v1/courses`
- `POST /api/v1/catalog/sync`
- `GET /api/v1/leads`

Operational APIs:

- `POST /api/transcribe`
- `POST /api/cron/webhooks`
- `POST /api/webhooks/stripe`

API keys are scoped to an organization and shown only once when created.

## AI And Retrieval Pipeline

The chat pipeline is grounded in the organization's course catalogue:

1. The user message is validated by guardrails.
2. The system loads conversation memory and organization context.
3. Gemini decides whether course search is needed.
4. The backend embeds the query with OpenAI.
5. Supabase pgvector retrieves matching active courses for that organization.
6. Gemini writes a structured response using only retrieved courses.
7. Invalid or invented recommendation references are stripped.
8. Low-confidence, sensitive, or explicit human-help cases can trigger a handoff offer.

The model is instructed to avoid inventing courses, explain why each recommendation fits, and reply in the user's language.

## Enrolment Concierge Features

The vertical slice includes:

- Structured course fields: delivery mode, location, schedule, dates, tuition, funding, eligibility, prerequisites, outcomes, qualification, and enrolment status.
- CSV catalogue import with preview and validation.
- Idempotent API catalogue sync.
- Hosted chat and embeddable widget.
- Origin allow-list for widget security.
- Anonymous widget session token support.
- UTM/source attribution.
- Human handoff form with privacy acknowledgement.
- Booking URL display after lead capture.
- Lead activities and admission-stage tracking.
- Funnel analytics.
- Signed webhook deliveries with retry state.
- Evaluation suites, cases, runs, and results.
- Demo seeding for the IncluDO example organization.

## Dashboard Features

Authenticated organization users can:

- Manage courses and structured course metadata.
- View conversations and recommendation history.
- Manage admissions leads in a Kanban-style workspace.
- Assign owners, set follow-up dates, add notes, and update stages.
- Export leads.
- Manage members and roles.
- Configure widget settings, allowed origins, privacy URL, booking URL, handoff copy, and escalation settings.
- Create API keys.
- Review usage and AI diagnostics.
- Manage billing and trial status.
- Configure webhooks and inspect deliveries.
- Run evaluation suites and recommendation benchmarks.

Roles include organization admin, organization member, and admissions agent. Admissions agents can manage leads and view relevant conversations/analytics but cannot administer billing, settings, integrations, courses, or members.

## Local Setup

1. Create a Supabase project.
2. Run all migrations in `supabase/migrations/` in order.
3. Copy `.env.example` to `.env.local`.
4. Fill in Supabase, Gemini, OpenAI, Stripe, Resend, webhook, and security variables as needed.
5. Install dependencies.
6. Seed or import a catalogue.
7. Start the app.

```bash
pnpm install
pnpm seed:demo
pnpm dev
```

For the older direct course ingest workflow:

```bash
pnpm ingest
```

Open:

```txt
http://localhost:3000
http://localhost:3000/auth/register
http://localhost:3000/o/includo/chat
http://localhost:3000/demo/widget-host
```

## Environment Variables

Core variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-2.5-flash

OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_TRANSCRIBE_MODEL=whisper-1

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

RESEND_API_KEY=
EMAIL_FROM=

INTEGRATION_ENCRYPTION_KEY=
CRON_SECRET=
SALES_CONTACT_URL=
USAGE_DASHBOARD_TOKEN=
```

Security-sensitive variables such as `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `INTEGRATION_ENCRYPTION_KEY`, and `CRON_SECRET` must remain server-only.

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm typecheck
pnpm build
```

The tests cover validation, auth routes, RAG behavior, guardrails, memory, rate limiting, anonymous sessions, lead capture, course localization, password policy, billing limits, webhook logic, evaluation scoring, Zustand stores, and i18n dictionaries.

## Security And Privacy Notes

- Organization scoping is enforced server-side.
- RLS is enabled in the database.
- Public chat and lead capture are rate-limited.
- Anonymous conversations are tied to hashed session identifiers.
- Widget access is restricted by public key and allowed origins.
- The app stores attribution only from an allow-list of UTM/source fields.
- Raw IP addresses are not stored for attribution.
- Lead capture can require privacy acknowledgement.
- Marketing consent is separate from privacy acknowledgement.
- Conversation and lead retention can be configured per organization.
- Webhook signatures use HMAC-SHA256.
- Webhook delivery rejects unsafe destinations and disables redirects.

## Documentation

- [System architecture and data flow](docs/architecture.md)
- [Repository ownership map](docs/repository-map.md)
- [Recommendation system, evaluation, and learning-to-rank gates](docs/recommendation-system.md)
- [Evidence-gated CRM connector selection](docs/crm-connector-selection.md)

## Deferred Or Future Work

These items are intentionally outside the current vertical slice:

- Native HubSpot OAuth
- Native Salesforce OAuth
- Student information system integrations
- XML catalogue import
- Scheduled website crawling
- Native calendar booking
- Live-agent takeover
- SSO
- Custom domains
- Cross-tenant learned ranking

## Copyright And License

Copyright 2026 Steff (steffFrank). All rights reserved.

This software is proprietary and confidential. It is not open source. No license to use, copy, modify, or distribute is granted by the mere fact that the code is visible or accessible. Any use requires a separate, signed, written agreement with the owner. See [LICENSE](./LICENSE) for full terms.
