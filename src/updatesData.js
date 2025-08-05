
// 20 projects at RMI
const projects = [
  'Clean Energy Access', 'Urban Mobility', 'Circular Economy', 'Climate Finance', 'Building Efficiency',
  'Renewable Grids', 'Sustainable Agriculture', 'Industrial Decarbonization', 'Water Resilience', 'Carbon Markets',
  'Green Hydrogen', 'Zero-Emission Shipping', 'Sustainable Aviation', 'Plastic Waste Solutions', 'Nature-Based Solutions',
  'Energy Storage', 'Smart Cities', 'Low-Carbon Cement', 'Food Waste Reduction', 'Just Transition'
];

const authors = [
  'Alex Kim', 'Jordan Lee', 'Morgan Patel', 'Taylor Smith', 'Casey Chen',
  'Riley Johnson', 'Jamie Garcia', 'Drew Evans', 'Avery Brown', 'Skyler Davis'
];

const statuses = ['On Track', 'At Risk', 'Delayed'];
const today = new Date();
const weeksAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n * 7);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};



const sampleDevLong = [
  "The project team has completed a major milestone by integrating a new data analytics platform, which will enable more robust tracking of project KPIs. Stakeholder engagement sessions were held with local partners to align on the next phase of implementation. Additionally, a new partnership was formalized with a regional NGO to support community outreach and training.",
  "A successful pilot of the digital platform for data sharing was launched, resulting in improved collaboration between project partners. The team also finalized the roadmap for the next quarter, focusing on scaling up renewable installations and enhancing monitoring and evaluation processes.",
  "Key actions this period included publishing new research findings on supply chain transparency and adopting circular design principles in project planning. The team expanded with two new hires specializing in policy advocacy and climate risk modeling.",
  "The project is transitioning to restricted data storage due to the expiration of data contracts with partners. Key actions include moving resources to a secure group and revoking permissions for the original team. A limited access period for sensitive documents has been agreed upon, pending formalization of new IP terms.",
  "A youth engagement initiative was launched, bringing together students and early-career professionals to participate in climate solution workshops. The team also advanced the integration of AI for predictive analytics in project operations.",
  "The project team held a successful community workshop, gathering feedback on the new technology deployment. Efforts were made to strengthen policy advocacy and improve the project's visibility through targeted media outreach.",
  "A cross-sectoral working group was formed to address complex regulatory challenges and share best practices. The team also piloted a new impact metrics framework to better capture project outcomes.",
  "The project secured new funding for a pilot phase focused on nature-based solutions. Collaboration with international partners was deepened, and a new monitoring protocol was established for biodiversity impacts.",
  "A major development was the adoption of a new supply chain management system, which is expected to reduce costs and improve efficiency. The team also completed baseline data collection for the expanded project scope.",
  "The project received positive media coverage following the release of a new report on sustainable finance. The team is now preparing for the next round of stakeholder consultations and regulatory reviews."
];

const sampleConcernsLong = [
  "There are ongoing concerns about compliance with new data access restrictions, as the team will lose access to certain datasets without updated licenses. Uncertainty remains regarding the final terms of access for key project documents, and there is a risk that some resources may need to be moved to private repositories, limiting visibility.",
  "Budget constraints for the upcoming quarter may impact the ability to scale up operations as planned. The team is also facing challenges in recruiting technical experts for the new analytics platform.",
  "Stakeholder alignment continues to be a challenge, particularly with new partners joining the project. There are also concerns about the slow adoption of new practices among some team members.",
  "The project is experiencing delays due to supply chain disruptions and limited data availability. Weather-related disruptions have also affected fieldwork, and there is a need for additional technical expertise to address emerging issues.",
  "There is uncertainty about the regulatory environment, with several new policies under review that could affect project implementation. The team is also monitoring potential resource allocation conflicts among partners.",
  "Data privacy concerns have been raised following the integration of new digital tools. The team is working to address these issues through updated protocols and stakeholder communication.",
  "The project is at risk of exceeding its budget due to unexpected costs and competing priorities. There is also a need for better impact metrics to demonstrate progress to funders.",
  "Limited access to finance is constraining the ability to expand project activities. The team is exploring new funding opportunities but faces a complex regulatory landscape.",
  "Insufficient stakeholder buy-in is slowing the adoption of new technologies. The team is planning additional engagement sessions to address these concerns.",
  "The project is facing challenges in maintaining momentum due to staff turnover and the need for ongoing training. Efforts are underway to recruit and onboard new team members."
];

