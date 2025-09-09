#!/usr/bin/env node
/**
 * Regenerate project card summaries using Gemini.
 * NOTE: This is a scaffold; fill in actual model call and JSON validation before production use.
 */
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import updatesData from '../lib/updatesData.js';

const PROMPT_FILE = path.join(process.cwd(), 'prompts', 'project_card_summaries.md');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'projectSummaries.static.json');

async function groupByProject() {
  const map = {};
  for (const u of updatesData) {
    (map[u.project] = map[u.project] || []).push(u);
  }
  Object.values(map).forEach(list => list.sort((a,b)=> new Date(a.date) - new Date(b.date)));
  return map;
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_API_KEY');
    process.exit(1);
  }
  const promptTemplate = await fs.readFile(PROMPT_FILE, 'utf8');
  const grouped = await groupByProject();
  const payload = Object.entries(grouped).map(([name, updates]) => ({ project: name, updates }));

  // Chunk if needed
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_GEN_MODEL || 'gemini-2.5-flash-lite';
  const model = genAI.getGenerativeModel({ model: modelName });

  const userContent = `PROJECT_UPDATES_JSON=\n${JSON.stringify(payload).slice(0, 180000)}`; // crude size guard
  const fullPrompt = `${promptTemplate}\n\n${userContent}`;
  console.log('Generating summaries with model', modelName, '...');
  const res = await model.generateContent(fullPrompt);
  const text = res?.response?.text() || '';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse model output as JSON');
    console.error(text.slice(0,2000));
    process.exit(2);
  }

  parsed.__meta = {
    description: 'Precomputed project card summaries. Regenerate via scripts/regenerateProjectSummaries.mjs',
    generatedAt: new Date().toISOString(),
    prompt: path.basename(PROMPT_FILE),
    schemaVersion: 1,
    model: modelName
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(parsed, null, 2));
  console.log('Wrote', OUTPUT_FILE);
}

main().catch(e => { console.error(e); process.exit(1); });
