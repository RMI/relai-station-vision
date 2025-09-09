# RMI Project Dashboard Demo

This is a demo single-page React app built with next.js and Tailwind CSS, simulating an AI-powered dashboard for RMI, a sustainability nonprofit. It summarizes and displays **synthetic** project status updates from multiple **synthetic** users.

## Features
- High-level summary of the most important updates
- Searchable list of project update cards
- **Synthetic** example updates for 20 **fictional** organizational leaders
## Getting Started
- Embeds each project update with `text-embedding-004` (first request builds index in memory).
- For each query: embeds the question, retrieves top similar updates via cosine similarity, and sends only those excerpts to `gemini-?` for grounded synthesis.
# Relai Station (Next.js)

Relai Station presents synthesized multi-program project updates with a natural language (LLM) corpus search powered by Gemini (embeddings + flash model) via a Next.js App Router API route.

## Stack
- Next.js 15 (App Router)
- React 18
- Tailwind CSS 3
- Framer Motion
- Google Generative AI (Gemini) for embeddings + answer generation

## Setup
1. Install dependencies
```
npm install
```
2. Provide a Google API key in `.env.local`:
```
GOOGLE_API_KEY=your_key_here
```
3. Start development server
```
npm run dev
```
Then open the reported local URL (defaults to http://localhost:3000 unless occupied).

## Natural Language Search
POST `/api/nl-search` with `{ "query": "your question" }`.
The API builds (once per cold start) an in-memory embedding cache of all updates, ranks top matches via cosine similarity, and synthesizes an answer grounded in the highest scoring snippets. If insufficient context exists, the model is prompted to say so. No local heuristic fallback is retained—missing key or errors return a 500 with an error message that is surfaced in the UI.

## Scripts
```
npm run dev    # Start Next dev server
npm run build  # Production build
npm run start  # Start production server (after build)
npm run lint   # Next lint
```

## Deployment
Deploy to any Node-capable host (e.g. Vercel). Ensure `GOOGLE_API_KEY` env var is set. Embedding cache is in-memory; for scale or cold start mitigation consider persisting precomputed embeddings.

## Notes
- Tailwind scans `app`, `lib`, `components`, and legacy `src` paths.
- Styling is currently a mix of utility classes and minimal global CSS.

*This demo is for illustrative purposes only and does not include real data.*

## Project Card Summaries (Precomputed)

Project overview cards use precomputed summaries stored in `data/projectSummaries.static.json`.

These are generated with a Gemini model using the prompt in `prompts/project_card_summaries.md`.

### Regenerating Summaries
1. Ensure `GOOGLE_API_KEY` is set in your environment.
2. (Optional) Set `GEMINI_GEN_MODEL` to override the default model.
3. Run:
```
node scripts/regenerateProjectSummaries.mjs
```
4. Commit the updated `data/projectSummaries.static.json`.

### Schema
Each project entry:
```json
{
	"status_color": "green | yellow | red",
	"headline": "string",
	"recentFocus": "string (optional)",
	"keyRisks": "string (optional)",
	"themes": ["string", "..."]
}
```
`__meta` contains generation metadata.

### Fallback Behavior
If a project in raw `updatesData` lacks a static summary, a minimal placeholder (latest status & truncated focus/risk) is used. Regenerate to replace placeholders with curated summaries.
