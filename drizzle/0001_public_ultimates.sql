CREATE TABLE `comment` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`post_id` varchar(15) NOT NULL,
	`text` varchar(255) NOT NULL,
	CONSTRAINT `comment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` varchar(15) NOT NULL,
	`image` varchar(255) NOT NULL,
	CONSTRAINT `post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_posts` (
	`user_id` varchar(15) NOT NULL,
	`post_id` varchar(15) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user` ADD `avatar` varchar(255);--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_post_id_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_posts` ADD CONSTRAINT `users_to_posts_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_to_posts` ADD CONSTRAINT `users_to_posts_post_id_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE no action ON UPDATE no action;