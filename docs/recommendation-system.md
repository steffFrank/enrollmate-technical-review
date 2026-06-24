# Recommendation System Contract

## Current Baseline

The baseline candidate generator combines tenant-scoped pgvector cosine similarity with hard catalogue constraints. The adviser then receives the ranked list and may present at most two courses by reference.

The recommendation path is deliberately split into three contracts:

1. `CandidateGenerator` retrieves eligible possibilities.
2. `CourseRanker` calculates explicit features, scores and positions.
3. The adviser presents and explains only courses produced by the ranker.

## Versioning

Every measured search must retain:

- Candidate generator version.
- Ranker version.
- Embedding provider and model.
- Catalogue version when available.
- Normalized query and structured filters.
- Candidate feature values, component scores, final score and rank.
- Whether the candidate was ultimately displayed.

Versions are immutable identifiers such as `pgvector-v1` and `weighted-v1`. A behavior change requires a new version rather than silently changing historical meaning.

## Weighted Ranker V1

The first ranker is deterministic and explainable. It uses only institution catalogue data and learner-declared preferences.

| Feature | Purpose |
| --- | --- |
| Semantic similarity | Topical and goal relevance |
| Delivery-mode match | Remote, on-site or hybrid preference |
| Location match | City/country compatibility |
| Funding availability | Requested funded options |
| Tuition compatibility | Declared maximum price |
| Start-date compatibility | Requested intake window |
| Enrolment availability | Open courses receive priority; closed courses are excluded upstream |

Missing preferences are neutral rather than negative. Eligibility text is not treated as proof that a learner qualifies. Eligibility questions may trigger human escalation.

## Offline Evaluation

Gold cases use institution-approved questions and graded course relevance:

- `0`: not relevant
- `1`: acceptable
- `2`: relevant
- `3`: ideal

Required ranking metrics are:

- Candidate Recall@K
- Precision@K
- Mean Reciprocal Rank
- NDCG@K
- Handoff precision/recall
- Unsupported-term and forbidden-term checks
- Metrics grouped by language

Evaluation records must retain ranker, candidate-generator and embedding versions so two runs can be compared without ambiguity.

## Embedding Bake-Off

Embedding benchmarks do not reuse the production course vector column. Each benchmark freezes the current catalogue version, builds an isolated per-run vector index with the selected model, and embeds every gold question with that same model and dimension. Supported comparison models are `text-embedding-3-small` and `text-embedding-3-large`, both requested at 1536 dimensions.

This prevents a model label from being changed while stale course vectors remain in PostgreSQL. Production catalogue synchronization also records `courses.embedding_model` and forces re-embedding when the configured model changes.

## Learning-To-Rank Gate

A learned ranker is not enabled merely because outcome events exist. Readiness requires:

- At least 10,000 measured recommendation impressions.
- At least 500 organization-confirmed application or enrolment outcomes.
- At least 80% of displayed recommendations linked to a known downstream state within the agreed attribution window.
- No organization contributing more than 40% of the training labels unless the model is organization-specific.
- A stable holdout set and no material regression in handoff or protected safety categories.
- Documented feature review excluding sensitive attributes without an approved lawful basis.

Until all gates pass, improvements use deterministic ranking, better catalogue data and controlled experiments.

## Experiment Rules

Experiments are introduced only after ranking runs and impressions are stable. Assignment must be deterministic per organization and anonymous session, persisted once, and excluded from evaluation traffic. Every impression records its experiment and variant so conversion comparisons remain auditable.
