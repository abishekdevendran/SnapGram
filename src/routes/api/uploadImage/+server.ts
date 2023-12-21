import { CLOUDINARY_API_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';

export const GET = async ({ locals, url }) => {
	console.log('GET /api/uploadImage');
	const timestamp = url.searchParams.get('timestamp');
	const folder = url.searchParams.get('folder');
	const custom_coordinates = url.searchParams.get('custom_coordinates');
	const upload_preset = url.searchParams.get('upload_preset');
	if (!timestamp || !folder || !custom_coordinates || !upload_preset)
		return new Response(null, { status: 400 });

	const session = await locals.auth.validate();
	if (!session) return new Response(null, { status: 401 });

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder, custom_coordinates, source: 'uw', upload_preset },
		CLOUDINARY_API_SECRET
	);
	return json({ signature });
};
