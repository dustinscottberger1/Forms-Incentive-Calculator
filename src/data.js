// Sharecare Disability Forms — Employee Incentive Calculator
// Anonymized summary data (first name + last initial)
//
// TO UPDATE: Replace the BASELINE and EMPLOYEES exports below with fresh numbers.
// You can ask Claude: "Regenerate my data.js from this spreadsheet using the same
// anonymization rules" and paste in the new .xlsx file.
//
// Last updated: 2026-04-07
// Baseline period: 2025-Oct through 2025-Dec (Q4 2025)
// Recent period:   2026-Jan through 2026-Mar (Q1 2026)

export const BASELINE = {
  omap: 4.32,
  utilization: 68.19,
  adjustedRecords: 4720,
  productiveHours: 1093,
  totalHours: 1603,
  numEmployees: 12,
};

export const EMPLOYEES = [
  { name: "Carlymarie R.", blOmap: 24.85,  blUtil: 2.08,  recentOmap: 0,      recentUtil: 0,     hasRecent: true },
  { name: "Tabatha H.",    blOmap: 5.3502, blUtil: 71.62, recentOmap: 6.3051, recentUtil: 74.20, hasRecent: true },
  { name: "Leah E.",       blOmap: 4.8191, blUtil: 68.28, recentOmap: 5.9208, recentUtil: 80.74, hasRecent: true },
  { name: "Susan H.",      blOmap: 5.3444, blUtil: 55.44, recentOmap: 5.2420, recentUtil: 59.16, hasRecent: true },
  { name: "Patricia B.",   blOmap: 4.7065, blUtil: 77.19, recentOmap: 5.0876, recentUtil: 83.97, hasRecent: true },
  { name: "Maranda M.",    blOmap: 5.1279, blUtil: 60.38, recentOmap: 0,      recentUtil: 0,     hasRecent: true },
  { name: "Danielle P.",   blOmap: 3.9806, blUtil: 82.77, recentOmap: 4.5342, recentUtil: 80.43, hasRecent: true },
  { name: "Ashley G.",     blOmap: 3.9147, blUtil: 88.63, recentOmap: 4.5973, recentUtil: 80.67, hasRecent: true },
  { name: "Ceirra W.",     blOmap: 4.0458, blUtil: 80.79, recentOmap: 4.0911, recentUtil: 79.50, hasRecent: true },
  { name: "Traniece A.",   blOmap: 2.7099, blUtil: 82.71, recentOmap: 3.9901, recentUtil: 75.07, hasRecent: true },
  { name: "Judy C.",       blOmap: 3.2024, blUtil: 69.12, recentOmap: 3.7885, recentUtil: 78.83, hasRecent: true },
];
