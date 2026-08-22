import type { RiskAssessment } from "../../../server/riskEngine";

export type DemoExposure = {
  id: string;
  type: string;
  category: "devices" | "accounts" | "permissions" | "trackers" | "breaches" | "integrations";
  severity: "low" | "medium" | "high" | "critical";
  status: "investigate" | "review" | "resolved" | "dismissed";
  title: string;
  description: string;
  detected: string;
  source: string;
  evidence: "Verified" | "Detected" | "User-reported" | "Inferred" | "Needs investigation";
  impact: number;
  action: string;
  related: string;
};

export const demoExposures: DemoExposure[] = [
  { id: "EXP-9F82A1C4", type: "Breach exposure", category: "breaches", severity: "high", status: "investigate", title: "Credential exposure needs review", description: "A simulated breach-monitoring source indicates that an email address could require password and MFA review.", detected: "Today, 09:42", source: "Demo breach intelligence source", evidence: "Detected", impact: 30, action: "Change the password and enable MFA through the account’s official security settings.", related: "Connected account" },
  { id: "EXP-4D12B8F7", type: "Permission change", category: "permissions", severity: "medium", status: "review", title: "Sensitive photo-library permission granted", description: "A simulated application record includes access to a sensitive permission that merits a user review.", detected: "Yesterday, 15:10", source: "Demo mobile permission source", evidence: "Verified", impact: 19, action: "Review the application’s supported permission controls and revoke access if unnecessary.", related: "Demo Gallery" },
  { id: "EXP-67E40C2A", type: "Device activity", category: "devices", severity: "medium", status: "review", title: "New device requires recognition", description: "A simulated account session source recorded a device that has not yet been marked as recognized.", detected: "Aug 20, 17:24", source: "Demo session source", evidence: "Verified", impact: 15, action: "Confirm this device through the provider’s official account-security page.", related: "Chrome on macOS" },
  { id: "EXP-0B91CDE5", type: "Tracker intelligence", category: "trackers", severity: "low", status: "investigate", title: "Third-party analytics relationship found", description: "A simulated tracker-intelligence source identified a third-party analytics relationship for review.", detected: "Aug 19, 11:05", source: "Demo tracker intelligence source", evidence: "Detected", impact: 8, action: "Review the privacy controls offered by the relevant service.", related: "analytics.example" },
];

export const demoRisk: RiskAssessment = {
  total: 72,
  band: "high",
  categoryScores: { devices: 15, accounts: 0, permissions: 19, trackers: 8, breaches: 30, integrations: 0 },
  contributions: demoExposures.map(event => ({ exposureId: event.id, category: event.category, severity: event.severity, status: event.status, riskImpact: event.impact, title: event.title, contribution: event.impact, reductionGuidance: event.action })),
  methodology: "Simulated only: each open finding is assigned a visible rules-based contribution. This demo score never represents a live security finding.",
};

export const demoDevices = [
  { name: "Chrome on macOS", platform: "macOS", status: "Review", lastObserved: "17 minutes ago" },
  { name: "Pixel 9", platform: "Android", status: "Recognized", lastObserved: "Today, 08:13" },
  { name: "Safari on iPad", platform: "iPadOS", status: "Recognized", lastObserved: "Yesterday" },
];

export const demoAccounts = [
  { provider: "Example Mail", account: "m•••@example.com", status: "Review", scopes: "profile, sessions" },
  { provider: "Example Drive", account: "m•••@example.com", status: "Connected", scopes: "files.metadata.read" },
  { provider: "Example Calendar", account: "m•••@example.com", status: "Connected", scopes: "calendar.readonly" },
];

export const demoPermissions = [
  { app: "Demo Gallery", permission: "Photos & videos", sensitivity: "Medium", status: "Review" },
  { app: "Maps Preview", permission: "Precise location", sensitivity: "High", status: "Granted" },
  { app: "Notes Sync", permission: "Contacts", sensitivity: "Medium", status: "Review" },
];

export const demoTrackers = [
  { domain: "analytics.example", company: "Example Analytics", purpose: "Audience measurement", evidence: "Detected" },
  { domain: "cdn.example", company: "Example CDN", purpose: "Content delivery", evidence: "Verified" },
  { domain: "support.example", company: "Example Support", purpose: "Customer support", evidence: "Detected" },
];

export const demoIntegrations = [
  { provider: "Example Mail", authorization: "OAuth 2.0", status: "Not connected", support: "Account profile and supported session summaries" },
  { provider: "Have I Been Pwned", authorization: "API credential", status: "Requires configuration", support: "Authorized breach intelligence lookups" },
  { provider: "Tracker intelligence provider", authorization: "API credential", status: "Requires configuration", support: "Licensed tracker and domain intelligence" },
];
