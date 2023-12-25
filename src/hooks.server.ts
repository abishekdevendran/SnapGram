// src/hooks.server.ts
import { auth } from '$lib/server/lucia';
import connection from '$lib/server/mysql';
import type { Handle } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '$lib/server/schema';
import redis from '$lib/server/redis';

export const handle: Handle = async ({ event, resolve }) => {
	// we can pass `event` because we used the SvelteKit middleware
	event.locals.auth = auth.handleRequest(event);
	event.locals.db = drizzle(connection, { schema, mode: 'default' });
	event.locals.redis = redis;
	return await resolve(event);
};
