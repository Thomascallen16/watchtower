ALTER TABLE `exposureEvents` MODIFY COLUMN `riskCategory` enum('devices','accounts','permissions','trackers','breaches','integrations','supply_chain') NOT NULL;
