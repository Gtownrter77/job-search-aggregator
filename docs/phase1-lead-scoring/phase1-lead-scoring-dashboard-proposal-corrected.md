# Phase 1 Proposal: Lead Scoring and Twenty CRM Dashboard

## Scope and approval status

This phase covers lead scoring, score explanations, compliance visibility, and the dashboard layout. It does not implement outreach logic, dial attempts, call scheduling, messaging, or automated workflows. Those activities remain blocked until a separate phase is approved.

The dashboard is designed for a **job seeker who needs to answer: which opportunities should I review, which are safe to pursue, and what needs cleanup.**

The approved scoring weights are **location fit 25%, benefits 30%, salary 25%, company reputation 12%, and contactability 8%**. The approved score bands are Priority (80–100), Qualified (60–79), Nurture / enrich (40–59), and Low priority (0–39). Outreach eligibility remains separate from score and is subject to hard gates, including do-not-call status, local time zone, valid phone, stale data, scheduled-interview holds, and the explicit consent/legal-basis gate.

## Approved hard-gate behavior

| Condition | Effect |
|---|---|
| Lead is on the do-not-call list | Not callable, regardless of score |
| Local time zone is missing or calling hours cannot be established | Not callable until resolved |
| Phone number is missing or invalid | Not callable; may remain eligible for non-call review |
| Consent, legal basis, or internal policy status is unknown where required | Compliance review; no automatic outreach |
| Active interview or meeting is scheduled | Hold duplicate outreach and show the next action and owner |
| Score or contact data is stale beyond the configured freshness window | Recheck required before any action |

## Dashboard design

The dashboard uses six KPI cards, a priority queue, score-composition panel, compliance and data-quality exceptions, interview pipeline, recent activity and audit trail, persistent filters, and a lead detail view. The queue displays score and outreach eligibility as separate fields so prioritization cannot be mistaken for permission to contact.

## Twenty CRM implementation note

The accompanying implementation specification maps the approved model to a primary Twenty object for job opportunities, related evidence and interview records, and auditable score and eligibility fields. No outbound behavior is enabled by this phase.

## References

[1]: https://docs.twenty.com/developers/extend/api "Twenty API documentation"
[2]: https://docs.twenty.com/user-guide/data-model/how-tos/create-custom-fields "Twenty custom-field documentation"
