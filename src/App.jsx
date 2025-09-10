import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import updatesData, { projectSummaries } from '../lib/updatesData';
import { variants, springLayout, listStagger } from './motionTokens';

/* -----------------------------------------------------------
   Utility helpers
------------------------------------------------------------ */
function projectSlug(name=''){ return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').trim(); }
function escapeHtml(str=''){ return str.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c)); }
// Removed splitSources logic (sources section deprecated in summaries)
function highlightSnippet(snippet, query){ if(!query) return escapeHtml(snippet); try { const tokens=Array.from(new Set(query.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean))); if(!tokens.length) return escapeHtml(snippet); const pattern=new RegExp('(' + tokens.map(t=>t.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')).join('|') + ')','ig'); return escapeHtml(snippet).replace(pattern,'<mark class="nlhi">$1</mark>'); } catch(e){ return escapeHtml(snippet);} }
function renderSourcesList(sources){ if(!sources.length) return null; return (<details className="mt-4 group summary-sources"><summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700 flex items-center gap-1">Sources ({sources.length})<span className="transition-transform group-open:rotate-90 inline-block text-neutral-400">›</span></summary><ul className="mt-2 space-y-1 text-[11px] leading-snug text-neutral-600">{sources.map((s,i)=>(<li key={i} className="pl-1">{escapeHtml(s)}</li>))}</ul></details>); }

/* -----------------------------------------------------------
   Relai Card
------------------------------------------------------------ */
const RelaiCard = ({ relai, onClick, onFilter, index }) => {
  const projSummary = projectSummaries[relai.project];
  const statusColorClass = relai.status_color === 'green' ? 'before:bg-emerald-400' : relai.status_color === 'yellow' ? 'before:bg-amber-400' : 'before:bg-rose-500';
  function initials(name=''){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join(''); }
  return (
    <motion.article layout variants={variants.scaleCard} custom={index} initial="hidden" animate="visible" exit="exit" transition={springLayout} whileHover={{y:-4}} whileTap={{scale:0.985}} onClick={onClick} id={`project-${projectSlug(relai.project)}`} className={`surface-card cursor-pointer group pl-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-accent/60 transition-all ${statusColorClass} relative before:content-[''] before:absolute before:inset-y-2 before:left-2 before:w-1 before:rounded-full before:shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`} role="listitem" aria-label={`Project ${relai.project}`}>
      <div className="mb-3 pr-1"><h3 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 group-hover:text-neutral-950 transition-colors">{relai.project}</h3></div>
      <div className="space-y-2 text-[13px] leading-snug text-neutral-700">
        <div className="flex items-start gap-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-400/30" aria-hidden="true"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg></span><p><span className="sr-only">Health:</span>{projSummary?.headline || 'Summary not available.'}</p></div>
        {(relai.overall_project_summary || projSummary?.recentFocus) && (<div className="flex items-start gap-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-500/15 text-sky-600 border border-sky-400/30" aria-hidden="true"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg></span><p><span className="sr-only">Summary:</span>{(relai.overall_project_summary || projSummary?.recentFocus || '').slice(0,180)}</p></div>)}
        {projSummary?.keyRisks && (<div className="flex items-start gap-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/15 text-amber-600 border border-amber-400/30" aria-hidden="true"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></span><p><span className="sr-only">Risks:</span>{projSummary.keyRisks}</p></div>)}
        {projSummary?.themes?.length>0 && (<div className="flex items-start gap-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-fuchsia-500/15 text-fuchsia-600 border border-fuchsia-400/30" aria-hidden="true"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M7 6h10"/><path d="M7 18h10"/></svg></span><p><span className="sr-only">Milestones:</span>{projSummary.themes.join('; ')}</p></div>)}
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 space-y-2">
        <div className="flex items-center gap-2"><button type="button" onClick={(e)=>{e.stopPropagation();onFilter?.('owner', relai.owner);}} className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 text-[11px] font-medium"><span className="w-5 h-5 rounded-full bg-neutral-300 text-neutral-700 flex items-center justify-center text-[10px] font-semibold" aria-hidden="true">{initials(relai.owner)}</span>{relai.owner}</button><button type="button" onClick={(e)=>{e.stopPropagation();onFilter?.('program', relai.program);}} className="ml-auto inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 text-[11px] font-medium"><span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />{relai.program}</button></div>
        <div className="flex items-center"><span className="text-neutral-400">Updated {relai.date}</span><span className="inline-flex items-center gap-1 font-medium text-accent text-xs ml-auto">See details<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></span></div>
      </div>
    </motion.article>
  );
};

/* -----------------------------------------------------------
   Detail Modal
------------------------------------------------------------ */
const RelaiDetailModal = ({ project, updates, onClose, onFilter, targetUpdateDate }) => {
  const sortedUpdates=[...updates].sort((a,b)=> new Date(b.date)-new Date(a.date));
  const latestUpdate = sortedUpdates[0];
  const objectives = latestUpdate?.objectives||[];
  useEffect(()=>{ if(targetUpdateDate){ setTimeout(()=>{ const el=document.getElementById(`update-${projectSlug(project)}-${targetUpdateDate.replace(/[^a-zA-Z0-9]/g,'-')}`); if(el){ el.classList.remove('update-pulse'); void el.offsetWidth; el.classList.add('update-pulse'); setTimeout(()=>el.classList.remove('update-pulse'),2200);} },90);} },[targetUpdateDate,project]);
  return (<div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white/95 border border-neutral-200 rounded-2xl shadow-lg max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-start rounded-t-2xl bg-gradient-to-r from-white/80 via-white to-white/90">
        <div className="pr-6"><h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-1">{project}</h2><div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500"><div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${latestUpdate.status_color==='green'?'bg-emerald-500':latestUpdate.status_color==='yellow'?'bg-amber-500':'bg-rose-500'}`} /><span className="font-medium text-neutral-700">{latestUpdate.status_color.toUpperCase()}</span></div><span className="w-1 h-1 rounded-full bg-neutral-300" /><button onClick={()=>onFilter?.('program', latestUpdate.program)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{latestUpdate.program}</button><span className="w-1 h-1 rounded-full bg-neutral-300" /><button onClick={()=>onFilter?.('owner', latestUpdate.owner)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{latestUpdate.owner}</button>{objectives.length>0 && (<><span className="w-1 h-1 rounded-full bg-neutral-300" /><span className="text-neutral-400">OOMs:</span>{objectives.map((o,i)=>(<button key={i} onClick={()=>onFilter?.('objective', o)} className="underline decoration-dotted underline-offset-2 hover:text-neutral-700">{String(o)}</button>))}</>)}</div></div>
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
      </div>
          <div className="overflow-y-auto px-6 py-6 flex-grow"><div className="relative pl-6"><div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-neutral-200 to-neutral-300" /><div className="space-y-10">{sortedUpdates.map((update,index)=>(<div key={index} id={`update-${projectSlug(project)}-${update.date.replace(/[^a-zA-Z0-9]/g,'-')}`} data-update-id={update.update_id || ''} className="relative group scroll-mt-24"><div className="absolute -left-3 mt-1 w-5 h-5"><div className={`absolute inset-0 rounded-full border-2 bg-white ${index===0?'border-accent':'border-neutral-300 group-hover:border-accent transition-colors'} flex items-center justify-center`}><div className={`w-2 h-2 rounded-full ${update.status_color==='green'?'bg-emerald-500':update.status_color==='yellow'?'bg-amber-500':'bg-rose-500'}`} /></div></div><div className={`rounded-xl p-5 border transition-colors ${index===0?'border-accent/40 bg-accent-soft':'border-neutral-200 hover:border-neutral-300 bg-white/70'} backdrop-blur-sm`}><div className="flex justify-between items-center mb-3"><span className="text-sm font-semibold text-neutral-800 tracking-tight">{update.date}</span><span className={`status-badge ${update.status_color==='green'?'status-green':update.status_color==='yellow'?'status-yellow':'status-red'}`}>{update.status_color}</span></div><div className="grid gap-5 text-[13px] leading-relaxed text-neutral-700">
            {(update.overall_project_summary) && (<div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Overall Project Summary</h4><p>{update.overall_project_summary}</p></div>)}
            <div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key Achievements</h4><p>{update.key_achievements}</p></div>
            {update.fyis && (<div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">FYIs</h4><p>{update.fyis}</p></div>)}
            {update.upcoming_milestones && (<div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Upcoming Milestones</h4><p>{update.upcoming_milestones}</p></div>)}
            {update.key_blockers_and_concerns && (<div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key Blockers & Concerns</h4><p>{update.key_blockers_and_concerns}</p></div>)}
            {update.key_new_insights_and_decisions && (<div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Key New Insights & Decisions</h4><p>{update.key_new_insights_and_decisions}</p></div>)}
            <div><h4 className="font-semibold text-neutral-900 mb-1 text-[12px] tracking-wide uppercase">Overall Project Status</h4><p>{update.overall_project_status}</p></div>
          </div></div></div>))}</div></div></div>
      <div className="px-6 py-4 border-t border-neutral-200 flex justify-end bg-white/80"><button onClick={onClose} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium">Close</button></div>
    </div>
  </div>);
};

/* -----------------------------------------------------------
   Main App
------------------------------------------------------------ */
function App(){
  const parseDate = (s)=> new Date(s);
  // Filters & state
  const [search,setSearch] = useState('');
  const [project,setProject] = useState('');
  const [owner,setOwner] = useState('');
  const [statusColor,setStatusColor] = useState('');
  const [selectedProject,setSelectedProject] = useState(null);
  const [mostRecentByProject,setMostRecentByProject] = useState({});
  const [targetUpdateDate,setTargetUpdateDate] = useState(null); // legacy (date-based) targeting
  const [targetUpdateId,setTargetUpdateId] = useState(null); // new stable id targeting
  const [selectedProgram,setSelectedProgram] = useState('');
  const [selectedObjective,setSelectedObjective] = useState('');
  // Summaries
  const [sectionLoading,setSectionLoading] = useState(false);
  const [sectionError,setSectionError] = useState(null);
  const [achievementsMd,setAchievementsMd] = useState('');
  const [flagsMd,setFlagsMd] = useState('');
  const [trendsMd,setTrendsMd] = useState('');
  const [lastGenAt,setLastGenAt] = useState(null);
  // unified expansion state
  const [openSummary,setOpenSummary] = useState(null);
  const [activeFilter,setActiveFilter] = useState(null);
  // NL search
  const [nlSearchQuery,setNlSearchQuery] = useState('');
  const [nlSearchActive,setNlSearchActive] = useState(false);
  const [nlSearchResults,setNlSearchResults] = useState([]);
  const [nlAnswer,setNlAnswer] = useState('');
  const [nlLoading,setNlLoading] = useState(false);
  const [nlError,setNlError] = useState(null);
  const [nlFocused,setNlFocused] = useState(false);
  const [searchEngaged,setSearchEngaged] = useState(false);
  // Ref for NL search input for programmatic focus
  const nlInputRef = useRef(null);

  const selectedProjectUpdates = selectedProject ? updatesData.filter(u=>u.project===selectedProject) : [];

  function currentScope(){ if(selectedProgram) return {mode:'program', value:selectedProgram}; if(selectedObjective) return {mode:'objective', value:selectedObjective}; return {mode:'overall'}; }

  const fetchSections = async(force=false)=>{ try { setSectionError(null); setSectionLoading(true); const resp=await fetch('/api/summary',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({scope:currentScope(), force})}); if(!resp.ok) throw new Error(`HTTP ${resp.status}`); const data=await resp.json(); setAchievementsMd(data.achievements||''); setFlagsMd(data.flags||''); setTrendsMd(data.trends||''); setLastGenAt(data.generatedAt||null); } catch(e){ setSectionError(e.message);} finally { setSectionLoading(false);} };
  useEffect(()=>{ fetchSections(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedProgram, selectedObjective]);

  const runNlSearch = async(q)=>{
    setNlError(null);
    if(q.trim().length<3){ setNlSearchActive(false); setNlSearchResults([]); setNlAnswer(''); setSearchEngaged(false); return; }
    try {
      setSearchEngaged(true); setNlSearchActive(true); setNlLoading(true); setNlSearchResults([]); setNlAnswer('');
      const resp = await fetch('/api/nl-search',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:q})});
      if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setNlAnswer(data.answer||'');
      setNlSearchResults([]); // unified route returns only answer
      setNlSearchActive(!!data.answer);
    } catch(e){
      setNlError(e.message);
    } finally {
      setNlLoading(false);
    }
  };
  const clearNlSearch = ()=>{ setNlSearchQuery(''); setNlSearchResults([]); setNlAnswer(''); setNlError(null); setNlSearchActive(false); setSearchEngaged(false); };

  // Keyboard shortcuts: Cmd+K (or Ctrl+K) to focus search, Esc to clear/exit if engaged/active
  useEffect(()=>{
    const handler = (e)=>{
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){
        e.preventDefault();
        if(nlInputRef.current){
          nlInputRef.current.focus();
          setNlFocused(true);
        }
      }
      else if(e.key === 'Escape'){
        if(searchEngaged || nlSearchQuery.length>0 || nlSearchActive){
          clearNlSearch();
          if(nlInputRef.current){ nlInputRef.current.blur(); }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [searchEngaged, nlSearchQuery, nlSearchActive]);

  // Build most recent update per project
  useEffect(()=>{ const latest={}; updatesData.forEach(u=>{ if(!latest[u.project] || new Date(u.date) > new Date(latest[u.project].date)) latest[u.project]=u; }); setMostRecentByProject(latest); },[]);

  const allOwners = Array.from(new Set(updatesData.map(u=>u.owner)));
  const allStatusColors = ['green','yellow','red'];
  const allPrograms = Array.from(new Set(updatesData.map(u=>u.program))).filter(Boolean);
  const allObjectives = Array.from(new Set(updatesData.flatMap(u=> Array.isArray(u.objectives)? u.objectives : [])));

  const matchedProjectSet = useMemo(()=>{ if(!nlSearchActive) return null; return new Set(nlSearchResults.map(r=>r.project)); },[nlSearchActive,nlSearchResults]);

  let filteredProjects = Object.values(mostRecentByProject).filter(u=>{
    const scopeOk = (!selectedProgram || u.program===selectedProgram) && (!selectedObjective || (Array.isArray(u.objectives) && u.objectives.map(String).includes(String(selectedObjective))));
    const searchSetOk = (!matchedProjectSet || matchedProjectSet.has(u.project));
    const freeTextHaystack = [
      u.owner,
      u.project,
  u.key_achievements || '',
      u.key_blockers_and_concerns || '',
      u.fyis || '',
      u.upcoming_milestones || '',
      u.overall_project_summary || '',
      u.overall_project_status || ''
    ].join('\n').toLowerCase();
    return scopeOk && searchSetOk &&
      (search==='' || freeTextHaystack.includes(search.toLowerCase())) &&
      (project==='' || u.project===project) && (owner==='' || u.owner===owner) && (statusColor==='' || u.status_color===statusColor) &&
      (!activeFilter || (activeFilter.type==='program' && u.program===activeFilter.value) || (activeFilter.type==='owner' && u.owner===activeFilter.value) || (activeFilter.type==='objective' && Array.isArray(u.objectives) && u.objectives.map(String).includes(String(activeFilter.value))));
  }).sort((a,b)=> new Date(b.date)-new Date(a.date));

  function extractHeadline(md){ if(!md) return ''; const firstLine=md.trim().split(/\n+/)[0].trim(); const m=firstLine.match(/(.+?[.!?])($|\s)/); let s=m?m[1].trim():firstLine; s=s.replace(/^#+\s*/, '').replace(/^\*\*(.+)\*\*$/,'$1'); return s; }
  function stripHeadline(md, headline){ if(!md) return ''; const lines=md.trim().split(/\n+/); if(lines[0] && lines[0].includes(headline.substring(0,Math.min(10,headline.length)))) lines.shift(); return lines.join('\n').trim(); }
  const achHeadline = extractHeadline(achievementsMd); const flagsHeadline = extractHeadline(flagsMd); const trendsHeadline = extractHeadline(trendsMd);
  const achBody = stripHeadline(achievementsMd, achHeadline); const flagsBody = stripHeadline(flagsMd, flagsHeadline); const trendsBody = stripHeadline(trendsMd, trendsHeadline);
  const scopeDescriptor = selectedProgram ? `for ${selectedProgram}` : selectedObjective ? `for Objective ${selectedObjective}` : '';

  // Enhanced markdown renderer: converts trailing project tag brackets [Project A, Project B] into clickable spans.
  function renderMarkdown(md){
    if(!md) return null;
    const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]||c));
    const lines=md.split(/\n+/);
    const html=lines.map(l=>{
      if(/^\s*-\s+/.test(l)){
        let content = l.replace(/^\s*-\s+/,'');
        // Extract trailing project bracket
        const tagMatch = content.match(/\s\[([^\]]+)\]\s*$/);
        let tagHtml='';
        if(tagMatch){
          const projects = tagMatch[1].split(/\s*,\s*/).filter(Boolean);
            content = content.slice(0, tagMatch.index).trim();
          tagHtml = `<span class="ml-2 inline-flex flex-wrap gap-1 align-middle">${projects.map(p=>`<button type="button" class="proj-tag" data-project="${esc(p)}">${esc(p)}</button>`).join('')}</span>`;
        }
        const inner = esc(content).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
        return `<li>${inner}${tagHtml}</li>`;
      }
      if(/^\*\*(.*?)\*\*/.test(l.trim())) return `<p><strong>${esc(l.trim().replace(/^\*\*(.*?)\*\*/,'$1'))}</strong></p>`;
      return `<p>${esc(l).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`;
    }).join('');
    if(/<li>/.test(html)) return `<ul class="list-disc pl-4 space-y-1">${html}</ul>`;
    return html;
  }

  // Delegate click handling for project tag buttons inside summary sections
  useEffect(()=>{
    function handleClick(e){
      const btn = e.target.closest('button.proj-tag');
      if(!btn) return;
      const proj = btn.getAttribute('data-project');
      if(!proj) return;
      // Determine most recent update_id for project
      const recent = updatesData.filter(u=>u.project===proj).sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
      setSelectedProject(proj);
      setTargetUpdateDate(null);
      setTargetUpdateId(recent?.update_id || null);
      setTimeout(()=>{
        if(recent?.update_id){
          const el = document.querySelector(`[data-update-id="${recent.update_id}"]`);
          if(el){
            el.scrollIntoView({behavior:'smooth', block:'start'});
            el.classList.add('update-pulse');
            setTimeout(()=> el.classList.remove('update-pulse'), 2200);
          }
        }
      }, 160);
    }
    document.addEventListener('click', handleClick);
    return ()=> document.removeEventListener('click', handleClick);
  },[]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {selectedProject && <RelaiDetailModal project={selectedProject} updates={selectedProjectUpdates} onClose={()=>{ setSelectedProject(null); setTargetUpdateDate(null); }} onFilter={(t,v)=>{ setActiveFilter({type:t,value:v}); if(t==='program'){ setSelectedProgram(v); setSelectedObjective(''); } else if(t==='objective'){ setSelectedObjective(String(v)); setSelectedProgram(''); } }} targetUpdateDate={targetUpdateDate} />}

      <header className="hero-shell relative">
        <div className="hero-bg" /><div className="hero-aurora" /><div className="hero-aurora" /><div className="hero-particles" /><div className="hero-noise" /><div className="hero-overlay" />
        <div className="hero-content relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
            <div className="max-w-5xl">
              <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.9,ease:[0.25,0.8,0.25,1]}} className="flex items-start gap-6 mb-10">
                <motion.div initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.15,duration:0.8,type:'spring',stiffness:110}} className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-sky-500/30 to-sky-700/30 border border-cyan-300/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_10px_30px_-5px_rgba(14,165,233,0.55)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" /></svg>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-10">
        {/* NL Search Container */}
        <motion.section layout initial={false} animate={searchEngaged?'engaged':'idle'} variants={{ idle:{scale:1}, engaged:{scale:1.015} }} transition={{duration:0.45,ease:[0.4,0.16,0.2,1]}} className={`nl-search-shell rounded-xl shadow-sm border p-5 mb-10 transition-all duration-500 ${searchEngaged? 'nl-search-shell-engaged ring-2 ring-accent/50 border-accent/50 shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_14px_48px_-10px_rgba(56,189,248,0.55)]' : 'bg-white'} ${nlFocused && !searchEngaged ? 'ring-2 ring-accent/50 border-accent/50 shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_10px_30px_-6px_rgba(56,189,248,0.55)] scale-[1.01]' : 'border-neutral-200'}`} role="search" aria-label="Natural language corpus search">
          <form onSubmit={(e)=>{ e.preventDefault(); if(nlSearchQuery.trim().length>=3) runNlSearch(nlSearchQuery); }} className="flex gap-3 items-center">
            <input ref={nlInputRef} type="text" aria-label="Ask a question about all updates" placeholder="Ask: What are the main blockers for platform integration?" value={nlSearchQuery} onFocus={()=>setNlFocused(true)} onBlur={()=>setNlFocused(false)} onChange={(e)=>setNlSearchQuery(e.target.value)} className={`flex-1 rounded-md bg-neutral-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 ${nlFocused? 'border-accent' : 'border-neutral-300'} ${searchEngaged? 'bg-white/70' : ''}`} />
            {nlSearchActive && !nlLoading && (<button type="button" onClick={clearNlSearch} className="px-3 py-2 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-600">Clear</button>)}
            <button type="submit" disabled={nlLoading || nlSearchQuery.trim().length<3} className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${nlLoading? 'bg-neutral-200 border-neutral-300 text-neutral-500 cursor-wait' : nlSearchQuery.trim().length<3 ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-accent-soft border-accent/30 text-accent hover:border-accent/50'}`}>{nlLoading? 'Searching…' : searchEngaged? 'Refine' : 'Search'}</button>
          </form>
          {nlSearchQuery.trim().length>0 && nlSearchQuery.trim().length<3 && !nlLoading && (<p className="mt-3 text-xs text-neutral-400">Type at least 3 characters then press Enter.</p>)}
          {(nlLoading || nlAnswer || nlError) && nlSearchQuery.trim().length>=3 && (
            <div className="mt-8 space-y-6" aria-live="polite">
              {nlLoading && (<div className="flex items-center gap-3 text-sm text-neutral-500"><svg className="h-5 w-5 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle className="opacity-25" cx="12" cy="12" r="10" /><path d="M22 12a10 10 0 0 1-10 10" className="opacity-75" /></svg><span>Analyzing updates…</span></div>)}
              {!nlLoading && nlAnswer && (<div className="answer-panel rounded-lg border border-neutral-200 bg-white/70 p-4 shadow-sm"><p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-line" dangerouslySetInnerHTML={{__html: highlightSnippet(nlAnswer,'')}} /></div>)}
              {!nlLoading && !nlAnswer && !nlError && (<p className="text-xs text-neutral-500">No answer returned. Try rephrasing your question.</p>)}
              {!nlLoading && nlError && (<p className="text-xs text-rose-600">Error: {nlError}</p>)}
            </div>
          )}
        </motion.section>

        {/* ANIMATED EXIT OF OTHER UI WHEN ENGAGED */}
        <AnimatePresence>{!searchEngaged && (
          <motion.section key="filters" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12,transition:{duration:0.35,ease:[0.4,0.16,0.2,1]}}} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-10">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Search (text)</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter by keyword…" className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-accent/40" /></div>
              <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Program</label><select value={selectedProgram} onChange={e=>{setSelectedProgram(e.target.value); if(e.target.value){ setSelectedObjective(''); setActiveFilter({type:'program', value:e.target.value}); } else { setActiveFilter(null);} }} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"><option value="">All</option>{allPrograms.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Objective</label><select value={selectedObjective} onChange={e=>{setSelectedObjective(e.target.value); if(e.target.value){ setSelectedProgram(''); setActiveFilter({type:'objective', value:e.target.value}); } else { setActiveFilter(null);} }} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"><option value="">All</option>{allObjectives.map(o=><option key={o} value={String(o)}>{o}</option>)}</select></div>
              <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Owner</label><select value={owner} onChange={e=>setOwner(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"><option value="">All</option>{allOwners.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
              <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Status</label><select value={statusColor} onChange={e=>setStatusColor(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"><option value="">All</option>{allStatusColors.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              {activeFilter && (<div className="ml-auto flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-md text-xs text-neutral-600"><span className="font-medium">{activeFilter.type}: {String(activeFilter.value)}</span><button onClick={()=>{ setActiveFilter(null); setSelectedProgram(''); setSelectedObjective(''); }} className="text-neutral-500 hover:text-neutral-800">Clear</button></div>)}
              <div className="ml-auto flex items-center gap-3"><button onClick={()=>{setSearch(''); setSelectedProgram(''); setSelectedObjective(''); setOwner(''); setStatusColor(''); setActiveFilter(null);}} className="text-xs px-3 py-2 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700">Reset</button><button onClick={()=>fetchSections(true)} disabled={sectionLoading} className={`text-xs px-3 py-2 rounded-md border ${sectionLoading?'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-wait':'bg-accent-soft border-accent/30 text-accent hover:border-accent/50'}`}>{sectionLoading?'Refreshing…':'Refresh Summaries'}</button>{lastGenAt && <span className="text-[10px] text-neutral-400">{new Date(lastGenAt).toLocaleTimeString()}</span>}</div>
            </div>
          </motion.section>)}</AnimatePresence>

        <AnimatePresence>{!searchEngaged && (selectedProgram||selectedObjective||owner||statusColor||search) && (
          <motion.div key="chips" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8,transition:{duration:0.3}}} className="max-w-7xl mx-auto mb-8 -mt-6 px-1">
            <div className="flex flex-wrap items-center gap-2">
              {search && (<button onClick={()=>setSearch('')} className="filter-chip"><span className="filter-chip-label">Search:</span> {search}<span aria-hidden className="filter-chip-close">×</span></button>)}
              {selectedProgram && (<button onClick={()=>{setSelectedProgram(''); if(activeFilter?.type==='program') setActiveFilter(null);}} className="filter-chip filter-chip-accent"><span className="filter-chip-label">Program:</span> {selectedProgram}<span aria-hidden className="filter-chip-close">×</span></button>)}
              {selectedObjective && (<button onClick={()=>{setSelectedObjective(''); if(activeFilter?.type==='objective') setActiveFilter(null);}} className="filter-chip filter-chip-objective"><span className="filter-chip-label">Objective:</span> {selectedObjective}<span aria-hidden className="filter-chip-close">×</span></button>)}
              {owner && (<button onClick={()=>setOwner('')} className="filter-chip filter-chip-owner"><span className="filter-chip-label">Owner:</span> {owner}<span aria-hidden className="filter-chip-close">×</span></button>)}
              {statusColor && (<button onClick={()=>setStatusColor('')} className={`filter-chip filter-chip-status-${statusColor}`}><span className="filter-chip-label">Status:</span> {statusColor}<span aria-hidden className="filter-chip-close">×</span></button>)}
              <button onClick={()=>{setSearch(''); setSelectedProgram(''); setSelectedObjective(''); setOwner(''); setStatusColor(''); setActiveFilter(null);}} className="filter-chip-clear-all">Clear All</button>
            </div>
          </motion.div>)}</AnimatePresence>

        {/* NEW SUMMARY CARDS */}
        <AnimatePresence>{!searchEngaged && (
          <motion.section key="summaries" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24,transition:{duration:0.4,ease:[0.4,0.16,0.2,1]}}} className="mb-12" aria-label="AI generated summaries">
            {sectionError && <div className="text-sm text-rose-600">Error loading summaries: {sectionError}</div>}
            {sectionLoading && !sectionError && (
              <div className="grid md:grid-cols-3 gap-6 animate-pulse">{Array.from({length:3}).map((_,i)=>(<div key={i} className="rounded-xl border border-neutral-200 bg-white p-5"><div className="h-4 w-28 bg-neutral-200 rounded mb-3" /><div className="h-2.5 bg-neutral-200 rounded w-5/6" /></div>))}</div>
            )}
            {!sectionLoading && !sectionError && (
              <div>
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  {[{key:'achievements', title:achHeadline||'Achievements', icon:(<svg viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' fill='none' className='w-5 h-5'><path d='M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.6 5.8 22 7 14.14l-5-4.87 7.1-1.01z'/></svg>)}, {key:'flags', title:flagsHeadline||'Flags', icon:(<svg viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' fill='none' className='w-5 h-5'><path d='M4 2h8l2 5 2-5h4v17H4z'/></svg>)}, {key:'trends', title:trendsHeadline||'Trends', icon:(<svg viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' fill='none' className='w-5 h-5'><path d='M3 17l6-6 4 4 8-8'/><path d='M14 7h7v7'/></svg>)}].map(card=>{
                    const active = openSummary===card.key;
                    return (
                      <button key={card.key} type="button" aria-expanded={active} onClick={()=> setOpenSummary(s=> s===card.key? null : card.key)} className={`text-left rounded-xl border p-5 relative group transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 ${card.key==='achievements'?'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200':card.key==='flags'?'bg-amber-50/60 hover:bg-amber-50 border-amber-200': 'bg-sky-50/60 hover:bg-sky-50 border-sky-200'} ${active? (card.key==='achievements'?'ring-2 ring-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_4px_16px_-4px_rgba(16,185,129,0.35)]':card.key==='flags'?'ring-2 ring-amber-300 shadow-[0_0_0_1px_rgba(245,158,11,0.30),0_4px_16px_-4px_rgba(245,158,11,0.35)]':'ring-2 ring-sky-300 shadow-[0_0_0_1px_rgba(14,165,233,0.25),0_4px_16px_-4px_rgba(14,165,233,0.35)]') : ''}`}>
                        <div className="flex items-start gap-3">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border text-neutral-700 ${card.key==='achievements'?'bg-emerald-100/70 border-emerald-300':''} ${card.key==='flags'?'bg-amber-100/70 border-amber-300':''} ${card.key==='trends'?'bg-sky-100/70 border-sky-300':''}`}>{card.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold tracking-tight text-neutral-800 flex items-center gap-2">{card.title} {scopeDescriptor && <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{scopeDescriptor}</span>}</div>
                            {!active && <div className="text-[11px] text-neutral-400 mt-1">Click to expand</div>}
                          </div>
                          <div className={`ml-2 text-neutral-400 transition-transform ${active?'rotate-90':''}`}>›</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {openSummary && (
                    <motion.div key={openSummary} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.35,ease:[0.4,0.16,0.2,1]}} className={`rounded-xl p-6 shadow-sm border-2 bg-white/95 backdrop-blur-sm transition-colors ${openSummary==='achievements'?'border-emerald-300':'border-neutral-200'} ${openSummary==='flags'?'border-amber-300':''} ${openSummary==='trends'?'border-sky-300':''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-base font-semibold tracking-tight text-neutral-800">
                          {openSummary==='achievements'? (achHeadline||'Achievements') : openSummary==='flags'? (flagsHeadline||'Flags') : (trendsHeadline||'Trends')}
                        </h4>
                        <button onClick={()=>setOpenSummary(null)} aria-label="Collapse summary" className="w-7 h-7 text-neutral-500 hover:text-neutral-800 rounded-md hover:bg-neutral-100 flex items-center justify-center">×</button>
                      </div>
                      <div className="prose prose-sm max-w-none text-neutral-800" dangerouslySetInnerHTML={{__html: renderMarkdown(openSummary==='achievements'? achBody : openSummary==='flags'? flagsBody : trendsBody)}} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.section>)}
        </AnimatePresence>

        <AnimatePresence>{!searchEngaged && (
          <motion.section key="projects" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20,transition:{duration:0.35,ease:[0.4,0.16,0.2,1]}}}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-neutral-800">Latest Relais <span className="text-neutral-400 font-normal">({filteredProjects.length})</span></h2></div>
            <motion.div layout variants={listStagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="list">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((update,i)=>(<RelaiCard key={update.project} relai={update} index={i} onClick={()=>setSelectedProject(update.project)} onFilter={(t,v)=>{ setActiveFilter({type:t,value:v}); if(t==='program'){setSelectedProgram(v); setSelectedObjective('');} else if(t==='objective'){setSelectedObjective(String(v)); setSelectedProgram('');}}} />))}
                {filteredProjects.length===0 && (<motion.div key="empty" variants={variants.fadeInUp} initial="hidden" animate="visible" exit="exit" className="col-span-3 py-12 text-center text-neutral-500 bg-white rounded-lg shadow-sm border border-neutral-200"><p className="text-lg font-medium">No Relais match your filters</p><p className="text-sm">Try adjusting your search criteria</p><button onClick={()=>{ setSearch(''); setProject(''); setStatusColor(''); setOwner(''); }} className="mt-4 px-4 py-2 text-sm font-medium text-accent hover:underline">Clear all filters</button></motion.div>)}
              </AnimatePresence>
            </motion.div>
          </motion.section>)}</AnimatePresence>
      </main>
      <footer className="bg-white border-t border-neutral-200 py-4 mt-4"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center text-sm text-neutral-500"><p>Relai Station • {new Date().getFullYear()} • Powered by AI-driven insights</p></div></div></footer>
    </div>
  );
}

export default App;
