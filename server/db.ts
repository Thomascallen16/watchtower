import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  accountDeletionRequests,
  alerts,
  auditLogs,
  connectedAccounts,
  dataExportRequests,
  devices,
  exposureEvents,
  exposureEvidence,
  InsertUser,
  integrationTokenReferences,
  permissions,
  riskAssessments,
  riskRules,
  riskScoreHistory,
  trackers,
  userActions,
  userNotes,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { defaultRiskConfig, type DataMode, type RiskConfig } from "../shared/watchtower";
import type { RiskAssessment } from "./riskEngine";
import { createExposureId } from "./exposureId";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function writeAuditLog(userId: number | null, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ userId, action, entityType, entityId, metadata });
}

export async function getDashboardForUser(userId: number, dataMode: DataMode) {
  const db = await getDb();
  if (!db) return { devices: [], accounts: [], permissions: [], trackers: [], alerts: [], events: [], history: [] };

  const [deviceRows, accountRows, permissionRows, trackerRows, alertRows, eventRows, historyRows] = await Promise.all([
    db.select().from(devices).where(and(eq(devices.userId, userId), eq(devices.dataMode, dataMode))).limit(12),
    db.select().from(connectedAccounts).where(and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.dataMode, dataMode))).limit(12),
    db.select().from(permissions).where(and(eq(permissions.userId, userId), eq(permissions.dataMode, dataMode))).limit(12),
    db.select().from(trackers).where(and(eq(trackers.userId, userId), eq(trackers.dataMode, dataMode))).limit(12),
    db.select().from(alerts).where(and(eq(alerts.userId, userId), eq(alerts.dataMode, dataMode))).orderBy(desc(alerts.createdAt)).limit(12),
    db.select().from(exposureEvents).where(and(eq(exposureEvents.userId, userId), eq(exposureEvents.dataMode, dataMode))).orderBy(desc(exposureEvents.firstDetectedAt)).limit(24),
    db.select().from(riskScoreHistory).where(and(eq(riskScoreHistory.userId, userId), eq(riskScoreHistory.dataMode, dataMode))).orderBy(desc(riskScoreHistory.observedAt)).limit(12),
  ]);
  return { devices: deviceRows, accounts: accountRows, permissions: permissionRows, trackers: trackerRows, alerts: alertRows, events: eventRows, history: historyRows };
}

export async function getExposureForUser(userId: number, exposureId: string, dataMode: DataMode) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(exposureEvents).where(and(eq(exposureEvents.id, exposureId), eq(exposureEvents.userId, userId), eq(exposureEvents.dataMode, dataMode))).limit(1);
  return rows[0];
}

export async function getExposureDetailForUser(userId: number, exposureId: string, dataMode: DataMode) {
  const db = await getDb();
  if (!db) return undefined;
  const event = await getExposureForUser(userId, exposureId, dataMode);
  if (!event) return undefined;
  const notes = await db.select().from(userNotes).where(and(eq(userNotes.userId, userId), eq(userNotes.exposureId, exposureId))).orderBy(desc(userNotes.createdAt));
  return { event, notes };
}

export async function listExposuresForUser(userId: number, dataMode: DataMode) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exposureEvents).where(and(eq(exposureEvents.userId, userId), eq(exposureEvents.dataMode, dataMode))).orderBy(desc(exposureEvents.firstDetectedAt)).limit(100);
}

