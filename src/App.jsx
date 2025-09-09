import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import updatesData, { projectSummaries } from '../lib/updatesData';
// import { projectSlug } from './summary.jsx';
import { variants, springLayout, listStagger } from './motionTokens';

// Restyled RelaiCard component
const RelaiCard = ({ relai, onClick, onFilter, index }) => {
  const projSummary = projectSummaries[relai.project];
  return (
    <motion.article
      layout
      variants={variants.scaleCard}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={springLayout}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      id={`project-${projectSlug(relai.project)}`}
      className={`surface-card cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-accent/60 transition-all group border-l-4
        ${relai.status_color === 'green' ? 'border-emerald-400' : relai.status_color === 'yellow' ? 'border-amber-400' : 'border-rose-500'}`}
      role="listitem"
      aria-label={`Project ${relai.project}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="meta-line mb-1 tracking-[0.5px] flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFilter && onFilter('program', relai.program); }}
              className="hover:text-neutral-800 transition-colors"
            >
              {relai.program}
            </button>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFilter && onFilter('owner', relai.owner); }}
              className="hover:text-neutral-800 transition-colors"
            >
              {relai.owner}
            </button>
          </div>
          <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 group-hover:text-neutral-950 transition-colors">
            {relai.project}
          </h3>
        </div>
        <span className={`status-badge ${relai.status_color === 'green' ? 'status-green' : relai.status_color === 'yellow' ? 'status-yellow' : 'status-red'}`}>{relai.status_color}</span>
      </div>
      <div className="space-y-2 text-[13px] leading-snug text-neutral-700">
        <div><span className="font-semibold text-neutral-900">Health:</span> {projSummary?.headline || 'Summary not available.'}</div>
        {projSummary?.recentFocus && (
          <div><span className="font-semibold text-neutral-900">Focus:</span> {projSummary.recentFocus}</div>
        )}
        {projSummary?.keyRisks && (
          <div><span className="font-semibold text-neutral-900">Risks:</span> {projSummary.keyRisks}</div>
        )}
        {projSummary?.themes && projSummary.themes.length > 0 && (
          <div><span className="font-semibold text-neutral-900">Themes:</span> {projSummary.themes.join('; ')}</div>
        )}
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Updated {relai.date}</span>
        <span className="inline-flex items-center gap-1 font-medium text-accent text-xs">Open
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </motion.article>
  );
};

// Detail modal component for showing project history
const RelaiDetailModal = ({ project, updates, onClose, onFilter, targetUpdateDate }) => {
  // Sort updates by date (newest first)
  const sortedUpdates = [...updates].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestUpdate = sortedUpdates[0];
  const objectives = latestUpdate?.objectives || [];
  React.useEffect(() => {
    if (targetUpdateDate) {
      setTimeout(() => {
        const el = document.getElementById(`update-${projectSlug(project)}-${targetUpdateDate.replace(/[^a-zA-Z0-9]/g,'-')}`);
        if (el) {
          // Remove any existing pulse first
          el.classList.remove('update-pulse');
          void el.offsetWidth; // force reflow
          el.classList.add('update-pulse');
          setTimeout(() => {
            el.classList.remove('update-pulse');
          }, 2200);
        }
      }, 90);
    }
  }, [targetUpdateDate, project]);
  
  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/95 border border-neutral-200 rounded-2xl shadow-lg max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-neutral-200 flex justify-between items-start rounded-t-2xl bg-gradient-to-r from-white/80 via-white to-white/90 backdrop-blur-sm`}> 
          <div className="pr-6">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-1">{project}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${latestUpdate.status_color === 'green' ? 'bg-emerald-500' : latestUpdate.status_color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <span className="font-medium text-neutral-700">{latestUpdate.status_color.toUpperCase()}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <button onClick={() => onFilter && onFilter('program', latestUpdate.program)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{latestUpdate.program}</button>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <button onClick={() => onFilter && onFilter('owner', latestUpdate.owner)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{latestUpdate.owner}</button>
              {objectives.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="text-neutral-400">OOMs:</span>
                  {objectives.map((o, i) => (
                    <button key={i} onClick={() => onFilter && onFilter('objective', o)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{String(o)}</button>
                  ))}
                </>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 flex-grow">
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-neutral-200 to-neutral-300" />
            <div className="space-y-10">
              {sortedUpdates.map((update, index) => (
                <div key={index} id={`update-${projectSlug(project)}-${update.date.replace(/[^a-zA-Z0-9]/g,'-')}`} className="relative group scroll-mt-24">
                  <div className="absolute -left-3 mt-1 w-5 h-5">
                    <div className={`absolute inset-0 rounded-full border-2 bg-white ${index === 0 ? 'border-accent' : 'border-neutral-300 group-hover:border-accent transition-colors'} flex items-center justify-center`}> 
                      <div className={`w-2 h-2 rounded-full ${update.status_color === 'green' ? 'bg-emerald-500' : update.status_color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    </div>
                  </div>
                  <div className={`rounded-xl p-5 border transition-colors ${index === 0 ? 'border-accent/40 bg-accent-soft' : 'border-neutral-200 hover:border-neutral-300 bg-white/70'} backdrop-blur-sm`}> 
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-neutral-800 tracking-tight">{update.date}</span>
                      <span className={`status-badge ${update.status_color === 'green' ? 'status-green' : update.status_color === 'yellow' ? 'status-yellow' : 'status-red'}`}>{update.status_color}</span>
                    </div>
                    <div className="grid gap-4 text-[13px] leading-relaxed text-neutral-700">
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key Developments & Decisions</h4>
                        <p>{update.key_developments_and_decisions}</p>
                      </div>
                      {update.key_new_insights_and_decisions && (
                        <div>
                          <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key New Insights & Decisions</h4>
                          <p>{update.key_new_insights_and_decisions}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key Blockers & Concerns</h4>
                        <p>{update.key_blockers_and_concerns}</p>
                      </div>
                      {update.emerging_themes && (
                        <div>
                          <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Emerging Themes</h4>
                          <p>{update.emerging_themes}</p>
                        </div>
                      )}
                      {update.funding_conversation && (
                        <div>
                          <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Funding Conversation</h4>
                          <p>{update.funding_conversation}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Overall Project Status</h4>
                        <p>{update.overall_project_status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end bg-white/80 backdrop-blur-sm">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function projectSlug(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();
}

function App() {
  function parseDate(dateStr) {
    // Format: 'Aug 5, 2025'
    return new Date(dateStr);
  }

 

  const [search, setSearch] = useState('');
  const [project, setProject] = useState('');
  const [owner, setOwner] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [mostRecentByProject, setMostRecentByProject] = useState({});
  const [targetUpdateDate, setTargetUpdateDate] = useState(null); // when opening modal at specific update
  // Summary filters
  // Removed summaryMode toggle in new layout; scope derives from program/objective filters
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  // AI Generated sectional summaries
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState(null);
  const [achievementsMd, setAchievementsMd] = useState('');
  const [flagsMd, setFlagsMd] = useState('');
  const [trendsMd, setTrendsMd] = useState('');
  const [lastGenAt, setLastGenAt] = useState(null);
  // Global clickable filter (program | owner | objective)
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'program'|'owner'|'objective', value: string }
  const [nlSearchQuery, setNlSearchQuery] = useState('');
  const [nlSearchActive, setNlSearchActive] = useState(false);
  const [nlSearchResults, setNlSearchResults] = useState([]); // server: {id, project, date, snippet, score}
  const [nlAnswer, setNlAnswer] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState(null);
  
  // Helper to open a search result (project + specific date) from NL results
  const openUpdate = (id) => {
    const match = nlSearchResults.find(r => r.update.id === id);
    if (match) {
      setSelectedProject(match.update.project);
      setTargetUpdateDate(match.update.date);
    }
  };

  const applyFilter = (type, value) => {
    setActiveFilter({ type, value });
    setSelectedProject(null);
    if (type === 'program') {
      setSelectedProgram(value);
      setSelectedObjective('');
    } else if (type === 'objective') {
      setSelectedObjective(String(value));
      setSelectedProgram('');
    }
  };

  const clearActiveFilter = () => {
    setActiveFilter(null);
    setSelectedProgram('');
    setSelectedObjective('');
  };

  function currentScope(){
    if (selectedProgram) return { mode: 'program', value: selectedProgram };
    if (selectedObjective) return { mode: 'objective', value: selectedObjective };
    return { mode: 'overall' };
  }

  const fetchSections = async (force=false) => {
    try {
      setSectionError(null);
      setSectionLoading(true);
      const resp = await fetch('/api/summary', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ scope: currentScope(), force }) });
      if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setAchievementsMd(data.achievements || '');
      setFlagsMd(data.flags || '');
      setTrendsMd(data.trends || '');
      setLastGenAt(data.generatedAt || null);
    } catch(e){
      setSectionError(e.message);
    } finally {
      setSectionLoading(false);
    }
  };

  // Fetch on mount & when scope changes
  useEffect(()=>{ fetchSections(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgram, selectedObjective]);

  function renderMarkdown(md){
    if(!md) return null;
    // minimal markdown to HTML (bold + bullets + inline code); keep secure.
    const esc = (s) => s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const lines = md.split(/\n+/);
    const html = lines.map(l=>{
      if(/^\s*-\s+/.test(l)) return `<li>${esc(l.replace(/^\s*-\s+/,'')).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</li>`;
      if(/^\*\*(.*?)\*\*/.test(l.trim())) return `<p><strong>${esc(l.trim().replace(/^\*\*(.*?)\*\*/,'$1'))}</strong></p>`;
      return `<p>${esc(l).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`;
    }).join('');
    if(/<li>/.test(html)) return `<ul class="list-disc pl-4 space-y-1">${html}</ul>`;
    return html;
  }
  
  const runNlSearch = async (q) => {
    setNlError(null);
    if (q.trim().length < 3) {
      setNlSearchActive(false);
      setNlSearchResults([]);
      setNlAnswer('');
      return;
    }
    try {
      // Activate NL search mode immediately so loading UI (spinner + skeleton) is visible
      setNlSearchActive(true);
      // Clear prior answer & sources to avoid showing stale content while loading
      setNlSearchResults([]);
      setNlAnswer('');
      setNlLoading(true);
      const resp = await fetch('/api/nl-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setNlAnswer(data.answer || '');
      setNlSearchResults((data.matches || []).map(m => ({ update: { project: m.project, date: m.date, id: m.id }, score: m.score, snippet: m.snippet })));
      setNlSearchActive((data.matches || []).length > 0 || !!data.answer);
    } catch(e){
      setNlError(e.message);
    } finally {
      setNlLoading(false);
    }
  };
  const clearNlSearch = () => { setNlSearchQuery(''); setNlSearchActive(false); setNlSearchResults([]); setNlAnswer(''); setNlError(null); };
  
  // Organize updates - get the most recent update for each project
  useEffect(() => {
    const latestByProject = {};
    const projectUpdates = {};
    
    updatesData.forEach(update => {
      // Keep track of all updates for each project
      if (!projectUpdates[update.project]) {
        projectUpdates[update.project] = [];
      }
      projectUpdates[update.project].push(update);
      
      // Find the most recent update for each project
      if (!latestByProject[update.project] || parseDate(update.date) > parseDate(latestByProject[update.project].date)) {
        latestByProject[update.project] = update;
      }
    });
    
    setMostRecentByProject(latestByProject);
  }, []);

  const allProjects = Array.from(new Set(updatesData.map(u => u.project)));
  const allOwners = Array.from(new Set(updatesData.map(u => u.owner)));
  const allStatusColors = ['green', 'yellow', 'red'];
  const allPrograms = Array.from(new Set(updatesData.map(u => u.program))).filter(Boolean);
  const allObjectives = Array.from(
    new Set(
      updatesData.flatMap(u => Array.isArray(u.objectives) ? u.objectives : [])
    )
  );
  
  // For the project detail modal
  const selectedProjectUpdates = selectedProject ? 
    updatesData.filter(u => u.project === selectedProject) : [];

  const matchedProjectSet = useMemo(() => {
    if (!nlSearchActive) return null;
    const set = new Set(nlSearchResults.map(r => r.update.project));
    return set;
  }, [nlSearchActive, nlSearchResults]);

  // Filter the most recent updates based on search criteria, summary filters, and global clickable filter
  let filteredProjects = Object.values(mostRecentByProject).filter((u) => {
    const matchesSummaryScope = (
      (!selectedProgram || u.program === selectedProgram) &&
      (!selectedObjective || (Array.isArray(u.objectives) && u.objectives.map(String).includes(String(selectedObjective))))
    );
    const matchesSearchCorpus = (!matchedProjectSet || matchedProjectSet.has(u.project));
    return (
      matchesSummaryScope && matchesSearchCorpus &&
      (search === '' ||
        u.owner.toLowerCase().includes(search.toLowerCase()) ||
        u.project.toLowerCase().includes(search.toLowerCase()) ||
        u.key_developments_and_decisions.toLowerCase().includes(search.toLowerCase()) ||
        u.key_blockers_and_concerns.toLowerCase().includes(search.toLowerCase()) ||
        u.overall_project_status.toLowerCase().includes(search.toLowerCase())) &&
      (project === '' || u.project === project) &&
      (owner === '' || u.owner === owner) &&
      (statusColor === '' || u.status_color === statusColor) &&
      (!activeFilter || (activeFilter.type === 'project' && u.project === activeFilter.value) ||
        (activeFilter.type === 'owner' && u.owner === activeFilter.value) ||
        (activeFilter.type === 'objective' && Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value))))
    );
  });

  // Sort the projects by date of most recent update
  filteredProjects = filteredProjects.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const synthesizedAnswer = nlAnswer;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Project detail modal */}
      {selectedProject && (
        <RelaiDetailModal 
          project={selectedProject} 
          updates={selectedProjectUpdates}
          onClose={() => { setSelectedProject(null); setTargetUpdateDate(null); }}
          onFilter={applyFilter}
          targetUpdateDate={targetUpdateDate}
        />
      )}
      {/* Hero Header (unchanged content, updated spacing for new layout) */}
      <header className="hero-shell relative">
        <div className="hero-bg" />
        <div className="hero-aurora" />
        <div className="hero-aurora" />
        <div className="hero-particles" />
        <div className="hero-noise" />
        <div className="hero-overlay" />
        <div className="hero-content relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
            <div className="max-w-5xl">
              <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.9,ease:[0.25,0.8,0.25,1]}} className="flex items-start gap-6 mb-10">
                <motion.div initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.15,duration:0.8,type:'spring',stiffness:110}} className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-sky-500/30 to-sky-700/30 border border-cyan-300/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_10px_30px_-5px_rgba(14,165,233,0.55)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-200 drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-tr from-cyan-300/10 via-sky-400/5 to-transparent" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="display-title">Relai Station</h1>
                  <p className="subheading mt-5 leading-relaxed">A synthesized, multi-program view of fictional Relais activity. High-signal updates, semantic search, and grounded AI summaries in one luminous surface.</p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-cyan-200/80 bg-cyan-400/10 border border-cyan-300/20 px-3 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">Live Semantic QA</div>
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-cyan-200/80 bg-cyan-400/10 border border-cyan-300/20 px-3 py-1.5 rounded-full backdrop-blur-md">Real-time Project Health</div>
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-cyan-200/80 bg-cyan-400/10 border border-cyan-300/20 px-3 py-1.5 rounded-full backdrop-blur-md">Context Grounded Summaries</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>
      {/* Main content redesigned layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-10">
        {/* Global NL Search Bar */}
        <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-8" role="search" aria-label="Natural language corpus search">
              <form
                onSubmit={(e)=>{ e.preventDefault(); if(nlSearchQuery.trim().length>=3){ runNlSearch(nlSearchQuery); } }}
                className="flex gap-3 items-center"
              >
                <input
                  type="text"
                  aria-label="Ask a question about all updates"
                  placeholder="Ask: What are the main blockers for platform integration?"
                  value={nlSearchQuery}
                  onChange={(e)=>{ setNlSearchQuery(e.target.value); }}
                  className="flex-1 rounded-md bg-neutral-50 border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40"
                />
                {nlSearchActive && !nlLoading && (
                  <button type="button" onClick={clearNlSearch} className="px-3 py-2 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent/40">Clear</button>
                )}
                <button
                  type="submit"
                  disabled={nlLoading || nlSearchQuery.trim().length < 3}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${nlLoading ? 'bg-neutral-200 border-neutral-300 text-neutral-500 cursor-wait' : nlSearchQuery.trim().length < 3 ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-accent-soft border-accent/30 text-accent hover:border-accent/50'}`}
                >
                  {nlLoading ? 'Searching…' : 'Search'}
                </button>
              </form>
              {nlSearchQuery.trim().length > 0 && nlSearchQuery.trim().length < 3 && !nlLoading && (
                <p className="mt-3 text-xs text-neutral-500">Type at least 3 characters then press Enter to search.</p>
              )}
              {nlSearchActive && (
                <div className="mt-6 space-y-6" aria-live="polite">
                  {nlLoading && (
                    <div className="flex items-center gap-3 text-sm text-neutral-500 animate-pulse">
                      <svg className="h-5 w-5 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle className="opacity-25" cx="12" cy="12" r="10" />
                        <path d="M22 12a10 10 0 0 1-10 10" className="opacity-75" />
                      </svg>
                      <span>Analyzing updates & generating answer…</span>
                    </div>
                  )}
                  {!nlLoading && synthesizedAnswer && <div className="bg-accent-soft rounded-lg p-4 border border-accent/30"><p className="text-sm leading-relaxed text-neutral-800"><span className="font-semibold text-accent">Answer:</span> <span dangerouslySetInnerHTML={{__html: highlightSnippet(synthesizedAnswer, '')}} /></p></div>}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs uppercase tracking-wide font-semibold text-neutral-500">Sources Used <span className="text-neutral-400 font-normal">({nlLoading ? '…' : nlSearchResults.length})</span></h3>
                      <div className="text-[11px] text-neutral-400">{nlLoading ? 'Gathering sources…' : `Projects matched: ${matchedProjectSet ? matchedProjectSet.size : 0}`}</div>
                    </div>
                    <ul className="space-y-3" aria-label="Search results list">
                      {nlLoading && (
                        Array.from({length:4}).map((_,i)=>(
                          <li key={i} className="rounded-lg p-3 border border-neutral-200 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20" />
                              <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2.5 bg-neutral-200 rounded" />
                              <div className="h-2.5 bg-neutral-200 rounded w-5/6" />
                              <div className="h-2.5 bg-neutral-200 rounded w-2/3" />
                            </div>
                          </li>
                        ))
                      )}
                       {!nlLoading && nlSearchResults.slice(0,40).map((r, idx) => (
                        <li key={r.update.id} className="rounded-lg p-3 border border-neutral-200 bg-white hover:border-accent/40 transition-colors focus-within:border-accent/50">
                          <button onClick={()=>openUpdate(r.update.id)} className="text-left w-full focus:outline-none">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] w-5 h-5 inline-flex items-center justify-center rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">{idx+1}</span>
                                <span className="text-xs font-semibold text-accent tracking-wide">{r.update.project}</span>
                              </div>
                            </div>
                            <p className="text-[12px] leading-snug text-neutral-600">{r.snippet}</p>
                          </button>
                        </li>
                      ))}
                       {!nlLoading && nlSearchResults.length===0 && !nlError && <li className="text-xs text-neutral-500">No matches. Refine or broaden your question.</li>}
                       {!nlLoading && nlError && <li className="text-xs text-rose-600">Error: {nlError}</li>}
                    </ul>
                  </div>
                </div>
              )}
        </section>
        {/* Unified Filter Bar */}
        <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-10">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Search (text)</label>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter by keyword…" className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Program</label>
              <select value={selectedProgram} onChange={e=>{setSelectedProgram(e.target.value); if(e.target.value) {setSelectedObjective(''); setActiveFilter({type:'program', value:e.target.value}); } else { setActiveFilter(null);} }} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All</option>
                {allPrograms.map(p=> <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Objective</label>
              <select value={selectedObjective} onChange={e=>{setSelectedObjective(e.target.value); if(e.target.value){ setSelectedProgram(''); setActiveFilter({type:'objective', value:e.target.value}); } else { setActiveFilter(null);} }} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All</option>
                {allObjectives.map(o=> <option key={o} value={String(o)}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Owner</label>
              <select value={owner} onChange={e=>setOwner(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All</option>
                {allOwners.map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Status</label>
              <select value={statusColor} onChange={e=>setStatusColor(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All</option>
                {allStatusColors.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {activeFilter && (
              <div className="ml-auto flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-md text-xs text-neutral-600">
                <span className="font-medium">{activeFilter.type}: {String(activeFilter.value)}</span>
                <button onClick={clearActiveFilter} className="text-neutral-500 hover:text-neutral-800">Clear</button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              <button onClick={()=>{setSearch(''); setSelectedProgram(''); setSelectedObjective(''); setOwner(''); setStatusColor(''); setActiveFilter(null);}} className="text-xs px-3 py-2 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700">Reset</button>
              <button onClick={()=>fetchSections(true)} disabled={sectionLoading} className={`text-xs px-3 py-2 rounded-md border ${sectionLoading ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-wait' : 'bg-accent-soft border-accent/30 text-accent hover:border-accent/50'}`}>{sectionLoading ? 'Refreshing…' : 'Refresh Summaries'}</button>
              {lastGenAt && <span className="text-[10px] text-neutral-400">{new Date(lastGenAt).toLocaleTimeString()}</span>}
            </div>
          </div>
        </section>
        {/* Summaries Section (Achievements / Flags / Trends) */}
        <section className="mb-14 space-y-8" aria-label="AI generated summaries">
          {sectionError && <div className="text-sm text-rose-600">Error loading summaries: {sectionError}</div>}
          {sectionLoading && !sectionError && (
            <div className="grid md:grid-cols-3 gap-6 animate-pulse">
              {Array.from({length:3}).map((_,i)=>(
                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
                  <div className="h-4 w-28 bg-neutral-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-2.5 bg-neutral-200 rounded" />
                    <div className="h-2.5 bg-neutral-200 rounded w-5/6" />
                    <div className="h-2.5 bg-neutral-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!sectionLoading && !sectionError && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="summary-tile">
                <div className="summary-tile-head">
                  <span className="summary-pill bg-emerald-500/15 text-emerald-600 border border-emerald-400/30">Achievements</span>
                </div>
                <div className="summary-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(achievementsMd)}} />
              </div>
              <div className="summary-tile">
                <div className="summary-tile-head">
                  <span className="summary-pill bg-amber-500/15 text-amber-600 border border-amber-400/30">Flags</span>
                </div>
                <div className="summary-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(flagsMd)}} />
              </div>
              <div className="summary-tile">
                <div className="summary-tile-head">
                  <span className="summary-pill bg-cyan-500/15 text-cyan-600 border border-cyan-400/30">Trends</span>
                </div>
                <div className="summary-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(trendsMd)}} />
              </div>
            </div>
          )}
        </section>
        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">Latest Relais <span className="text-neutral-400 font-normal">({filteredProjects.length})</span></h2>
          </div>
          <motion.div layout variants={listStagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="list">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((update, i) => (
                <RelaiCard
                  key={update.project}
                  relai={update}
                  index={i}
                  onClick={() => setSelectedProject(update.project)}
                  onFilter={applyFilter}
                />
              ))}
              {filteredProjects.length === 0 && (
                <motion.div key="empty" variants={variants.fadeInUp} initial="hidden" animate="visible" exit="exit" className="col-span-3 py-12 text-center text-neutral-500 bg-white rounded-lg shadow-sm border border-neutral-200">
                  <p className="text-lg font-medium">No Relais match your filters</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                  <button onClick={() => { setSearch(''); setProject(''); setStatusColor(''); setOwner(''); }} className="mt-4 px-4 py-2 text-sm font-medium text-accent hover:underline">Clear all filters</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-neutral-500">
            <p>Relai Station • {new Date().getFullYear()} • Powered by AI-driven insights</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

function highlightSnippet(snippet, query){
  if(!query) return escapeHtml(snippet);
  try {
    const tokens = Array.from(new Set(query.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean)));
    if(!tokens.length) return escapeHtml(snippet);
    const pattern = new RegExp('(' + tokens.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')', 'ig');
    return escapeHtml(snippet).replace(pattern, '<mark class="nlhi">$1</mark>');
  } catch(e){
    return escapeHtml(snippet);
  }
}

function escapeHtml(str){
  return str.replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
