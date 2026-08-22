import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

const dataModeEnum = mysqlEnum("dataMode", ["live", "demo"]);
const evidenceEnum = mysqlEnum("evidenceClassification", ["verified", "detected", "user_reported", "inferred", "needs_investigation"]);
const severityEnum = mysqlEnum("severity", ["low", "medium", "high", "critical"]);
const eventStatusEnum = mysqlEnum("eventStatus", ["investigate", "review", "resolved", "dismissed"]);
const riskCategoryEnum = mysqlEnum("riskCategory", ["devices", "accounts", "permissions", "trackers", "breaches", "integrations"]);

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const organizationMembers = mysqlTable("organizationMembers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("memberRole", ["owner", "member"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("organization_user_unique").on(table.organizationId, table.userId)]);

export const dataSources = mysqlTable("dataSources", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataMode: dataModeEnum.notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  kind: mysqlEnum("sourceKind", ["provider_api", "oauth", "manual", "demo"]).notNull(),
  evidencePolicy: varchar("evidencePolicy", { length: 240 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("data_source_user_mode").on(table.userId, table.dataMode)]);

export const devices = mysqlTable("devices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  platform: varchar("platform", { length: 80 }).notNull(),
  status: mysqlEnum("deviceStatus", ["recognized", "review", "removed"]).default("review").notNull(),
  lastObservedAt: timestamp("lastObservedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("device_user_mode").on(table.userId, table.dataMode)]);

export const connectedAccounts = mysqlTable("connectedAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  provider: varchar("provider", { length: 120 }).notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  status: mysqlEnum("accountStatus", ["active", "review", "disconnected"]).default("review").notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("account_user_mode").on(table.userId, table.dataMode)]);

export const applications = mysqlTable("applications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  publisher: varchar("publisher", { length: 160 }),
  status: mysqlEnum("applicationStatus", ["active", "review", "removed"]).default("review").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("application_user_mode").on(table.userId, table.dataMode)]);

export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  applicationId: varchar("applicationId", { length: 64 }).references(() => applications.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  sensitivity: severityEnum.notNull(),
  status: mysqlEnum("permissionStatus", ["granted", "review", "revoked"]).default("review").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("permission_user_mode").on(table.userId, table.dataMode)]);

export const trackers = mysqlTable("trackers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  domain: varchar("domain", { length: 253 }).notNull(),
  company: varchar("company", { length: 160 }),
  purpose: varchar("purpose", { length: 240 }),
  classification: evidenceEnum.notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("tracker_user_mode").on(table.userId, table.dataMode)]);

export const exposureEvents = mysqlTable("exposureEvents", {
  id: varchar("id", { length: 16 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataSourceId: int("dataSourceId").references(() => dataSources.id),
  dataMode: dataModeEnum.notNull(),
  eventType: varchar("eventType", { length: 96 }).notNull(),
  category: riskCategoryEnum.notNull(),
  severity: severityEnum.notNull(),
  status: eventStatusEnum.default("investigate").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  evidenceClassification: evidenceEnum.notNull(),
  sourceName: varchar("sourceName", { length: 120 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  relatedKind: varchar("relatedKind", { length: 32 }),
  relatedRecordId: varchar("relatedRecordId", { length: 64 }),
  riskImpact: int("riskImpact").default(0).notNull(),
  recommendedActions: json("recommendedActions").$type<string[]>().notNull(),
  resolutionNote: text("resolutionNote"),
  firstDetectedAt: timestamp("firstDetectedAt").defaultNow().notNull(),
  lastObservedAt: timestamp("lastObservedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("exposure_user_mode_time").on(table.userId, table.dataMode, table.firstDetectedAt), index("exposure_user_status").on(table.userId, table.status)]);

export const exposureEvidence = mysqlTable("exposureEvidence", {
  id: int("id").autoincrement().primaryKey(),
  exposureId: varchar("exposureId", { length: 16 }).notNull().references(() => exposureEvents.id),
  classification: evidenceEnum.notNull(),
  sourceName: varchar("sourceName", { length: 120 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  summary: text("summary").notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
}, table => [index("evidence_exposure").on(table.exposureId)]);

export const riskAssessments = mysqlTable("riskAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataMode: dataModeEnum.notNull(),
  totalScore: int("totalScore").notNull(),
  riskBand: mysqlEnum("riskBand", ["low", "guarded", "elevated", "high", "critical"]).notNull(),
  categoryScores: json("categoryScores").$type<Record<string, number>>().notNull(),
  contributions: json("contributions").$type<Record<string, unknown>[]>().notNull(),
  rulesVersion: varchar("rulesVersion", { length: 32 }).default("mvp-v1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("risk_assessment_user_mode_time").on(table.userId, table.dataMode, table.createdAt)]);

export const riskScoreHistory = mysqlTable("riskScoreHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dataMode: dataModeEnum.notNull(),
  totalScore: int("totalScore").notNull(),
  sourceAssessmentId: int("sourceAssessmentId").references(() => riskAssessments.id),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
}, table => [index("risk_history_user_mode_time").on(table.userId, table.dataMode, table.observedAt)]);

export const riskRules = mysqlTable("riskRules", {
  userId: int("userId").primaryKey().references(() => users.id),
  severityLow: int("severityLow").default(6).notNull(),
  severityMedium: int("severityMedium").default(13).notNull(),
  severityHigh: int("severityHigh").default(22).notNull(),
  severityCritical: int("severityCritical").default(34).notNull(),
  reviewPercent: int("reviewPercent").default(75).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alerts = mysqlTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  exposureId: varchar("exposureId", { length: 16 }).references(() => exposureEvents.id),
  dataMode: dataModeEnum.notNull(),
  severity: severityEnum.notNull(),
  status: mysqlEnum("alertStatus", ["unread", "read", "dismissed"]).default("unread").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("alert_user_mode_status").on(table.userId, table.dataMode, table.status)]);

export const userNotes = mysqlTable("userNotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  exposureId: varchar("exposureId", { length: 16 }).notNull().references(() => exposureEvents.id),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("note_user_exposure").on(table.userId, table.exposureId)]);

export const userActions = mysqlTable("userActions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  exposureId: varchar("exposureId", { length: 16 }).references(() => exposureEvents.id),
  actionType: varchar("actionType", { length: 80 }).notNull(),
  status: mysqlEnum("actionStatus", ["pending", "completed", "dismissed"]).default("pending").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const integrationTokenReferences = mysqlTable("integrationTokenReferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  provider: varchar("provider", { length: 80 }).notNull(),
  authorizationMethod: mysqlEnum("authorizationMethod", ["oauth2", "api_key", "manual_import"]).notNull(),
  supportedData: json("supportedData").$type<string[]>().notNull(),
  scopes: json("scopes").$type<string[]>().notNull(),
  tokenReference: varchar("tokenReference", { length: 512 }),
  keyVersion: varchar("keyVersion", { length: 64 }),
  syncStatus: mysqlEnum("syncStatus", ["not_connected", "connected", "syncing", "error", "revoked"]).default("not_connected").notNull(),
  syncError: text("syncError"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  supportsDisconnect: boolean("supportsDisconnect").default(false).notNull(),
  supportsRevocation: boolean("supportsRevocation").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("integration_user_provider_unique").on(table.userId, table.provider)]);

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("audit_user_time").on(table.userId, table.createdAt)]);

export const dataExportRequests = mysqlTable("dataExportRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("exportStatus", ["requested", "ready", "expired"]).default("requested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const accountDeletionRequests = mysqlTable("accountDeletionRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("deletionStatus", ["requested", "processing", "completed", "cancelled"]).default("requested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