const sampleStatusLong = [
  "The project is currently on track, with key milestones achieved and positive feedback from stakeholders. Continued focus on risk management and stakeholder engagement will be essential for maintaining progress.",
  "The project is at risk due to compliance issues and the need for clear agreements with partners regarding data access. While there are positive developments in terms of new partnerships, the lack of clarity on certain terms may impact progress.",
  "The project is delayed as a result of supply chain disruptions and resource constraints. The team is working to address these issues and has developed a mitigation plan to get back on schedule."
];




const updatesData = [];
const weekOffsets = [8, 6, 4, 2, 0]; // 8, 6, 4, 2 weeks ago, today

// Generate meaningful synthetic updates tailored to each project type
function generateMeaningfulDevelopments(project, weekIndex) {
  const developments = {
    'Clean Energy Access': [
      `Completed installation of microgrids in 5 rural communities, increasing energy access for 1,200 households. Community feedback sessions revealed 89% satisfaction with reliability.`,
      `Secured $3.2M in additional funding for Phase 2 expansion to 8 more communities. Partner agreements finalized with 3 local installation contractors.`,
      `Energy storage capacity increased by 35% across pilot sites through battery system upgrades. Data shows 28% reduction in outages during peak demand periods.`,
      `Regulatory approval received for renewable tariff structure in target region. Cost analysis shows 22% reduction in energy costs for end users compared to previous solutions.`,
      `Completed training program for 37 local technicians who are now certified to maintain solar installations independently. Local maintenance capacity increased by 150%.`
    ],
    'Urban Mobility': [
      `E-mobility pilot launched with 50 electric buses now operational across 3 major routes, reducing emissions by an estimated 720 tons CO2e annually.`,
      `Mobility data platform integration complete, now tracking 85% of public transit fleet in real-time. User adoption of transit app increased 43% month-over-month.`,
      `Completed traffic signal optimization at 27 key intersections, reducing average commute times by 12.5% in pilot corridor during peak hours.`,
      `Bike share program expanded with 15 new stations and 200 additional bikes. Ridership increased 37% compared to previous quarter.`,
      `Pedestrian infrastructure improvements completed in downtown district with 8 enhanced crossings and 3.2 miles of widened sidewalks. Pedestrian counts up 28%.`
    ],
    'Circular Economy': [
      `Waste recovery program now operational in 5 municipalities with 72% material recovery rate, exceeding target by 12 percentage points.`,
      `Product redesign collaborations established with 7 manufacturers, projected to reduce packaging waste by 380 tons annually once implemented.`,
      `Digital materials marketplace launched with 42 active business participants. Platform has facilitated exchange of 156 tons of materials in first month.`,
      `Material flow analysis completed for 3 major industrial sectors, identifying 5 high-potential circular interventions with estimated $4.7M annual value.`,
      `Repair café network expanded to 12 locations with 98 volunteer repair experts. Program prevented an estimated 1,800 items from entering landfill this quarter.`
    ]
  };
  
  // For projects not specifically listed, generate by category
  const projectCategories = {
    'Climate Finance': 'finance',
    'Building Efficiency': 'buildings',
    'Renewable Grids': 'energy',
    'Sustainable Agriculture': 'agriculture',
    'Industrial Decarbonization': 'industry',
    'Water Resilience': 'water',
    'Carbon Markets': 'finance',
    'Green Hydrogen': 'energy',
    'Zero-Emission Shipping': 'transportation',
    'Sustainable Aviation': 'transportation',
    'Plastic Waste Solutions': 'waste',
    'Nature-Based Solutions': 'environment',
    'Energy Storage': 'energy',
    'Smart Cities': 'urban',
    'Low-Carbon Cement': 'industry',
    'Food Waste Reduction': 'waste',
    'Just Transition': 'policy'
  };
  
  const categoryDevelopments = {
    'finance': [
      `Secured commitments from 8 institutional investors representing $2.7B in assets under management to align portfolios with 1.5°C pathway.`,
      `Completed financial risk modeling for 3 major investment portfolios, identifying $580M in climate-exposed assets requiring transition strategies.`,
      `Green bond framework developed and verified by independent auditor. Initial offering of $120M fully subscribed with 15% premium over conventional bonds.`,
      `Climate risk disclosure methodology adopted by 5 major regional banks. Implementation workshops completed with 37 financial analysts.`,
      `Insurance product for climate resilience technologies launched with 3 carrier partners. Early adoption by 28 projects in high-risk zones.`
    ],
    'buildings': [
      `Energy efficiency retrofits completed in 12 commercial buildings, reducing energy consumption by average of 34% and saving $287,000 in annual operating costs.`,
      `Building code analysis completed for 5 municipalities with recommendations submitted to planning departments. Two jurisdictions advancing to formal review.`,
      `Smart building technology pilot expanded to 8 sites with comprehensive monitoring now covering 1.2M sq ft of commercial space.`,
      `Net-zero design certification program launched with 16 architecture firms completing training. Three demonstration projects now under construction.`,
      `Heat pump transition program launched with installation partners in 3 states. Contractor capacity increased by 65% through technical training program.`
    ],
    'energy': [
      `Microgrid control systems upgraded across 7 sites, enabling 23% increase in renewable energy utilization during peak demand periods.`,
      `Completed grid flexibility assessment identifying 780MW of demand response potential across 3 utility territories.`,
      `Advanced battery storage project site preparation complete with 45MWh of capacity scheduled for installation next quarter.`,
      `Interconnection study completed for 5 renewable project sites with combined 340MW capacity. Two projects received expedited approval.`,
      `Virtual power plant software integration complete with 1,840 distributed resources now participating in grid balancing operations.`
    ],
    'agriculture': [
      `Regenerative agriculture practices implemented across 8,700 acres with soil carbon baseline measurement complete. Early data shows 12% increase in soil organic matter.`,
      `Precision irrigation systems installed on 1,200 acres, reducing water usage by 27% while maintaining crop yields.`,
      `Climate-smart agriculture training completed for 87 extension agents who will support implementation across 3 agricultural regions.`,
      `Supply chain emissions assessment completed for 4 major agricultural commodities, identifying 430,000 tons CO2e reduction potential.`,
      `Low-carbon fertilizer trials showing 18% yield increase with 32% less emissions across 15 test plots compared to conventional approaches.`
    ],
    'industry': [
      `Energy efficiency audit program completed across 7 manufacturing facilities, identifying 18.5% average energy reduction potential with 3.2 year payback.`,
      `Heat recovery system design complete for major industrial processor with projected annual savings of 12,800 MWh and $1.4M.`,
      `Low-carbon production certification program launched with 5 industry partners representing 23% of sector production capacity.`,
      `Electrification roadmap completed for 3 industrial processes with technical validation of conversion feasibility and 42% emissions reduction potential.`,
      `Industrial symbiosis program facilitated 7 new material exchange partnerships, diverting 5,800 tons from waste streams into productive use.`
    ],
    'water': [
      `Water conservation program implemented across 5 water districts, reducing consumption by 840,000 gallons daily through infrastructure improvements.`,
      `Climate vulnerability assessment completed for 3 watershed systems, identifying 27 priority resilience projects for municipal planning.`,
      `Stormwater management retrofits completed at 12 urban sites, increasing retention capacity by 560,000 gallons during peak events.`,
      `Water quality monitoring network expanded with 23 new sensor installations, now providing real-time data across 85% of the target watershed.`,
      `Drought-resistant landscaping program completed 47 commercial property conversions, reducing irrigation needs by 65% across 28 acres.`
    ],
    'transportation': [
      `Fleet electrification roadmap completed for 3 logistics companies with implementation plan for 780 vehicles over next 36 months.`,
      `Zero-emission freight corridor planning complete with 5 charging/fueling hubs identified and preliminary engineering designs approved.`,
      `Modal shift program increased public transit ridership by 18% along 3 key corridors through service improvements and incentive programs.`,
      `Sustainable aviation fuel supply chain analysis identified 3 viable production pathways with potential to meet 35% of regional jet fuel demand.`,
      `Last-mile delivery optimization program reduced urban delivery emissions by 27% across pilot zone while improving delivery times by 12%.`
    ],
    'waste': [
      `Organic waste diversion program now capturing 72% of commercial food waste in target region with methane emissions reduction of 18,500 tons CO2e annually.`,
      `Materials recovery facility upgrade completed, increasing sorting efficiency by 35% and reducing contamination in recyclable streams by 28%.`,
      `Extended producer responsibility framework developed with 17 industry partners now covering 35% of packaging materials in regional market.`,
      `Construction waste management program diverted 87% of materials from 23 project sites, exceeding target by 12 percentage points.`,
      `Chemical recycling pilot for hard-to-recycle plastics processing 5.8 tons daily with 83% recovery rate for polymer feedstocks.`
    ],
    'environment': [
      `Reforestation initiative completed planting of 280,000 native trees across 620 acres of degraded land with 92% survival rate after first growing season.`,
      `Biodiversity monitoring program documented 18% increase in indicator species across restored habitat areas compared to baseline assessment.`,
      `Coastal resilience projects completed in 3 vulnerable communities, protecting 8.5 miles of shoreline and 1,200 properties from storm surge.`,
      `Carbon sequestration measurement protocol validated across 15 test sites with verified accuracy of 93% compared to laboratory analysis.`,
      `Ecosystem services valuation completed for regional watershed, documenting $27M in annual economic benefits from nature-based solutions.`
    ],
    'urban': [
      `Smart city data platform now integrating 12 municipal systems with real-time visualization dashboard for planning and emergency response.`,
      `Urban heat island mitigation measures implemented across 15 blocks, reducing average summer temperatures by 3.2°F in target areas.`,
      `Connected infrastructure project completed with 87 smart intersections now optimizing traffic flow and prioritizing public transit.`,
      `Community resilience hubs established in 5 neighborhoods with solar+storage backup power and emergency services capacity for 12,000 residents.`,
      `Urban agriculture program expanded with 14 new community gardens producing 28,000 pounds of fresh produce annually in former food deserts.`
    ],
    'policy': [
      `Policy analysis completed on proposed clean energy standard with economic impact assessment showing net positive job creation of 3,800 positions.`,
      `Stakeholder engagement process completed with 27 community organizations representing environmental justice concerns in transition planning.`,
      `Regulatory reform recommendations submitted to 3 state agencies with implementation roadmap for streamlining clean energy permitting.`,
      `Economic transition planning completed for 2 fossil fuel-dependent communities with diversification strategies for 1,200 affected workers.`,
      `Climate policy toolkit developed and adopted by 8 municipal governments, with implementation underway for 65% of recommended actions.`
    ]
  };
  
  let projectType = project;
  if (!developments[project]) {
    const category = projectCategories[project] || 'policy'; // Default to policy if unknown
    projectType = category;
    return categoryDevelopments[category][weekIndex % categoryDevelopments[category].length];
  }
  
  return developments[project][weekIndex % developments[project].length];
}

