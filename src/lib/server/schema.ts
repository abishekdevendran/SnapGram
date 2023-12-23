// schema.ts
import { relations, sql } from 'drizzle-orm';
import {
	mysqlTable,
	bigint,
	varchar,
	boolean,
	primaryKey,
	timestamp,
	index
} from 'drizzle-orm/mysql-core';

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
	}),
	isPrivate: boolean('isPrivate').default(false)
}, (t) => ({
	unameIdx : index('username_idx').on(t.username),
}));

export const post = mysqlTable('post', {
	id: varchar('id', {
		length: 15
	}).primaryKey(),
	image: varchar('image', {
		length: 255
	}).notNull(),
	likes: bigint('likes', {
		mode: 'number'
	}).default(0),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
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
export const userToPost = mysqlTable(
	'users_to_posts',
	{
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
	},
	(t) => ({
		pk: primaryKey({
			columns: [t.userId, t.postId]
		})
	})
);
export const userToUser = mysqlTable(
	'users_to_users',
	{
		user1Id: varchar('user1_id', {
			length: 15
		})
			.notNull()
			.references(() => user.id),
		user2Id: varchar('user2_id', {
			length: 15
		})
			.notNull()
			.references(() => user.id)
	},
	(t) => ({
		pk: primaryKey({
			columns: [t.user1Id, t.user2Id]
		})
	})
);
export const followRequest = mysqlTable(
	'follow_request',
	{
		followerId: varchar('follower_id', {
			length: 15
		})
			.notNull()
			.references(() => user.id),
		followingId: varchar('following_id', {
			length: 15
		})
			.notNull()
			.references(() => user.id)
	},
	(t) => ({
		pk: primaryKey({
			columns: [t.followerId, t.followingId]
		})
	})
);

// relations
export const userRelations = relations(user, ({ many }) => ({
	userToPost: many(userToPost),
	comment: many(comment),
	followers: many(userToUser, { relationName: 'follower' }),
	following: many(userToUser, { relationName: 'following' }),
	followRequests: many(followRequest, { relationName: 'followRequests' })
}));
export const postRelations = relations(post, ({ many }) => ({
	userToPost: many(userToPost),
	comment: many(comment)
}));
export const commentRelations = relations(comment, ({ one }) => ({
	user: one(user, {
		fields: [comment.userId],
		references: [user.id]
	}),
	post: one(post, {
		fields: [comment.postId],
		references: [post.id]
	})
}));
export const userToPostRelations = relations(userToPost, ({ one }) => ({
	user: one(user, {
		fields: [userToPost.userId],
		references: [user.id]
	}),
	post: one(post, {
		fields: [userToPost.postId],
		references: [post.id]
	})
}));
export const userToUserRelations = relations(userToUser, ({ one }) => ({
	following: one(user, {
		fields: [userToUser.user2Id],
		references: [user.id],
		relationName: 'following'
	}),
	follower: one(user, {
		fields: [userToUser.user1Id],
		references: [user.id],
		relationName: 'follower'
	})
}));
export const followRequestRelations = relations(followRequest, ({ one }) => ({
	follower: one(user, {
		fields: [followRequest.followerId],
		references: [user.id],
		relationName: 'follower'
	}),
	following: one(user, {
		fields: [followRequest.followingId],
		references: [user.id],
		relationName: 'following'
	})
}));

// Ideally never need to touch any of the below tables
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
