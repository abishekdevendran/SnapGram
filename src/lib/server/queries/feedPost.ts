import type { feedPost } from '$lib/index.d';
import { sql } from 'drizzle-orm';
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
									comment: true,
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
	const preparedPosts = locals.db.query.user
		.findMany({
			where: (user, { eq }) => eq(user.id, sql.placeholder('sessionUserId')),
			offset: page * limit,
			limit,
			with: {
				following: {
					columns: {
						user1Id: false,
						user2Id: false
					},
					with: {
						follower: {
							columns: {
								avatar: true,
								id: false,
								isPrivate: false,
								username: true
							},
							with: {
								userToPost: {
									columns: {
										userId: false,
										postId: false
									},
									with: {
										post: {
											with: {
												comment: true,
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
						}
					}
				}
			}
		})
		.prepare();
	const posts = await preparedPosts.execute({
		sessionUserId: session.user.userId
	});
	// console.log(posts[0].following[0].follower.userToPost[0].post);
	// consolidate all posts into a single array
	let feed: feedPost[] = [];
	posts.forEach((user) => {
		user.following.forEach((following) => {
			following.follower.userToPost.forEach((post) => {
				// modify post to flatten the object
				// @ts-ignore
				post.post.authors = post.post.userToPost.map((userToPost) => {
					return {
						username: userToPost.user.username,
						avatar: userToPost.user.avatar
					};
				});
				// @ts-ignore
				delete post.post.userToPost;
				// @ts-ignore
				feed.push(post.post);
			});
		});
	});
	// sort by timestamp
	feed.sort((a, b) => {
		return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
	});
	// cutoff posts that are not in the current page
	feed = feed.splice(page * limit, limit);
	return feed;
}
