import { auth } from '$lib/server/lucia.js';
import { user } from '$lib/server/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { CLOUDINARY_API_SECRET } from '$env/static/private';
import { v2 as cloudinary } from 'cloudinary';
import { PUBLIC_CLOUDINARY_API_KEY } from '$env/static/public';

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
