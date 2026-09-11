export const initialMetrics = {
  issuesReported: 1284,
  issuesResolved: 843,
  verifiedResolutionRate: "91%",
  peopleHelping: 237,
  criticalPending: 7,
  highPending: 16,
  needAttentionTotal: 23
};

export const initialActivities = [
  {
    id: "act-1",
    user: "Ananya Sharma",
    action: "supported",
    issueTitle: "Open pothole near university gate",
    time: "10 mins ago"
  },
  {
    id: "act-2",
    user: "Ramesh Kumar",
    action: "started work on",
    issueTitle: "Open pothole near university gate",
    time: "45 mins ago"
  },
  {
    id: "act-3",
    user: "Suresh Patil",
    action: "was assigned to",
    issueTitle: "Major water supply leakage on Green Park Rd",
    time: "2 hours ago"
  }
];

export const initialRewards = {
  civicImpactScore: 340,
  issuesHelped: 7,
  evidenceContributions: 4,
  verificationsCompleted: 3,
  volunteerActions: 2,
  badges: [
    { title: "COMMUNITY CONTRIBUTOR", level: "Gold", icon: "Award" },
    { title: "TOP VERIFIER", level: "Silver", icon: "CheckCircle" },
    { title: "LOCAL GUARDIAN", level: "Bronze", icon: "Shield" }
  ]
};
