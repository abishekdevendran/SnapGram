CREATE TABLE `comment` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`post_id` varchar(15) NOT NULL,
	`text` varchar(255) NOT NULL,
	CONSTRAINT `comment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `key` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`hashed_password` varchar(255),
	CONSTRAINT `key_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` varchar(15) NOT NULL,
	`image` varchar(255) NOT NULL,
	`likes` bigint DEFAULT 0,
	CONSTRAINT `post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`active_expires` bigint NOT NULL,
	`idle_expires` bigint NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(15) NOT NULL,
	`username` varchar(255),
	`avatar` varchar(255),
	`isPrivate` boolean DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `users_to_posts` (
	`user_id` varchar(15) NOT NULL,
	`post_id` varchar(15) NOT NULL,
	CONSTRAINT `users_to_posts_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_users` (
	`user1_id` varchar(15) NOT NULL,
	`user2_id` varchar(15) NOT NULL,
	CONSTRAINT `users_to_users_user1_id_user2_id_pk` PRIMARY KEY(`user1_id`,`user2_id`)
);
--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_post_id_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `key` ADD CONSTRAINT `key_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_posts` ADD CONSTRAINT `users_to_posts_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_posts` ADD CONSTRAINT `users_to_posts_post_id_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_users` ADD CONSTRAINT `users_to_users_user1_id_user_id_fk` FOREIGN KEY (`user1_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_users` ADD CONSTRAINT `users_to_users_user2_id_user_id_fk` FOREIGN KEY (`user2_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;