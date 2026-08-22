// Single source of truth for Department + Designation options,
// used by Sign Up and Admin Employee Management so both stay in sync.

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Finance',
  'Design',
  'People & Culture',
  'Executive Leadership'
];

// Curated common designations. Not exhaustive — both the Sign Up form and
// Admin Employee Management should let the user pick one of these OR type
// a custom value that isn't listed (via <datalist>, not a locked <select>).
export const DESIGNATIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Manager',
  'UX Researcher',
  'UX/UI Designer',
  'Content Strategist',
  'Marketing Manager',
  'Financial Analyst',
  'HR Specialist',
  'Senior Recruiter',
  'Operations Manager',
  'Sales Executive',
  'Associate Specialist',
  'Team Lead',
  'Director',
  'VP of People Operations'
];
