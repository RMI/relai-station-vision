# RMI Project Dashboard Demo

This is a demo single-page React app built with Vite and Tailwind CSS, simulating an AI-powered dashboard for RMI, a sustainability nonprofit. It summarizes and displays project status updates from multiple users.

## Features
- High-level summary of the most important updates
- Searchable list of project update cards
- 30 example updates for 10 projects, each with 3 time points
- Light RMI-inspired color scheme (greens, blues, white)
## Getting Started

- Embeds each project update with `text-embedding-004` (first request builds index in memory).
- For each query: embeds the question, retrieves top similar updates via cosine similarity, and sends only those excerpts to `gemini-1.5-flash` for grounded synthesis.
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
- Legacy Vite + Express server removed.
- Tailwind scans `app`, `lib`, `components`, and legacy `src` paths.
- Styling is currently a mix of utility classes and minimal global CSS.

## Future Improvements (Optional)
- Persist embeddings to disk or KV store to avoid recomputation.
- Add streaming answer generation.
- Incorporate citations inline within the synthesized answer.
- Retrieval threshold prunes very low-similarity matches.
- Synthesis prompt enforces grounding & source citation.

*This demo is for illustrative purposes only and does not include live data or AI integration.*
