import relaiHier from '../rmi_outcome14_relai_synthetic.json';
import staticSummaries from '../data/projectSummaries.static.json';

function deriveStatusColor(statusText = '') {
  const s = statusText.toLowerCase();
  if (!s) return 'green';
  if (s.includes('critical') || s.includes('blocked') || s.includes('off-track') || s.includes('off track')) return 'red';
  if (s.includes('risk') || s.includes('at risk') || s.includes('concern')) return 'yellow';
  if (s.includes('on track') || s.includes('on-track')) return 'green';
  return 'green';
}

const processedData = (relaiHier?.relai || []).flatMap(entry => {
  const date = entry.date;
  const owner = entry?.owner?.principal || '';
  const projects = entry?.relai_projects || [];
  return projects.map(p => {
    const updates = p.updates || {};
    const overall = updates.overall_project_status || '';
    return {
      program: p.program || entry?.owner?.program || '',
      project: p.name || '',
      owner,
      date,
      objectives: Array.isArray(p.oom_contributions) ? p.oom_contributions : [],
      key_developments_and_decisions: updates.key_achievements || '',
      key_blockers_and_concerns: updates.key_blockers_and_concerns || '',
      key_new_insights_and_decisions: updates.key_new_insights_and_decisions || '',
      emerging_themes: updates.emerging_themes || '',
      funding_conversation: updates.funding_conversation || '',
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
  const achievements = byDate.map(u => (u.key_developments_and_decisions || '').trim()).filter(Boolean);
  const blockers = byDate.map(u => (u.key_blockers_and_concerns || '').trim()).filter(Boolean);
  const themes = byDate.map(u => (u.emerging_themes || '').trim()).filter(Boolean);
  const uniq = (arr) => Array.from(new Set(arr)).slice(0, 3);
  const achSnippet = achievements.find(t => t.length > 0) || '';
  const blockerSnippet = blockers.find(t => t.length > 0) || '';
  const themeList = uniq(themes).filter(Boolean).slice(0, 2);
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
    themes: themeList,
    text: [
      headline,
      achSnippet ? `Recent focus: ${achSnippet.replace(/\s+/g, ' ').trim()}` : null,
      blockerSnippet ? `Key risks: ${blockerSnippet.replace(/\s+/g, ' ').trim()}` : null,
      themeList.length ? `Themes: ${themeList.join('; ')}` : null,
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
      recentFocus: (latest.key_developments_and_decisions||'').slice(0,180),
      keyRisks: (latest.key_blockers_and_concerns||'').slice(0,180),
      themes: [],
      _fallback: true
    };
  }
});

export default updatesData;
