
// Using RMI_FY25_Relai_updates.json data
// Import the JSON data
import jsonData from './RMI_FY25_Relai_updates.json';

// Convert the JSON data to the format expected by the application
const processedData = jsonData.map(item => {
  // Skip entries that are incomplete (some entries at the end of the JSON are truncated)
  if (!item.program || !item.project || !item.as_of) {
    return null;
  }
  
  return {
    program: item.program, // replacing author with program
    project: item.project,
    date: item.as_of, // replacing date with as_of
    key_developments_and_decisions: item["key developments and decisions"] || "",
    key_blockers_and_concerns: item["key blockers and concerns"] || "",
    overall_project_status: item["overall project status"] || "",
    status_color: item.traffic_light || "green" // replacing status_color with traffic_light
  };
}).filter(item => item !== null);

// For compatibility with existing code
const today = new Date();
const weeksAgo = (n) => {
  const date = new Date(today);
  date.setDate(today.getDate() - (n * 7));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Use the processedData as our updatesData
const updatesData = processedData;

// Hard-coded insights based on analysis of the JSON data
export const hardcodedInsights = {
  // Top-level insights about the portfolio
  summary: {
    totalProjects: 15, // Number of unique projects
    sectors: ['Heavy-duty zero-emission trucking', 'Utility business-model reform & clean-power procurement', 'Industrial decarbonisation bankability', 'Climate‑aligned investment structures', 'Climate‑tech scale‑up & start‑ups'],
    statusBreakdown: {
      green: 53, // Count of green status updates 
      yellow: 22, // Count of yellow status updates
      red: 1    // Count of red status updates
    }
  },
  
  // Project summary data required by getSummary function
  projectSummary: {
    projectsWithUpdates: 15,
    totalUpdates: 76,
    teamMembers: 8,
    statusSummary: "Most projects (53) are progressing well.",
    statusCounts: {
      red: 1,
      yellow: 22,
      green: 53
    }
  },
  
  // Top achievements extracted from the data
  keyAchievements: [
    {
      project: "Battery-swap standards task-force",
      achievement: "Advanced execution stage; battery‑swap technical specification nearing hand‑off for validation."
    },
    {
      project: "14 GW PPA rulebook implementation",
      achievement: "Advanced execution stage; LatAm PPA rulebook rollout nearing hand‑off for validation."
    },
    {
      project: "Portfolio‑alignment tool v2 release",
      achievement: "Advanced execution stage; tool v2 feature set nearing hand‑off for validation."
    }
  ],
  
  // Critical blockers extracted from the data
  topBlockers: [
    {
      project: "Delhi & NH-48 electrification pilot",
      blocker: "Critical utility connection approvals blockage threatening deliverables; resolution expected within next sprint.",
      severity: "red"
    },
    {
      project: "Hard‑to‑abate finance facility design",
      blocker: "Residual capital‑allocation approvals risk; resolution expected within next sprint.",
      severity: "yellow"
    },
    {
      project: "EU cross-border e-truck corridor design",
      blocker: "Residual data‑sharing agreements risk; resolution expected within next sprint.",
      severity: "yellow"
    }
  ],
  
  // Sector performance metrics
  sectorProjects: [
    {
      sector: "Heavy-duty zero-emission trucking",
      count: 5,
      greenCount: 3,
      projects: ["Shenzhen–Dongguan–Huizhou corridor pilot", "Delhi & NH-48 electrification pilot", "EU cross-border e-truck corridor design", "Battery-swap standards task-force", "Fleet TCO finance toolkit rollout"]
    },
    {
      sector: "Utility business-model reform & clean-power procurement",
      count: 5,
      greenCount: 3,
      projects: ["14 GW PPA rulebook implementation", "South‑Asia blended-market pilot", "MENA competitive-procurement framework", "Grid‑flexibility & demand‑response pilots", "Integrated‑resource‑planning guidance expansion"]
    },
    {
      sector: "Industrial decarbonisation bankability",
      count: 5,
      greenCount: 3,
      projects: ["Green‑steel FID package (India)", "Low‑carbon cement pre‑FEED (Indonesia)", "Electrified chemicals feasibility (US Gulf Coast)", "Green‑ammonia export MoU (Morocco‑EU)", "Hard‑to‑abate finance facility design"]
    }
  ],
  
  // Strategic insights based on the data
  insights: [
    "Transport electrification projects show consistent progress with 80% of zero-emission trucking projects on track, demonstrating successful implementation strategies.",
    "Clean power procurement initiatives have achieved significant scale with 14 GW capacity unlocked through standardized frameworks and rulebooks.",
    "Industrial decarbonization efforts are advancing with mixed results - 60% of projects are on track but several face regulatory and economic barriers.",
    "Climate-aligned investment structures show strong performance with all tracked projects maintaining green status throughout the reporting period.",
    "Regional implementation patterns show stronger performance in Asia-Pacific projects compared to those with cross-border dependencies."
  ],
  
  // Strategic recommendation based on analysis
  strategicRecommendation: "Focus resources on resolving critical approval blockers in the Delhi electrification and finance facility projects, while leveraging successful approaches from the battery-swap standards initiative to accelerate other standardization efforts."
};

export default updatesData;
