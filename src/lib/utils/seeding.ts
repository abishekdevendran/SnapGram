import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2';
import dotenv from 'dotenv';
import * as schema from '$lib/server/schema.js';
import { faker } from '@faker-js/faker';
import type { InferSelectModel } from 'drizzle-orm';

dotenv.config();

const connection = createConnection({
	uri: process.env.MYSQL_URI
});

const db = drizzle(connection, { schema, mode: 'default' });

type User = InferSelectModel<typeof schema.user>;
type Post = InferSelectModel<typeof schema.post>;
type UserToPost = InferSelectModel<typeof schema.userToPost>;
type UserToUser = InferSelectModel<typeof schema.userToUser>;
// seed multiple users first
const seedUsers = async () => {
	let usersObj: User[] = [];
	for (let i = 0; i < 50; i++) {
		usersObj.push({
			id: faker.string.alphanumeric(15),
			username: faker.internet.userName(),
			isPrivate: faker.datatype.boolean(),
			avatar: faker.image.avatar()
		});
	}
	// insert users
	await db.insert(schema.user).values(usersObj);
	await connection.end();
	console.log(`Inserted ${usersObj.length} users successfully 🎉`);
};

const seedPosts = async () => {
	// get all users
	const users = await db.select().from(schema.user);
	// create posts
	const posts: Post[] = users.map((user) => {
		return {
			id: faker.string.alphanumeric(15),
			image: faker.image.url(),
			likes: faker.number.int(100)
		};
	});
	// insert posts
	await db.insert(schema.post).values(posts);
	// insert userToPost
	const userToPost: UserToPost[] = posts.map((post, index) => {
		return {
			userId: users[index].id,
			postId: post.id
		};
	});
	await db.insert(schema.userToPost).values(userToPost);
	await connection.end();
	console.log(`Inserted ${posts.length} posts successfully 🎉`);
};

const seedFollowers = async () => {
	// get all users
	const users = await db.select().from(schema.user);
	// every user user follows the next 3 users
	const userToUser: UserToUser[] = [];
	for (let i = 0; i < users.length; i++) {
		for (let j = 1; j <= 3; j++) {
			userToUser.push({
				user1Id: users[i].id,
				user2Id: users[(i + j) % users.length].id
			});
		}
	}
	await db.insert(schema.userToUser).values(userToUser);
	await connection.end();
	console.log(`Inserted ${userToUser.length} followers successfully 🎉`);
};
