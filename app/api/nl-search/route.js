import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import updatesData from '../../../lib/updatesData';

// In-memory embedding cache (module-level)
let embeddingCache = null; // { vectors: number[][], meta: [{id, project, date, text}] }

function buildCorpusEntries() {
  // Build a representative text block per update (concatenate key fields)
  return updatesData.map((u, idx) => ({
    id: `upd-${idx}`,
    project: u.project,
    date: u.date,
    text: [
      u.key_developments_and_decisions,
      u.key_new_insights_and_decisions,
      u.key_blockers_and_concerns,
      u.emerging_themes,
      u.overall_project_status,
      u.funding_conversation
    ].filter(Boolean).join('\n')
  }));
}

async function ensureEmbeddings(apiKey) {
  if (embeddingCache) return embeddingCache;
  const genAI = new GoogleGenerativeAI(apiKey);
  const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const entries = buildCorpusEntries();
  const vectors = [];
  for (const entry of entries) {
    const res = await embedModel.embedContent({
      content: { parts: [{ text: entry.text.slice(0, 8000) }] }
    });
    vectors.push(res.embedding.values);
  }
  embeddingCache = { vectors, meta: entries };
  return embeddingCache;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i=0;i<a.length;i++){ const x=a[i]; const y=b[i]; dot+=x*y; na+=x*x; nb+=y*y; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// Keep server output raw; client will highlight tokens
function buildSnippet(text, maxLen=420){
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export async function POST(req) {
  try {
    const start = Date.now();
    console.log('[nl-search] request start');
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing Google API key', code: 'NO_API_KEY' }, { status: 500 });
    const { query } = await req.json();
    console.log('[nl-search] query:', query);
    if (!query || query.trim().length < 3) return NextResponse.json({ matches: [], answer: '' });

    const genAI = new GoogleGenerativeAI(apiKey);
  const { vectors, meta } = await ensureEmbeddings(apiKey);
  console.log('[nl-search] corpus size:', meta.length);
    if (!meta.length) return NextResponse.json({ matches: [], answer: '', warning: 'Empty corpus' });
    let qEmb;
    try {
      const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const qRes = await embedModel.embedContent({ content: { parts: [{ text: query }] } });
      qEmb = qRes.embedding.values;
    } catch(embedErr) {
      return NextResponse.json({ error: 'Failed to embed query', code: 'EMBED_QUERY_FAIL', detail: embedErr.message }, { status: 500 });
    }

    // Score
  const scored = meta.map((m, i) => ({ ...m, score: cosineSim(qEmb, vectors[i]) }));
    scored.sort((a,b)=> b.score - a.score);
  const top = scored.slice(0, 18);
  console.log('[nl-search] top scores:', top.slice(0,3).map(t=>t.score.toFixed(4)));

    // Compose context for answer
  const contextSources = top.slice(0, 8);
  const context = contextSources.map((t,i) => `[${i+1}] ${t.project} (${t.date})\n${t.text}`).join('\n---\n');

    // Generate answer
    let answer = '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `You are an assistant summarizing internal project update snippets.\nUser question: "${query}"\nContext (each source is numbered in square brackets):\n${context}\nInstructions: Provide a concise, factual answer grounded ONLY in the numbered context above. \nRequirements: \n- After each distinct claim, append the source number(s) in square brackets (e.g., [1], or [2,4]). \n- Use only source numbers 1-8. \n- If information is not present, state that the context does not contain that detail. \n- Do not fabricate numbers or content. \nAnswer:`;
      const resp = await model.generateContent(prompt);
      answer = resp.response.text();
    } catch(genErr) {
      return NextResponse.json({ error: 'Failed to generate answer', code: 'ANSWER_FAIL', detail: genErr.message, matches: [] }, { status: 500 });
    }

    const matches = contextSources.map((t,i) => ({
      id: t.id,
      project: t.project,
      date: t.date,
      score: t.score,
      rank: i+1,
      snippet: buildSnippet(t.text)
    }));

    console.log('[nl-search] success in', Date.now()-start,'ms');
  return NextResponse.json({ matches, answer });
  } catch (e) {
    console.error('nl-search error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
