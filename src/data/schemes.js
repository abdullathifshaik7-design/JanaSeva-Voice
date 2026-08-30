export const SCHEME_CATEGORIES = [
  { id: "farmer", label: "Farmer", emoji: "🌾" },
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "senior", label: "Senior Citizen", emoji: "👵" },
  { id: "women", label: "Women", emoji: "👩" },
  { id: "jobseeker", label: "Job Seeker", emoji: "💼" },
  { id: "family", label: "Family", emoji: "🏠" },
];

export const DEMO_SCHEMES = {
  farmer: [
    {
      id: "pm-kisan-demo",
      name: "PM-KISAN (Demo Reference)",
      purpose: "Income support for eligible farmer families.",
      eligibility: "Small and marginal farmer families with cultivable land (demo criteria).",
      benefits: "Periodic financial assistance for agricultural households.",
      documents: ["Aadhaar", "Land records", "Bank account details"],
      lastUpdated: "Jan 2026",
    },
    {
      id: "crop-insurance-demo",
      name: "Crop Insurance Scheme (Demo)",
      purpose: "Protection against crop loss due to natural calamities.",
      eligibility: "Farmers growing notified crops in notified areas.",
      benefits: "Insurance coverage for crop damage (demo summary).",
      documents: ["Land records", "Sowing certificate", "Bank details"],
      lastUpdated: "Dec 2025",
    },
  ],
  student: [
    {
      id: "scholarship-demo",
      name: "Merit Scholarship (Demo)",
      purpose: "Financial support for eligible students pursuing higher education.",
      eligibility: "Students meeting academic and income criteria (demo).",
      benefits: "Tuition and maintenance allowance (illustrative).",
      documents: ["Academic records", "Income certificate", "Aadhaar"],
      lastUpdated: "Feb 2026",
    },
  ],
  senior: [
    {
      id: "pension-demo",
      name: "Old Age Pension (Demo)",
      purpose: "Monthly pension support for eligible senior citizens.",
      eligibility: "Citizens above age threshold with income criteria (demo).",
      benefits: "Monthly financial assistance.",
      documents: ["Age proof", "Income certificate", "Bank details"],
      lastUpdated: "Jan 2026",
    },
  ],
  women: [
    {
      id: "women-welfare-demo",
      name: "Women Welfare Support (Demo)",
      purpose: "Support programs for women entrepreneurs and caregivers.",
      eligibility: "Women meeting program-specific criteria (demo).",
      benefits: "Skill training and financial linkage (illustrative).",
      documents: ["Aadhaar", "Address proof", "Application form"],
      lastUpdated: "Nov 2025",
    },
  ],
  jobseeker: [
    {
      id: "employment-demo",
      name: "Employment Exchange (Demo)",
      purpose: "Job matching and skill development for job seekers.",
      eligibility: "Registered job seekers (demo).",
      benefits: "Job notifications and training referrals.",
      documents: ["Educational certificates", "Aadhaar", "Resume"],
      lastUpdated: "Mar 2026",
    },
  ],
  family: [
    {
      id: "family-benefits-demo",
      name: "Family Welfare Program (Demo)",
      purpose: "Health and nutrition support for families.",
      eligibility: "Families meeting income and household criteria (demo).",
      benefits: "Healthcare and nutrition assistance (illustrative).",
      documents: ["Ration card", "Aadhaar", "Income certificate"],
      lastUpdated: "Jan 2026",
    },
  ],
};
