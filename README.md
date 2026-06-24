# EnrollMate Technical Review Extract

This repository is a focused technical-review extract of EnrollMate for academic evaluation.

It is not the full private production repository. Secrets, `.env.local`, generated build output, deployment state, private data, and unrelated product modules are intentionally excluded.

## Project Criteria Covered

### Application Type

EnrollMate is a multi-page application (MPA) built with Next.js App Router.

The review extract includes separate pages for:

- Registration
- Login
- Auth callback
- Logout
- Dashboard redirect/session handling
- User profile management

### RESTful User APIs

The extract includes the REST endpoints required for user management:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

These endpoints use Supabase Auth, Zod validation, structured JSON responses, and server-side session handling.

### Frontend

The frontend uses React with Next.js App Router.

Included UI areas:

- Registration form
- Login form
- Magic-link login form
- Turnstile security field
- Password-strength checklist
- Profile form
- Email update form
- Password update form
- Logout button
- Language switcher
- Theme toggle

### Frontend State

Zustand is included for focused client-side UI state:

- `src/stores/chat-ui-store.ts`
- `src/stores/onboarding-store.ts`

The stores handle UI interaction state such as language, drafts, voice/transcription state, streaming state, onboarding step, organization-name draft, and generated slug.

Server-owned data remains in Supabase and is not stored in Zustand.

### Server Actions

The extract includes the shared Server Action helper:

- `src/lib/actions/action.ts`

It centralizes:

- Zod validation
- Auth checks
- Role checks
- Optional fresh-session verification
- Context-aware Supabase client selection
- Structured error handling

Profile, login, registration, and onboarding actions use this helper where appropriate.

### Extra API Functionality

The additional user-profile feature is included:

- Update display name
- Update preferred language
- Change email
- Change password with current-password verification

### Documentation

The complete `docs/` folder is included for architectural review.

## What Is Intentionally Excluded

- `.env.local`
- API keys and secrets
- `node_modules`
- `.next`
- Supabase local runtime state
- Full enrolment-concierge modules not needed for the school criteria
- Full private repository history
- Production data

## Suggested Review Order

1. Read `docs/architecture.md`.
2. Read `PROJECT-README.md` for the full product summary.
3. Review `src/app/api/auth/`.
4. Review `src/app/auth/`.
5. Review `src/app/dashboard/profile/`.
6. Review `src/lib/actions/action.ts`.
7. Review `src/stores/`.
8. Review the focused tests under `src/test/`.

## Notes

This extract is meant for code review and presentation, not as a standalone deployable application. Some imports may reference framework or project context that exists in the full private repository.
