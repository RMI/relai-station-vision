// Import the new hierarchical JSON (root-level file)
import relaiHier from '../rmi_outcome14_relai_synthetic.json';

// Helper to derive a traffic-light style from the overall status text
function deriveStatusColor(statusText = '') {
  const s = statusText.toLowerCase();
  if (!s) return 'green';
  if (s.includes('critical') || s.includes('blocked') || s.includes('off-track') || s.includes('off track')) return 'red';
  if (s.includes('risk') || s.includes('at risk') || s.includes('concern')) return 'yellow';
  if (s.includes('on track') || s.includes('on-track')) return 'green';
  return 'green';
}

// Flatten the hierarchical structure into per-project per-date updates
const processedData = (relaiHier?.relai || []).flatMap(entry => {
  const date = entry.date;
  const owner = entry?.owner?.principal || '';
  const projects = entry?.relai_projects || [];
  return projects.map(p => {
    const updates = p.updates || {};
    const overall = updates.overall_project_status || '';
    return {
      // core identity
      program: p.program || entry?.owner?.program || '',
      project: p.name || '',
      owner,
      date,
      // objective(s) (OOM contributions) if available
      objectives: Array.isArray(p.oom_contributions) ? p.oom_contributions : [],
      // map fields to what the UI expects and add additional ones for modal
      key_developments_and_decisions: updates.key_achievements || '',
      key_blockers_and_concerns: updates.key_blockers_and_concerns || '',
      key_new_insights_and_decisions: updates.key_new_insights_and_decisions || '',
      emerging_themes: updates.emerging_themes || '',
      funding_conversation: updates.funding_conversation || '',
      overall_project_status: overall,
      // derive status color from overall status text
      status_color: deriveStatusColor(overall)
    };
  });
});

// Use the processedData as our updatesData
const updatesData = processedData;

// Build a one-time, static summary per project based on all available updates and trends
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
  // Pull representative texts
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
    // Legacy full text for any consumers that want a single paragraph
    text: [
      headline,
      achSnippet ? `Recent focus: ${achSnippet.replace(/\s+/g, ' ').trim()}` : null,
      blockerSnippet ? `Key risks: ${blockerSnippet.replace(/\s+/g, ' ').trim()}` : null,
      themeList.length ? `Themes: ${themeList.join('; ')}` : null,
    ].filter(Boolean).join(' ')
  };
}

const summariesByProject = (() => {
  const map = {};
  const groups = updatesData.reduce((acc, u) => {
    (acc[u.project] = acc[u.project] || []).push(u);
    return acc;
  }, {});
  Object.entries(groups).forEach(([project, ups]) => {
    map[project] = summarizeProject(ups);
  });
  return map;
})();

// Hard-coded insights based on analysis of the JSON data
export const projectSummaries = summariesByProject;

export const hardcodedInsights = {
  // Top-level insights about the portfolio
  summary: {
    // Based on the current cards (flattened latest data from the hierarchical JSON)
    totalProjects: 22, // Unique projects across 10 programs
    sectors: [
      'Climate-Aligned Industries (CAI)',
      'Climate Intelligence (CI)',
      'Carbon-Free Transportation (CFT)',
      'Africa Energy Program (AEP)',
      'China Program',
      'Carbon-Free Buildings (CFB)',
      'Carbon-Free Electricity (CFE)',
      'Global South Program (C3)',
      'US Program (USP)',
      'Climate Finance (CF)'
    ],
    statusBreakdown: {
      // Approximate snapshot of latest status by project
      green: 14,
      yellow: 7,
      red: 1
    }
  },
  
  // Project summary data required by getSummary function
  projectSummary: {
    projectsWithUpdates: 22,
    totalUpdates: 110, // rough total across 5 bi-weekly cycles
    teamMembers: 10,
    statusSummary: "Most projects are progressing, with concentrated risks around data access and approvals.",
    statusCounts: {
      red: 1,
      yellow: 7,
      green: 14
    }
  },
  
  // Top achievements extracted from the data
  keyAchievements: [
    {
      project: "Green Steel Buyers Index (CAI)",
      achievement: "Internal alpha tested; scope and initial KPI baselines established with incremental on-track progress."
    },
    {
      project: "Chain-of-Custody Verifier (CI)",
      achievement: "Design and validation approach matured; steady progress toward a practical verifier for product provenance."
    },
    {
      project: "Zero-Emission Freight Score (CFT)",
      achievement: "Baseline defined and scoring approach stabilized; stakeholder engagement advancing predictably."
    }
  ],
  
  // Critical blockers extracted from the data
  topBlockers: [
    {
      project: "Cement Carbon Labeling Pilot (CAI)",
      blocker: "Dependence on third-party data/API and rate limits; team capacity tight, slowing iteration.",
      severity: "yellow"
    },
    {
      project: "Green Ammonia Offtake Registry (CAI)",
      blocker: "API/data access uncertainty and permissions constrain progress; mitigation plan active.",
      severity: "yellow"
    },
    {
      project: "Grid and interconnection approvals (multiple)",
      blocker: "External approvals and coordination risks remain gating in several workstreams; escalate with partners.",
      severity: "red"
    }
  ],
  
  // Sector performance metrics
  sectorProjects: [
    // Show top programs (treated as sectors for the tile UI)
    {
      sector: "Climate-Aligned Industries (CAI)",
      count: 3,
      greenCount: 1,
      projects: ["Green Steel Buyers Index", "Cement Carbon Labeling Pilot", "Green Ammonia Offtake Registry"]
    },
    {
      sector: "Climate Intelligence (CI)",
      count: 3,
      greenCount: 2,
      projects: ["Open Product Emissions Schema (OPES)", "Chain-of-Custody Verifier", "Climate Data Cookbook v2"]
    },
    {
      sector: "Carbon-Free Electricity (CFE)",
      count: 3,
      greenCount: 2,
      projects: ["Clean Power Attribute Tariff Scorecard", "VPP Reliability Label", "Grid Carbon Intensity API"]
    }
  ],
  
  // Strategic insights based on the data
  insights: [
    "Most programs report steady, incremental progress consistent with small teams; risks concentrate around third-party data/API access and external approvals.",
    "CAI portfolio shows mixed health: one project is on track while two face data-access and capacity constraints that slow iteration.",
    "Climate Intelligence (CI) projects are trending positively, with provenance and schema work maturing toward practical adoption.",
    "Delivery risk patterns are similar across programs: approvals, data-sharing, and limited bandwidth recur in multiple workstreams.",
    "Cross-cutting themes include EU/US product-carbon rule harmonization, offtake aggregation to de-risk first movers, and AI-driven MRV."
  ],
  
  // Strategic recommendation based on analysis
  strategicRecommendation: "Concentrate near-term support on removing data/API access constraints and external approval bottlenecks, while scaling promising CI and CFE efforts that are closest to adoption."
};

export default updatesData;
