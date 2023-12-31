import { followRequest, post, user, userToPost, userToUser, type TUser, type TPost } from '$lib/server/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, type InferSelectModel } from 'drizzle-orm';

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
	let matches: any;
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
						post: {
							with: {
								comments: true
							}
						}
					}
				}
			}
		});
	} else {
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
							with: {
								comments: true
							}
						}
					}
				}
			}
		});
	}
	//  get all pending follow requests
	let pendingFollowRequests: InferSelectModel<typeof followRequest>[] = [];
	if (session) {
		pendingFollowRequests = await locals.db.query.followRequest.findMany({
			where: (followRequest, { eq }) => eq(followRequest.followerId, session!.user.userId)
		});
	}
	// if not self
	let following: TUser[] = [];
	if (session && session.user.username !== slug) {
		// get all following list
		const resp = await locals.db.query.userToUser.findMany({
			where: (userToUser, { eq }) => eq(userToUser.user2Id, session!.user.userId),
			columns: {
				user1Id: false,
				user2Id: false
			},
			with: {
				follower: true
			}
		});
		following = resp.map((userToUser) => userToUser.follower);
	} else {
		following = matches[0]?.following ?? [];
	}

	if (!matches || matches.length === 0) {
		// get a skinned down version of user if user exists at all
		const userExists = await locals.db.query.user.findMany({
			where: (user, { eq }) => eq(user.username, slug)
		});
		if (!userExists || userExists.length === 0) {
			error(404, 'No such user exists');
		}
		return {
			user: userExists[0],
			self: session && session.user,
			isSelf: false,
			pendingFollowRequests,
			following
		};
	} else {
		matches = matches[0];
		// aggregate followers and following and posts
		matches.followers = matches.followers.map((follower: any) => follower.following);
		matches.following = matches.following.map((following: any) => following.follower);
		matches.post = matches.userToPost.map((post: any) => {
			// aggregate comments
			post.post.comment = post.post.comments.map((comment: any) => comment);
			return post.post;
		});
		matches.userToPost = undefined;
		const ans: TUser & {
			followers: TUser[];
			following: TUser[];
			post: TPost[];
		} = matches;
		return {
			user: ans,
			self: session && session.user,
			isSelf: session && session.user.userId === ans.id,
			pendingFollowRequests,
			following
		};
	}
};

export const actions = {
	follow: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session)
			return fail(401, {
				message: 'Sign in to follow users'
			});
		const formData = await request.formData();
		const userId = formData.get('userId') as string | null;
		if (!userId) return fail(400);
		try {
			const user = await locals.db.query.user.findFirst({
				where: (user, { eq }) => eq(user.id, userId)
			});
			if (!user) return fail(400);
			if (!user.isPrivate) {
				// check if already following
				const userToUserRes = await locals.db.query.userToUser.findFirst({
					where: (userToUser, { and, eq }) =>
						and(eq(userToUser.user2Id, session.user.userId), eq(userToUser.user1Id, user.id))
				});
				if (userToUserRes) {
					// delete follow
					await locals.db
						.delete(userToUser)
						.where(
							and(
								eq(userToUser.user1Id, userToUserRes.user1Id),
								eq(userToUser.user2Id, userToUserRes.user2Id)
							)
						);
					// return success
					return {
						message: 'Unfollowed'
					};
				} else {
					await locals.db.insert(userToUser).values({
						user2Id: session.user.userId,
						user1Id: user.id
					});
					return {
						message: 'Followed'
					};
				}
			} else {
				// check if follow request already exists
				const followRequestRes = await locals.db.query.followRequest.findFirst({
					where: (followRequest, { and, eq }) =>
						and(
							eq(followRequest.followerId, session.user.userId),
							eq(followRequest.followingId, user.id)
						)
				});
				if (followRequestRes) {
					// delete follow request
					await locals.db
						.delete(followRequest)
						.where(
							and(
								eq(followRequest.followerId, followRequestRes.followerId),
								eq(followRequest.followingId, followRequestRes.followingId)
							)
						);
					// return success
					return {
						message: 'Follow request deleted'
					};
				} else {
					await locals.db.insert(followRequest).values({
						followerId: session.user.userId,
						followingId: user.id
					});
					return {
						message: 'Follow request sent'
					};
				}
			}
		} catch (e) {
			console.log(e);
			return fail(400);
		}
	},
	updateProfile: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session)
			return fail(401, {
				message: 'Sign in to update profile'
			});
		const formData = await request.formData();
		const formDataObj = Object.fromEntries(formData.entries());
		const { username, bio, isPrivate } = formDataObj as unknown as {
			username: string | undefined;
			bio: string | undefined;
			isPrivate: boolean | undefined;
		};
		console.log(username, bio, isPrivate);
		try {
			await locals.db
				.update(user)
				.set({
					...(username && { username }),
					...(bio && { bio }),
					isPrivate: isPrivate ? true : false
				})
				.where(eq(user.id, session.user.userId));
		} catch (e) {
			console.log(e);
			return fail(400);
		}
		redirect(302, `/${username}`);
	}
};