function generateMeaningfulBlockers(project, weekIndex, color) {
  // Blockers should align with the status color
  const severityLevel = color === 'green' ? 'low' : color === 'yellow' ? 'medium' : 'high';
  
  const blockers = {
    'low': [
      `Minor supply chain delays affecting non-critical components, mitigation plan in place with 2-week buffer in schedule.`,
      `Recruitment for specialized roles taking longer than anticipated, but core team capacity remains sufficient for current phase.`,
      `Stakeholder feedback requiring minor design adjustments. Additional workshop scheduled to finalize approach.`,
      `Weather delays impacted field work by 3 days, but contingency scheduling will maintain overall timeline.`,
      `Budget reallocation needed for emerging priorities, but total project spending remains within 5% of plan.`
    ],
    'medium': [
      `Regulatory approval delayed by approximately 6 weeks, impacting project phase transition. Escalation with agency underway.`,
      `Technical integration issues between legacy systems and new platform requiring additional development cycles.`,
      `Stakeholder consensus not reached on key design parameters. Mediation process initiated with completion expected in 4 weeks.`,
      `Two key team members departing, creating knowledge gap in critical technical area. Recruitment accelerated with interim consulting support.`,
      `Cost increases of 18% in key materials affecting budget projections. Seeking alternative suppliers and considering design modifications.`
    ],
    'high': [
      `Critical permit approval rejected due to environmental impact concerns. Major redesign required with minimum 3-month delay.`,
      `Funding shortfall of 28% identified for next implementation phase. Urgent discussions with investors and potential for scope reduction.`,
      `Key technology partner experiencing significant delivery failures with no immediate alternative suppliers identified.`,
      `Major stakeholder opposition emerged, halting community approval process. Political intervention likely needed to resolve impasse.`,
      `Severe weather event damaged pilot installation, requiring substantial repairs and validation of system resilience before proceeding.`
    ]
  };
  
  // Add project-specific context to the generic blocker
  const baseBlocker = blockers[severityLevel][weekIndex % blockers[severityLevel].length];
  const projectContext = {
    'Clean Energy Access': `Rural deployment logistics and community adoption rates are additional considerations.`,
    'Urban Mobility': `City permitting processes and competing transit priorities remain factors to monitor.`,
    'Circular Economy': `Material quality standards and market development for recovered resources need attention.`,
    'Climate Finance': `Investor risk tolerance and policy certainty affect capital deployment timelines.`,
    'Building Efficiency': `Split incentive issues between building owners and tenants complicate implementation.`,
    'Renewable Grids': `Grid interconnection capacity and stability requirements impact deployment schedules.`,
    'Sustainable Agriculture': `Seasonal timing and farmer adoption cycles influence implementation windows.`,
    'Industrial Decarbonization': `Production continuity requirements and technology readiness levels affect transition speed.`
  };
  
  let additionalContext = projectContext[project] || '';
  if (!additionalContext) {
    // Generate context for other projects based on their name
    if (project.includes('Water')) additionalContext = `Water rights and drought conditions add complexity to implementation plans.`;
    else if (project.includes('Carbon')) additionalContext = `Carbon accounting methodology and verification processes require additional time.`;
    else if (project.includes('Energy')) additionalContext = `Energy market volatility and technology performance validation are ongoing considerations.`;
    else additionalContext = `Interdependencies with related initiatives and external policy developments require close monitoring.`;
  }
  
  return `${baseBlocker} ${additionalContext}`;
}

