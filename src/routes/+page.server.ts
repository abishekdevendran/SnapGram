import { auth } from '$lib/server/lucia.js';
import { fail, redirect } from '@sveltejs/kit';

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
	updateAvatar: async ({ locals }) => {},
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId); // invalidate session
		locals.auth.setSession(null); // remove cookie
		throw redirect(302, '/'); // redirect to login page
	}
};
