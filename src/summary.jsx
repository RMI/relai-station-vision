import React from 'react';
import { hardcodedInsights } from './updatesData';

// Use hardcoded insights instead of generating on the fly
export function getEmergingThemes(updates) {
  // Use hardcoded insights instead of dynamically generating them
  const themes = hardcodedInsights.insights;

  return (
    <ul className="list-disc pl-5 text-gray-800 text-sm">
      {themes.map((theme, i) => <li key={i}>{theme}</li>)}
      {themes.length === 0 && <li>No significant themes detected in recent updates.</li>}
    </ul>
  );
}

export function getRelatedWork(updates) {
  // Use hardcoded sector information instead of dynamically generating
  const clusters = hardcodedInsights.sectorProjects.map(sector => ({
    topic: sector.sector,
    projects: sector.projects.map(project => project) // List projects without author
  }));
  
  return (
    <ul className="list-disc pl-5 text-gray-800 text-sm">
      {clusters.map((cluster, i) => (
        <li key={i}>
          <span className="font-semibold">{cluster.topic}:</span> {cluster.projects.join(', ')}
        </li>
      ))}
      {clusters.length === 0 && <li>No significant clusters of related work detected.</li>}
    </ul>
  );
}

// World-class chief of staff executive summary that analyzes actual update content
function getBusinessLeaderSummary(mostRecentUpdates, colorCounts, newlyGreen, newlyRed) {
  // Current date formatted elegantly
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // Get all the analysis from the existing function
  const {
    metrics,
    sectors,
    topBlockers,
    keyAchievements,
    sectorProjects,
    avgCompletionRate,
    insights,
    strategicRecommendation
  } = analyzeUpdates(mostRecentUpdates);
  
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      {/* Executive header with gradient - FIXED with proper colors and text */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-4 flex justify-between items-center">
        <h3 className="font-bold text-white text-xl">Relai Station Summary</h3>
        <div className="text-white text-sm font-medium">
          {currentDate}
        </div>
      </div>
      
      {/* Main summary content */}
      <div className="p-5 bg-white">
        {/* High-level strategic insights - FIXED heading */}
        <div className="mb-5">
          <h4 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">Relai Insights</h4>
          
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-2">
              Analysis of {mostRecentUpdates.length} active projects across {Object.values(sectors).filter(arr => arr.length > 0).length} sectors reveals several key patterns:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              {insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Two-column layout for achievements and blockers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Key achievements */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Top Achievements</h4>
            <div className="space-y-2">
              {keyAchievements.length > 0 ? keyAchievements.map((item, i) => (
                <div key={i} className="bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="font-medium text-green-800 text-sm">{item.project}</div>
                  <div className="text-sm text-gray-700">{item.achievement}</div>
                </div>
              )) : (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  No significant achievements to report this period.
                </div>
              )}
            </div>
          </div>
          
          {/* Critical blockers */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Critical Blockers</h4>
            <div className="space-y-2">
              {topBlockers.length > 0 ? topBlockers.map((item, i) => (
                <div key={i} className={`p-3 rounded-md border ${item.severity === 'red' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <div className={`font-medium text-sm ${item.severity === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>{item.project}</div>
                  <div className="text-sm text-gray-700">{item.blocker}</div>
                </div>
              )) : (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  No significant blockers reported this period.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Portfolio health snapshot (simplified) */}
        <div className="mb-5">
          <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Sector Performance</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sectorProjects.map((sector, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium capitalize">{sector.sector}</div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${(sector.greenCount / sector.count) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-xs ml-2">{sector.greenCount}/{sector.count}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((sector.greenCount / sector.count) * 100)}% on track
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Strategic recommendation */}
        <div className="mt-5 border-t pt-4">
          <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Strategic Recommendation</h4>
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong> {strategicRecommendation}
            </p>
          </div>
          
          {newlyRed.length > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">
                <strong>Urgent Action:</strong> Schedule intervention for {newlyRed.length} project{newlyRed.length > 1 ? 's' : ''} that recently moved to critical status: <span className="font-medium">{newlyRed.join(', ')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to analyze the updates (extracted from the original getBusinessLeaderSummary)
function analyzeUpdates(mostRecentUpdates) {
  // 1. Extract key metrics from updates
  const metrics = {
    emissions: { count: 0, total: 0, projects: [] },
    energy: { count: 0, total: 0, projects: [] },
    cost: { count: 0, total: 0, projects: [] },
    people: { count: 0, total: 0, projects: [] },
    completion: { count: 0, total: 0, projects: [] },
  };
  
  // 2. Categorize projects by sector/focus area
  const sectors = {
    energy: [],
    transportation: [],
    buildings: [],
    industry: [],
    agriculture: [],
    waste: [],
    finance: [],
    policy: [],
    other: []
  };
  
  // 3. Extract top blockers and achievements
  let topBlockers = [];
  let keyAchievements = [];
  
  // Analyze updates
  mostRecentUpdates.forEach(update => {
    // Sector classification
    const project = update.project.toLowerCase();
    if (project.includes('energy') || project.includes('grid') || project.includes('renewable') || project.includes('hydrogen')) {
      sectors.energy.push(update.project);
    } else if (project.includes('mobility') || project.includes('transport') || project.includes('shipping') || project.includes('aviation')) {
      sectors.transportation.push(update.project);
    } else if (project.includes('building') || project.includes('cities')) {
      sectors.buildings.push(update.project);
    } else if (project.includes('industry') || project.includes('cement') || project.includes('industrial')) {
      sectors.industry.push(update.project);
    } else if (project.includes('agriculture') || project.includes('food')) {
      sectors.agriculture.push(update.project);
    } else if (project.includes('waste') || project.includes('circular')) {
      sectors.waste.push(update.project);
    } else if (project.includes('finance') || project.includes('market') || project.includes('carbon')) {
      sectors.finance.push(update.project);
    } else if (project.includes('policy') || project.includes('transition')) {
      sectors.policy.push(update.project);
    } else {
      sectors.other.push(update.project);
    }
    
    // Extract metrics from developments
    const devText = update.key_developments_and_decisions.toLowerCase();
    if (devText.match(/(\d+)(?:\.\d+)?(?:k|m)?\s*tons?\s*(?:co2|carbon|emissions|ghg)/i)) {
      const match = devText.match(/(\d+(?:\.\d+)?)(?:k|m)?\s*tons?\s*(?:co2|carbon|emissions|ghg)/i);
      if (match) {
        let value = parseFloat(match[1]);
        if (match[0].includes('k')) value *= 1000;
        if (match[0].includes('m')) value *= 1000000;
        metrics.emissions.count++;
        metrics.emissions.total += value;
        metrics.emissions.projects.push(update.project);
      }
    }
    
    if (devText.match(/(\d+)(?:\.\d+)?(?:k|m)?\s*(?:kwh|mwh|gwh|mw|gw|megawatt|gigawatt)/i)) {
      const match = devText.match(/(\d+(?:\.\d+)?)(?:k|m)?\s*(?:kwh|mwh|gwh|mw|gw|megawatt|gigawatt)/i);
      if (match) {
        let value = parseFloat(match[1]);
        if (match[0].includes('k')) value *= 1;
        if (match[0].includes('m')) value *= 1000;
        if (match[0].includes('g')) value *= 1000000;
        metrics.energy.count++;
        metrics.energy.total += value;
        metrics.energy.projects.push(update.project);
      }
    }
    
    if (devText.match(/\$(\d+(?:\.\d+)?)(?:k|m|b)?/i)) {
      const match = devText.match(/\$(\d+(?:\.\d+)?)(?:k|m|b)?/i);
      if (match) {
        let value = parseFloat(match[1]);
        if (match[0].includes('k')) value *= 1000;
        if (match[0].includes('m')) value *= 1000000;
        if (match[0].includes('b')) value *= 1000000000;
        metrics.cost.count++;
        metrics.cost.total += value;
        metrics.cost.projects.push(update.project);
      }
    }
    
    if (devText.match(/(\d+)\s*(?:people|households|residents|communities|farmers|workers|jobs|positions)/i)) {
      const match = devText.match(/(\d+)\s*(?:people|households|residents|communities|farmers|workers|jobs|positions)/i);
      if (match) {
        metrics.people.count++;
        metrics.people.total += parseInt(match[1]);
        metrics.people.projects.push(update.project);
      }
    }
    
    if (devText.match(/(\d+)(?:%|\s*percent)/i)) {
      const match = devText.match(/(\d+)(?:%|\s*percent)/i);
      if (match) {
        metrics.completion.count++;
        metrics.completion.total += parseInt(match[1]);
        metrics.completion.projects.push(update.project);
      }
    }
    
    // Extract blockers (focus on high priority ones)
    if (update.status_color === 'red' || update.status_color === 'yellow') {
      const blockerText = update.key_blockers_and_concerns;
      if (blockerText.length > 20) {
        topBlockers.push({
          project: update.project,
          blocker: blockerText.split('.')[0] + '.',
          severity: update.status_color
        });
      }
    }
    
    // Extract achievements
    if (update.status_color === 'green') {
      const achievementText = update.key_developments_and_decisions;
      if (achievementText.match(/completed|launched|secured|expanded|increased|reduced|received|established|implemented|achieved/i)) {
        keyAchievements.push({
          project: update.project,
          achievement: achievementText.split('.')[0] + '.'
        });
      }
    }
  });
  
  // Sort blockers by severity
  topBlockers.sort((a, b) => a.severity === 'red' && b.severity !== 'red' ? -1 : 1);
  topBlockers = topBlockers.slice(0, 3);  // Top 3 blockers
  
  // Sort achievements by significance (basic proxy: text length)
  keyAchievements.sort((a, b) => b.achievement.length - a.achievement.length);
  keyAchievements = keyAchievements.slice(0, 3);  // Top 3 achievements
  
  // Calculate the largest sectors
  const sectorCounts = Object.entries(sectors)
    .map(([key, projects]) => ({ sector: key, count: projects.length }))
    .sort((a, b) => b.count - a.count);
  
  const topSectors = sectorCounts.slice(0, 3);
  const sectorProjects = topSectors.map(s => ({ 
    sector: s.sector, 
    count: s.count,
    greenCount: sectors[s.sector].filter(p => 
      mostRecentUpdates.find(u => u.project === p && u.status_color === 'green')
    ).length
  }));
  
  // Generate strategic insights based on all the analysis
  const avgCompletionRate = metrics.completion.count > 0 ? 
    Math.round(metrics.completion.total / metrics.completion.count) : 0;
  
  // 4. Formulate strategic insights
  const insights = [];
  
  if (metrics.emissions.count >= 2) {
    insights.push(`Carbon reduction efforts showing results with ${Math.round(metrics.emissions.total).toLocaleString()} tons CO2e avoided across ${metrics.emissions.count} projects.`);
  }
  
  if (metrics.energy.count >= 2) {
    insights.push(`Energy projects scaling with ${Math.round(metrics.energy.total).toLocaleString()} MW capacity now deployed or in development.`);
  }
  
  if (metrics.people.count >= 2) {
    insights.push(`Community impact growing with ${metrics.people.total.toLocaleString()} people directly benefiting from our initiatives.`);
  }
  
  if (avgCompletionRate > 0) {
    insights.push(`Average completion rate of ${avgCompletionRate}% across tracked projects, ${avgCompletionRate > 70 ? 'exceeding' : 'approaching'} quarterly targets.`);
  }
  
  // Generate sector-specific insight
  if (topSectors.length > 0) {
    const topSector = topSectors[0];
    const sectorHealth = sectorProjects[0].greenCount / sectorProjects[0].count >= 0.7 ? 
      'strong performance' : 'mixed results';
    insights.push(`${topSector.sector.charAt(0).toUpperCase() + topSector.sector.slice(1)} represents our largest sector (${topSector.count} projects) with ${sectorHealth}.`);
  }
  
  // Strategic recommendation based on all data
  let strategicRecommendation = '';
  
  if (topBlockers.length >= 2 && topBlockers.filter(b => b.severity === 'red').length >= 1) {
    strategicRecommendation = 'Focus on resolving critical resource and regulatory blockers that are affecting multiple projects.';
  } else if (keyAchievements.length >= 2) {
    strategicRecommendation = 'Capitalize on recent successes by accelerating similar approaches across related projects.';
  } else if (metrics.cost.count > 0) {
    strategicRecommendation = 'Continue to focus on financial sustainability and scaling proven models.';
  } else {
    strategicRecommendation = 'Maintain balanced focus on execution excellence while addressing emerging risks.';
  }
  
  return {
    metrics,
    sectors,
    topBlockers,
    keyAchievements,
    sectorProjects,
    avgCompletionRate,
    insights,
    strategicRecommendation
  };
}

export function getSummary(updates) {
  // Use hardcoded summary data instead of dynamically generating
  const summary = hardcodedInsights.projectSummary;
  
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-primary-700">{summary.projectsWithUpdates}</div>
          <div className="text-sm text-neutral-600">Active Projects</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-primary-700">{summary.totalUpdates}</div>
          <div className="text-sm text-neutral-600">Total Updates</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-primary-700">{summary.teamMembers}</div>
          <div className="text-sm text-neutral-600">Team Members</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold text-green-700">Green</span>
            <span className="text-xs font-semibold text-green-700">{summary.statusCounts.green}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(summary.statusCounts.green / (summary.statusCounts.green + summary.statusCounts.yellow + summary.statusCounts.red)) * 100}%` }}></div>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold text-amber-600">Yellow</span>
            <span className="text-xs font-semibold text-amber-600">{summary.statusCounts.yellow}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(summary.statusCounts.yellow / (summary.statusCounts.green + summary.statusCounts.yellow + summary.statusCounts.red)) * 100}%` }}></div>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-semibold text-rose-600">Red</span>
            <span className="text-xs font-semibold text-rose-600">{summary.statusCounts.red}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5">
            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(summary.statusCounts.red / (summary.statusCounts.green + summary.statusCounts.yellow + summary.statusCounts.red)) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-neutral-700">{summary.statusSummary}</div>
    </div>
  );
}

// New function with corrected header
function getBusinessLeaderSummaryWithFixedHeading(mostRecentUpdates, colorCounts, newlyGreen, newlyRed) {
  // Current date formatted elegantly
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // Get all the analysis from the existing function
  const {
    metrics,
    sectors,
    topBlockers,
    keyAchievements,
    sectorProjects,
    avgCompletionRate,
    insights,
    strategicRecommendation
  } = analyzeUpdates(mostRecentUpdates);
  
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      {/* Executive header with gradient - FIXED with proper colors and text */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-4 flex justify-between items-center">
        <h3 className="font-bold text-white text-xl">Relai Station Summary</h3>
        <div className="text-white text-sm font-medium">
          {currentDate}
        </div>
      </div>
      
      {/* Main summary content */}
      <div className="p-5 bg-white">
        {/* High-level strategic insights - FIXED heading */}
        <div className="mb-5">
          <h4 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">Relai Insights</h4>
          
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-2">
              Analysis of {mostRecentUpdates.length} active projects across {Object.values(sectors).filter(arr => arr.length > 0).length} sectors reveals several key patterns:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              {insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Two-column layout for achievements and blockers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Key achievements */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Top Achievements</h4>
            <div className="space-y-2">
              {keyAchievements.length > 0 ? keyAchievements.map((item, i) => (
                <div key={i} className="bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="font-medium text-green-800 text-sm">{item.project}</div>
                  <div className="text-sm text-gray-700">{item.achievement}</div>
                </div>
              )) : (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  No significant achievements to report this period.
                </div>
              )}
            </div>
          </div>
          
          {/* Critical blockers */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Critical Blockers</h4>
            <div className="space-y-2">
              {topBlockers.length > 0 ? topBlockers.map((item, i) => (
                <div key={i} className={`p-3 rounded-md border ${item.severity === 'red' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <div className={`font-medium text-sm ${item.severity === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>{item.project}</div>
                  <div className="text-sm text-gray-700">{item.blocker}</div>
                </div>
              )) : (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  No significant blockers reported this period.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Portfolio health snapshot (simplified) */}
        <div className="mb-5">
          <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Sector Performance</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sectorProjects.map((sector, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium capitalize">{sector.sector}</div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${(sector.greenCount / sector.count) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-xs ml-2">{sector.greenCount}/{sector.count}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((sector.greenCount / sector.count) * 100)}% on track
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Strategic recommendation */}
        <div className="mt-5 border-t pt-4">
          <h4 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">Strategic Recommendation</h4>
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong> {strategicRecommendation}
            </p>
          </div>
          
          {newlyRed.length > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">
                <strong>Urgent Action:</strong> Schedule intervention for {newlyRed.length} project{newlyRed.length > 1 ? 's' : ''} that recently moved to critical status: <span className="font-medium">{newlyRed.join(', ')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
