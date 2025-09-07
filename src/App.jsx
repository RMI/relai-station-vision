import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import updatesData, { projectSummaries } from './updatesData';
import { getSummary, getEmergingThemes, getRelatedWork, projectSlug } from './summary.jsx';
import { variants, springLayout, listStagger } from './motionTokens';

// RelaiCard component for displaying the most recent update per project
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
      className={`flex h-full flex-col surface-card border-l-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all
        ${relai.status_color === 'green' ? 'border-secondary-500' :
          relai.status_color === 'yellow' ? 'border-amber-400' :
          'border-rose-500'} hover:-translate-y-1`}
      role="listitem"
      aria-label={`Project ${relai.project}`}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-lg leading-snug tracking-tight text-neutral-900">{relai.project}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFilter && onFilter('program', relai.program); }}
            className="token-pill text-[11px]"
            title="Filter by program"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 01.8 1.6l-4.2 5.6V16a1 1 0 01-1.447.894l-3-1.5A1 1 0 017 14.5V10.2L2.2 5.6A1 1 0 013 4z"/></svg>
            {relai.program}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFilter && onFilter('owner', relai.owner); }}
            className="token-pill text-[11px]"
            title="Filter by owner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
            {relai.owner}
          </button>
        </div>
      </div>
      <div className="space-y-2 text-[13px] leading-snug text-neutral-800">
        <div>
          <span className="font-semibold text-neutral-900">Health:</span>{' '}
          <span>{projSummary?.headline || 'Summary not available.'}</span>
        </div>
        {projSummary?.recentFocus && (
          <div>
            <span className="font-semibold text-neutral-900">Recent focus:</span>{' '}
            <span>{projSummary.recentFocus}</span>
          </div>
        )}
        {projSummary?.keyRisks && (
          <div>
            <span className="font-semibold text-neutral-900">Key risks:</span>{' '}
            <span>{projSummary.keyRisks}</span>
          </div>
        )}
        {projSummary?.themes && projSummary.themes.length > 0 && (
          <div>
            <span className="font-semibold text-neutral-900">Themes:</span>{' '}
            <span>{projSummary.themes.join('; ')}</span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
        <span className="text-xs text-neutral-500">Last updated {relai.date}</span>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 focus-ring flex items-center">
          View Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
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
      // Wait a tick for modal render
      setTimeout(() => {
        const el = document.getElementById(`update-${projectSlug(project)}-${targetUpdateDate.replace(/[^a-zA-Z0-9]/g,'-')}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-2','ring-blue-400','ring-offset-2','ring-offset-white');
          setTimeout(() => {
            el.classList.remove('ring-2','ring-blue-400','ring-offset-2','ring-offset-white');
          }, 1800);
        }
      }, 90);
    }
  }, [targetUpdateDate, project]);
  
  return (
    <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-modal max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-neutral-200 flex justify-between items-center rounded-t-xl
          ${latestUpdate.status_color === 'green' ? 'bg-secondary-50' : 
            latestUpdate.status_color === 'yellow' ? 'bg-amber-50' : 
            'bg-rose-50'}`}>
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral-800">{project}</h2>
            <p className="text-sm text-neutral-500 flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2
                ${latestUpdate.status_color === 'green' ? 'bg-secondary-500' : 
                  latestUpdate.status_color === 'yellow' ? 'bg-amber-500' : 
                  'bg-rose-500'}`}></span>
              Current Status: {latestUpdate.status_color.charAt(0).toUpperCase() + latestUpdate.status_color.slice(1)}
            </p>
            <p className="text-xs text-neutral-500">Program: <button onClick={() => onFilter && onFilter('program', latestUpdate.program)} className="font-medium text-neutral-700 underline decoration-dotted underline-offset-2 hover:text-neutral-800">{latestUpdate.program}</button></p>
            <p className="text-xs text-neutral-500">Owner: <button onClick={() => onFilter && onFilter('owner', latestUpdate.owner)} className="font-medium text-neutral-700 underline decoration-dotted underline-offset-2 hover:text-neutral-800">{latestUpdate.owner}</button></p>
            {objectives.length > 0 && (
              <p className="text-xs text-neutral-500">OOMs: {objectives.map((o, i) => (
                <button key={i} onClick={() => onFilter && onFilter('objective', o)} className="ml-1 font-medium text-neutral-700 underline decoration-dotted underline-offset-2 hover:text-neutral-800">{String(o)}</button>
              ))}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="mb-6">
            <h3 className="font-medium text-neutral-900 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Project History ({sortedUpdates.length} Relais)
            </h3>
            <div className="border-l-2 border-neutral-200 ml-2 pl-4 space-y-8 py-2">
              {sortedUpdates.map((update, index) => (
                <div key={index} id={`update-${projectSlug(project)}-${update.date.replace(/[^a-zA-Z0-9]/g,'-')}`} className="relative">
                  <div className="absolute -left-[21px] mt-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white"></div>
                  <div className={`rounded-lg p-4 ${index === 0 ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-neutral-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-primary-800">{update.date}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                        ${update.status_color === 'green' ? 'bg-secondary-100 text-secondary-700' : 
                          update.status_color === 'yellow' ? 'bg-amber-100 text-amber-700' : 
                          'bg-rose-100 text-rose-700'}`}>
                        {update.status_color.charAt(0).toUpperCase() + update.status_color.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-3">By {update.owner} • {update.program}</p>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Key Developments & Decisions</h4>
                      <p className="text-sm text-neutral-600">{update.key_developments_and_decisions}</p>
                    </div>
                    {update.key_new_insights_and_decisions && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Key New Insights & Decisions</h4>
                        <p className="text-sm text-neutral-600">{update.key_new_insights_and_decisions}</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Key Blockers & Concerns</h4>
                      <p className="text-sm text-neutral-600">{update.key_blockers_and_concerns}</p>
                    </div>
                    {update.emerging_themes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Emerging Themes</h4>
                        <p className="text-sm text-neutral-600">{update.emerging_themes}</p>
                      </div>
                    )}
                    {update.funding_conversation && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-neutral-700 mb-1">Funding Conversation</h4>
                        <p className="text-sm text-neutral-600">{update.funding_conversation}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Overall Project Status</h4>
                      <p className="text-sm text-neutral-600">{update.overall_project_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [summaryMode, setSummaryMode] = useState('overall'); // overall | program | objective
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  // Global clickable filter (program | owner | objective)
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'program'|'owner'|'objective', value: string }

  const applyFilter = (type, value) => {
    setActiveFilter({ type, value });
    setSelectedProject(null);
    // Keep summary controls in sync where applicable
    if (type === 'program') {
      setSummaryMode('program');
      setSelectedProgram(value);
    } else if (type === 'objective') {
      setSummaryMode('objective');
      setSelectedObjective(String(value));
    }
    // For owner we don't have a summary control; filtering will still apply to the dataset below
  };

  const clearActiveFilter = () => {
    setActiveFilter(null);
    setSelectedProgram('');
    setSelectedObjective('');
  };
  
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

  // Filter the most recent updates based on search criteria and global clickable filter
  let filteredProjects = Object.values(mostRecentByProject).filter((u) => {
    return (
      (search === '' ||
        u.owner.toLowerCase().includes(search.toLowerCase()) ||
        u.project.toLowerCase().includes(search.toLowerCase()) ||
        u.key_developments_and_decisions.toLowerCase().includes(search.toLowerCase()) ||
        u.key_blockers_and_concerns.toLowerCase().includes(search.toLowerCase()) ||
        u.overall_project_status.toLowerCase().includes(search.toLowerCase())) &&
      (project === '' || u.project === project) &&
      (owner === '' || u.owner === owner) &&
      (statusColor === '' || u.status_color === statusColor) &&
      (!activeFilter || (activeFilter.type === 'program' && u.program === activeFilter.value) ||
        (activeFilter.type === 'owner' && u.owner === activeFilter.value) ||
        (activeFilter.type === 'objective' && Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value))))
    );
  });

  // Sort the projects by date of most recent update
  filteredProjects = filteredProjects.sort((a, b) => parseDate(b.date) - parseDate(a.date));

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
      
      {/* Hero Header */}
      <header className="hero-shell relative">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="max-w-3xl">
                <div className="flex items-center mb-5">
                  <div className="h-12 w-12 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shadow-inner backdrop-blur-sm mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="display-title">Relai Station</h1>
                    <p className="subheading">A synthesized, multi-program view of fictional Relais activity.</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/80 text-xs font-medium">
                  <div className="glass-panel rounded-lg px-3 py-2 flex flex-col gap-1">
                    <span className="text-white/60">Projects</span>
                    <span className="text-sm font-semibold text-white/95">{Object.keys(mostRecentByProject).length}</span>
                  </div>
                  <div className="glass-panel rounded-lg px-3 py-2 flex flex-col gap-1">
                    <span className="text-white/60">Updated</span>
                    <span className="text-sm font-semibold text-white/95">{new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                  </div>
                  <div className="glass-panel rounded-lg px-3 py-2 flex flex-col gap-1">
                    <span className="text-white/60">Green Ratio</span>
                    <span className="text-sm font-semibold text-white/95">{(() => { const greens = Object.values(mostRecentByProject).filter(u=>u.status_color==='green').length; const total = Object.keys(mostRecentByProject).length||1; return Math.round((greens/total)*100)+'%'; })()}</span>
                  </div>
                  <div className="glass-panel rounded-lg px-3 py-2 flex flex-col gap-1">
                    <span className="text-white/60">Signals</span>
                    <span className="text-sm font-semibold text-white/95">Live</span>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col gap-4 items-start md:items-end justify-end">
                <div className="text-white/80 text-sm font-medium mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="hidden md:flex items-center gap-3 text-xs text-white/70">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Healthy</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Watch</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeFilter && (
          <div className="mb-4">
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 text-primary-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                </svg>
                <span className="font-medium">Active Filter</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white border border-primary-200 text-primary-800">
                  {activeFilter.type.charAt(0).toUpperCase() + activeFilter.type.slice(1)}
                </span>
                <span className="text-primary-900">=</span>
                <span className="font-semibold">{String(activeFilter.value)}</span>
              </div>
              <div className="flex items-center gap-2">
                {(activeFilter.type === 'program' || activeFilter.type === 'objective') && (
                  <span className="text-xs text-primary-700">(Top summary is scoped to this {activeFilter.type}.)</span>
                )}
                <button onClick={clearActiveFilter} className="inline-flex items-center gap-1 text-sm text-primary-800 hover:text-primary-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear filter
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Summary section */}
        <section className="mb-10">
          {/* Summary filters */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Summary view:</span>
              <div className="inline-flex bg-neutral-100 rounded-lg p-1">
                {['overall','program','objective'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setSummaryMode(mode); setSelectedProgram(''); setSelectedObjective(''); }}
                    className={`px-3 py-1.5 text-sm rounded-md ${summaryMode === mode ? 'bg-white shadow text-neutral-900' : 'text-neutral-600'}`}
                  >
                    {mode === 'overall' ? 'Overall' : mode === 'program' ? 'By Program' : 'By Objective'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {summaryMode === 'program' && (
                <select
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
                >
                  <option value="">Select a program…</option>
                  {allPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {summaryMode === 'objective' && (
                <select
                  value={selectedObjective}
                  onChange={e => setSelectedObjective(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
                >
                  <option value="">Select an objective…</option>
                  {allObjectives.map(o => <option key={o} value={String(o)}>{o}</option>)}
                </select>
              )}
              {activeFilter && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    Filter: {activeFilter.type.charAt(0).toUpperCase() + activeFilter.type.slice(1)} = {String(activeFilter.value)}
                  </span>
                  <button onClick={clearActiveFilter} className="text-xs text-neutral-500 hover:text-neutral-700">Clear</button>
                </div>
              )}
            </div>
          </div>

          {/** Compute summary dataset based on controls + global clickable filter */}
          {(() => {
            let summaryData = updatesData;
            if (summaryMode === 'program' && selectedProgram) {
              summaryData = updatesData.filter(u => u.program === selectedProgram);
            } else if (summaryMode === 'objective' && selectedObjective) {
              summaryData = updatesData.filter(u => Array.isArray(u.objectives) && u.objectives.map(String).includes(String(selectedObjective)));
            }
            if (activeFilter) {
              if (activeFilter.type === 'program') summaryData = summaryData.filter(u => u.program === activeFilter.value);
              if (activeFilter.type === 'owner') summaryData = summaryData.filter(u => u.owner === activeFilter.value);
              if (activeFilter.type === 'objective') summaryData = summaryData.filter(u => Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value)));
            }
            return (
              <div className="bg-white rounded-xl shadow-card mb-6">
                {getSummary(summaryData, { 
                  openProjectUpdate: (proj, date) => {
                    setSelectedProject(proj);
                    setTargetUpdateDate(date);
                  }
                })}
              </div>
            );
          })()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4 text-primary-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Emerging Themes
              </h3>
              {getEmergingThemes(
                (() => {
                  let data = updatesData;
                  if (activeFilter) {
                    if (activeFilter.type === 'program') data = data.filter(u => u.program === activeFilter.value);
                    if (activeFilter.type === 'owner') data = data.filter(u => u.owner === activeFilter.value);
                    if (activeFilter.type === 'objective') data = data.filter(u => Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value)));
                  }
                  return data;
                })()
              )}
            </div>
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4 text-primary-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Related Work
              </h3>
              {getRelatedWork(
                (() => {
                  let data = updatesData;
                  if (activeFilter) {
                    if (activeFilter.type === 'program') data = data.filter(u => u.program === activeFilter.value);
                    if (activeFilter.type === 'owner') data = data.filter(u => u.owner === activeFilter.value);
                    if (activeFilter.type === 'objective') data = data.filter(u => Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value)));
                  }
                  return data;
                })()
              )}
            </div>
          </div>
        </section>
        
        {/* Relai updates section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-display font-semibold text-neutral-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              Latest Relais
              <span className="ml-2 text-sm font-normal text-neutral-500">({filteredProjects.length} projects)</span>
            </h2>
            
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search projects, owners, updates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusColor('')}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${statusColor === '' ? 'bg-primary-100 text-primary-800' : 'bg-white text-neutral-600'}`}
              >
                All Statuses
              </button>
              {allStatusColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStatusColor(color)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center whitespace-nowrap
                    ${statusColor === color ? 
                      (color === 'green' ? 'bg-secondary-100 text-secondary-800' : 
                      color === 'yellow' ? 'bg-amber-100 text-amber-800' : 
                      'bg-rose-100 text-rose-800') : 
                      'bg-white text-neutral-600'}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-1.5
                    ${color === 'green' ? 'bg-secondary-500' : 
                      color === 'yellow' ? 'bg-amber-500' : 
                      'bg-rose-500'}`}></span>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 w-full sm:w-auto">
              <select 
                value={project} 
                onChange={e => setProject(e.target.value)} 
                className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
              >
                <option value="">All Projects</option>
                {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              
              <select 
                value={owner} 
                onChange={e => setOwner(e.target.value)} 
                className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
              >
                <option value="">All Owners</option>
                {allOwners.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {allPrograms.length > 0 && (
                <select 
                  value={activeFilter?.type === 'program' ? activeFilter.value : ''}
                  onChange={e => e.target.value ? applyFilter('program', e.target.value) : clearActiveFilter()}
                  className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
                >
                  <option value="">All Programs</option>
                  {allPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {allObjectives.length > 0 && (
                <select 
                  value={activeFilter?.type === 'objective' ? String(activeFilter.value) : ''}
                  onChange={e => e.target.value ? applyFilter('objective', e.target.value) : clearActiveFilter()}
                  className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
                >
                  <option value="">All OOMs</option>
                  {allObjectives.map(o => <option key={o} value={String(o)}>{o}</option>)}
                </select>
              )}
            </div>
          </div>
          
      {/* Display most recent update per project as cards */}
      <motion.div
        layout
        variants={listStagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        role="list"
      >
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
            <motion.div
              key="empty"
              variants={variants.fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="col-span-3 py-12 text-center text-neutral-500 bg-white rounded-lg shadow-sm border border-neutral-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No Relais match your filters</p>
              <p className="text-sm">Try adjusting your search criteria</p>
              <button
                onClick={() => { setSearch(''); setProject(''); setStatusColor(''); setOwner(''); }}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4 mt-12">
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
