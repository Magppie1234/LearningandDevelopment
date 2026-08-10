# API, Integration & Credential Requirements

**Deliverable 6 of 12.** Contracts: `src/lib/call-intelligence/service.ts`.

> **Nothing here is connected yet.** `activeSource = mockSource`. The live
> source deliberately **throws** rather than falling back to demo numbers — a
> dashboard that silently shows mock data as production is worse than one that
> fails loudly.

## The swap

The UI imports only `service.ts`. To go live:

1. Implement the six adapters below.
2. Register them in a `liveSource.getAllCalls()` implementation.
3. Change `export const activeSource = mockSource` → `liveSource`.

No page component changes.

## Adapter contracts

### 1. `TelephonyAdapter` — REQUIRED
```ts
listCalls(from: string, to: string): Promise<CallRecord[]>
getRecordingUrl(callId: string): Promise<string | null>
```
Must supply: callId, customerId/phone, employeeId, startedAt, durationSec,
direction, recording pointer, disposition.
Candidates: Exotel, Knowlarity, Ozonetel, Twilio, MyOperator.
**Recording URLs must be short-lived and signed.** Never store a permanent
public URL.

### 2. `TranscriptionAdapter` — REQUIRED
```ts
getTranscript(callId: string): Promise<TranscriptTurn[]>
```
Must supply per turn: speaker label, startSec, endSec, text **in the original
language**, per-turn confidence. Must supply per call: overall transcription
confidence, **diarisation confidence**, detected language.

> **Blocking gap.** The existing transcription feature must expose a
> *diarisation confidence* figure. Without it, `dynamics.reliable` cannot be
> computed and talk-to-listen, interruption and silence metrics must stay
> hidden (§8). Do not substitute overall STT confidence — they measure
> different things.

Translation must be a **separate field**, never overwriting the original.

### 3. `CrmAdapter` — REQUIRED
```ts
getOutcome(callId: string): Promise<CrmOutcome>
```
Must supply: region/state/city/pincode, product, lead source, campaign, CRM
stage, customer segment, opportunity created, **crmLossReason**.
This repo already has Zoho CRM MCP tooling available (`ZohoCRM_getRecords`,
`ZohoCRM_getFields`, `ZohoCRM_executeCOQLQuery`) — the fastest path is a COQL
query joining Leads/Deals on phone number.

Returns `provenance: 'not_available'` with all-null fields when no CRM record
matches. **Do not guess.**

### 4. `TaskAdapter` — REQUIRED for the Next-Action Tracker to be real
```ts
createTask(action: ActionRecord): Promise<{ url: string }>
updateTask(actionId: string, patch: Partial<ActionRecord>): Promise<void>
```
Until this exists, `crmTaskUrl` is `null` everywhere (asserted in validation)
and the tracker is read-plus-local-state only.

### 5. `OrderAdapter` — REQUIRED for revenue
```ts
getOrderValue(customerId: string): Promise<number | null>
```
Zoho Books MCP tooling is available in this workspace (`list_sales_orders`,
`get_sales_order`, `list_invoices`).

### 6. `ComplaintAdapter` — REQUIRED for service metrics
```ts
getComplaint(callId: string): Promise<{ logged: boolean; severity: 'critical'|'major'|'minor'|null }>
```

## AI extraction service

The extraction itself is **not implemented**. It needs one LLM call per
transcript returning the schema in `05-ai-extraction-schema.md`.

Recommended: Claude (`claude-opus-5` for accuracy-critical extraction,
`claude-sonnet-5` for volume) via the Anthropic Messages API with a forced
tool-call for structured output. This repo already routes LLM traffic through
`OPENROUTER_API_KEY` (`/api/assistant/chat`), so the same pattern applies.

Cost control: extract once per call, persist the result, version-stamp it with
`taxonomyVersion` + `modelVersions`. Never re-extract on page load.

## Credentials — checklist

> **No live credentials are included in this bundle, by design.** Committing
> API keys into a zip that gets uploaded to third-party AI tools leaks them
> permanently and irrevocably. Fill these in locally in `.env` (git-ignored).

### Already used by this repo (`.env.example`)

| Variable | Purpose | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe key | same page |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes/ingestion | same page — **server only, never `NEXT_PUBLIC_`** |
| `NEXT_PUBLIC_BD_ACADEMY_ID` | Academy row UUID | `select id, slug from academies;` |
| `NEXT_PUBLIC_SALES_ACADEMY_ID` | Academy row UUID | same |
| `NEXT_PUBLIC_REAL_AUTH` | `1` = real magic-link auth | — |
| `OPENAI_API_KEY` | Whisper voice input + vector ingestion | platform.openai.com |
| `OPENROUTER_API_KEY` | AI Assistant answer synthesis | openrouter.ai |

### Additionally required for Call Intelligence (not yet in `.env.example`)

| Variable | Purpose |
|---|---|
| `TELEPHONY_API_KEY` / `TELEPHONY_API_SECRET` / `TELEPHONY_BASE_URL` | Call metadata + recordings |
| `STT_API_KEY` / `STT_BASE_URL` | Transcription + diarisation |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` / `ZOHO_API_DOMAIN` | CRM + Books |
| `ANTHROPIC_API_KEY` | Extraction model |
| `TASK_SYSTEM_API_KEY` / `TASK_SYSTEM_BASE_URL` | Next-action write-back |
| `CI_RECORDING_SIGNING_SECRET` | Signing short-lived recording URLs |

**Deployment note:** Vercel environment variables only take effect on a
**redeploy**. Vercel project: `lnd2` (`prj_KXXNnarmq3w294XIXvdb0ve6oJsh`).

## Ingestion architecture (recommended)

```
Telephony webhook  ──▶  queue  ──▶  STT  ──▶  extraction (LLM)  ──▶  Postgres
                                                                        │
CRM / Order / Complaint nightly reconcile ─────────────────────────────▶┘
                                                                        │
                                                       Dashboard reads ─┘
```

Extraction is asynchronous and idempotent, keyed on `callId + modelVersion`.
The dashboard reads only from the persisted store, never live from the LLM.

## Server-side query layer

`paginate()` and `QueryOptions<T>` in `service.ts` define the shape the server
API must accept, so moving filtering/pagination server-side is a swap of the
function body, not a change to any caller:

```
POST /api/call-intelligence/query
{ filters: CallFilters, page, pageSize, sortKey, sortDir }
→ { rows, total, page, pageSize }
```

RBAC must be evaluated **server-side** in this endpoint. The client-side
masking in `rbac.ts` is a UX affordance, not a security boundary.
