import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import updatesData from '../../../lib/updatesData';
import { GEN_ANSWER_MODEL } from '../../../lib/aiModels';

// In-memory cache (resets on server restart / redeploy)
// Structure: { key: { ts: number, data: { achievements, flags, trends } } }
const CACHE = new Map();
const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function scopeUpdates(scope) {
  if (!scope || scope.mode === 'overall') return updatesData;
  if (scope.mode === 'program' && scope.value) return updatesData.filter(u => u.program === scope.value);
  if (scope.mode === 'objective' && scope.value) return updatesData.filter(u => Array.isArray(u.objectives) && u.objectives.map(String).includes(String(scope.value)));
  return updatesData;
}

function buildCorpusSlice(updates) {
  // Compact JSON lines so we can stay under model token limits; join minimal necessary fields.
  return updates.map(u => ({
    project: u.project,
    date: u.date,
    status_color: u.status_color,
    key_developments_and_decisions: u.key_developments_and_decisions,
    key_new_insights_and_decisions: u.key_new_insights_and_decisions,
    key_blockers_and_concerns: u.key_blockers_and_concerns,
    emerging_themes: u.emerging_themes,
    funding_conversation: u.funding_conversation,
    overall_project_status: u.overall_project_status
  }));
}

async function loadPrompt(name) {
  const filePath = path.join(process.cwd(), 'prompts', `${name}.md`);
  return fs.readFile(filePath, 'utf8');
}

async function generateSection(genAI, modelName, promptMd, label, corpusJson) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const system = promptMd.replace(/^#.*\n/, '').trim();
  const userContent = `DATA:\n${JSON.stringify(corpusJson).slice(0, 45000)}`; // guard size
  const fullPrompt = `${system}\n\n${userContent}`;
  const res = await model.generateContent(fullPrompt);
  const text = res?.response?.text() || '';
  return text.trim();
}

export async function POST(req) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing Google API key', code: 'NO_API_KEY' }, { status: 500 });
    const body = await req.json().catch(()=>({}));
    const { scope } = body || {}; // { mode: 'overall'|'program'|'objective', value?: string }
    const cacheKey = JSON.stringify(scope || { mode: 'overall' });
    const now = Date.now();
    const cached = CACHE.get(cacheKey);
    if (cached && (now - cached.ts) < TTL_MS) {
      return NextResponse.json({ fromCache: true, ...cached.data });
    }

    const scoped = scopeUpdates(scope);
    if (!scoped.length) {
      return NextResponse.json({ achievements: '**No data in scope**', flags: '**No data in scope**', trends: '**No data in scope**' });
    }
    const corpus = buildCorpusSlice(scoped);
    const genAI = new GoogleGenerativeAI(apiKey);

    // Load prompts in parallel
    const [achPrompt, flagPrompt, trendPrompt] = await Promise.all([
      loadPrompt('achievements'),
      loadPrompt('flags'),
      loadPrompt('trends')
    ]);

    // Generate sequentially to avoid rate spikes (could parallelize if needed)
    const achievements = await generateSection(genAI, GEN_ANSWER_MODEL, achPrompt, 'achievements', corpus);
    const flags = await generateSection(genAI, GEN_ANSWER_MODEL, flagPrompt, 'flags', corpus);
    const trends = await generateSection(genAI, GEN_ANSWER_MODEL, trendPrompt, 'trends', corpus);

    const data = { achievements, flags, trends, fromCache: false, generatedAt: new Date().toISOString() };
    CACHE.set(cacheKey, { ts: now, data });
    return NextResponse.json(data);
  } catch (e) {
    console.error('[summary] error', e);
    return NextResponse.json({ error: e.message || 'Unknown error', code: 'SUMMARY_FAIL' }, { status: 500 });
  }
}
