import type { feedPost } from '$lib/types';
import { user, userToPost, userToUser } from '$lib/server/schema';
import { and, desc, sql } from 'drizzle-orm';
import type { Session } from 'lucia';

const cacheDuration = 60 * 5; // 5 minutes

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
}): Promise<feedPost[]> {
	// check if for the same session user, page and limit, the feed has already been cached
	const key = `feed:${session?.user.userId}:${page}:${limit}`;
	const cachedFeed = await locals.redis.get(key);
	if (cachedFeed) {
		console.log(JSON.parse(cachedFeed));
		return JSON.parse(cachedFeed);
	}
	if (!session) {
		// get all public posts
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
											.from(user)
											.where(and(eq(user.id, userToPost.userId), eq(user.isPrivate, false)))
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
				},
				limit: limit,
				offset: page * limit
			})
			.prepare();
		let posts = await preparedPosts.execute().then((posts) => {
			const temp = posts.map((post) => {
				const modifiedPost = {
					...post,
					authors: post.userToPost.map((userToPost) => ({
						username: userToPost.user.username,
						avatar: userToPost.user.avatar
					}))
				};
				// Use destructuring to omit the property
				const { userToPost, ...result } = modifiedPost;
				return modifiedPost as feedPost; // Assert the type here
			});
			return temp;
		});
		// cache the feed for given time
		await locals.redis.set(key, JSON.stringify(posts), 'EX', cacheDuration);
		// console.log(posts);
		return posts;
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
					columns: {
						postId: false,
						userId: false
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
			},
			limit: limit,
			offset: page * limit
		})
		.prepare();
	let posts: feedPost[] = await preparedPosts
		.execute({
			sessionUserId: session.user.userId
		})
		.then((posts) => {
			const temp = posts.map((post) => {
				const modifiedPost = {
					...post,
					authors: post.userToPost.map((userToPost) => ({
						username: userToPost.user.username,
						avatar: userToPost.user.avatar
					}))
				};
				// Use destructuring to omit the property
				const { userToPost, ...result } = modifiedPost;
				return modifiedPost as feedPost; // Assert the type here
			});
			return temp;
		});
	// cache the feed for given time
	await locals.redis.set(key, JSON.stringify(posts), 'EX', cacheDuration);
	// cutoff posts that are not in the current page
	// console.log(posts);
	return posts;
}
