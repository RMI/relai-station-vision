import React from 'react';
import { hardcodedInsights } from './updatesData';

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


export function getSummary(updates, options = {}) {
  const { onProgramClick } = options;
  // Get the most recent updates for each project
  const projectsMap = {};
  updates.forEach(update => {
    if (!projectsMap[update.project] || new Date(update.date) > new Date(projectsMap[update.project].date)) {
      projectsMap[update.project] = update;
    }
  });
  
  // Convert to array of most recent updates per project
  const mostRecentUpdates = Object.values(projectsMap);
  
  // Get color counts
  const colorCounts = {
    green: mostRecentUpdates.filter(u => u.status_color === 'green').length,
    yellow: mostRecentUpdates.filter(u => u.status_color === 'yellow').length,
    red: mostRecentUpdates.filter(u => u.status_color === 'red').length
  };
  // Static content only: do not flag newly changed status here
  const newlyRed = [];
  const newlyGreen = [];
  
  // Use the existing executive summary function with hardcoded data
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-4 flex justify-between items-center">
        <h3 className="font-bold text-white text-lg">Relai Overview</h3>
        <div className="text-white text-xs font-medium">{currentDate}</div>
      </div>
      <div className="p-4 bg-white">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200">
            <span className="font-semibold text-neutral-800 mr-1">Projects:</span>
            {hardcodedInsights.summary.totalProjects}
          </div>
          <div className="px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 flex items-center gap-1">
            <span className="font-semibold text-neutral-800 mr-1">Status:</span>
            <span className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-500"></span>{hardcodedInsights.summary.statusBreakdown.green}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{hardcodedInsights.summary.statusBreakdown.yellow}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{hardcodedInsights.summary.statusBreakdown.red}</span>
            </span>
          </div>
          <div className="px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200">
            <span className="font-semibold text-neutral-800 mr-1">Programs:</span>{hardcodedInsights.summary.sectors.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// (Legacy analytical summary functions removed to keep top section intentionally lightweight.)
