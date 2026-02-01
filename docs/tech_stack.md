# Technology Stack: BharatLinks

To achieve the "Operating at the Speed of Indian Business" USP, we need a stack that offers **extreme speed (low latency)** for redirects, **high reliability**, and **scalability** for burst traffic (SMS campaigns).

## 1. Core Stack (The "T3" Influence)

- **Framework**: **Next.js 14+** (App Router)
  - _Why_: Excellent for SEO (Landing pages), Server Actions for mutation, and Edge capabilities for redirects.
- **Language**: **TypeScript** (Strict mode)
  - _Why_: Type safety is non-negotiable for financial/business tools.
- **Styling**: **Tailwind CSS** + **Shadcn/UI** + **Framer Motion**
  - _Why_: Rapid development of "Premium" looking UI. Framer Motion restricts animations to micro-interactions to keep the app feeling "snappy".

## 2. Backend & Data

- **Database (Primary)**: **PostgreSQL** (Managed via Supabase or Neon)
  - _Why_: Relational data integrity for Users, Organizations, and Subscription management.
  - _Region_: **AWS Mumbai (ap-south-1)** - Mandatory for Data Residency.
- **Caching & Redirection Layer**: **Redis** (Upstash) ✅ **IMPLEMENTED**
  - _Why_: The redirection engine _must not_ hit the SQL database for every click.
  - _Flow_: User visits `lnk.in/xyz` -> Server checks Redis cache -> If hit, redirects immediately (<50ms latency). If miss, queries DB, caches result, then redirects.
  - _Implementation_: Dynamic import with graceful fallback. Caches link data (24h TTL) and metadata (1h TTL). Automatic cache invalidation on create/update/delete.
  - _See_: `docs/redis_caching.md` for detailed implementation guide.
- **Analytics**: **Tinybird** (ClickHouse) or **Postgres** (initially)
  - _MVP_: Store click events in Postgres (partitioned).
  - _Scale_: Move click ingestion to Tinybird for real-time dashboards over millions of rows.

## 3. Infrastructure & DevOps

- **Hosting**: **Vercel**
  - _Why_: Best-in-class support for Next.js Edge Middleware (critical for fast redirects). Deploys to Mumbai edge nodes automatically.
- **Authentication**: **Clerk**
  - _Why_: Handles "Sign in with Google" and "Phone Number Login" (OTP) out of the box. Indian users prefer OTP.
- **Payments**: **Razorpay**
  - _Why_: The gold standard for Indian payments (UPI, Cards, GST compliant invoices).

---

## Architecture Diagram

```mermaid
graph TD
    User[(Mobile User)] -->|Clicks Link| Server[Next.js Server]
    Server -->|Check Cache| Redis[(Redis - Mumbai)]
    Redis -- Hit --> Server
    Server -- Redirect --> User
    Redis -- Miss --> DB[(PostgreSQL - Mumbai)]
    DB -- Cache Result --> Redis

    Server -.->|Async Event| Analytics[(Analytics - PostgreSQL)]
```

**Current Implementation**: Server-side caching in Next.js App Router with Redis.
**Future Enhancement**: Move to Vercel Edge Middleware for even faster redirects.

---

## Scalability & Capacity

### User Capacity by Tier

```mermaid
graph LR
    subgraph "Free Tier"
        F1[1K Users<br/>100K Links<br/>2M Redirects/month<br/>₹0/month]
    end
    
    subgraph "Pro Tier"
        P1[10K Users<br/>1M Links<br/>20M Redirects/month<br/>₹10K/month]
    end
    
    subgraph "Pro + Overage"
        O1[50K Users<br/>5M Links<br/>100M Redirects/month<br/>₹20K/month]
    end
    
    subgraph "Enterprise"
        E1[Unlimited Users<br/>Unlimited Links<br/>Unlimited Redirects<br/>₹50K+/month]
    end
    
    F1 -->|Upgrade| P1
    P1 -->|Scale| O1
    O1 -->|Enterprise| E1
```

### Scalability Architecture

```mermaid
graph TB
    subgraph "Request Flow - Scalable Path"
        Users[10K+ Concurrent Users] -->|Distributed| Edge[Vercel Edge Network<br/>Auto-scales to 100K+ req/s]
        Edge -->|95% Cache Hit| Redis[Redis Cache<br/>Mumbai Region<br/>Sub-10ms response]
        Edge -->|5% Cache Miss| App[Next.js Serverless<br/>Auto-scales per demand]
        App -->|Query| DB[(PostgreSQL<br/>Mumbai Region<br/>Connection Pooling)]
        App -->|Cache Result| Redis
    end
    
    subgraph "Scaling Mechanisms"
        H1[Horizontal Scaling<br/>Auto-scaling Functions]
        H2[Read Replicas<br/>For Analytics]
        H3[CDN Caching<br/>Static Assets]
        H4[Database Sharding<br/>Future: By Workspace]
    end
    
    Edge -.->|Scales| H1
    DB -.->|Scales| H2
    Edge -.->|Caches| H3
    DB -.->|Future| H4
```

### Performance Metrics

| Metric | Free Tier | Pro Tier | Enterprise |
|--------|-----------|----------|------------|
| **Concurrent Users** | 100 | 1,000 | 10,000+ |
| **Redirects/sec** | 10 | 100 | 1,000+ |
| **Response Time (P95)** | <200ms | <100ms | <50ms |
| **Cache Hit Rate** | 90% | 95% | 98% |
| **Uptime SLA** | 99% | 99.5% | 99.9% |

**For detailed system architecture, see**: [System Architecture & Scalability](./system-architecture.md)
