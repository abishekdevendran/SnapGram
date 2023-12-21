// schema.ts
import { relations } from 'drizzle-orm';
import { mysqlTable, bigint, varchar } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
	id: varchar('id', {
		length: 15 // change this when using custom user ids
	}).primaryKey(),
	// other user attributes
	username: varchar('username', {
		length: 255
	}).unique(),
	avatar: varchar('avatar', {
		length: 255
	})
});

export const post = mysqlTable('post', {
	id: varchar('id', {
		length: 15
	}).primaryKey(),
	image: varchar('image', {
		length: 255
	}).notNull()
});

export const comment = mysqlTable('comment', {
	id: varchar('id', {
		length: 15
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	postId: varchar('post_id', {
		length: 15
	})
		.notNull()
		.references(() => post.id),
	text: varchar('text', {
		length: 255
	}).notNull()
});

// junction tables
export const userToPost = mysqlTable('users_to_posts', {
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	postId: varchar('post_id', {
		length: 15
	})
		.notNull()
		.references(() => post.id)
});

// relations
export const userRelations = relations(user, ({ many }) => ({
	userToPost: many(userToPost),
	comment: many(comment)
}));
export const postRelations = relations(post, ({ many }) => ({
	userToPost: many(userToPost),
	comment: many(comment)
}));
export const userToPostRelations = relations(userToPost, ({ one }) => ({
	user: one(user, {
		fields: [userToPost.userId],
		references: [user.id]
	}),
	post: one(post,{
		fields: [userToPost.postId],
		references: [post.id]
	})
}));

export const key = mysqlTable('key', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
});

export const session = mysqlTable('session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});
