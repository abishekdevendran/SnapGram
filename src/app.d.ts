/// <reference types="lucia" />
import 'vite-plugin-pwa/svelte';
import 'vite-plugin-pwa/info';
import 'vite-plugin-pwa/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '$lib/server/schema';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare const __DATE__: string;
	declare const __RELOAD_SW__: boolean;
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
			bio: string;
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};
