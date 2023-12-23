import { post, user, userToPost, userToUser } from '$lib/server/schema.js';
import { error } from '@sveltejs/kit';
import { and, eq, exists, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';

export const load = async ({ params, locals }) => {
	// fetch any matching slug from user
	const slug = params.username;
	if (!slug) {
		error(400);
	}
	console.log('Slug: ', slug);
	// check if user auth
	const session = await locals.auth.validate();
	// write a SQL query to get all matching users, and filter by isPrivate if no session
	let matches:any;
	if (!session) {
		matches = await locals.db.query.user.findMany({
			where: (user, { eq, and }) => and(eq(user.isPrivate, false), eq(user.username, slug)),
			with: {
				followers: {
					columns: {
						user1Id: false,
						user2Id: false
					},
					with: {
						following: true
					}
				},
				following: {
					columns: {
						user1Id: false,
						user2Id: false
					},
					with: {
						follower: true
					}
				},
				userToPost: {
					columns: {
						userId: false,
						postId: false
					},
					with: {
						post: true
					}
				}
			}
		});
	} else {
		// matches = await locals.db
		// 	.select({
		// 		id: user.id,
		// 		username: user.username,
		// 		avatar: user.avatar,
		// 		isPrivate: user.isPrivate,
		// 		followers: sql`JSON_ARRAYAGG(JSON_OBJECT('id', ${followersTable}.id, 'username', ${followersTable}.username, 'avatar', ${followersTable}.avatar, 'isPrivate', ${followersTable}.isPrivate))`,
		// 		following: sql`JSON_ARRAYAGG(JSON_OBJECT('id', ${followingTable}.id, 'username', ${followingTable}.username, 'avatar', ${followingTable}.avatar, 'isPrivate', ${followingTable}.isPrivate))`
		// 	})
		// 	.from(user)
		// 	.where(
		// 		and(
		// 			eq(user.username, slug),
		// 			or(
		// 				eq(user.isPrivate, false),
		// 				eq(user.id, session.user.userId),
		// 				exists(
		// 					locals.db
		// 						.select()
		// 						.from(userToUser)
		// 						.where(
		// 							and(eq(userToUser.user2Id, session.user.userId), eq(userToUser.user1Id, user.id))
		// 						)
		// 				)
		// 			)
		// 		)
		// 	)
		// 	.leftJoin(userToUser1, eq(userToUser1.user1Id, user.id))
		// 	.leftJoin(followersTable, eq(followersTable.id, userToUser1.user2Id))
		// 	.leftJoin(userToUser2, eq(userToUser2.user2Id, user.id))
		// 	.leftJoin(followingTable, eq(followingTable.id, userToUser2.user1Id))
		// 	.groupBy(user.id);
		// using CTEs instead of subqueries
		// const followersTableCTE = locals.db.$with('followersTableCTE').as(
		// 	locals.db
		// 		.select({
		// 			id: user.id,
		// 			username: user.username,
		// 			avatar: user.avatar,
		// 			isPrivate: user.isPrivate,
		// 			followers: sql`JSON_ARRAYAGG(JSON_OBJECT('id', ${followersTable}.id, 'username', ${followersTable}.username, 'avatar', ${followersTable}.avatar, 'isPrivate', ${followersTable}.isPrivate))`
		// 		})
		// 		.from(user)
		// 		.where(
		// 			and(
		// 				eq(user.username, slug),
		// 				or(
		// 					eq(user.isPrivate, false),
		// 					eq(user.id, session.user.userId),
		// 					exists(
		// 						locals.db
		// 							.select()
		// 							.from(userToUser)
		// 							.where(
		// 								and(
		// 									eq(userToUser.user2Id, session.user.userId),
		// 									eq(userToUser.user1Id, user.id)
		// 								)
		// 							)
		// 					)
		// 				)
		// 			)
		// 		)
		// 		.leftJoin(userToUser1, eq(userToUser1.user1Id, user.id))
		// 		.leftJoin(followersTable, eq(followersTable.id, userToUser1.user2Id))
		// );
		// const matches = await locals.db
		// 	.with(followersTableCTE)
		// 	.select()
		// 	.from(followersTableCTE)
		// 	.leftJoin(userToUser2, eq(userToUser2.user2Id, user.id))
		// 	.leftJoin(followingTable, eq(followingTable.id, userToUser2.user1Id));
		matches = await locals.db.query.user.findMany({
			where: (user, { eq, and, or, exists }) =>
				and(
					eq(user.username, slug),
					or(
						eq(user.isPrivate, false),
						eq(user.id, session.user.userId),
						exists(
							locals.db
								.select()
								.from(userToUser)
								.where(
									and(eq(userToUser.user2Id, session.user.userId), eq(userToUser.user1Id, user.id))
								)
						)
					)
				),
			with: {
				followers: {
					columns: {
						user1Id: false,
						user2Id: false
					},
					with: {
						following: true
					}
				},
				following: {
					columns: {
						user1Id: false,
						user2Id: false
					},
					with: {
						follower: true
					}
				},
				userToPost: {
					columns: {
						userId: false,
						postId: false
					},
					with: {
						post: {
							with : {
								comment: true
							}
						}
					}
				}
			}
		});
	}
	if (!matches || matches.length === 0) {
		error(404, 'User not found');
	} else {
		matches = matches[0];
		// aggregate followers and following and posts
		matches.followers = matches.followers.map((follower:any) => follower.following);
		matches.following = matches.following.map((following:any) => following.follower);
		matches.userToPost = matches.userToPost.map((post:any) => {
			// aggregate comments
			post.post.comment = post.post.comment.map((comment:any) => comment);
			return post.post;
		});
		console.log(matches);
	}
	// // get all posts
	// const posts = await locals.db
	// 	.select()
	// 	.from(userToPost)
	// 	.where(eq(userToPost.userId, matches.id))
	// 	.leftJoin(post, eq(userToPost.postId, post.id));
	// console.log(posts);
	// // get all followers
	// const followers = await locals.db
	// 	.select()
	// 	.from(userToUser)
	// 	.where(eq(userToUser.user2Id, matches.id))
	// 	.leftJoin(user, eq(userToUser.user1Id, user.id));
	// // get all following
	// const following = await locals.db
	// 	.select()
	// 	.from(userToUser)
	// 	.where(eq(userToUser.user1Id, matches.id))
	// 	.leftJoin(user, eq(userToUser.user2Id, user.id));
	// console.log(followers, following);
};
