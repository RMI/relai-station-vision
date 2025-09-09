import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import updatesData, { projectSummaries } from '../lib/updatesData';
// import { projectSlug } from './summary.jsx';
import { variants, springLayout, listStagger } from './motionTokens';

// Restyled RelaiCard component
const RelaiCard = ({ relai, onClick, onFilter, index }) => {
  const projSummary = projectSummaries[relai.project];
  const statusColorClass = relai.status_color === 'green' ? 'before:bg-emerald-400' : relai.status_color === 'yellow' ? 'before:bg-amber-400' : 'before:bg-rose-500';
  function initials(name=''){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join(''); }
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
      className={`surface-card cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-accent/60 transition-all group pl-4 ${statusColorClass} relative before:content-[''] before:absolute before:inset-y-2 before:left-2 before:w-1 before:rounded-full before:shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`}
      role="listitem"
      aria-label={`Project ${relai.project}`}
    >
      <div className="mb-3 pr-1">
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 group-hover:text-neutral-950 transition-colors">
          {relai.project}
        </h3>
      </div>
      <div className="space-y-2 text-[13px] leading-snug text-neutral-700">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-400/30" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg>
          </span>
          <p><span className="sr-only">Health:</span>{projSummary?.headline || 'Summary not available.'}</p>
        </div>
        {projSummary?.recentFocus && (
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-500/15 text-sky-600 border border-sky-400/30" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>
            </span>
            <p><span className="sr-only">Focus:</span>{projSummary.recentFocus}</p>
          </div>
        )}
        {projSummary?.keyRisks && (
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/15 text-amber-600 border border-amber-400/30" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </span>
            <p><span className="sr-only">Risks:</span>{projSummary.keyRisks}</p>
          </div>
        )}
        {projSummary?.themes && projSummary.themes.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-fuchsia-500/15 text-fuchsia-600 border border-fuchsia-400/30" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M7 6h10"/><path d="M7 18h10"/></svg>
            </span>
            <p><span className="sr-only">Themes:</span>{projSummary.themes.join('; ')}</p>
          </div>
        )}
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 space-y-2">
        {/* Row 1: owner left, program right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e)=>{ e.stopPropagation(); onFilter && onFilter('owner', relai.owner); }}
            className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="w-5 h-5 rounded-full bg-neutral-300 text-neutral-700 flex items-center justify-center text-[10px] font-semibold" aria-hidden="true">{initials(relai.owner)}</span>
            {relai.owner}
          </button>
          <button
            type="button"
            onClick={(e)=>{ e.stopPropagation(); onFilter && onFilter('program', relai.program); }}
            className="ml-auto inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
            {relai.program}
          </button>
        </div>
        {/* Row 2: updated left, see details right */}
        <div className="flex items-center">
          <span className="text-neutral-400">Updated {relai.date}</span>
          <span className="inline-flex items-center gap-1 font-medium text-accent text-xs ml-auto">See details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
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
  // Collapsed states for summary sections
  const [achCollapsed, setAchCollapsed] = useState(true);
  const [flagsCollapsed, setFlagsCollapsed] = useState(true);
  const [trendsCollapsed, setTrendsCollapsed] = useState(true);
  // Global clickable filter (program | owner | objective)
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'program'|'owner'|'objective', value: string }
  const [nlSearchQuery, setNlSearchQuery] = useState('');
  const [nlSearchActive, setNlSearchActive] = useState(false);
  const [nlSearchResults, setNlSearchResults] = useState([]); // server: {id, project, date, snippet, score}
  const [nlAnswer, setNlAnswer] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState(null);
  // Full screen NL search UX state
  const [fullSearchMode, setFullSearchMode] = useState(false); // true once user focuses NL input
  const [fullSearchStarted, setFullSearchStarted] = useState(false); // true after submit (Enter)
  
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
      setFullSearchStarted(true); // mark that a search execution has begun
      setNlSearchActive(true);
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
  const clearNlSearch = () => { setNlSearchQuery(''); setNlSearchActive(false); setNlSearchResults([]); setNlAnswer(''); setNlError(null); setFullSearchStarted(false); setFullSearchMode(false); };
  
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
        (activeFilter.type === 'program' && u.program === activeFilter.value) ||
        (activeFilter.type === 'owner' && u.owner === activeFilter.value) ||
        (activeFilter.type === 'objective' && Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value))))
    );
  });

  // Sort the projects by date of most recent update
  filteredProjects = filteredProjects.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const synthesizedAnswer = nlAnswer;
  const achParts = splitSources(achievementsMd);
  const flagParts = splitSources(flagsMd);
  const trendParts = splitSources(trendsMd);
  const scopeDescriptor = selectedProgram ? `for ${selectedProgram}` : selectedObjective ? `for Objective ${selectedObjective}` : '';

  // Extract first sentence (headline) utility
  function extractHeadline(md){
    if(!md) return '';
    const cleaned = md.trim();
    const firstLine = cleaned.split(/\n+/)[0].trim();
    const sentenceMatch = firstLine.match(/(.+?[.!?])($|\s)/);
    let sentence = sentenceMatch ? sentenceMatch[1].trim() : firstLine;
    sentence = sentence.replace(/^#+\s*/, '');
    // remove wrapping **bold** markers but keep inner text styled later
    sentence = sentence.replace(/^\*\*(.+)\*\*$/, '$1');
    return sentence;
  }

  const achHeadline = extractHeadline(achParts.main);
  const flagsHeadline = extractHeadline(flagParts.main);
  const trendsHeadline = extractHeadline(trendParts.main);

  function bodyWithoutHeadline(parts, headline){
    if(!parts.main) return '';
    const lines = parts.main.split(/\n+/);
    if(lines.length === 0) return '';
    // Remove first line only if it contains the headline text start
    if(lines[0].includes(headline.substring(0, Math.min(10, headline.length)))){
      lines.shift();
    }
    return lines.join('\n').trim();
  }

  const achBody = bodyWithoutHeadline(achParts, achHeadline);
  const flagsBody = bodyWithoutHeadline(flagParts, flagsHeadline);
  const trendsBody = bodyWithoutHeadline(trendParts, trendsHeadline);
  
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
                  <p className="subheading mt-5 leading-relaxed">All data here is based on <strong>completely fictional</strong> Relais activity!</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>
      {/* Main content redesigned layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-10">
        {/* Full Screen NL Search Overlay */}
        <AnimatePresence>
          {fullSearchMode && (
            <motion.div key="fs-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}} className="full-search-overlay">
              <motion.div initial={{scale:0.94, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.94, opacity:0}} transition={{type:'spring', stiffness:160, damping:18}} className="search-elevated">
                <form onSubmit={(e)=>{ e.preventDefault(); if(nlSearchQuery.trim().length>=3){ runNlSearch(nlSearchQuery); } }} className="relative flex items-center gap-3">
                  <input
                    autoFocus
                    type="text"
                    aria-label="Ask a question about all updates"
                    placeholder="Ask anything across all project updates…"
                    value={nlSearchQuery}
                    onChange={(e)=>{ setNlSearchQuery(e.target.value); }}
                    className="search-elevated-input flex-1"
                  />
                  {nlSearchQuery && !nlLoading && (
                    <button type="button" onClick={()=>{ setNlSearchQuery(''); setFullSearchStarted(false); setNlSearchActive(false); }} className="search-elevated-clear" aria-label="Clear query">✕</button>
                  )}
                  <button type="submit" disabled={nlLoading || nlSearchQuery.trim().length < 3} className="search-elevated-action" aria-label="Run search">
                    {nlLoading ? 'Searching…' : 'Search'}
                  </button>
                  <button type="button" onClick={clearNlSearch} className="search-elevated-close" aria-label="Close search (Esc)">Esc</button>
                </form>
                {nlSearchQuery.trim().length>0 && nlSearchQuery.trim().length<3 && !nlLoading && (
                  <p className="mt-3 text-xs text-neutral-400">Type at least 3 characters then press Enter.</p>
                )}
                {fullSearchStarted && (
                  <div className="mt-8 space-y-6" aria-live="polite">
                    {nlLoading && (
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <svg className="h-5 w-5 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle className="opacity-25" cx="12" cy="12" r="10" />
                          <path d="M22 12a10 10 0 0 1-10 10" className="opacity-75" />
                        </svg>
                        <span>Analyzing updates…</span>
                      </div>
                    )}
                    {!nlLoading && synthesizedAnswer && <div className="answer-panel"><p className="text-sm leading-relaxed text-neutral-800"><span className="font-semibold text-accent">Answer:</span> <span dangerouslySetInnerHTML={{__html: highlightSnippet(synthesizedAnswer, '')}} /></p></div>}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] uppercase tracking-wide font-semibold text-neutral-500">Sources <span className="text-neutral-400 font-normal">({nlLoading ? '…' : nlSearchResults.length})</span></h3>
                        <div className="text-[11px] text-neutral-400">{nlLoading ? 'Gathering…' : `Projects: ${matchedProjectSet ? matchedProjectSet.size : 0}`}</div>
                      </div>
                      <ul className="space-y-3 max-h-[42vh] overflow-y-auto pr-1" aria-label="Search results list">
                        {nlLoading && Array.from({length:5}).map((_,i)=>(
                          <li key={i} className="result-skel">
                            <div className="h-3 w-40 bg-neutral-200 rounded mb-2" />
                            <div className="space-y-1">
                              <div className="h-2.5 bg-neutral-200 rounded" />
                              <div className="h-2.5 bg-neutral-200 rounded w-5/6" />
                              <div className="h-2.5 bg-neutral-200 rounded w-2/3" />
                            </div>
                          </li>
                        ))}
                        {!nlLoading && nlSearchResults.slice(0,60).map((r,idx)=>(
                          <li key={r.update.id} className="result-item" onClick={()=>openUpdate(r.update.id)}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="index-badge">{idx+1}</span>
                              <span className="proj-name">{r.update.project}</span>
                              <span className="date-chip">{r.update.date}</span>
                            </div>
                            <p className="snippet">{r.snippet}</p>
                          </li>
                        ))}
                        {!nlLoading && nlSearchResults.length===0 && !nlError && fullSearchStarted && <li className="text-[11px] text-neutral-500">No matches. Refine your question.</li>}
                        {!nlLoading && nlError && <li className="text-[11px] text-rose-600">Error: {nlError}</li>}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Global NL Search Bar (only visible when not in full search mode) */}
        {!fullSearchMode && (
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
                  onFocus={()=> setFullSearchMode(true)}
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
        </section>
        )}
        {/* Unified Filter Bar */}
        {!fullSearchMode && (
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
        )}
        {/* Active Filter Chips Row */}
        {!fullSearchMode && (selectedProgram || selectedObjective || owner || statusColor || search) && (
          <div className="max-w-7xl mx-auto mb-8 -mt-6 px-1">
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <button onClick={()=>setSearch('')} className="filter-chip">
                  <span className="filter-chip-label">Search:</span> {search}
                  <span aria-hidden="true" className="filter-chip-close">×</span>
                </button>
              )}
              {selectedProgram && (
                <button onClick={()=>{setSelectedProgram(''); if(activeFilter?.type==='program') setActiveFilter(null);}} className="filter-chip filter-chip-accent">
                  <span className="filter-chip-label">Program:</span> {selectedProgram}
                  <span aria-hidden="true" className="filter-chip-close">×</span>
                </button>
              )}
              {selectedObjective && (
                <button onClick={()=>{setSelectedObjective(''); if(activeFilter?.type==='objective') setActiveFilter(null);}} className="filter-chip filter-chip-objective">
                  <span className="filter-chip-label">Objective:</span> {selectedObjective}
                  <span aria-hidden="true" className="filter-chip-close">×</span>
                </button>
              )}
              {owner && (
                <button onClick={()=>setOwner('')} className="filter-chip filter-chip-owner">
                  <span className="filter-chip-label">Owner:</span> {owner}
                  <span aria-hidden="true" className="filter-chip-close">×</span>
                </button>
              )}
              {statusColor && (
                <button onClick={()=>setStatusColor('')} className={`filter-chip filter-chip-status-${statusColor}`}>
                  <span className="filter-chip-label">Status:</span> {statusColor}
                  <span aria-hidden="true" className="filter-chip-close">×</span>
                </button>
              )}
              <button onClick={()=>{setSearch(''); setSelectedProgram(''); setSelectedObjective(''); setOwner(''); setStatusColor(''); setActiveFilter(null);}} className="filter-chip-clear-all">Clear All</button>
            </div>
          </div>
        )}
        {/* Summaries Section (Achievements / Flags / Trends) */}
        {!fullSearchMode && (
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
            <motion.div className="space-y-10" initial="hidden" animate="visible" variants={{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:0.18,delayChildren:0.05}}}}>
              {/* Achievements Spotlight */}
              <motion.section variants={{hidden:{opacity:0,y:28},visible:{opacity:1,y:0,transition:{duration:0.65,ease:[0.4,0.16,0.2,1]}}}} className="summary-spotlight summary-spotlight-green group cursor-pointer" aria-labelledby="achievements-heading" role="button" tabIndex={0} aria-expanded={!achCollapsed} onClick={()=>setAchCollapsed(c=>!c)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault(); setAchCollapsed(c=>!c);}}}>
                <header className="summary-spotlight-head">
                  <div className="summary-spotlight-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.6 5.8 22 7 14.14l-5-4.87 7.1-1.01z" />
                    </svg>
                  </div>
                  <h3 id="achievements-heading" className="summary-spotlight-title flex items-start gap-3">
                    <span className="inline-flex items-center gap-2">{achHeadline || 'Achievements'} {scopeDescriptor && <span className="summary-scope-tag">{scopeDescriptor}</span>}</span>
                    <button type="button" aria-label={achCollapsed? 'Expand achievements summary':'Collapse achievements summary'} onClick={(e)=>{e.stopPropagation(); setAchCollapsed(c=>!c);}} className={`chevron-btn ${achCollapsed? '' : 'open'}`}>
                      <span aria-hidden className="chevron-icon">›</span>
                    </button>
                  </h3>
                </header>
                {!achCollapsed && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.35,ease:[0.4,0.16,0.2,1]}} className="overflow-hidden">
                    <div className="summary-spotlight-body prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(achBody)}} />
                    {renderSourcesList(achParts.sources)}
                  </motion.div>
                )}
              </motion.section>
              {/* Flags Spotlight */}
              <motion.section variants={{hidden:{opacity:0,y:30},visible:{opacity:1,y:0,transition:{duration:0.65,ease:[0.4,0.16,0.2,1]}}}} className="summary-spotlight summary-spotlight-amber group cursor-pointer" aria-labelledby="flags-heading" role="button" tabIndex={0} aria-expanded={!flagsCollapsed} onClick={()=>setFlagsCollapsed(c=>!c)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault(); setFlagsCollapsed(c=>!c);}}}>
                <header className="summary-spotlight-head">
                  <div className="summary-spotlight-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M4 2h8l2 5 2-5h4v20H4z" />
                    </svg>
                  </div>
                  <h3 id="flags-heading" className="summary-spotlight-title flex items-start gap-3">
                    <span className="inline-flex items-center gap-2">{flagsHeadline || 'Flags'} {scopeDescriptor && <span className="summary-scope-tag">{scopeDescriptor}</span>}</span>
                    <button type="button" aria-label={flagsCollapsed? 'Expand flags summary':'Collapse flags summary'} onClick={(e)=>{e.stopPropagation(); setFlagsCollapsed(c=>!c);}} className={`chevron-btn ${flagsCollapsed? '' : 'open'}`}>
                      <span aria-hidden className="chevron-icon">›</span>
                    </button>
                  </h3>
                </header>
                {!flagsCollapsed && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.35,ease:[0.4,0.16,0.2,1]}} className="overflow-hidden">
                    <div className="summary-spotlight-body prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(flagsBody)}} />
                    {renderSourcesList(flagParts.sources)}
                  </motion.div>
                )}
              </motion.section>
              {/* Trends Spotlight */}
              <motion.section variants={{hidden:{opacity:0,y:32},visible:{opacity:1,y:0,transition:{duration:0.65,ease:[0.4,0.16,0.2,1]}}}} className="summary-spotlight summary-spotlight-cyan group cursor-pointer" aria-labelledby="trends-heading" role="button" tabIndex={0} aria-expanded={!trendsCollapsed} onClick={()=>setTrendsCollapsed(c=>!c)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault(); setTrendsCollapsed(c=>!c);}}}>
                <header className="summary-spotlight-head">
                  <div className="summary-spotlight-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M3 17l6-6 4 4 8-8" />
                      <path d="M14 7h7v7" />
                    </svg>
                  </div>
                  <h3 id="trends-heading" className="summary-spotlight-title flex items-start gap-3">
                    <span className="inline-flex items-center gap-2">{trendsHeadline || 'Trends'} {scopeDescriptor && <span className="summary-scope-tag">{scopeDescriptor}</span>}</span>
                    <button type="button" aria-label={trendsCollapsed? 'Expand trends summary':'Collapse trends summary'} onClick={(e)=>{e.stopPropagation(); setTrendsCollapsed(c=>!c);}} className={`chevron-btn ${trendsCollapsed? '' : 'open'}`}>
                      <span aria-hidden className="chevron-icon">›</span>
                    </button>
                  </h3>
                </header>
                {!trendsCollapsed && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.35,ease:[0.4,0.16,0.2,1]}} className="overflow-hidden">
                    <div className="summary-spotlight-body prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: renderMarkdown(trendsBody)}} />
                    {renderSourcesList(trendParts.sources)}
                  </motion.div>
                )}
              </motion.section>
            </motion.div>
          )}
        </section>
  )}
        {/* Projects Section */}
        {!fullSearchMode ? (
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
        ) : null}
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

// Split sources from the raw text
function splitSources(raw = '') {
  const lines = raw.split(/\n/);
  const idx = lines.findIndex(l => /^SOURCES:\s*$/i.test(l.trim()));
  if (idx === -1) return { main: raw.trim(), sources: [] };
  const main = lines.slice(0, idx).join('\n').trim();
  const sourceLines = lines.slice(idx + 1).map(l => l.trim()).filter(Boolean);
  // Treat '(none)' or empty list as no sources
  const sources = sourceLines[0] && sourceLines[0].toLowerCase() !== '(none)' ? sourceLines : [];
  return { main, sources };
}

// Small renderer for sources; reuse existing escapeHtml
function renderSourcesList(sources) {
  if (!sources.length) return null;
  return (
    <details className="mt-4 group summary-sources">
      <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
        Sources ({sources.length})
        <span className="transition-transform group-open:rotate-90 inline-block text-neutral-400">›</span>
      </summary>
      <ul className="mt-2 space-y-1 text-[11px] leading-snug text-neutral-600">
        {sources.map((s,i)=>(
          <li key={i} className="pl-1">{escapeHtml(s)}</li>
        ))}
      </ul>
    </details>
  );
}
