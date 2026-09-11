export const initialIssues = [
  {
    id: "JAN-2026-1042",
    title: "Open pothole near university gate",
    description: "Large dangerous pothole on main thoroughfare near University Gate 2 creating severe safety risk for two-wheelers and cyclists.",
    category: "ROADS_INFRASTRUCTURE",
    department: "Roads & Infrastructure Department",
    severity: "High",
    priority: 91,
    priorityLevel: "HIGH",
    status: "IN_PROGRESS",
    location: {
      area: "University Road",
      landmark: "Gate 2 entrance",
      latitude: 28.5355,
      longitude: 77.3910
    },
    distanceText: "420m away",
    evidence: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
    ],
    reporter: {
      id: "user-001",
      name: "Ananya Sharma"
    },
    supporters: 17,
    volunteers: 3,
    assignedWorker: {
      id: "EMP-ROA-101",
      name: "Anil Kumar",
      role: "Road Maintenance Technician",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80",
      status: "On Site"
    },
    createdAt: "2026-08-22T08:30:00Z",
    updatedAt: "2026-08-22T14:15:00Z",
    timeline: [
      { status: "REPORTED", title: "Reported by Citizen", time: "Aug 22, 08:30 AM", description: "Report submitted with photo evidence." },
      { status: "VERIFIED", title: "AI Civic Intelligence Verified", time: "Aug 22, 08:31 AM", description: "Categorized under Roads & Infrastructure Department. Priority score 91 calculated." },
      { status: "ASSIGNED", title: "Assigned by Municipal Authority", time: "Aug 22, 10:15 AM", description: "Assigned to Road Technician Anil Kumar." },
      { status: "IN_PROGRESS", title: "Work Commenced", time: "Aug 22, 02:15 PM", description: "Field technician arrived on site laying cold-mix asphalt patch." }
    ],
    aiAnalysis: {
      category: "ROADS_INFRASTRUCTURE",
      department: "Roads & Infrastructure Department",
      severity: "High",
      priority: 91,
      duplicateRisk: "Low",
      reason: "High accident risk on high-footfall entrance road for two-wheelers."
    },
    resolutionProof: null
  },
  {
    id: "JAN-2026-1043",
    title: "Major water supply leakage on Green Park Rd",
    description: "Main supply pipeline burst wasting clean water and flooding pedestrian sidewalk. Urgent valve shutoff required.",
    category: "WATER_SUPPLY_SEWERAGE",
    department: "Water Supply & Sewerage Department",
    severity: "Critical",
    priority: 98,
    priorityLevel: "CRITICAL",
    status: "ASSIGNED",
    location: {
      area: "Green Park Main Rd",
      landmark: "Block B Market",
      latitude: 28.5401,
      longitude: 77.3850
    },
    distanceText: "850m away",
    evidence: [
      "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80"
    ],
    reporter: {
      id: "user-002",
      name: "Vikramaditya Roy"
    },
    supporters: 28,
    volunteers: 5,
    assignedWorker: {
      id: "EMP-WAT-101",
      name: "Suresh Verma",
      role: "Pipe & Hydraulics Lead",
      phone: "+91 98112 33445",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      status: "Dispatched"
    },
    createdAt: "2026-08-22T11:00:00Z",
    updatedAt: "2026-08-22T11:45:00Z",
    timeline: [
      { status: "REPORTED", title: "Reported by Citizen", time: "Aug 22, 11:00 AM", description: "High volume leak reported." },
      { status: "VERIFIED", title: "AI Civic Intelligence Verified", time: "Aug 22, 11:01 AM", description: "Auto-escalated to Critical priority. Duplicate check clear." },
      { status: "ASSIGNED", title: "Assigned by Municipal Authority", time: "Aug 22, 11:45 AM", description: "Dispatched Water Supply Rapid Response Unit." }
    ],
    aiAnalysis: {
      category: "WATER_SUPPLY_SEWERAGE",
      department: "Water Supply & Sewerage Department",
      severity: "Critical",
      priority: 98,
      duplicateRisk: "Low",
      reason: "High volume potable water loss and infrastructure erosion risk."
    },
    resolutionProof: null
  },
  {
    id: "JAN-2026-1044",
    title: "Broken streetlight array near Metro Pillar 140",
    description: "Continuous stretch of 4 streetlights non-functional creating dark zone for evening commuters.",
    category: "ELECTRICAL",
    department: "Electrical Department",
    severity: "Medium",
    priority: 68,
    priorityLevel: "MEDIUM",
    status: "REPORTED",
    location: {
      area: "Metro Pillar 140",
      landmark: "Blue Line Metro",
      latitude: 28.5300,
      longitude: 77.3990
    },
    distanceText: "1.2km away",
    evidence: [
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80"
    ],
    reporter: {
      id: "user-003",
      name: "Pooja Verma"
    },
    supporters: 8,
    volunteers: 1,
    assignedWorker: null,
    createdAt: "2026-08-22T15:20:00Z",
    updatedAt: "2026-08-22T15:20:00Z",
    timeline: [
      { status: "REPORTED", title: "Reported by Citizen", time: "Aug 22, 03:20 PM", description: "Submitted via mobile app." },
      { status: "VERIFIED", title: "AI Civic Intelligence Verified", time: "Aug 22, 03:21 PM", description: "Categorized as Electrical. Suggested Dept: Electrical Department." }
    ],
    aiAnalysis: {
      category: "ELECTRICAL",
      department: "Electrical Department",
      severity: "Medium",
      priority: 68,
      duplicateRisk: "Low",
      reason: "Public safety concern during evening hours."
    },
    resolutionProof: null
  },
  {
    id: "JAN-2026-1040",
    title: "Overflowing garbage dumpster near Community Center",
    description: "Waste overflow spilling onto pedestrian walk. Requires immediate clearance and sanitation spray.",
    category: "MUNICIPAL",
    department: "Municipal Department",
    severity: "High",
    priority: 86,
    priorityLevel: "HIGH",
    status: "CITIZEN_VERIFICATION",
    location: {
      area: "Community Center",
      landmark: "Sector 15 Park",
      latitude: 28.5380,
      longitude: 77.3940
    },
    distanceText: "600m away",
    evidence: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
    ],
    reporter: {
      id: "user-004",
      name: "Kavita Nair"
    },
    supporters: 34,
    volunteers: 6,
    assignedWorker: {
      id: "EMP-MUN-101",
      name: "Ramesh Singh",
      role: "Sanitation Lead",
      phone: "+91 99887 76655",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      status: "Task Completed"
    },
    createdAt: "2026-08-21T09:10:00Z",
    updatedAt: "2026-08-22T12:00:00Z",
    timeline: [
      { status: "REPORTED", title: "Reported by Citizen", time: "Aug 21, 09:10 AM", description: "Sanitation report filed." },
      { status: "VERIFIED", title: "Verified", time: "Aug 21, 09:15 AM", description: "High priority designated." },
      { status: "ASSIGNED", title: "Assigned", time: "Aug 21, 11:00 AM", description: "Municipal Unit assigned." },
      { status: "IN_PROGRESS", title: "Work Completed", time: "Aug 22, 10:30 AM", description: "Dumpster emptied and sanitized." },
      { status: "RESOLVED", title: "Marked Resolved by Worker", time: "Aug 22, 12:00 PM", description: "Worker uploaded completion proof photo." }
    ],
    aiAnalysis: {
      category: "MUNICIPAL",
      department: "Municipal Department",
      severity: "High",
      priority: 86,
      duplicateRisk: "Low",
      reason: "Health hazard and sanitation blockade."
    },
    resolutionProof: {
      beforeUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      afterUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
      timestamp: "2026-08-22T12:00:00Z",
      note: "Dumpster emptied, area sanitized and disinfected."
    }
  }
];
