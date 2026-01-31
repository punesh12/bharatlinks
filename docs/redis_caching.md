# Redis Caching Implementation

## Overview

Redis caching has been implemented to provide high-performance link redirection with sub-50ms latency. The caching layer uses Upstash Redis REST API, which is edge-compatible and works seamlessly with Next.js serverless functions.

## Architecture

```
User Request → [shortCode] Page
  ↓
Check Redis Cache (link:{shortCode})
  ↓
Cache Hit? → Yes → Redirect (<50ms)
  ↓ No
Query PostgreSQL Database
  ↓
Cache Result in Redis
  ↓
Redirect to Destination URL
```

## Implementation Details

### Cache Structure

**Link Data Cache** (`link:{shortCode}`)
- **TTL**: 24 hours
- **Contains**: Full link data including URL, metadata, UPI fields, click count
- **Used for**: Fast link redirection

**Link Metadata Cache** (`link:meta:{shortCode}`)
- **TTL**: 1 hour
- **Contains**: Title, description, image URL, UPI fields
- **Used for**: Fast metadata generation for SEO and social sharing

### Cache Operations

#### 1. Link Creation
- Link data is cached immediately after creation
- Metadata is cached separately for faster metadata generation
- Both caches are populated asynchronously (non-blocking)

#### 2. Link Update
- Cache is invalidated (both link and metadata)
- Updated data is re-cached immediately
- Ensures users always see the latest data

#### 3. Link Deletion
- Both link and metadata caches are invalidated
- Prevents stale data from being served

#### 4. Link Redirection
- Checks Redis cache first
- Falls back to database if cache miss
- Caches result for future requests

### Redis Client

The Redis client is implemented with:
- **Dynamic Import**: Only imports `@upstash/redis` when needed
- **Graceful Degradation**: Works without Redis (falls back to database)
- **Singleton Pattern**: Single Redis client instance per serverless function
- **Error Handling**: Comprehensive error handling with logging

### Configuration

Add to your `.env` file:

```env
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

**Note**: Redis is optional. The application works without it, but caching provides significant performance improvements.

## Performance Benefits

- **Sub-50ms redirects**: Cache hits are extremely fast
- **Reduced database load**: Most redirects don't hit the database
- **Better scalability**: Can handle high traffic without database bottlenecks
- **Improved SEO**: Faster metadata generation for social sharing

## Cache Invalidation Strategy

Cache is automatically invalidated when:
- Link is updated (both caches cleared and re-populated)
- Link is deleted (both caches cleared)
- Link is created (caches populated immediately)

## Error Handling

- Cache failures don't block functionality
- Errors are logged but don't affect user experience
- Application gracefully falls back to database queries
- Non-blocking cache operations prevent delays

## Future Enhancements

1. **Edge Middleware**: Move redirect logic to Vercel Edge Middleware for even faster redirects
2. **Cache Warming**: Pre-cache popular links
3. **Cache Statistics**: Monitor hit/miss rates
4. **Bulk Operations**: Batch cache operations for multiple links
5. **Cache Versioning**: Handle schema changes gracefully

## Installation

To enable Redis caching:

1. Install the package:
   ```bash
   npm install @upstash/redis
   ```

2. Set up Upstash Redis:
   - Create account at https://upstash.com
   - Create a Redis database (Mumbai region recommended)
   - Copy REST URL and Token

3. Add credentials to `.env`:
   ```env
   UPSTASH_REDIS_REST_URL="https://..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

4. Restart your development server

The caching will automatically activate once credentials are configured.
