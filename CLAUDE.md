# CLAUDE.md — AffiliateHunter AI

## Project Overview

**AffiliateHunter AI** is an AI-native SaaS platform for automated publisher and affiliate recruitment. It helps brands discover, evaluate, contact, and convert affiliate publishers/creators/media/deal sites using AI agents.

**Tagline:** "AI agents that recruit your next 1,000 affiliate partners."

**Core value proposition:** Replaces manual publisher discovery, outreach, and pipeline management with AI-powered automation.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router) | TypeScript, Server Components |
| Styling | Tailwind CSS | Utility-first, dark sidebar layout |
| Backend | Next.js Route Handlers | `/src/app/api/` |
| Database | Supabase (PostgreSQL) | Auth + DB + RLS |
| AI | Anthropic Claude API | `@anthropic-ai/sdk` |
| Package Manager | npm | v10.9.4 |
| Node | v22.22.0 | |

---

## Project Structure

```
/
├── CLAUDE.md                          # This file
├── README.md                          # Project readme
├── .env.local.example                 # Environment variable template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
├── src/
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout (sidebar + content)
│   │   ├── page.tsx                   # Dashboard (home page)
│   │   ├── publishers/
│   │   │   ├── page.tsx               # Publisher Finder (search + AI discovery)
│   │   │   └── [id]/page.tsx          # Publisher Detail + Intelligence
│   │   ├── outreach/
│   │   │   └── page.tsx               # AI Outreach message generator
│   │   ├── campaigns/
│   │   │   ├── page.tsx               # Campaign list
│   │   │   └── [id]/page.tsx          # Campaign detail + sequencer
│   │   ├── pipeline/
│   │   │   └── page.tsx               # CRM Pipeline (Kanban board)
│   │   ├── analytics/
│   │   │   └── page.tsx               # Analytics dashboard
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   └── api/                       # API Route Handlers
│   │       ├── publishers/
│   │       │   ├── route.ts           # GET/POST publishers
│   │       │   ├── discover/route.ts  # POST AI publisher discovery
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET/PUT/DELETE single publisher
│   │       │       └── analyze/route.ts # POST AI publisher analysis
│   │       ├── outreach/
│   │       │   ├── route.ts           # GET/POST outreach records
│   │       │   └── generate/route.ts  # POST AI message generation
│   │       ├── campaigns/
│   │       │   └── route.ts           # GET/POST campaigns
│   │       └── analytics/
│   │           └── route.ts           # GET analytics data
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx            # App sidebar navigation
│   │   │   └── header.tsx             # Page header component
│   │   ├── ui/                        # Reusable UI primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── textarea.tsx
│   │   ├── publishers/
│   │   │   ├── publisher-table.tsx    # Publisher results table
│   │   │   ├── publisher-card.tsx     # Publisher detail card
│   │   │   └── score-badge.tsx        # Score display component
│   │   ├── pipeline/
│   │   │   ├── pipeline-board.tsx     # Kanban board
│   │   │   └── pipeline-card.tsx      # Kanban card
│   │   ├── outreach/
│   │   │   └── message-preview.tsx    # Generated message preview
│   │   └── analytics/
│   │       └── stat-card.tsx          # Metric display card
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   └── middleware.ts          # Auth middleware
│   │   ├── ai/
│   │   │   ├── client.ts             # Anthropic SDK client init
│   │   │   ├── research-agent.ts     # Publisher discovery agent
│   │   │   ├── outreach-agent.ts     # Message generation agent
│   │   │   └── scoring.ts            # Publisher scoring logic
│   │   └── utils.ts                  # Shared utilities (cn helper)
│   └── types/
│       └── index.ts                  # TypeScript type definitions
```

---

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Database Schema

Three core tables in Supabase (PostgreSQL):

### `publishers`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | TEXT | Publisher name |
| website | TEXT | Publisher URL |
| category | TEXT | e.g., "Tech", "Fitness", "Finance" |
| content_type | TEXT | e.g., "Reviews", "Deals", "Blog" |
| traffic_estimate | INTEGER | Monthly traffic estimate |
| email | TEXT | Contact email |
| linkedin | TEXT | LinkedIn profile URL |
| affiliate_friendly | BOOLEAN | Whether they accept affiliates |
| publisher_score | INTEGER | Overall score (0-100) |
| affiliate_fit_score | INTEGER | Affiliate fit score (0-100) |
| traffic_score | INTEGER | Traffic quality score (0-100) |
| audience | TEXT | Audience description |
| notes | TEXT | Free-form notes |

