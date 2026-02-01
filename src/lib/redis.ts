/**
 * Redis client for caching link data
 * Uses Upstash Redis REST API for edge-compatible caching
 */
import type { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;
let RedisClass: typeof Redis | null = null;
let importAttempted = false;
let importFailed = false;

// Dynamically import Redis to handle cases where package isn't installed
const getRedisClient = async (): Promise<Redis | null> => {
  // Return existing client if already initialized
  if (redisClient) {
    return redisClient;
  }

  // If import already failed, don't try again
  if (importFailed) {
    return null;
  }

  // Check if Redis credentials are configured
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Silently return null if not configured (don't log warning on every call)
    return null;
  }

  // Try to import Redis dynamically (only once)
  if (!RedisClass && !importAttempted) {
    importAttempted = true;
    try {
      const redisModule = await import("@upstash/redis");
      RedisClass = redisModule.Redis;
    } catch {
      // Package not installed or import failed - only log once
      console.warn("⚠️ @upstash/redis package not found. Caching disabled. Install it with: npm install @upstash/redis");
      importFailed = true;
      return null;
    }
  }

  // If import failed, return null
  if (!RedisClass) {
    return null;
  }

  try {
    redisClient = new RedisClass({
      url: url.trim(),
      token: token.trim(),
    });
    return redisClient;
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    return null;
  }
};

/**
 * Cache key prefix for link data
 */
const LINK_CACHE_PREFIX = "link:";
const LINK_METADATA_PREFIX = "link:meta:";

/**
 * Get cache key for a link by shortCode
 */
const getLinkCacheKey = (shortCode: string): string => {
  return `${LINK_CACHE_PREFIX}${shortCode}`;
};

/**
 * Get cache key for link metadata by shortCode
 */
const getLinkMetadataCacheKey = (shortCode: string): string => {
  return `${LINK_METADATA_PREFIX}${shortCode}`;
};

/**
 * Cache TTL (Time To Live) in seconds
 * Links are cached for 24 hours, metadata for 1 hour
 */
const LINK_CACHE_TTL = 60 * 60 * 24; // 24 hours
const METADATA_CACHE_TTL = 60 * 60; // 1 hour

/**
 * Link data structure for caching
 */
export interface CachedLink {
  id: string;
  workspaceId: string;
  shortCode: string;
  longUrl: string;
  clickCount: number;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  tags: string | null;
  type: "standard" | "upi";
  upiVpa: string | null;
  upiName: string | null;
  upiAmount: string | null;
  upiNote: string | null;
  createdAt: string;
}

/**
 * Link metadata structure for caching
 */
export interface CachedLinkMetadata {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  type: "standard" | "upi";
  upiVpa: string | null;
  upiName: string | null;
  upiAmount: string | null;
  upiNote: string | null;
}

/**
 * Get link data from cache
 */
export const getCachedLink = async (shortCode: string): Promise<CachedLink | null> => {
  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<CachedLink>(getLinkCacheKey(shortCode));
    return cached || null;
  } catch (error) {
    console.error(`Failed to get cached link for ${shortCode}:`, error);
    return null;
  }
};

/**
 * Cache link data
 */
export const cacheLink = async (link: CachedLink): Promise<void> => {
  const redis = await getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.setex(getLinkCacheKey(link.shortCode), LINK_CACHE_TTL, link);
  } catch (error) {
    console.error(`Failed to cache link ${link.shortCode}:`, error);
  }
};

/**
 * Get link metadata from cache
 */
export const getCachedLinkMetadata = async (shortCode: string): Promise<CachedLinkMetadata | null> => {
  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<CachedLinkMetadata>(getLinkMetadataCacheKey(shortCode));
    return cached || null;
  } catch (error) {
    console.error(`Failed to get cached metadata for ${shortCode}:`, error);
    return null;
  }
};

/**
 * Cache link metadata
 */
export const cacheLinkMetadata = async (shortCode: string, metadata: CachedLinkMetadata): Promise<void> => {
  const redis = await getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.setex(getLinkMetadataCacheKey(shortCode), METADATA_CACHE_TTL, metadata);
  } catch (error) {
    console.error(`Failed to cache metadata for ${shortCode}:`, error);
  }
};

/**
 * Invalidate link cache (delete from Redis)
 * Call this when a link is updated or deleted
 */
export const invalidateLinkCache = async (shortCode: string): Promise<void> => {
  const redis = await getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await Promise.all([
      redis.del(getLinkCacheKey(shortCode)),
      redis.del(getLinkMetadataCacheKey(shortCode)),
    ]);
  } catch (error) {
    console.error(`Failed to invalidate cache for ${shortCode}:`, error);
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  const client = await getRedisClient();
  return client !== null;
};
