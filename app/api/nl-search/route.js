import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import updatesData from '../../../lib/updatesData';
import { GEN_ANSWER_MODEL } from '../../../lib/aiModels';

// Unified prompt-based natural language search (summary-style)
// Adds detailed debug logging to inspect exact prompt/query sent to Gemini.

const CACHE = new Map(); // key -> { ts, answer, generatedAt }
const TTL_MS = 1000 * 30; // 30 seconds

function buildCorpusSlice() {
  return updatesData.map(u => ({
    program: u.program,
    project: u.project,
    owner: u.owner,
    date: u.date,
    objectives: u.objectives || [],
    key_achievements: u.key_achievements,
    key_blockers_and_concerns: u.key_blockers_and_concerns,
    key_new_insights_and_decisions: u.key_new_insights_and_decisions,
    fyis: u.fyis,
    upcoming_milestones: u.upcoming_milestones,
    overall_project_summary: u.overall_project_summary,
    overall_project_status: u.overall_project_status,
    status_color: u.status_color
  }));
}

async function loadPrompt() {
  const p = path.join(process.cwd(), 'prompts', 'nl_answer.md');
  return fs.readFile(p, 'utf8');
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export async function POST(req) {
  const start = Date.now();
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Google API key', code: 'NO_API_KEY' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const queryRaw = (body?.query || '').trim();
    const debugRequested = !!body?.debug;
    const debugEnv = process.env.DEBUG_NL_SEARCH === '1' || process.env.DEBUG_NL_SEARCH === 'true';
    const debug = debugRequested || debugEnv;

    if (!queryRaw || queryRaw.length < 3) {
      return NextResponse.json({
        answer: '',
        meta: { reason: 'QUERY_TOO_SHORT', elapsedMs: Date.now() - start, query: queryRaw }
      });
    }

    const query = queryRaw;
    const key = query.toLowerCase();
    const now = Date.now();
    const cached = CACHE.get(key);
    if (cached && (now - cached.ts) < TTL_MS) {
      console.log('[nl-search] cache hit', { query, cachedAt: cached.generatedAt });
      return NextResponse.json({
        answer: cached.answer,
        fromCache: true,
        generatedAt: cached.generatedAt,
        meta: { cached: true, elapsedMs: Date.now() - start, query }
      });
    }

    const corpus = buildCorpusSlice();
    if (debug) {
      const progSet = new Set(corpus.map(c=>c.program).filter(Boolean));
      console.log('[nl-search][debug] program coverage', { distinctPrograms: progSet.size, programs: Array.from(progSet).slice(0,12) });
    }
    const promptTemplate = await loadPrompt();

    let system = promptTemplate;
    if (/{{QUERY}}/g.test(system)) {
      system = system.replace(/{{QUERY}}/g, query);
    } else {
      system += `\n\nQUESTION: ${query}`;
    }

    // Serialize entire corpus (guard at a high char limit)
    const corpusJson = JSON.stringify(corpus);
    const truncated = corpusJson.length > 4500000;
    const corpusSlice = truncated ? corpusJson.slice(0, 4500000) : corpusJson;

    const fullPrompt = `${system}\n\nCORPUS_DATA:\n${corpusSlice}`;
    const fullHash = sha256(fullPrompt);

    // Debug logging (without always dumping full prompt)
    const previewHead = fullPrompt.slice(0, 600);
    const previewTail = fullPrompt.slice(-600);
    console.log('[nl-search][debug] outbound request meta', {
      query,
      model: GEN_ANSWER_MODEL,
      corpusUpdates: corpus.length,
      corpusJsonChars: corpusJson.length,
      truncatedCorpus: truncated,
      promptChars: fullPrompt.length,
      promptHash: fullHash
    });
    if (debug) {
      console.log('[nl-search][debug] prompt.head(600)\n' + previewHead);
      console.log('[nl-search][debug] prompt.tail(600)\n' + previewTail);
      // Only print full prompt if explicitly forced to avoid >MB logs
      if (process.env.DEBUG_NL_SEARCH_FULL === '1') {
        console.log('[nl-search][debug] FULL_PROMPT_BEGIN\n' + fullPrompt + '\nFULL_PROMPT_END');
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEN_ANSWER_MODEL });

    let answer = '';
    let rawLength = 0;
    try {
      const response = await model.generateContent(fullPrompt);
      answer = (response?.response?.text() || '').trim();
      rawLength = answer.length;
    } catch (genErr) {
      console.error('[nl-search][error] model call failed', {
        query,
        error: genErr?.message,
        stack: genErr?.stack
      });
      return NextResponse.json({
        error: 'MODEL_ERROR',
        detail: genErr?.message || 'Unknown model error',
        meta: {
          query,
          promptHash: fullHash,
          elapsedMs: Date.now() - start
        }
      }, { status: 502 });
    }

    if (!answer) {
      console.warn('[nl-search][warn] empty answer', { query, promptHash: fullHash });
      answer = 'No relevant content found.';
    }

    // Optional heuristic: if model returns generic absence but we *do* have corpus,
    // we can log it for later improvement.
    if (/no (relevant|meaningful) (content|information)/i.test(answer) && corpus.length > 0) {
      console.log('[nl-search][info] generic absence response despite non-empty corpus', {
        query,
        corpusUpdates: corpus.length,
        promptHash: fullHash
      });
    }

    const elapsedMs = Date.now() - start;
    console.log('[nl-search] success', { query, answerChars: rawLength, elapsedMs });

    const payload = {
      answer,
      fromCache: false,
      generatedAt: new Date().toISOString(),
      meta: {
        query,
        corpusSize: corpus.length,
        promptHash: fullHash,
        promptChars: fullPrompt.length,
        truncatedCorpus: truncated,
        elapsedMs
      }
    };
    CACHE.set(key, { ts: now, answer, generatedAt: payload.generatedAt });
    return NextResponse.json(payload);
  } catch (e) {
    console.error('[nl-search unified] fatal error', e);
    return NextResponse.json({ error: e?.message || 'Unknown error', code: 'NL_SEARCH_FAIL' }, { status: 500 });
  }
}
