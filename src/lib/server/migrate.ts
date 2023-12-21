import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createConnection } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = createConnection({
	uri: process.env.MYSQL_URI
});
const db = drizzle(connection);

await migrate(db, { migrationsFolder: 'drizzle' });
await connection.end();

console.log('Migrated successfully 🎉');