### `campaigns`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | TEXT | Campaign name |
| brand | TEXT | Brand name |
| category | TEXT | Campaign category |
| status | TEXT | draft/active/paused/completed |
| sequence | JSONB | Automation sequence steps |

### `outreach`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| publisher_id | UUID (FK) | References publishers |
| campaign_id | UUID (FK) | References campaigns |
| status | TEXT | lead/contacted/replied/meeting/partner/active |
| channel | TEXT | linkedin/email |
| message | TEXT | Outreach message content |
| reply | TEXT | Publisher's reply |
| sent_at | TIMESTAMPTZ | When message was sent |
| replied_at | TIMESTAMPTZ | When reply was received |
| next_follow_up | TIMESTAMPTZ | Scheduled follow-up date |

---

## AI Agents

The system uses three AI agents powered by Anthropic Claude:

### 1. Research Agent (`src/lib/ai/research-agent.ts`)
- **Purpose:** Discover publishers matching search criteria
- **Input:** keyword, category, product type
- **Output:** Structured list of publishers with metadata
- **API:** `POST /api/publishers/discover`

### 2. Outreach Agent (`src/lib/ai/outreach-agent.ts`)
- **Purpose:** Generate personalized outreach messages
- **Input:** Publisher data, channel (linkedin/email), campaign context
- **Output:** Tailored message text
- **API:** `POST /api/outreach/generate`

### 3. Scoring Engine (`src/lib/ai/scoring.ts`)
- **Purpose:** Analyze and score publishers for affiliate potential
- **Input:** Publisher website and metadata
- **Output:** publisher_score, affiliate_fit_score, traffic_score
- **API:** `POST /api/publishers/[id]/analyze`

---

## CRM Pipeline Stages

The outreach pipeline follows these stages (in order):

1. **Lead** — Discovered but not yet contacted
2. **Contacted** — Initial outreach sent
3. **Replied** — Publisher responded
4. **Meeting** — Meeting scheduled or held
5. **Partner** — Agreement reached
6. **Active** — Actively participating as affiliate

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server only)
ANTHROPIC_API_KEY=                # Anthropic API key for Claude
```

---

## Coding Conventions

### General
- **TypeScript** throughout — strict types, no `any` unless unavoidable
- **Import alias:** `@/*` maps to `src/*`
- **Utility function:** Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes

### Components
- Use **Server Components** by default; add `"use client"` only when needed (interactivity, hooks)
- UI primitives in `src/components/ui/` — reusable, unstyled-ish with Tailwind
- Feature components grouped by domain: `publishers/`, `pipeline/`, `outreach/`, `analytics/`

### API Routes
- Use Next.js **Route Handlers** (not pages API routes)
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Return `NextResponse.json()` with appropriate status codes
- Server-side Supabase client for all DB operations in API routes

### Styling
- **Tailwind CSS** only — no CSS modules or styled-components
- Color scheme: dark sidebar (`bg-gray-900`), light content area
- Consistent spacing with Tailwind utilities

### Database
- Always use **parameterized queries** via Supabase client (never raw SQL in app code)
- UUIDs for all primary keys
- Timestamps with timezone (`TIMESTAMPTZ`)

---

## User Roles

| Role | Permissions |
|------|------------|
| Admin | Full access to all features and settings |
| Manager | Manage campaigns, view analytics |
| BD | Create and send outreach, manage pipeline |
| Viewer | Read-only access to all data |

---

## Business Context

**Target users:**
1. **DTC Brands** (e.g., Gymshark, Allbirds) — need affiliate publishers and creators
2. **Affiliate Managers** — pain: slow discovery, manual outreach, messy pipelines
3. **Marketing Agencies** (e.g., Cell Digital, Xark) — recruit publishers for multiple brands

**Pricing tiers:**
- Starter ($99/mo) — 100 leads/month
- Growth ($399/mo) — 1,000 leads, automation sequences
- Agency ($999/mo) — Multi-brand support, full feature set

**Key differentiator vs. Impact.com/Partnerize/Awin:** Those platforms manage existing affiliates. AffiliateHunter AI specifically solves the _recruitment_ problem — finding and converting new publishers.

---

## Automation Sequencer

Campaigns support multi-step outreach sequences defined as JSONB:

```json
[
  { "step": 1, "action": "connect", "channel": "linkedin", "day": 1 },
  { "step": 2, "action": "message", "channel": "linkedin", "day": 3 },
  { "step": 3, "action": "follow_up", "channel": "linkedin", "day": 7 },
  { "step": 4, "action": "email", "channel": "email", "day": 14 }
]
```

Follow-up Agent rule: If no reply after 5 days, automatically send follow-up.
