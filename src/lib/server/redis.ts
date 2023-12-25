import { REDIS_URL } from '$env/static/private';
import { Redis } from 'ioredis';

const redis = new Redis(REDIS_URL);

export default redis;
