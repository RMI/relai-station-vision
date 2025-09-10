import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEN_EMBED_MODEL, GEN_ANSWER_MODEL } from '../../../lib/aiModels';
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
  const embedModel = genAI.getGenerativeModel({ model: GEN_EMBED_MODEL });
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

function buildSnippet(text, maxLen=420){
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

// ----- NEW: mention detection utilities -----
const STOPWORDS = new Set(['the','and','for','with','from','that','this','have','has','had','were','was','been','are','any','but','not','into','onto','about','over','under','their','them','they','whose','which','what','when','where','why','how']);

function extractQueryTokens(raw){
  if (!raw) return [];
  return raw
    .toLowerCase()
    .split(/[\s,.;:!?()"/'+-]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

// ALL-token matching (strict). If you prefer ANY-token, set matchAll=false below.
function detectMentions(orderedEntries, tokens, { matchAll = true } = {}){
  if (!tokens.length) return [];
  const hits = [];
  for (let i=0;i<orderedEntries.length;i++){
    const txt = orderedEntries[i].text.toLowerCase();
    if (matchAll) {
      let all = true;
      for (const tk of tokens) {
        if (!txt.includes(tk)) { all = false; break; }
      }
      if (all) hits.push(i+1); // 1-based to align with snippet numbering
    } else {
      if (tokens.some(tk => txt.includes(tk))) hits.push(i+1);
    }
  }
  return hits;
}
// --------------------------------------------

function splitSentences(answer) {
  // Simple splitter; could refine for abbreviations if needed.
  return answer
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function isPerformanceTrackingQuery(q) {
  const l = q.toLowerCase();
  return /(most behind|underperform|raised the most|who .*behind|performance|track.*performance)/.test(l);
}

function analyzeAnswer(answer, { absenceFlag }) {
  const violations = [];
  const trimmed = answer.trim();

  if (absenceFlag === 'YES') {
    if (trimmed !== 'People should write better updates.') {
      violations.push('ABSENCE_FLAG=YES but answer not exactly fallback line');
    }
    // If correct fallback, we don't need further checks
    if (violations.length === 0) return { violations, sentences: [] };
    return { violations, sentences: [] };
  }

  // absenceFlag = NO
  if (/people should write better updates/i.test(trimmed)) {
    violations.push('Used fallback while ABSENCE_FLAG=NO');
  }
  const sentences = splitSentences(trimmed);

  if (!sentences.length) {
    violations.push('No sentences produced');
    return { violations, sentences: [] };
  }

  for (const s of sentences) {
    // Citation at end
    if (!/\[[0-9,\s]+\]$/.test(s)) {
      violations.push(`Missing or misplaced citation in sentence: "${s}"`);
    }
    // Begins with entity + "has reported"
    if (!/^[^.\[\]]+ has reported/i.test(s)) {
      violations.push(`Sentence does not start with "<Entity> has reported": "${s}"`);
    }
    // Avoid mid-sentence citations
    const midMatches = s.slice(0, -1).match(/\[[0-9,\s]+\]/g);
    if (midMatches && midMatches.length > 1) {
      violations.push(`Multiple citation blocks or mid-sentence citation: "${s}"`);
    }
  }
  return { violations, sentences };
}

// ----- existing code continues ...

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

    // Query embedding
    let qEmb;
    try {
      const embedModel = genAI.getGenerativeModel({ model: GEN_EMBED_MODEL });
      const qRes = await embedModel.embedContent({ content: { parts: [{ text: query }] } });
      qEmb = qRes.embedding.values;
    } catch(embedErr) {
      return NextResponse.json({ error: 'Failed to embed query', code: 'EMBED_QUERY_FAIL', detail: embedErr.message }, { status: 500 });
    }

    // Score all
    const scored = meta.map((m, i) => ({ ...m, score: cosineSim(qEmb, vectors[i]) }));
    scored.sort((a,b)=> b.score - a.score);
    console.log('[nl-search] top scores:', scored.slice(0,3).map(t=>t.score.toFixed(4)));

    // Build full corpus context under size guards
    const MAX_CONTEXT_ENTRIES = 2000;
    const MAX_CONTEXT_CHARS = 450000;
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
      running += block.length + 5;
    }
    const contextSubset = usedEntries; // ordered list actually in prompt
    let context = contextParts.join('\n---\n');

    // Matches list (UI) still top 25 by relevance
    const contextSources = scored.slice(0, 25);

    // ----- NEW: deterministic mention detection BEFORE prompt build -----
    const tokens = extractQueryTokens(query);
    // Choose ALL-token semantic; change to { matchAll:false } for ANY-token semantics
    const mentionIndices = detectMentions(contextSubset, tokens, { matchAll: true });
    const ABSENCE_FLAG = mentionIndices.length === 0 ? 'YES' : 'NO';
    const MENTIONED_SNIPPETS = mentionIndices.join(',');
    const MENTIONED_COUNT = mentionIndices.length;
    // --------------------------------------------------------------

    // Answer generation
    const GEN_TIMEOUT_MS = 30000;
    const model = genAI.getGenerativeModel({ model: GEN_ANSWER_MODEL });
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

    function buildPrompt(currentContext){
      // template already contains the contract now
      return template
        .replace(/{{QUERY}}/g, query)
        .replace(/{{CONTEXT}}/g, currentContext)
        + `

MENTIONED_SNIPPETS: ${MENTIONED_SNIPPETS || 'NONE'}
MENTIONED_COUNT: ${MENTIONED_COUNT}
ABSENCE_FLAG: ${ABSENCE_FLAG}
`;
    }

    async function generateOnce(currentContext){
      const prompt = buildPrompt(currentContext);
      const genPromise = model.generateContent(prompt).then(r => r?.response?.text() || '');
      const timeoutPromise = new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout exceeded')), GEN_TIMEOUT_MS));
      return Promise.race([genPromise, timeoutPromise]);
    }

    function violatesAbsence(ans){
      if (ABSENCE_FLAG === 'NO') {
        const lower = ans.toLowerCase();
        return /(not (in|present)|no (updates|snippets) mention|not found)/.test(lower) || /should write better updates/i.test(lower);
      }
      return false;
    }

    let answer = '';
    let attempt = 0;
    let trimmed = false;
    let fallbackUsed = false;
    let lastError = null;
    const MAX_ATTEMPTS = 2;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        answer = await generateOnce(context);
        if (!answer.trim()) throw new Error('empty response');
        // Absence violation check (only if model wrongly claims absence)
        if (violatesAbsence(answer)) {
          console.warn('[nl-search] model incorrectly implied absence; forcing rewrite');
          const rewritePrompt = `The earlier draft incorrectly stated absence. Rewrite answer.
Query: ${query}
Only cite snippet numbers from: ${MENTIONED_SNIPPETS || 'NONE'}
Context:
${context}
`;
          const rewrite = await model.generateContent(rewritePrompt).then(r => r?.response?.text() || '');
          if (rewrite.trim()) answer = rewrite;
        }
        break; // success
      } catch(err) {
        lastError = err;
        const classified = classifyError(err);
        if (attempt < MAX_ATTEMPTS && (classified === 'INVALID_REQUEST' || classified === 'TIMEOUT')) {
          // Trim context
          const reducedEntries = contextSubset.slice(0, Math.max(8, Math.floor(contextSubset.length/2)));
          trimmed = true;
          const trimmedParts = reducedEntries.map((t,i)=>{
            const txt = t.text.length > 1200 ? t.text.slice(0,1200)+'…' : t.text;
            return `[${i+1}] ${t.project} (${t.date})\n${txt}`;
          });
          context = trimmedParts.join('\n---\n');
          fallbackUsed = true;
          continue;
        }
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
      if (ABSENCE_FLAG === 'YES') {
        return NextResponse.json({
          matches: [],
          answer: 'People should write better updates.',
          meta: { forcedFallback: true }
        });
      }
      return NextResponse.json({ error: 'Empty answer returned by model', code: 'EMPTY_ANSWER', detail: 'Model responded with no textual content', matches: [] }, { status: 502 });
    }

    // Extract citations (matches snippet numbering in contextSubset)
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
    const contextByNumber = contextSubset.reduce((acc, entry, idx)=>{ acc[idx+1] = entry; return acc; }, {});
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
    return NextResponse.json({
      matches,
      answer,
      meta: {
        elapsedMs: elapsed,
        citedCount: matches.length,
        corpus: meta.length,
        contextEntries: contextSubset.length,
        contextChars: context.length,
        attemptCount: attempt,
        fallbackUsed,
        trimmed,
        absenceFlag: ABSENCE_FLAG,
        mentionedCount: MENTIONED_COUNT
      }
    });
  } catch (e) {
    console.error('nl-search error', e);
    return NextResponse.json({ error: e.message, code: 'UNCAUGHT', detail: e?.stack }, { status: 500 });
  }
}
