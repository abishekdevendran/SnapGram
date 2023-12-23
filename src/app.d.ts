/// <reference types="lucia" />

import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '$lib/server/schema';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('lucia').AuthRequest;
			db: MySql2Database<typeof schema>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth;
		type DatabaseUserAttributes = {
			username: string;
			avatar: string | null;
			isPrivate: boolean;
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};
