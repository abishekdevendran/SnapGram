CREATE TABLE `follow_request` (
	`follower_id` varchar(15) NOT NULL,
	`following_id` varchar(15) NOT NULL,
	CONSTRAINT `follow_request_follower_id_following_id_pk` PRIMARY KEY(`follower_id`,`following_id`)
);
--> statement-breakpoint
ALTER TABLE `follow_request` ADD CONSTRAINT `follow_request_follower_id_user_id_fk` FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `follow_request` ADD CONSTRAINT `follow_request_following_id_user_id_fk` FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;