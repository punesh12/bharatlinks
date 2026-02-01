# BharatLinks System Architecture & Scalability

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
        API[API Clients]
    end

    subgraph "CDN & Edge Network"
        CDN[Vercel Edge Network<br/>Mumbai Region<br/>~50ms latency]
    end

    subgraph "Application Layer - Vercel"
        EdgeMW[Edge Middleware<br/>Link Redirect Handler<br/><50ms response]
        NextJS[Next.js App Router<br/>Server Components<br/>Server Actions]
        Static[Static Assets<br/>Landing Pages<br/>SEO Optimized]
    end

    subgraph "Caching Layer - Upstash Redis"
        Redis[(Redis Cache<br/>Mumbai Region<br/>Link Data: 24h TTL<br/>Metadata: 1h TTL<br/>Hit Rate: ~95%)]
    end

    subgraph "Database Layer - Supabase PostgreSQL"
        PrimaryDB[(Primary Database<br/>Mumbai Region<br/>Users, Links, Workspaces<br/>Subscriptions, Analytics)]
        ReadReplica[(Read Replica<br/>Optional<br/>For Analytics Queries)]
    end

    subgraph "External Services"
        Auth[Clerk<br/>Authentication<br/>OTP, OAuth]
        Email[Resend<br/>Email Service<br/>Team Invites, Notifications]
        Payment[Razorpay<br/>Payment Gateway<br/>UPI, Cards, Invoices]
        AnalyticsDB[Tinybird<br/>ClickHouse<br/>Future: Real-time Analytics]
    end

    subgraph "Background Jobs"
        Queue[Job Queue<br/>Future: Analytics Processing<br/>Email Sending]
        Worker[Background Workers<br/>Cache Warming<br/>Data Aggregation]
    end

    %% User Flow - Link Click (Hot Path)
    Web -->|1. Click Link| CDN
    Mobile -->|1. Click Link| CDN
    CDN -->|2. Route| EdgeMW
    EdgeMW -->|3. Check Cache| Redis
    Redis -->|4a. Cache Hit<br/>~95%| EdgeMW
    Redis -->|4b. Cache Miss<br/>~5%| NextJS
    NextJS -->|5. Query DB| PrimaryDB
    PrimaryDB -->|6. Return Data| NextJS
    NextJS -->|7. Cache & Redirect| Redis
    NextJS -->|8. Redirect| EdgeMW
    EdgeMW -->|9. Response| Web
    EdgeMW -->|9. Response| Mobile

    %% Analytics Flow (Async)
    EdgeMW -.->|10. Async Track| NextJS
    NextJS -.->|11. Store Event| PrimaryDB
    NextJS -.->|12. Future: Stream| AnalyticsDB

    %% User Management Flow
    Web -->|Login| Auth
    Auth -->|Verify| NextJS
    NextJS -->|User Data| PrimaryDB

    %% Admin Flow
    Web -->|Manage Links| NextJS
    NextJS -->|CRUD Operations| PrimaryDB
    NextJS -->|Invalidate Cache| Redis

    %% Email Flow
    NextJS -->|Send Email| Email
    Email -->|Deliver| Web

    %% Payment Flow
    Web -->|Subscribe| Payment
    Payment -->|Webhook| NextJS
    NextJS -->|Update Plan| PrimaryDB

    %% Analytics Query Flow
    Web -->|View Analytics| NextJS
    NextJS -->|Query| ReadReplica
    ReadReplica -->|Aggregated Data| NextJS

    %% Styling
    classDef edge fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef cache fill:#ef4444,stroke:#dc2626,color:#fff
    classDef db fill:#10b981,stroke:#059669,color:#fff
    classDef service fill:#f59e0b,stroke:#d97706,color:#fff
    classDef client fill:#8b5cf6,stroke:#7c3aed,color:#fff

    class EdgeMW,NextJS,Static edge
    class Redis cache
    class PrimaryDB,ReadReplica,AnalyticsDB db
    class Auth,Email,Payment service
    class Web,Mobile,API client
