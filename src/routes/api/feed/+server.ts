import fetchFeed from '$lib/server/queries/feedPost.js';
import { json } from '@sveltejs/kit';

const PAGE_SIZE = 10;

export const GET = async ({ locals, url, setHeaders }) => {
	const session = await locals.auth.validate();
	// get optional query params
	const page = parseInt(url.searchParams.get('page') ?? '0');
	const limit = parseInt(url.searchParams.get('limit') ?? PAGE_SIZE.toString());
	const feed = await fetchFeed({ locals, session, page: page ?? 0, limit: limit ?? PAGE_SIZE });
	// set cache headers for 2 minutes
	setHeaders({
		'Cache-Control': 'public, max-age=120'
	});
	return json({
		feed,
		page
	});
};
