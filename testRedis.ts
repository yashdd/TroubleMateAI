import redisClient from './utils/redisClient';

const testRedisConnection = async () => {
  try {
    await redisClient.connect();

    await redisClient.set('test:key', '✅ Redis Connected Successfully');
    const value = await redisClient.get('test:key');

    console.log('Redis Test Key Value:', value);

    await redisClient.del('test:key'); // optional cleanup
    await redisClient.disconnect();
  } catch (err) {
    console.error('❌ Redis connection test failed:', err);
  }
};

testRedisConnection();
