CREATE TABLE `riskRules` (
	`userId` int NOT NULL,
	`severityLow` int NOT NULL DEFAULT 6,
	`severityMedium` int NOT NULL DEFAULT 13,
	`severityHigh` int NOT NULL DEFAULT 22,
	`severityCritical` int NOT NULL DEFAULT 34,
	`reviewPercent` int NOT NULL DEFAULT 75,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riskRules_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `riskRules` ADD CONSTRAINT `riskRules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;