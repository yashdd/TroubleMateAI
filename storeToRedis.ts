import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import redisClient from './utils/redisClient';
import { fileURLToPath } from 'url';
dotenv.config();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'scraper', 'data');

const loadJSON = (filename: string) => {
  const file = path.join(dataPath, filename);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const storeToRedis = async () => {
  try {
    await redisClient.connect();

    const stackData = loadJSON('stackoverflow_data.json');
    for (const item of stackData) {
      await redisClient.set(`stack:question:${item.id}`, JSON.stringify(item));
    }

    const githubData = loadJSON('github_issues.json');
    for (const issue of githubData) {
      await redisClient.set(`github:issue:${issue.id}`, JSON.stringify(issue));
    }

    const redditData = loadJSON('reddit_posts.json');
    for (const post of redditData) {
      await redisClient.set(`reddit:post:${post.id}`, JSON.stringify(post));
    }

    console.log('✅ All data stored successfully in Redis');
  } catch (err) {
    console.error('❌ Failed to store data:', err);
  } finally {
    await redisClient.disconnect();
  }
};

storeToRedis();
