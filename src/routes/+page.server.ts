import { auth } from '$lib/server/lucia.js';
import { user } from '$lib/server/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { CLOUDINARY_API_SECRET } from '$env/static/private';
import { v2 as cloudinary } from 'cloudinary';
import { PUBLIC_CLOUDINARY_API_KEY } from '$env/static/public';
import fetchFeed from '$lib/server/queries/feedPost.js';

export const load = async ({ locals, parent }) => {
	// await auth hook
	const session = await locals.auth.validate();
	// console.log(feed[0]);
	const { queryClient } = await parent();
	// TODO: offload fetchFeed to a separate API endpoint and cache responses, forward set-Headers to client
	await queryClient.prefetchQuery({
		queryKey: ['feed', session?.user?.userId || ''],
		queryFn: async () => (await fetchFeed({ locals, session }))
	});
	return {
		user: session ? session.user : null
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
