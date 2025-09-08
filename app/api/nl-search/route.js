import { NextResponse } from 'next/server';
import OpenAI from 'openai';
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

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// Keep server output raw; client will highlight tokens
function buildSnippet(text, maxLen = 420) {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

// Initialize Azure OpenAI client
function getAzureClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
  if (!endpoint || !apiKey) {
    throw new Error('Missing Azure OpenAI configuration (AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY)');
  }
  // Base URL includes api-version so the SDK doesn't need query injection per call
  const baseURL = `${endpoint.replace(/\/$/, '')}/openai/deployments`; // SDK will append /{deployment}/{operation}
  const client = new OpenAI({
    apiKey,
    baseURL: `${baseURL}?api-version=${apiVersion}`,
    defaultHeaders: { 'api-key': apiKey }
  });
  return client;
}

async function verifyDeploymentExists(client, deploymentName, type) {
  // Lightweight probe: attempt a minimal embeddings or chat call with benign input; catch 404 explicitly.
  try {
    if (type === 'embedding') {
      await client.embeddings.create({ model: deploymentName, input: 'ping' });
    } else {
      await client.chat.completions.create({ model: deploymentName, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, temperature: 0 });
    }
    return true;
  } catch (e) {
    if (e.status === 404) {
      throw new Error(`Azure OpenAI ${type} deployment "${deploymentName}" not found (404). Check the deployment name & api-version.`);
    }
    // For other errors (401/403) let caller handle credentials or permission issues
    return true; // Do not block on transient issues here.
  }
}

// Fetch or build embeddings for corpus
async function ensureEmbeddings() {
  if (embeddingCache) return embeddingCache;

  const embedDeployment = process.env.AZURE_OPENAI_EMBED_DEPLOYMENT;
  if (!embedDeployment) {
    throw new Error('Missing AZURE_OPENAI_EMBED_DEPLOYMENT');
  }

  const client = getAzureClient();
  // Fast upfront sanity check to fail early on 404 rather than N times.
  await verifyDeploymentExists(client, embedDeployment, 'embedding');

  const entries = buildCorpusEntries();

  // Batch embeddings to reduce round trips (Azure supports array input). We'll chunk to avoid huge payloads.
  const CHUNK_SIZE = 20; // tune as needed
  const vectors = [];
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const slice = entries.slice(i, i + CHUNK_SIZE);
    const inputs = slice.map(e => e.text.slice(0, 8000));
    try {
      const resp = await client.embeddings.create({ model: embedDeployment, input: inputs });
      resp.data.forEach((row, idx) => { vectors.push(row.embedding); });
    } catch (e) {
      // If the whole batch fails, log and push blanks for each to preserve index alignment
      console.error('[nl-search] embedding batch failure indices', i, '-', i + slice.length - 1, e);
      slice.forEach(() => vectors.push([]));
    }
  }

  // Quality check: if too many blanks, abort so caller can surface a clean error.
  const blankCount = vectors.filter(v => v.length === 0).length;
  if (blankCount / vectors.length > 0.5) {
    throw new Error(`More than 50% of embedding attempts failed (${blankCount}/${vectors.length}). Check deployment / quota.`);
  }

  embeddingCache = { vectors, meta: entries };
  return embeddingCache;
}

export async function POST(req) {
  const start = Date.now();
  try {
    console.log('[nl-search] request start');
    const { query } = await req.json();
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ matches: [], answer: '' });
    }

    // Prepare embeddings
    let cache;
    try {
      cache = await ensureEmbeddings();
    } catch (embInitErr) {
      return NextResponse.json(
        { error: 'Failed to initialize embeddings', code: 'EMBED_INIT_FAIL', detail: embInitErr.message },
        { status: 500 }
      );
    }

    const { vectors, meta } = cache;
    if (!meta.length) {
      return NextResponse.json({ matches: [], answer: '', warning: 'Empty corpus' });
    }

    // Query embedding
    const embedDeployment = process.env.AZURE_OPENAI_EMBED_DEPLOYMENT;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    if (!chatDeployment) {
      return NextResponse.json(
        { error: 'Missing AZURE_OPENAI_CHAT_DEPLOYMENT', code: 'NO_CHAT_DEPLOYMENT' },
        { status: 500 }
      );
    }

    let qEmb;
    try {
      const client = getAzureClient();
      // Quick verify only once per cold start for chat deployment if missing; avoids extra ping every request
      if (!process.env.__CHAT_VERIFIED && chatDeployment) {
        try { await verifyDeploymentExists(client, chatDeployment, 'chat'); process.env.__CHAT_VERIFIED = '1'; } catch (ignored) { /* We'll surface later if real usage fails */ }
      }
      const qRes = await client.embeddings.create({ model: embedDeployment, input: query });
      qEmb = qRes.data[0].embedding;
    } catch (embedQueryErr) {
      const code = embedQueryErr?.status === 404 ? 'EMBED_DEPLOYMENT_NOT_FOUND' : 'EMBED_QUERY_FAIL';
      return NextResponse.json(
        { error: 'Failed to embed query', code, detail: embedQueryErr.message },
        { status: 500 }
      );
    }

    // Score
    const scored = meta.map((m, i) => {
      const vec = vectors[i];
      const score = vec.length ? cosineSim(qEmb, vec) : -1;
      return { ...m, score };
    }).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 18);
    const contextSources = top.slice(0, 8);
    console.log('[nl-search] top scores:', contextSources.slice(0, 3).map(s => s.score.toFixed(4)));

    const context = contextSources
      .map((t, i) => `[${i + 1}] ${t.project} (${t.date})\n${t.text}`)
      .join('\n---\n');

    // Build prompt (converted to Chat format)
    const system = `You are an assistant summarizing internal project update snippets.
Provide a concise, factual answer grounded ONLY in the provided numbered context.
After each claim, append source number(s) e.g. [1] or [2,4].
If info is missing, explicitly state the context does not contain it.
Do NOT fabricate figures or content.
Sources available: 1-8 only.`;

    const userPrompt = `User question: "${query}"

Context (each source numbered):
${context}

Answer:`;

    let answer = '';
    try {
      const client = getAzureClient();
      // Azure OpenAI Chat Completions (OpenAI v4 SDK uses client.chat.completions)
      const completion = await client.chat.completions.create({
        model: chatDeployment,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
            // userPrompt includes context
          { role: 'user', content: userPrompt }
        ]
      });
      answer = completion.choices?.[0]?.message?.content?.trim() || '';
    } catch (genErr) {
      console.error('[nl-search] generation failed', genErr);
      return NextResponse.json(
        { error: 'Failed to generate answer', code: 'ANSWER_FAIL', detail: genErr.message, matches: [] },
        { status: 500 }
      );
    }

    const matches = contextSources.map((t, i) => ({
      id: t.id,
      project: t.project,
      date: t.date,
      score: t.score,
      rank: i + 1,
      snippet: buildSnippet(t.text)
    }));

    console.log('[nl-search] success in', Date.now() - start, 'ms');
    return NextResponse.json({ matches, answer });
  } catch (e) {
    console.error('nl-search error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