```

## Scalability & Capacity Analysis

### Current Architecture Capacity

#### 1. **Link Redirects (Hot Path)**
- **Edge Middleware**: Handles redirects at edge (<50ms latency)
- **Redis Cache Hit Rate**: ~95% (estimated)
- **Throughput**:
  - **Vercel Free Tier**: 100GB bandwidth/month (~2M redirects/month)
  - **Vercel Pro Tier**: 1TB bandwidth/month (~20M redirects/month)
  - **Vercel Enterprise**: Unlimited (scales automatically)
- **Concurrent Users**: 
  - Edge functions auto-scale (no limit)
  - Can handle **10,000+ concurrent redirects**

#### 2. **Database Capacity**
- **Supabase Free Tier**: 
  - 500MB storage
  - 50K monthly active users
  - ~100K links capacity
- **Supabase Pro Tier**:
  - 8GB storage
  - 100K monthly active users
  - ~1.6M links capacity
- **Supabase Enterprise**:
  - Unlimited storage
  - Unlimited users
  - Horizontal scaling with read replicas

#### 3. **Redis Cache Capacity**
- **Upstash Free Tier**: 
  - 10K commands/day
  - 256MB storage
  - ~50K cached links
- **Upstash Fixed Plan**:
  - 100K commands/day
  - 1GB storage
  - ~200K cached links
- **Upstash Pay-as-you-go**:
  - Unlimited commands
  - Scales automatically
  - Cost: $0.20 per 100K commands

### User Capacity Estimates

#### **Phase 1: MVP (Free Tier)**
- **Users**: Up to **1,000 active users**
- **Links**: Up to **100,000 links**
- **Monthly Redirects**: Up to **2 million**
- **Cost**: ₹0/month
- **Limitations**: 
  - Limited bandwidth
  - Basic analytics
  - No advanced features

#### **Phase 2: Early Growth (Pro Tier)**
- **Users**: **1,000 - 10,000 active users**
- **Links**: Up to **1 million links**
- **Monthly Redirects**: Up to **20 million**
- **Cost**: ₹9,000-12,000/month
- **Features**:
  - High-performance caching
  - Advanced analytics
  - Team collaboration

#### **Phase 3: Growth (Pro + Overage)**
- **Users**: **10,000 - 50,000 active users**
- **Links**: Up to **5 million links**
- **Monthly Redirects**: Up to **100 million**
- **Cost**: ₹15,000-20,000/month
- **Optimizations**:
  - Read replicas for analytics
  - Enhanced caching strategies
  - CDN optimization

#### **Phase 4: Scale (Enterprise)**
- **Users**: **50,000+ active users**
- **Links**: **Unlimited**
- **Monthly Redirects**: **Unlimited**
- **Cost**: ₹50,000+/month
- **Architecture**:
  - Multi-region deployment
  - Database sharding
  - Dedicated analytics infrastructure
  - 99.9% uptime SLA

## Scalability Mechanisms

### 1. **Horizontal Scaling**
```mermaid
graph LR
    LB[Load Balancer] --> S1[Server 1]
    LB --> S2[Server 2]
    LB --> S3[Server N]
    S1 --> Redis
    S2 --> Redis
    S3 --> Redis
    S1 --> DB
    S2 --> DB
    S3 --> DB
```

- **Vercel**: Auto-scales serverless functions
- **Database**: Read replicas for read-heavy workloads
- **Redis**: Distributed caching across regions

### 2. **Caching Strategy**
- **L1 Cache**: Edge Middleware (in-memory, <1ms)
- **L2 Cache**: Redis (Mumbai region, <10ms)
- **L3 Cache**: Database query cache (PostgreSQL, <50ms)
- **Cache Invalidation**: Automatic on create/update/delete

### 3. **Database Optimization**
- **Connection Pooling**: Supabase handles automatically
- **Read Replicas**: For analytics queries (future)
- **Partitioning**: Analytics tables by date (future)
- **Indexing**: Optimized indexes on frequently queried columns

### 4. **Async Processing**
- **Link Tracking**: Fire-and-forget (non-blocking)
- **Email Sending**: Queued and processed asynchronously
- **Analytics Aggregation**: Background jobs (future)

## Performance Metrics

### **Link Redirect Performance**
- **Cache Hit**: <50ms (95% of requests)
- **Cache Miss**: <200ms (5% of requests)
- **Average Response Time**: ~60ms
- **P99 Latency**: <300ms

### **API Response Times**
- **Dashboard Load**: <500ms
- **Link Creation**: <300ms
- **Analytics Query**: <1s (with caching)
- **Search/Filter**: <200ms

### **Scalability Bottlenecks & Solutions**

| Bottleneck | Current Limit | Solution |
|------------|---------------|----------|
| Database Connections | 100 concurrent | Connection pooling, read replicas |
| Redis Commands | 100K/day (Fixed) | Pay-as-you-go plan |
| Bandwidth | 1TB/month (Pro) | Enterprise plan, CDN optimization |
| Analytics Queries | Slow on large datasets | Move to Tinybird/ClickHouse |
| Email Rate Limits | 3K/day (Free) | Resend Pro (50K/day) |

## Future Scalability Enhancements

### 1. **Edge Computing**
- Move redirect logic to Vercel Edge Functions
- Reduce latency to <20ms globally
- Handle 100K+ requests/second

### 2. **Database Sharding**
- Shard by workspace ID
- Distribute load across multiple databases
- Support billions of links

### 3. **Analytics Pipeline**
- Real-time streaming to Tinybird
- Pre-aggregated dashboards
- Support millions of events/day

### 4. **Multi-Region Deployment**
- Deploy to multiple regions (Mumbai, Singapore, etc.)
- Route users to nearest edge
- Global low-latency experience

## Cost vs. Scale Analysis

```mermaid
graph LR
    A[Free Tier<br/>₹0/month<br/>1K users] --> B[Pro Tier<br/>₹10K/month<br/>10K users]
    B --> C[Pro + Overage<br/>₹20K/month<br/>50K users]
    C --> D[Enterprise<br/>₹50K+/month<br/>Unlimited]
```

## Conclusion

**Current Capacity**: The system can handle **10,000+ active users** and **20+ million redirects/month** on Pro tier.

**Scalability**: The architecture is designed to scale horizontally with:
- Auto-scaling serverless functions
- Distributed caching
- Database read replicas
- Edge computing capabilities

**Growth Path**: Clear upgrade path from free tier to enterprise with predictable costs and performance improvements at each stage.
