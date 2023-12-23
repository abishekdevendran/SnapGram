import { auth } from '$lib/server/lucia.js';
import { post, user } from '$lib/server/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { CLOUDINARY_API_SECRET } from '$env/static/private';
import { v2 as cloudinary } from 'cloudinary';
import { PUBLIC_CLOUDINARY_API_KEY } from '$env/static/public';
import type { feedPost } from '$lib/index.d';

export const load = async ({ locals }) => {
	// await auth hook
	const session = await locals.auth.validate();
	if (!session) {
		return {};
	}
	// get all posts whose atleast 1 tag is in the user's following list
	const posts = await locals.db.query.user.findMany({
		where: (user, { eq }) => eq(user.id, session.user.userId),
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
	});
	// console.log(posts[0].following[0].follower.userToPost[0].post);
	// consolidate all posts into a single array
	const feed: feedPost[] = [];
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
	// console.log(feed[0]);
	return {
		user: session.user,
		feed
	};
	// generate a signed upload URL if user is authenticated
};

export const actions = {
	updateAvatar: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		const formData = await request.formData();
		const avatar = formData.get('avatar') as string | null;
		if (!avatar) return fail(400);
		try {
			// delete old avatar from cloudinary
			const oldAvatar = session.user.avatar;
			if (oldAvatar) {
				const publicId = 'avatars/' + oldAvatar.split('/').slice(-1)[0].split('.')[0];
				console.log(publicId, ' is the public id');
				cloudinary.config({
					api_secret: CLOUDINARY_API_SECRET,
					api_key: PUBLIC_CLOUDINARY_API_KEY,
					cloud_name: 'snapgram'
				});
				await cloudinary.uploader.destroy(
					publicId,
					{
						invalidate: true,
						resource_type: 'image',
						type: 'upload'
					},
					(err, res) => {
						console.log(err, res);
					}
				);
			}
			await locals.db.update(user).set({ avatar }).where(eq(user.id, session.user.userId));
		} catch (e) {
			console.log(e);
			return fail(400);
		}
	},
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId); // invalidate session
		locals.auth.setSession(null); // remove cookie
		throw redirect(302, '/'); // redirect to login page
	}
};
