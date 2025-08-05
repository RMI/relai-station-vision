import React, { useState, useEffect } from 'react';
import updatesData from './updatesData';
import { getSummary, getEmergingThemes, getRelatedWork } from './summary.jsx';

// RelaiCard component for displaying the most recent update per project
const RelaiCard = ({ relai, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-card p-4 border-l-4 hover:shadow-lg transition-all cursor-pointer 
        ${relai.status_color === 'green' ? 'border-secondary-500' : 
          relai.status_color === 'yellow' ? 'border-amber-400' : 
          'border-rose-500'}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-semibold text-lg text-primary-700">{relai.project}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold 
            ${relai.status_color === 'green' ? 'bg-secondary-100 text-secondary-700' : 
              relai.status_color === 'yellow' ? 'bg-amber-100 text-amber-700' : 
              'bg-rose-100 text-rose-700'}`}>
            {relai.status_color.charAt(0).toUpperCase() + relai.status_color.slice(1)}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">{relai.date}</span>
        </div>
      </div>
      <div className="text-sm text-neutral-500 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        {relai.author}
      </div>
      <div className="mb-3">
        <p className="text-neutral-700 line-clamp-2 text-sm">{relai.key_developments_and_decisions}</p>
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center">
          View Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Detail modal component for showing project history
const RelaiDetailModal = ({ project, updates, onClose }) => {
  // Sort updates by date (newest first)
  const sortedUpdates = [...updates].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestUpdate = sortedUpdates[0];
  
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
                <div key={index} className="relative">
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
                    <p className="text-sm text-neutral-500 mb-3">By {update.author}</p>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Key Developments & Decisions</h4>
                      <p className="text-sm text-neutral-600">{update.key_developments_and_decisions}</p>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Key Blockers & Concerns</h4>
                      <p className="text-sm text-neutral-600">{update.key_blockers_and_concerns}</p>
                    </div>
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
  const [author, setAuthor] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [mostRecentByProject, setMostRecentByProject] = useState({});
  
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
  const allAuthors = Array.from(new Set(updatesData.map(u => u.author)));
  const allStatusColors = ['green', 'yellow', 'red'];
  
  // For the project detail modal
  const selectedProjectUpdates = selectedProject ? 
    updatesData.filter(u => u.project === selectedProject) : [];

  // Filter the most recent updates based on search criteria
  let filteredProjects = Object.values(mostRecentByProject).filter((u) => {
    return (
      (search === '' ||
        u.author.toLowerCase().includes(search.toLowerCase()) ||
        u.project.toLowerCase().includes(search.toLowerCase()) ||
        u.key_developments_and_decisions.toLowerCase().includes(search.toLowerCase()) ||
        u.key_blockers_and_concerns.toLowerCase().includes(search.toLowerCase()) ||
        u.overall_project_status.toLowerCase().includes(search.toLowerCase())) &&
      (project === '' || u.project === project) &&
      (author === '' || u.author === author) &&
      (statusColor === '' || u.status_color === statusColor)
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
          onClose={() => setSelectedProject(null)}
        />
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h1 className="text-2xl font-display font-bold text-primary-700">Relai Station</h1>
                <p className="text-sm text-neutral-500">Insights from project status updates</p>
              </div>
            </div>
            <div className="text-sm text-neutral-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary section */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold mb-4 text-neutral-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Portfolio Summary
          </h2>
          
          <div className="bg-white rounded-xl shadow-card mb-6">
            {getSummary(updatesData)}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4 text-primary-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Emerging Themes
              </h3>
              {getEmergingThemes(updatesData)}
            </div>
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4 text-primary-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Related Work
              </h3>
              {getRelatedWork(updatesData)}
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
                placeholder="Search projects, authors, updates..."
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
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white text-neutral-600"
              >
                <option value="">All Authors</option>
                {allAuthors.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          
          {/* Display most recent update per project as cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((update, i) => (
              <RelaiCard 
                key={i} 
                relai={update} 
                onClick={() => setSelectedProject(update.project)}
              />
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-3 py-12 text-center text-neutral-500 bg-white rounded-lg shadow-sm border border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No Relais match your filters</p>
                <p className="text-sm">Try adjusting your search criteria</p>
                <button 
                  onClick={() => { setSearch(''); setProject(''); setStatusColor(''); setAuthor(''); }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
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
