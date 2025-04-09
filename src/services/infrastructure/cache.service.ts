import Redis from "ioredis";
import logger from "src/utils/logger";

class CacheService {
  protected client: Redis;
  constructor() {
    this.client = new Redis({
      port: 6379,
      host: '0.0.0.0',
      db: 0
    })
  }

  async set(key: string, value: any, ttl?: number) {
    try {
      logger.info(`Set Redis key: ${key}`);
      await this.client.set(key, JSON.stringify(value), 'EX', ttl || 3600);
    } catch (error) {
      console.error('Error setting key:', error);
    }
  }

  async get(key: string) {
    try {
      const result = await this.client.get(key);
      logger.info(`Get Redis key: ${key}`);
      return result;
    } catch (error) {
      console.error('Error getting key:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const result = await this.client.del(key);
      logger.info(`Deleted ${result} key(s).`);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  }
}

export default CacheService;