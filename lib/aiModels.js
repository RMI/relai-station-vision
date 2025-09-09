// Centralized Gemini model constants with environment overrides.
// Adjust via environment variables without touching code.
export const GEN_EMBED_MODEL  = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004';
export const GEN_ANSWER_MODEL = process.env.GEMINI_GEN_MODEL   || 'gemini-2.5-flash-lite';