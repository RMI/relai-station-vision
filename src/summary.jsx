import React from 'react';
import { motion } from 'framer-motion';
import { hardcodedInsights } from './updatesData';

// Utility to slugify project names for DOM ids
export function projectSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
import { variants, listStagger } from './motionTokens';

// Use hardcoded insights instead of generating on the fly
export function getEmergingThemes(updates) {
  // Recent-interest themes: take the first 4 concise themes (no performance wording)
  const raw = hardcodedInsights.insights || [];
  const themes = raw
    .filter(t => !/on track|performance|percent|%/i.test(t))
    .slice(0, 4);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {themes.map((t, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 hover:border-neutral-300 transition-colors">
          <div className="text-[13px] font-medium text-neutral-800 leading-snug">
            {t}
          </div>
        </div>
      ))}
      {themes.length === 0 && (
        <div className="text-xs text-neutral-500">No conversational themes surfaced yet.</div>
      )}
    </div>
  );
}

export function getRelatedWork(updates) {
  const connections = [
    {
      title: 'Grid & AI signals',
      blurb: 'CI work on grid data + CFE grid intensity API should align schemas early.'
    },
    {
      title: 'MRV & provenance stack',
      blurb: 'CI, CFE, AEP, CFB citing AI-driven MRV—time for a shared tooling roadmap.'
    },
    {
      title: 'Product‑carbon harmonization',
      blurb: 'CAI, CI, CFT, China, CFE all pushing EU/US rule alignment; form a working pod.'
    },
    {
      title: 'Near‑zero materials procurement',
      blurb: 'CAI + CFB: unify labeling criteria and buyer enablement playbooks.'
    },
    {
      title: 'Provenance & battery passports',
      blurb: 'Chain-of-Custody and EV Battery Passport share traceability needs—standardize schema.'
    },
    {
      title: 'Microgrid signals',
      blurb: 'C3 microgrid standards + CFE carbon intensity API = location-based certification signals.'
    }
  ].slice(0,4);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {connections.map((c, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:shadow-sm transition-shadow">
          <div className="text-[13px] font-semibold text-neutral-800 leading-tight">{c.title}</div>
          <div className="mt-0.5 text-[12px] text-neutral-600 leading-snug">{c.blurb}</div>
        </div>
      ))}
      {connections.length === 0 && (
        <div className="text-xs text-neutral-500">No overlaps surfaced yet.</div>
      )}
    </div>
  );
}
// Utility to slugify date for element ids
export function dateSlug(dateStr = '') {
  return dateStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Basic stopword list for naive clustering
const STOPWORDS = new Set(['the','and','to','of','a','in','on','for','with','by','is','at','as','an','from','this','that','into','via','be','are','was','were','over','new','key','near']);

function tokenize(text = '') {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g,' ')
    .split(/\s+/)
    .filter(t => t && t.length > 2 && !STOPWORDS.has(t));
}

function sentenceFirst(text='') {
  return (text.split(/(?<=\.)\s+/)[0] || text).trim();
}

function clusterSentences(items, { minSimilarity = 0.3 } = {}) {
  // Each item: { project, date, raw, severity }
  const entries = items.map(it => {
    const sentence = sentenceFirst(it.raw);
    const tokens = Array.from(new Set(tokenize(sentence)));
    return { ...it, sentence, tokens };
  }).filter(e => e.sentence.length > 0 && e.tokens.length > 0);

  const clusters = [];
  const used = new Set();
  for (let i=0;i<entries.length;i++) {
    if (used.has(i)) continue;
    const base = entries[i];
    const groupIdxs = [i];
    for (let j=i+1;j<entries.length;j++) {
      if (used.has(j)) continue;
      const cand = entries[j];
      const inter = cand.tokens.filter(t => base.tokens.includes(t));
      const union = Array.from(new Set([...cand.tokens, ...base.tokens]));
      const sim = inter.length / union.length;
      if (sim >= minSimilarity || inter.length >= 3) {
        groupIdxs.push(j);
      }
    }
    groupIdxs.forEach(k => used.add(k));
    const group = groupIdxs.map(k => entries[k]);
    // Derive label: choose the shortest sentence OR majority tokens
    const label = group.slice().sort((a,b)=>a.sentence.length-b.sentence.length)[0].sentence.replace(/\.$/,'');
    clusters.push({ label, items: group });
  }
  // Only keep clusters with >1 project to satisfy "based on several cards"
  return clusters.filter(c => c.items.length > 1);
}

export function getSummary(updates, options = {}) {
  const { openProjectUpdate } = options;
  // Pick most recent update per project for signal recency
  const latestByProject = {};
  updates.forEach(u => {
    if (!latestByProject[u.project] || new Date(u.date) > new Date(latestByProject[u.project].date)) {
      latestByProject[u.project] = u;
    }
  });
  const recent = Object.values(latestByProject);

  const achievementItems = recent
    .filter(u => u.status_color === 'green' && u.key_developments_and_decisions)
    .map(u => ({ project: u.project, date: u.date, raw: u.key_developments_and_decisions }));
  const blockerItems = recent
    .filter(u => (u.status_color === 'yellow' || u.status_color === 'red') && u.key_blockers_and_concerns)
    .map(u => ({ project: u.project, date: u.date, raw: u.key_blockers_and_concerns, severity: u.status_color }));

  const achievementClusters = clusterSentences(achievementItems).slice(0,4);
  const blockerClusters = clusterSentences(blockerItems).slice(0,4);

  const noAchievements = achievementClusters.length === 0;
  const noBlockers = blockerClusters.length === 0;

  return (
    <motion.div className="space-y-6" variants={listStagger} initial="hidden" animate="visible">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h4 className="text-xs font-semibold tracking-wide text-neutral-600 uppercase mb-2">Cross-Project Achievements</h4>
          <div className="space-y-3">
            {noAchievements && <div className="text-xs text-neutral-500">No multi-project achievement clusters.</div>}
            {achievementClusters.map((c,idx) => (
              <div key={idx} className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                <div className="text-[12px] font-medium text-emerald-800 leading-snug">{c.label}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {c.items.map(item => (
                    <button
                      key={item.project}
                      type="button"
                      onClick={() => openProjectUpdate && openProjectUpdate(item.project, item.date)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      title={`Open update for ${item.project}`}
                    >
                      {item.project}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold tracking-wide text-neutral-600 uppercase mb-2">Cross-Project Blockers</h4>
          <div className="space-y-3">
            {noBlockers && <div className="text-xs text-neutral-500">No multi-project blocker clusters.</div>}
            {blockerClusters.map((c,idx) => (
              <div key={idx} className="rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2">
                <div className="text-[12px] font-medium text-amber-800 leading-snug">{c.label}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {c.items.map(item => (
                    <button
                      key={item.project}
                      type="button"
                      onClick={() => openProjectUpdate && openProjectUpdate(item.project, item.date)}
                      className={`text-[11px] px-2 py-0.5 rounded-full bg-white border ${item.severity === 'red' ? 'border-rose-300 text-rose-700 hover:bg-rose-100 focus:ring-rose-400' : 'border-amber-300 text-amber-700 hover:bg-amber-100 focus:ring-amber-400'} focus:outline-none focus:ring-2`}
                      title={`Open update for ${item.project}`}
                    >
                      {item.project}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// (Legacy analytical summary functions removed to keep top section intentionally lightweight.)
