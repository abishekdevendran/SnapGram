// src/lib/server/lucia.ts
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { mysql2 } from '@lucia-auth/adapter-mysql';
import connection from '$lib/server/mysql';
import { github } from '@lucia-auth/oauth/providers';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

// expect error (see next section)
export const auth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: mysql2(connection, {
		key: 'key',
		session: 'session',
		user: 'user'
	}),
	getUserAttributes: (data) => {
		return {
			username: data.username,
			avatar: data.avatar
		};
	}
});

export const githubAuth = github(auth, {
	clientId: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET
});

export type Auth = typeof auth;
