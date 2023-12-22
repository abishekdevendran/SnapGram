import { post, user, userToPost, userToUser } from '$lib/server/schema.js';
import { error } from '@sveltejs/kit';
import { and, eq, exists, or } from 'drizzle-orm';

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
	let matches;
	if (!session) {
		matches = await locals.db.query.user.findMany({
			where: (user, { eq, and }) => and(eq(user.isPrivate, false), eq(user.username, slug))
		});
	} else {
		matches = await locals.db
			.select()
			.from(user)
			.where(
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
				)
			)
			.limit(1);
	}
	if (!matches) {
		error(404, 'User not found');
	} else {
		matches = matches[0];
		console.log(matches);
	}
	// get all posts
	const posts = await locals.db
		.select()
		.from(userToPost)
		.where(eq(userToPost.userId, matches.id))
		.leftJoin(post, eq(userToPost.postId, post.id));
	console.log(posts);
  // get all followers
  const followers = await locals.db.select().from(userToUser).where(eq(userToUser.user2Id, matches.id)).leftJoin(user, eq(userToUser.user1Id, user.id));
  // get all following
  const following = await locals.db.select().from(userToUser).where(eq(userToUser.user1Id, matches.id)).leftJoin(user, eq(userToUser.user2Id, user.id));
  console.log(followers, following);
};
