# Native CRM Connector Decision

## Current Decision

No native connector is selected yet. The repository contains no real pilot-customer evidence that would justify choosing HubSpot, Salesforce, Pipedrive, or Microsoft Dynamics. Selecting one from assumptions would violate the roadmap's evidence requirement.

## Evidence Gate

Organization administrators record append-only evidence from interviews, active pilots, lost deals, and support requests. The platform decision requires at least three evidence records from three distinct organizations supporting the same connector.

The leading connector must also exceed the runner-up weighted score by at least 10%; otherwise the evidence is treated as inconclusive.

The score combines:

- Stated integration priority.
- Whether the integration is required to buy or continue.
- Approximate monthly enquiry volume, with a capped logarithmic weight.

The platform-admin CRM research page stores the complete score snapshot and rationale with the decision. A later decision supersedes rather than overwrites the previous record.

## Scope After Selection

The selected connector should initially synchronize:

- Lead identity and consent fields.
- Source and UTM attribution.
- Recommended course.
- Conversation link.
- Admissions status and owner.
- Booking, application, enrolment and loss outcomes.

OAuth implementation starts only after the evidence-backed decision record exists.
