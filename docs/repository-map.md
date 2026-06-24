# Repository Map

| Path | Ownership |
| --- | --- |
| `src/app/api/chat` | Hosted chat orchestration and SSE response |
| `src/app/api/widget` | Widget authorization and opaque-session transport |
| `src/app/api/v1` | API-key authenticated public API |
| `src/app/dashboard/[organizationSlug]` | Organization administration and admissions workspace |
| `src/app/embed` and `public/widget` | Embeddable concierge runtime |
| `src/lib/ai` | Adviser prompts, model gateway, guardrails, tool schemas and handoff |
| `src/lib/rag` | Low-level vector retrieval and embedding content |
| `src/lib/recommendations` | Candidate generation, ranking, instrumentation, experiments and readiness |
| `src/lib/evaluations` | Offline deterministic quality metrics |
| `src/lib/courses` | Course management, CSV parsing and catalogue synchronization |
| `src/lib/analytics` | Attribution and funnel event persistence |
| `src/lib/integrations` | Signed webhooks and CRM evidence decisions |
| `src/lib/billing` | Plans, subscription state, entitlements and usage limits |
| `src/test` | Unit, component and route tests |
| `supabase/migrations` | Additive PostgreSQL schema and scheduled cleanup |
| `scripts` | Reproducible ingestion, demo seeding and operational commands |
| `docs` | Architecture, ranking governance and product decisions |

## Dependency Direction

Route handlers and server actions may depend on domain services. Domain services may depend on database/model gateways. Low-level gateways must not import UI or routes.

```text
app routes/components
        ↓
domain services (recommendations, courses, evaluations, integrations)
        ↓
gateways (Supabase, Gemini, OpenAI, email, Stripe)
```

The recommendation pipeline owns ordering. The adviser owns presentation. Analytics records behavior but does not change ranking outside a versioned experiment.

