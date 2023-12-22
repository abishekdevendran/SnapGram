import { user, userToUser } from '$lib/server/schema.js';
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
		matches = await locals.db.query.user.findFirst({
			with: {
				userToPost: true
			},
			where: (user, { eq }) => eq(user.isPrivate, false)
		});
	} else {
		matches = await locals.db
			.select()
			.from(user)
			.where(
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
			.leftJoin(userToUser, eq(user.id, userToUser.user2Id));
	}
	console.log(matches);
};
