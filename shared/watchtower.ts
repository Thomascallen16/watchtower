import { z } from "zod";

export const DATA_MODES = ["live", "demo"] as const;
export const EVIDENCE_CLASSIFICATIONS = ["verified", "detected", "user_reported", "inferred", "needs_investigation"] as const;
export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const EVENT_STATUSES = ["investigate", "review", "resolved", "dismissed"] as const;
export const RISK_CATEGORIES = ["devices", "accounts", "permissions", "trackers", "breaches", "integrations", "supply_chain"] as const;

export type DataMode = (typeof DATA_MODES)[number];
export type EvidenceClassification = (typeof EVIDENCE_CLASSIFICATIONS)[number];
export type Severity = (typeof SEVERITIES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const evidenceClassificationSchema = z.enum(EVIDENCE_CLASSIFICATIONS);
export const severitySchema = z.enum(SEVERITIES);
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export const dataModeSchema = z.enum(DATA_MODES);
export const riskCategorySchema = z.enum(RISK_CATEGORIES);

export const createExposureEventSchema = z.object({
  dataMode: z.literal("live"),
  eventType: z.string().trim().min(3).max(96),
  category: riskCategorySchema,
  severity: severitySchema,
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(2000),
  evidenceClassification: evidenceClassificationSchema,
  sourceName: z.string().trim().min(2).max(120),
  sourceUrl: z.string().url().max(2048).optional(),
  relatedKind: z.enum(["device", "account", "application", "permission", "tracker", "integration"]).optional(),
  relatedRecordId: z.string().trim().max(64).optional(),
  riskImpact: z.number().int().min(-100).max(100),
  recommendedActions: z.array(z.string().trim().min(2).max(300)).min(1).max(8),
  firstDetectedAt: z.coerce.date().optional(),
});

export const updateResolutionSchema = z.object({
  exposureId: z.string().regex(/^EXP-[A-Z0-9]{8}$/),
  status: z.enum(["investigate", "review", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().min(2).max(1200).optional(),
});

export const userNoteSchema = z.object({
  exposureId: z.string().regex(/^EXP-[A-Z0-9]{8}$/),
  body: z.string().trim().min(1).max(2000),
});

export const integrationSchema = z.object({
  provider: z.string().trim().min(2).max(80),
  authorizationMethod: z.enum(["oauth2", "api_key", "manual_import"]),
  supportedData: z.array(z.string().trim().min(2).max(80)).min(1).max(20),
  scopes: z.array(z.string().trim().min(1).max(160)).max(30),
});

export const demoDisclosure = "DEMO DATA — NOT A LIVE SECURITY FINDING.";

export const defaultRiskConfig = {
  severityLow: 6,
  severityMedium: 13,
  severityHigh: 22,
  severityCritical: 34,
  reviewPercent: 75,
} as const;

export const riskConfigSchema = z.object({
  severityLow: z.number().int().min(0).max(50),
  severityMedium: z.number().int().min(0).max(50),
  severityHigh: z.number().int().min(0).max(60),
  severityCritical: z.number().int().min(0).max(80),
  reviewPercent: z.number().int().min(0).max(100),
}).refine(value => value.severityLow <= value.severityMedium && value.severityMedium <= value.severityHigh && value.severityHigh <= value.severityCritical, {
  message: "Severity weights must increase from low through critical.",
});

export const completeActionSchema = z.object({
  exposureId: z.string().regex(/^EXP-[A-Z0-9]{8}$/),
  actionType: z.string().trim().min(2).max(80),
});

export type RiskConfig = z.infer<typeof riskConfigSchema>;
