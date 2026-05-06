import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL
});
console.log("redis url : ",process.env.REDIS_URL);

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
try {
  await redisClient.connect();
  console.log("Redis connected");
} catch (err) {
  console.error("Redis connection failed", err);
  process.exit(1);
}
export default redisClient;
