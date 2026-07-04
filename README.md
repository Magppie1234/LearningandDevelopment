# Magppie L&D Portal (Next.js)

Next.js 15 App Router build of the Magppie Learning & Development Portal.
See `E:\L&D\L&D\CLAUDE.md` for project-wide conventions.

## Running locally

```
npm install
npm run dev
```

Runs on port 3020 by default (see `.claude/launch.json` at the repo root,
config `magppie-ld-next`). The portal runs in **demo mode** without any
`.env.local` — click "Explore the portal (demo)" on the login screen. Copy
`.env.example` to `.env.local` and fill in real Supabase keys to use live auth.

## AI Assistant

The AI Assistant (`/ai-assistant`) answers questions from the **Magppie AI
Bot Master Training Document** (brand story, SilverStone product facts,
sales pitch flow, objection scripts, 62-question FAQ, pricing, store
directory, bot persona rules). It never answers from general knowledge —
if a question isn't covered, it says so and suggests flagging it for the
Training Lead.

### Answer synthesis via OpenRouter (active)

With `OPENROUTER_API_KEY` set in `.env.local`, `/api/assistant/chat` runs
two-stage RAG: loose keyword retrieval finds candidate chunks, then an LLM
(`anthropic/claude-haiku-4.5` via OpenRouter) writes the answer under strict
rules — answer only from the excerpts, reproduce verbatim scripts closely,
quote pricing exactly, never use the §2.4 forbidden words, and reply with
the "not in the training document" fallback when excerpts don't cover the
question. This handles rephrased and even Hinglish questions. If the key is
missing or the call fails, the route falls back to the keyword-only path
below, so the assistant always works.

### How it works without any keys (fallback path)

- The source PDF is transcribed into structured chunks in
  [`src/data/training-doc.ts`](src/data/training-doc.ts) — each chunk has a
  section number/title, a `category`, and an `isVerbatimScript` flag (true
  for content that must be reproduced closely, like sales scripts and the
  forbidden-words table; false for FAQ answers that read naturally either way).
- [`src/lib/training-search.ts`](src/lib/training-search.ts) scores chunks by
  keyword/phrase overlap against the user's question — no embedding API or
  LLM call needed. This is intentional: it's a fully working, zero-dependency
  retrieval layer that already answers accurately from the real document.
- [`src/app/api/assistant/chat/route.ts`](src/app/api/assistant/chat/route.ts)
  is the API the chat UI calls. The request/response shape is stable, so it
  can be upgraded to real vector search + an LLM call without touching the UI.

### Upgrading to vector search + an LLM (optional)

A `training_documents` Supabase table with `pgvector` is already migrated
(`supabase/migrations/0007_training_documents.sql`), including a
`match_training_documents()` similarity-search RPC. To activate it:

1. Set real Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`) and an embedding provider key
   (`OPENAI_API_KEY` by default) in `.env.local`.
2. Run the migration against your Supabase project.
3. Run `npm run ingest:training-doc` — this embeds every chunk in
   `src/data/training-doc.ts` and upserts it into `training_documents`.
4. Update `/api/assistant/chat` to call `match_training_documents()` via
   Supabase instead of (or in addition to) `answerFromTrainingDoc()`.

### Re-ingesting an updated training document

When the master document gets a new version:

1. Update the content in `src/data/training-doc.ts` to match the new PDF.
2. Bump `TRAINING_DOC_VERSION` at the top of that file (e.g. `'1.0'` → `'1.1'`).
3. If vector search is active, re-run `npm run ingest:training-doc` — it's
   idempotent: it deletes that document's previous-version rows first, so
   re-running never duplicates content (the migration's
   `unique(source_document, document_version, chunk_key)` constraint also
   guards against this at the DB level).
4. If only the keyword-search path is active (no Supabase/embedding keys
   set), no extra step is needed — the API route reads `training-doc.ts`
   directly, so the update is live as soon as the app rebuilds.
