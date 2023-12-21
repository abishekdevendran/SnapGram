import connection from '$lib/server/mysql';
import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle(connection);

export default db;
