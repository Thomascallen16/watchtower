CREATE TABLE `accountDeletionRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deletionStatus` enum('requested','processing','completed','cancelled') NOT NULL DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `accountDeletionRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`exposureId` varchar(16),
	`dataMode` enum('live','demo') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`alertStatus` enum('unread','read','dismissed') NOT NULL DEFAULT 'unread',
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`name` varchar(160) NOT NULL,
	`publisher` varchar(160),
	`applicationStatus` enum('active','review','removed') NOT NULL DEFAULT 'review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectedAccounts` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`provider` varchar(120) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`accountStatus` enum('active','review','disconnected') NOT NULL DEFAULT 'review',
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connectedAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataExportRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportStatus` enum('requested','ready','expired') NOT NULL DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `dataExportRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataMode` enum('live','demo') NOT NULL,
	`name` varchar(120) NOT NULL,
	`sourceKind` enum('provider_api','oauth','manual','demo') NOT NULL,
	`evidencePolicy` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`name` varchar(160) NOT NULL,
	`platform` varchar(80) NOT NULL,
	`deviceStatus` enum('recognized','review','removed') NOT NULL DEFAULT 'review',
	`lastObservedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exposureEvents` (
	`id` varchar(16) NOT NULL,
	`userId` int NOT NULL,
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`eventType` varchar(96) NOT NULL,
	`riskCategory` enum('devices','accounts','permissions','trackers','breaches','integrations') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`eventStatus` enum('investigate','review','resolved','dismissed') NOT NULL DEFAULT 'investigate',
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`evidenceClassification` enum('verified','detected','user_reported','inferred','needs_investigation') NOT NULL,
	`sourceName` varchar(120) NOT NULL,
	`sourceUrl` varchar(2048),
	`relatedKind` varchar(32),
	`relatedRecordId` varchar(64),
	`riskImpact` int NOT NULL DEFAULT 0,
	`recommendedActions` json NOT NULL,
	`resolutionNote` text,
	`firstDetectedAt` timestamp NOT NULL DEFAULT (now()),
	`lastObservedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exposureEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exposureEvidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exposureId` varchar(16) NOT NULL,
	`evidenceClassification` enum('verified','detected','user_reported','inferred','needs_investigation') NOT NULL,
	`sourceName` varchar(120) NOT NULL,
	`sourceUrl` varchar(2048),
	`summary` text NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exposureEvidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrationTokenReferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(80) NOT NULL,
	`authorizationMethod` enum('oauth2','api_key','manual_import') NOT NULL,
	`supportedData` json NOT NULL,
	`scopes` json NOT NULL,
	`tokenReference` varchar(512),
	`keyVersion` varchar(64),
	`syncStatus` enum('not_connected','connected','syncing','error','revoked') NOT NULL DEFAULT 'not_connected',
	`syncError` text,
	`lastSyncedAt` timestamp,
	`supportsDisconnect` boolean NOT NULL DEFAULT false,
	`supportsRevocation` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrationTokenReferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `integration_user_provider_unique` UNIQUE(`userId`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `organizationMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`memberRole` enum('owner','member') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizationMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_user_unique` UNIQUE(`organizationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`applicationId` varchar(64),
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`name` varchar(160) NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`permissionStatus` enum('granted','review','revoked') NOT NULL DEFAULT 'review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riskAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataMode` enum('live','demo') NOT NULL,
	`totalScore` int NOT NULL,
	`riskBand` enum('low','guarded','elevated','high','critical') NOT NULL,
	`categoryScores` json NOT NULL,
	`contributions` json NOT NULL,
	`rulesVersion` varchar(32) NOT NULL DEFAULT 'mvp-v1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riskAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riskScoreHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataMode` enum('live','demo') NOT NULL,
	`totalScore` int NOT NULL,
	`sourceAssessmentId` int,
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riskScoreHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trackers` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`dataSourceId` int,
	`dataMode` enum('live','demo') NOT NULL,
	`domain` varchar(253) NOT NULL,
	`company` varchar(160),
	`purpose` varchar(240),
	`evidenceClassification` enum('verified','detected','user_reported','inferred','needs_investigation') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exposureId` varchar(16),
	`actionType` varchar(80) NOT NULL,
	`actionStatus` enum('pending','completed','dismissed') NOT NULL DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `userActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exposureId` varchar(16) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountDeletionRequests` ADD CONSTRAINT `accountDeletionRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_exposureId_exposureEvents_id_fk` FOREIGN KEY (`exposureId`) REFERENCES `exposureEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connectedAccounts` ADD CONSTRAINT `connectedAccounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connectedAccounts` ADD CONSTRAINT `connectedAccounts_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataExportRequests` ADD CONSTRAINT `dataExportRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataSources` ADD CONSTRAINT `dataSources_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devices` ADD CONSTRAINT `devices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devices` ADD CONSTRAINT `devices_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exposureEvents` ADD CONSTRAINT `exposureEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exposureEvents` ADD CONSTRAINT `exposureEvents_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exposureEvidence` ADD CONSTRAINT `exposureEvidence_exposureId_exposureEvents_id_fk` FOREIGN KEY (`exposureId`) REFERENCES `exposureEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrationTokenReferences` ADD CONSTRAINT `integrationTokenReferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationMembers` ADD CONSTRAINT `organizationMembers_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationMembers` ADD CONSTRAINT `organizationMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `riskAssessments` ADD CONSTRAINT `riskAssessments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `riskScoreHistory` ADD CONSTRAINT `riskScoreHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `riskScoreHistory` ADD CONSTRAINT `riskScoreHistory_sourceAssessmentId_riskAssessments_id_fk` FOREIGN KEY (`sourceAssessmentId`) REFERENCES `riskAssessments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trackers` ADD CONSTRAINT `trackers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trackers` ADD CONSTRAINT `trackers_dataSourceId_dataSources_id_fk` FOREIGN KEY (`dataSourceId`) REFERENCES `dataSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userActions` ADD CONSTRAINT `userActions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userActions` ADD CONSTRAINT `userActions_exposureId_exposureEvents_id_fk` FOREIGN KEY (`exposureId`) REFERENCES `exposureEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userNotes` ADD CONSTRAINT `userNotes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userNotes` ADD CONSTRAINT `userNotes_exposureId_exposureEvents_id_fk` FOREIGN KEY (`exposureId`) REFERENCES `exposureEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `alert_user_mode_status` ON `alerts` (`userId`,`dataMode`,`alertStatus`);--> statement-breakpoint
CREATE INDEX `application_user_mode` ON `applications` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `audit_user_time` ON `auditLogs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `account_user_mode` ON `connectedAccounts` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `data_source_user_mode` ON `dataSources` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `device_user_mode` ON `devices` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `exposure_user_mode_time` ON `exposureEvents` (`userId`,`dataMode`,`firstDetectedAt`);--> statement-breakpoint
CREATE INDEX `exposure_user_status` ON `exposureEvents` (`userId`,`eventStatus`);--> statement-breakpoint
CREATE INDEX `evidence_exposure` ON `exposureEvidence` (`exposureId`);--> statement-breakpoint
CREATE INDEX `permission_user_mode` ON `permissions` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `risk_assessment_user_mode_time` ON `riskAssessments` (`userId`,`dataMode`,`createdAt`);--> statement-breakpoint
CREATE INDEX `risk_history_user_mode_time` ON `riskScoreHistory` (`userId`,`dataMode`,`observedAt`);--> statement-breakpoint
CREATE INDEX `tracker_user_mode` ON `trackers` (`userId`,`dataMode`);--> statement-breakpoint
CREATE INDEX `note_user_exposure` ON `userNotes` (`userId`,`exposureId`);