function getStatusForColor(color) {
  const greenStatuses = [
    'progressing well with strong momentum',
    'on track and exceeding expectations',
    'advancing smoothly with all objectives met',
    'showing excellent progress and high team morale',
    'meeting all milestones ahead of schedule'
  ];
  
  const yellowStatuses = [
    'experiencing moderate risk and needs attention',
    'slightly behind schedule but recoverable',
    'facing some challenges that require mitigation',
    'proceeding with caution due to emerging issues',
    'requiring additional resources to stay on track'
  ];
  
  const redStatuses = [
    'at risk due to significant blockers',
    'encountering critical delays that threaten deliverables',
    'facing major obstacles requiring immediate intervention',
    'significantly behind schedule with budget concerns',
    'stalled due to unresolved compliance issues'
  ];
  
  if (color === 'green') return greenStatuses[Math.floor(Math.random() * greenStatuses.length)];
  if (color === 'yellow') return yellowStatuses[Math.floor(Math.random() * yellowStatuses.length)];
  return redStatuses[Math.floor(Math.random() * redStatuses.length)];
}

projects.forEach((project, i) => {
  weekOffsets.forEach((weeks, j) => {
    // Ensure a mix of colors each week (distribute evenly across projects)
    const weekIndex = Math.floor(j / weekOffsets.length * projects.length);
    const status_color = ['green', 'yellow', 'red'][(i + weekIndex) % 3];
    
    // Generate meaningful, unique updates specific to each project
    const dev = generateMeaningfulDevelopments(project, (i + j) % 5);
    const blockers = generateMeaningfulBlockers(project, (i + j) % 5, status_color);
    const status = `Overall status: The project is ${getStatusForColor(status_color)}.`;
    updatesData.push({
      author: authors[(i + j) % authors.length],
      project, // Using consistent naming with App.jsx
      date: weeksAgo(weeks),
      key_developments_and_decisions: dev,
      key_blockers_and_concerns: blockers,
      overall_project_status: status,
      status_color,
    });
  });
});

export default updatesData;
