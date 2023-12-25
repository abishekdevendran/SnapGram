import type { feedPost } from '$lib/index.d';
import { userToPost, userToUser } from '$lib/server/schema';
import { and, desc, sql } from 'drizzle-orm';
import type { Session } from 'lucia';

export default async function fetchFeed({
	locals,
	session,
	page = 0,
	limit = 10
}: {
	locals: App.Locals;
	session: Session | null;
	page?: number;
	limit?: number;
}) {
	// if (session) {
	// 	const preparedTempPosts = locals.db.query.post
	// 		.findMany({
	// 			orderBy: (post, { asc, desc }) => [desc(post.createdAt)],
	// 			where: (post, { eq, exists, and }) =>
	// 				exists(
	// 					locals.db
	// 						.select()
	// 						.from(userToPost)
	// 						.where(
	// 							and(
	// 								exists(
	// 									locals.db
	// 										.select()
	// 										.from(userToUser)
	// 										.where(
	// 											and(
	// 												eq(userToUser.user2Id, sql.placeholder('sessionUserId')),
	// 												eq(userToUser.user1Id, userToPost.userId)
	// 											)
	// 										)
	// 								),
	// 								eq(userToPost.postId, post.id)
	// 							)
	// 						)
	// 				),
	// 			with: {
	// 				comments: true,
	// 				userToPost: {
	// 					with: {
	// 						user: {
	// 							columns: {
	// 								avatar: true,
	// 								username: true
	// 							}
	// 						}
	// 					}
	// 				}
	// 			}
	// 		})
	// 		.prepare();
	// 	let tempPosts = await preparedTempPosts.execute({
	// 		sessionUserId: session.user.userId
	// 	});
	// 	tempPosts = tempPosts.map((post) => {
	// 		// modify post to flatten the object
	// 		// @ts-ignore
	// 		post.authors = post.userToPost.map((userToPost) => {
	// 			return {
	// 				username: userToPost.user.username,
	// 				avatar: userToPost.user.avatar
	// 			};
	// 		});
	// 		// @ts-ignore
	// 		delete post.userToPost;
	// 		return post;
	// 	});
	// 	console.log(tempPosts[0]);
	// }
	if (!session) {
		// get all public posts
		const preparedPosts = locals.db.query.user
			.findMany({
				where: (user, { eq }) => eq(user.isPrivate, false),
				columns: {
					id: false,
					isPrivate: false,
					avatar: false,
					username: false
				},
				with: {
					userToPost: {
						columns: {
							userId: false,
							postId: false
						},
						with: {
							post: {
								columns: {
									createdAt: true,
									id: true,
									image: true,
									likes: true
								},
								with: {
									comments: true,
									userToPost: {
										columns: {
											userId: false,
											postId: false
										},
										with: {
											user: {
												columns: {
													avatar: true,
													username: true
												}
											}
										}
									}
								}
							}
						}
					}
				}
			})
			.prepare();
		const posts = await preparedPosts.execute();
		let feed: feedPost[] = [];
		posts.forEach((post) => {
			post.userToPost.forEach((userToPost) => {
				// modify post to flatten the object
				// console.log(userToPost);
				// @ts-ignore
				userToPost.post.authors = userToPost.post.userToPost.map((userToPost) => {
					return {
						username: userToPost.user.username,
						avatar: userToPost.user.avatar
					};
				});
				// @ts-ignore
				delete userToPost.post.userToPost;
				// @ts-ignore
				feed.push(userToPost.post);
			});
		});
		// cutoff posts that are not in the current page
		feed = feed.slice(page * limit, page * limit + limit);
		return feed;
	}
	// get all posts whose atleast 1 tag is in the user's following list
	const preparedPosts = locals.db.query.post
		.findMany({
			orderBy: (post, { asc, desc }) => [desc(post.createdAt)],
			where: (post, { eq, exists, and }) =>
				exists(
					locals.db
						.select()
						.from(userToPost)
						.where(
							and(
								exists(
									locals.db
										.select()
										.from(userToUser)
										.where(
											and(
												eq(userToUser.user2Id, sql.placeholder('sessionUserId')),
												eq(userToUser.user1Id, userToPost.userId)
											)
										)
								),
								eq(userToPost.postId, post.id)
							)
						)
				),
			with: {
				comments: true,
				userToPost: {
					with: {
						user: {
							columns: {
								avatar: true,
								username: true
							}
						}
					}
				}
			}
		})
		.prepare();
	let posts = await preparedPosts.execute({
		sessionUserId: session.user.userId
	});
	// console.log(posts[0].following[0].follower.userToPost[0].post);
	// consolidate all posts into a single array
	posts = posts.map((post) => {
		// modify post to flatten the object
		// @ts-ignore
		post.authors = post.userToPost.map((userToPost) => {
			return {
				username: userToPost.user.username,
				avatar: userToPost.user.avatar
			};
		});
		// @ts-ignore
		delete post.userToPost;
		return post;
	});
	// cutoff posts that are not in the current page
	posts = posts.slice(page * limit, page * limit + limit);
	return posts;
}
