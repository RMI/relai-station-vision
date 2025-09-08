import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import updatesData from '../../../lib/updatesData';
import fs from 'fs/promises';
import path from 'path';

// In-memory embedding cache (module-level)
let embeddingCache = null; // { vectors: number[][], meta: [{id, project, date, text}] }
let answerPromptCache = null; // cached markdown string

async function loadAnswerPrompt(){
  if (answerPromptCache) return answerPromptCache;
  try {
    const p = path.join(process.cwd(), 'prompts', 'nl_answer.md');
    answerPromptCache = await fs.readFile(p, 'utf8');
  } catch(e){
    answerPromptCache = `You are an assistant. Use context. Question: {{QUERY}} Context: {{CONTEXT}}`;
  }
  return answerPromptCache;
}

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

    // Score all and retain full ordering for matches while providing ENTIRE corpus context.
    const scored = meta.map((m, i) => ({ ...m, score: cosineSim(qEmb, vectors[i]) }));
    scored.sort((a,b)=> b.score - a.score);
    console.log('[nl-search] top scores:', scored.slice(0,3).map(t=>t.score.toFixed(4)));

    // Build numbered context with size & char safeguards.
    const MAX_CONTEXT_ENTRIES = 120; // hard ceiling
    const MAX_CONTEXT_CHARS = 45000; // approximate token safety guard
    const contextEntriesRaw = meta.slice(0, MAX_CONTEXT_ENTRIES);
    let running = 0;
    const contextParts = [];
    const usedEntries = [];
    for (let i=0; i<contextEntriesRaw.length; i++) {
      const t = contextEntriesRaw[i];
      const block = `[${i+1}] ${t.project} (${t.date})\n${t.text}`;
      if ((running + block.length) > MAX_CONTEXT_CHARS) break;
      contextParts.push(block);
      usedEntries.push(t);
      running += block.length + 5; // include delimiter estimate
    }
    let contextSubset = usedEntries; // actual entries included in context
    let context = contextParts.join('\n---\n');

    // For matches list we still return top relevance subset (first 25 for UI)
    const contextSources = scored.slice(0, 25);

    // Generate answer with timeout, retry, enriched error classification
    const GEN_TIMEOUT_MS = 30000; // 30s ceiling
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const template = await loadAnswerPrompt();

    function classifyError(err){
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('invalid json payload') || msg.includes('unknown name')) return 'INVALID_REQUEST';
      if (msg.includes('rate') || msg.includes('quota')) return 'RATE_LIMIT';
      if (msg.includes('timeout')) return 'TIMEOUT';
      if (msg.includes('permission') || msg.includes('auth') || msg.includes('unauthorized')) return 'AUTH';
      if (msg.includes('overloaded') || msg.includes('resource')) return 'OVERLOADED';
      if (msg.includes('empty response')) return 'EMPTY_ANSWER';
      return 'UNKNOWN';
    }

    async function generateOnce(currentContext){
      const prompt = template
        .replace(/{{QUERY}}/g, query)
        .replace(/{{CONTEXT}}/g, currentContext);
      const genPromise = model.generateContent(prompt).then(r => r?.response?.text() || '');
      const timeoutPromise = new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout exceeded')), GEN_TIMEOUT_MS));
      return Promise.race([genPromise, timeoutPromise]);
    }

    let answer = '';
    let attempt = 0;
    let fallbackUsed = false;
    let trimmed = false;
    let lastError = null;
    const MAX_ATTEMPTS = 2;
    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        answer = await generateOnce(context);
        if (!answer.trim()) throw new Error('empty response');
        break; // success
      } catch(err) {
        lastError = err;
        const classified = classifyError(err);
        // If invalid request or timeout on first attempt, try trimming context and retry.
        if (attempt < MAX_ATTEMPTS && (classified === 'INVALID_REQUEST' || classified === 'TIMEOUT')) {
          // Trim: reduce entries by half and shorten each block to 1200 chars
          const reducedEntries = contextSubset.slice(0, Math.max(8, Math.floor(contextSubset.length/2)));
          trimmed = true;
            const trimmedParts = reducedEntries.map((t,i)=>{
            const txt = t.text.length > 1200 ? t.text.slice(0,1200)+'…' : t.text;
            return `[${i+1}] ${t.project} (${t.date})\n${txt}`;
          });
          contextSubset = reducedEntries;
          context = trimmedParts.join('\n---\n');
          fallbackUsed = true;
          continue; // retry
        }
        // Non-retry or exhausted attempts
        const diagnostics = {
          code: classified,
          raw: err?.message || String(err),
          elapsedMs: Date.now() - start,
          corpusSize: meta.length,
          contextEntries: contextSubset.length,
          contextChars: context.length,
          queryLength: query.length,
          attempt,
          fallbackUsed,
          trimmed
        };
        console.error('[nl-search] generation error', diagnostics);
        const httpStatus = classified === 'RATE_LIMIT' ? 429 : classified === 'AUTH' ? 401 : classified === 'TIMEOUT' ? 504 : classified === 'INVALID_REQUEST' ? 400 : 500;
        return NextResponse.json({ error: 'Failed to generate answer', code: 'ANSWER_FAIL', diagnostics, matches: [] }, { status: httpStatus });
      }
    }
    if (!answer || !answer.trim()) {
      return NextResponse.json({ error: 'Empty answer returned by model', code: 'EMPTY_ANSWER', detail: 'Model responded with no textual content', matches: [] }, { status: 502 });
    }

    // Extract cited source numbers from answer (e.g., [1], [2,4,7])
    function extractCitations(ans, maxIndex){
      const citedOrder = [];
      const seen = new Set();
      const re = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
      let m;
      while((m = re.exec(ans))){
        const group = m[1].split(/\s*,\s*/).map(n=>parseInt(n,10)).filter(n=>Number.isInteger(n) && n>=1 && n<=maxIndex);
        for(const n of group){
          if(!seen.has(n)) { seen.add(n); citedOrder.push(n); }
        }
      }
      return citedOrder;
    }
    const citedNumbers = extractCitations(answer, contextSubset.length);
    // Map numbered context (1-based) to entries
    const contextByNumber = contextSubset.reduce((acc, entry, idx)=>{ acc[idx+1] = entry; return acc; }, {});
    // Build matches only for cited sources; include score if available
    const scoreById = scored.reduce((acc,s)=>{ acc[s.id] = s.score; return acc; }, {});
    const matches = citedNumbers.map((num, rankIdx) => {
      const entry = contextByNumber[num];
      if(!entry) return null;
      return {
        id: entry.id,
        project: entry.project,
        date: entry.date,
        score: scoreById[entry.id] ?? null,
        rank: rankIdx + 1,
        sourceNumber: num,
        snippet: buildSnippet(entry.text)
      };
    }).filter(Boolean);

    const elapsed = Date.now()-start;
    console.log('[nl-search] success in', elapsed,'ms','citations:', matches.length,'attempts:', attempt, trimmed ? '(trimmed)' : '');
  return NextResponse.json({ matches, answer, meta: { elapsedMs: elapsed, citedCount: matches.length, corpus: meta.length, attemptCount: attempt, contextEntries: contextSubset.length, contextChars: context.length, fallbackUsed, trimmed } });
  } catch (e) {
    console.error('nl-search error', e);
    return NextResponse.json({ error: e.message, code: 'UNCAUGHT', detail: e?.stack }, { status: 500 });
  }
}
