// Updated to use new synthetic v5 corpus structure
import relaiV5 from '../relais_corpus_unique_v5.json';
import staticSummaries from '../data/projectSummaries.static.json';

// Heuristic status color derivation from free-form overall_project_status text
function deriveStatusColor(text = '') {
  if (!text) return 'green';
  const s = text.toLowerCase();
  // Explicit color keywords first
  if (/\bgreen\b/.test(s)) return 'green';
  if (/\bred\b/.test(s)) return 'red';
  if (/\byellow\b|\bamber\b/.test(s)) return 'yellow';
  // Phrase-based heuristics
  if (/on[- ]?track|healthy|steady progress/.test(s)) return 'green';
  if (/at risk|risk of|slight delays|watchlist/.test(s)) return 'yellow';
  if (/off[- ]?track|critical|blocked|severe|major delay/.test(s)) return 'red';
  // Fallback: prefer green optimistic default unless concerning words show up
  if (/delay|issue|risk|concern|block/.test(s)) return 'yellow';
  return 'green';
}


// v5 structure: Flat array of project records, each with fields:
//   relai_id, owner_principal_name, program, project_id, name, objective_ids,
//   relai_updates: [{
//      update_id, date, key_achievements, key_blockers_and_concerns, fyis,
//      upcoming_milestones, overall_project_summary, overall_project_status,
//      (plus any possible legacy fields)
//   }]
// We normalize to a unified internal shape using canonical fields only.
const processedData = (relaiV5 || []).flatMap(projectRec => {
  const owner = projectRec.owner_principal_name || '';
  const program = projectRec.program || '';
  const project = projectRec.name || '';
  const objectives = Array.isArray(projectRec.objective_ids) ? projectRec.objective_ids.map(String) : [];
  const updates = Array.isArray(projectRec.relai_updates) ? projectRec.relai_updates : [];
  // If timestamps/dates exist inside relai_updates we would extract them; dataset snippet only shows status. Use index ordering as pseudo-date if absent.
  return updates.map((u, idx) => {
    const overall = u.overall_project_status || '';
    const date = u.date || u.updated_at || u.timestamp || `update-${idx+1}`;
    const keyAchievements = u.key_achievements || '';
    const blockers = u.key_blockers_and_concerns || '';
    const fyis = u.fyis || '';
    const milestones = u.upcoming_milestones || '';
    const summary = u.overall_project_summary || '';
    return {
      program,
      project,
      owner,
      date,
      update_id: u.update_id || `${projectRec.project_id || project}-${idx}`,
      objectives,
      // New canonical fields
      key_achievements: keyAchievements,
      fyis,
      upcoming_milestones: milestones,
      overall_project_summary: summary,
      key_blockers_and_concerns: blockers,
      key_new_insights_and_decisions: '',
      overall_project_status: overall,
      status_color: deriveStatusColor(overall)
    };
  });
});

const updatesData = processedData;

function summarizeProject(updates) {
  if (!updates || updates.length === 0) return null;
  const byDate = [...updates].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = byDate[byDate.length - 1];
  const statusRank = { red: 0, yellow: 1, green: 2 };
  const statusCounts = byDate.reduce((acc, u) => { acc[u.status_color] = (acc[u.status_color] || 0) + 1; return acc; }, {});
  const lastTwo = byDate.slice(-2);
  let trend = 'stable';
  if (lastTwo.length === 2) {
    const [prev, curr] = lastTwo;
    const delta = (statusRank[curr.status_color] ?? 1) - (statusRank[prev.status_color] ?? 1);
    trend = delta > 0 ? 'improving' : delta < 0 ? 'slipping' : 'stable';
  }
  const achievements = byDate.map(u => (u.key_achievements || '').trim()).filter(Boolean);
  const blockers = byDate.map(u => (u.key_blockers_and_concerns || '').trim()).filter(Boolean);
  const milestones = byDate.map(u => (u.upcoming_milestones || '').trim()).filter(Boolean);
  const uniq = (arr) => Array.from(new Set(arr)).slice(0, 3);
  const achSnippet = achievements.find(t => t.length > 0) || '';
  const blockerSnippet = blockers.find(t => t.length > 0) || '';
  const milestoneList = uniq(milestones).filter(Boolean).slice(0, 2);
  const statusWord = latest.status_color === 'green' ? 'on track' : latest.status_color === 'yellow' ? 'at risk' : 'off-track';
  const countsText = [
    statusCounts.green ? `${statusCounts.green} green` : null,
    statusCounts.yellow ? `${statusCounts.yellow} yellow` : null,
    statusCounts.red ? `${statusCounts.red} red` : null
  ].filter(Boolean).join(', ');
  const headline = `${latest.project} is ${statusWord} with a ${trend} trend (${countsText}).`;
  return {
    project: latest.project,
    statusWord,
    trend,
    countsText,
    headline,
  recentFocus: achSnippet ? achSnippet.replace(/\s+/g, ' ').trim() : '',
    keyRisks: blockerSnippet ? blockerSnippet.replace(/\s+/g, ' ').trim() : '',
    themes: milestoneList, // repurpose temporarily; UI will shift to milestones
    text: [
      headline,
      achSnippet ? `Recent focus: ${achSnippet.replace(/\s+/g, ' ').trim()}` : null,
      blockerSnippet ? `Key risks: ${blockerSnippet.replace(/\s+/g, ' ').trim()}` : null,
      milestoneList.length ? `Upcoming: ${milestoneList.join('; ')}` : null,
    ].filter(Boolean).join(' ')
  };
}

// Use precomputed static summaries if available; fallback to on-the-fly minimal summary (without LLM) only if missing.
export const projectSummaries = new Proxy({}, {
  get(_t, key){
    if (key === Symbol.toStringTag) return 'projectSummaries';
    const k = String(key);
    const entry = staticSummaries[k];
    if (entry) return entry;
    // Fallback: derive last status_color and create minimal placeholder so UI still renders.
    const ups = updatesData.filter(u => u.project === k);
    if (!ups.length) return undefined;
    const latest = ups.sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
    return {
      status_color: latest.status_color,
      headline: `${latest.project} status is ${latest.status_color}`,
  recentFocus: (latest.key_achievements || '').slice(0,180),
      keyRisks: (latest.key_blockers_and_concerns||'').slice(0,180),
      themes: (latest.upcoming_milestones ? [latest.upcoming_milestones.slice(0,120)] : []),
      _fallback: true
    };
  }
});

export default updatesData;
