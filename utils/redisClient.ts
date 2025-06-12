// src/utils/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  username: 'default', // usually 'default' for Redis Cloud
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export default redisClient;