export async function createExposureForUser(userId: number, input: {
  eventType: string; category: "devices" | "accounts" | "permissions" | "trackers" | "breaches" | "integrations"; severity: "low" | "medium" | "high" | "critical"; title: string; description: string; evidenceClassification: "verified" | "detected" | "user_reported" | "inferred" | "needs_investigation"; sourceName: string; sourceUrl?: string; relatedKind?: string; relatedRecordId?: string; riskImpact: number; recommendedActions: string[]; firstDetectedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const id = createExposureId();
  const now = new Date();
  await db.insert(exposureEvents).values({
    id, userId, dataMode: "live", eventType: input.eventType, category: input.category, severity: input.severity,
    status: "investigate", title: input.title, description: input.description, evidenceClassification: input.evidenceClassification,
    sourceName: input.sourceName, sourceUrl: input.sourceUrl, relatedKind: input.relatedKind, relatedRecordId: input.relatedRecordId,
    riskImpact: input.riskImpact, recommendedActions: input.recommendedActions, firstDetectedAt: input.firstDetectedAt ?? now, lastObservedAt: now,
  });
  await db.insert(exposureEvidence).values({ exposureId: id, classification: input.evidenceClassification, sourceName: input.sourceName, sourceUrl: input.sourceUrl, summary: input.description });
  await writeAuditLog(userId, "exposure.created", "exposure", id, { dataMode: "live", source: input.sourceName });
  return id;
}

export async function updateExposureResolution(userId: number, exposureId: string, status: "investigate" | "review" | "resolved" | "dismissed", resolutionNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await getExposureForUser(userId, exposureId, "live");
  if (!existing) return false;
  await db.update(exposureEvents).set({ status, resolutionNote, resolvedAt: status === "resolved" || status === "dismissed" ? new Date() : null }).where(and(eq(exposureEvents.id, exposureId), eq(exposureEvents.userId, userId), eq(exposureEvents.dataMode, "live")));
  await writeAuditLog(userId, "exposure.resolution_updated", "exposure", exposureId, { status });
  return true;
}

export async function addUserNote(userId: number, exposureId: string, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await getExposureForUser(userId, exposureId, "live");
  if (!existing) return false;
  await db.insert(userNotes).values({ userId, exposureId, body });
  await writeAuditLog(userId, "note.created", "exposure", exposureId);
  return true;
}

export async function completeRecommendedAction(userId: number, exposureId: string, actionType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await getExposureForUser(userId, exposureId, "live");
  if (!existing) return false;
  await db.insert(userActions).values({ userId, exposureId, actionType, status: "completed", completedAt: new Date() });
  await writeAuditLog(userId, "action.completed", "exposure", exposureId, { actionType });
  return true;
}

export async function recordRiskAssessment(userId: number, dataMode: DataMode, assessment: RiskAssessment) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(riskAssessments).values({ userId, dataMode, totalScore: assessment.total, riskBand: assessment.band, categoryScores: assessment.categoryScores, contributions: assessment.contributions });
  await db.insert(riskScoreHistory).values({ userId, dataMode, totalScore: assessment.total, sourceAssessmentId: Number(result[0].insertId) });
}

export async function getRiskConfigForUser(userId: number): Promise<RiskConfig> {
  const db = await getDb();
  if (!db) return { ...defaultRiskConfig };
  const rows = await db.select().from(riskRules).where(eq(riskRules.userId, userId)).limit(1);
  const row = rows[0];
  return row ? { severityLow: row.severityLow, severityMedium: row.severityMedium, severityHigh: row.severityHigh, severityCritical: row.severityCritical, reviewPercent: row.reviewPercent } : { ...defaultRiskConfig };
}

export async function updateRiskConfigForUser(userId: number, config: RiskConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(riskRules).values({ userId, ...config }).onDuplicateKeyUpdate({ set: { ...config } });
  await writeAuditLog(userId, "risk.rules_updated", "risk_rules", String(userId), config);
  return config;
}

export async function getRiskHistoryForUser(userId: number, dataMode: DataMode) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(riskScoreHistory).where(and(eq(riskScoreHistory.userId, userId), eq(riskScoreHistory.dataMode, dataMode))).orderBy(desc(riskScoreHistory.observedAt)).limit(20);
}

export async function listIntegrationReferences(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrationTokenReferences).where(eq(integrationTokenReferences.userId, userId)).orderBy(desc(integrationTokenReferences.updatedAt));
}

export async function registerIntegrationReference(userId: number, input: { provider: string; authorizationMethod: "oauth2" | "api_key" | "manual_import"; supportedData: string[]; scopes: string[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const supportsProviderDisconnect = input.authorizationMethod === "oauth2";
  await db.insert(integrationTokenReferences).values({
    userId,
    provider: input.provider,
    authorizationMethod: input.authorizationMethod,
    supportedData: input.supportedData,
    scopes: input.scopes,
    syncStatus: "not_connected",
    supportsDisconnect: supportsProviderDisconnect,
    supportsRevocation: supportsProviderDisconnect,
  }).onDuplicateKeyUpdate({
    set: {
      authorizationMethod: input.authorizationMethod,
      supportedData: input.supportedData,
      scopes: input.scopes,
      syncStatus: "not_connected",
      syncError: null,
      supportsDisconnect: supportsProviderDisconnect,
      supportsRevocation: supportsProviderDisconnect,
    },
  });
  await writeAuditLog(userId, "integration.metadata_registered", "integration", input.provider, { authorizationMethod: input.authorizationMethod, scopes: input.scopes });
  return { accepted: true };
}

export async function requestDataExport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(dataExportRequests).values({ userId, status: "requested" });
  await writeAuditLog(userId, "privacy.export_requested", "account");
  return { accepted: true };
}

export async function requestAccountDeletion(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(accountDeletionRequests).values({ userId, status: "requested" });
  await writeAuditLog(userId, "privacy.deletion_requested", "account");
  return { accepted: true };
}
