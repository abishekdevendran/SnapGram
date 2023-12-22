import { auth } from '$lib/server/lucia.js';
import { user } from '$lib/server/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	// await auth hook
	const session = await locals.auth.validate();
	if (!session) {
		return {};
	}
	return {
		user: session.user
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
		console.log(avatar);
		try {
			await locals.db.update(user).set({ avatar }).where(eq(user.id, session.user.userId));
			// also update session
			await auth.updateSessionAttributes(session.sessionId, { avatar });
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
