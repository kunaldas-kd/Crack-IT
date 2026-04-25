# CrackIt 🎯

> **"From coaching institute tool to the Google of Indian Education"**

CrackIt is a full-stack EdTech platform built for the Indian education market — starting as a B2B SaaS for coaching institutes and evolving into a **national education operating system** that serves every student, teacher, and institution across India.

---

## Table of Contents

- [Vision](#vision)
- [Product Architecture](#product-architecture)
- [Feature Overview by Phase](#feature-overview-by-phase)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Vision

CrackIt is built in **10 versions across 5 strategic phases**, evolving from a simple institute management tool into a comprehensive national education platform.

```
Phase 1 · B2B Foundation   →   Sell to coaching institutes
Phase 2 · B2C Pivot        →   Reach every Indian student
Phase 3 · B2C Platform     →   Compete with Unacademy, Testbook
Phase 4 · AI Suite         →   LLM-powered personalized learning
Phase 5 · National OS      →   Government-grade education infrastructure
```

The long-term goal: become the **default operating system for Indian education** — the platform that every student, teacher, coaching centre, school, and government body relies on.

---

## Product Architecture

### Phase 1 — B2B Foundation (`v1–v5`) · 64 features

Building the core institute management suite. Starts with an MVP sellable to coaching centres and scales to a white-label premium product.

| Version | Name | Tier | Description |
|---------|------|------|-------------|
| **v1** | Starter MVP | Free / Trial | Auth, student management, attendance, file uploads |
| **v2** | Basic Plus | ₹499/mo | First sellable product — fees, timetable, teacher login, student portal |
| **v3** | Standard B2B | ₹999–1999/mo | Test engine, PDF invoices, SMS notifications, analytics dashboard |
| **v4** | Advanced B2B | ₹2999/mo | Doubt forum, parent login, question bank, push notifications |
| **v5** | Premium B2B | ₹4999+/mo | White-label branded app, custom domain, multi-branch, QR check-in, CRM, payroll |

### Phase 2 — B2C Pivot (`v6`) · 50 features

The strategic pivot from B2B to consumer. Builds the universal exam discovery engine targeting every Indian student from Class 9 to PhD.

| Version | Name | Description |
|---------|------|-------------|
| **v6** | Universal Engine | Exam directory, career explorer, study planner, daily question feed, streak system |

### Phase 3 — B2C Platform (`v7–v8`) · 50 features

Full student ecosystem competing with Unacademy and Testbook. Mock tests, PYQs, video library, and predictive intelligence.

| Version | Name | Description |
|---------|------|-------------|
| **v7** | Student Ecosystem | Full mock tests, PYQs, flashcards, weak area detection, video + notes library |
| **v8** | Exam Intelligence | Cutoff & rank predictors, timetable generator, college predictor, result tracking |

### Phase 4 — AI Suite (`v9`) · 50 features

Making CrackIt future-ready with an AI layer across the entire platform.

| Version | Name | Description |
|---------|------|-------------|
| **v9** | AI Education Suite | LLM-powered question gen, AI doubt solver, adaptive difficulty, semantic search, spaced repetition ML |

### Phase 5 — National OS (`v10`) · 50 features

The end-game: becoming the infrastructure layer for Indian education.

| Version | Name | Description |
|---------|------|-------------|
| **v10** | National Education OS | CBSE/ICSE APIs, DigiLocker KYC, national leaderboard, regional language support, Open API for partners |

---

## Feature Overview by Phase

### 🔵 B2B Core Features (v1–v5)

**Institute Management**
- Multi-role authentication (Admin, Teacher, Student, Parent)
- Student enrollment, profile management, batch assignment
- Attendance tracking with daily/monthly reports
- Fee management with PDF invoice generation
- Timetable scheduling and class management

**Academic Tools**
- Online test creation engine with multiple question types (MCQ, subjective, fill-in-the-blank)
- Question bank with tagging by subject, topic, difficulty, and exam type
- Assignment creation and submission with file upload
- Performance analytics dashboard for students and teachers
- Doubt forum with threaded discussions

**Communication & Notifications**
- SMS notifications via MSG91/Twilio (attendance, fees, results)
- WhatsApp integration for parent communication
- Push notifications for mobile
- Automated reminders and alerts

**Premium Institute Features (v5)**

*White-Label Branding*
- Fully branded app shell — institute's own name, logo, colors, and splash screen
- Custom domain provisioning (e.g. `app.brilliantacademy.in`) with SSL certificate auto-managed by CrackIt
- Branded email domain for all outgoing notifications (e.g. `noreply@brilliantacademy.in`)
- Removal of all CrackIt branding — students and parents only see the institute's identity
- Custom app icons and store listing metadata (Play Store / App Store) via white-label builds

*Multi-Branch Management*
- Centralised super-admin dashboard across unlimited branches
- Branch-wise student enrollment, batch, and teacher assignment
- Consolidated fee collection and financial reporting across branches
- Branch-level vs institute-level analytics and comparison views
- Role-based access — branch managers see only their branch data

*QR Check-In*
- QR code generated per student for fast contactless attendance
- Mobile scanner for teachers — scan to mark present in real time
- Geo-fenced check-in option to prevent proxy attendance
- Live attendance dashboard for admins during class hours
- Auto-absent marking after class start + parent SMS alert

*CRM — Lead & Admission Management*
- Lead capture from website, WhatsApp, and walk-ins
- Lead pipeline with stages: Enquiry → Demo → Enrolled → Lost
- Automated follow-up reminders for counsellors
- Conversion rate analytics per source and counsellor
- Fee payment tracking from lead to enrolled student

*Payroll Management*
- Teacher and staff salary configuration (fixed, hourly, or per-class)
- Monthly payslip generation with deductions (TDS, PF)
- Attendance-linked salary computation
- Bank transfer integration (direct NEFT/IMPS via Razorpay Payouts)
- Payroll history, export to Excel, and statutory compliance reports

---

### 🟡 B2C Core Features (v6)

**Exam Discovery Engine**
- Comprehensive exam directory covering JEE, NEET, UPSC, SSC, Banking, State PSCs, Defence, and 500+ exams
- Career explorer with role → exam → preparation path mapping
- Personalised study planner based on exam date and current level
- Daily question feed by exam category
- Streak system for daily engagement

---

### 🟣 B2C Platform Features (v7–v8)

**Mock Test Platform**
- Full-length and chapter-wise mock tests for all major exams
- Previous Year Question (PYQ) papers with solutions
- Timer, auto-submit, negative marking, and sectional time limits
- Detailed performance analysis after each test

**Learning Tools**
- Flashcard system with spaced repetition
- Weak area detection and personalized drill sets
- Video lecture library with bookmarks and notes
- PDF study notes with annotations

**Predictive Intelligence (v8)**
- Cutoff predictor based on historical data and current trends
- Rank predictor based on mock test performance
- College predictor for JEE/NEET based on rank
- Timetable auto-generator based on available study hours
- Result tracker and seat matrix for counselling

---

### 🟢 AI Suite Features (v9)

- **LLM Question Generation** — Generate unique questions from any topic/chapter using Claude/GPT
- **AI Doubt Solver** — Students can photograph or type doubts and get step-by-step solutions
- **Adaptive Difficulty Engine** — Test difficulty adjusts in real time based on student responses
- **Semantic Search** — Find questions, notes, and videos by meaning, not just keywords
- **Spaced Repetition ML** — Algorithm learns the optimal time to revise each concept per student
- **Dropout Risk Prediction** — Flags at-risk students for intervention before they disengage
- **Automated Feedback Generation** — AI writes personalised feedback on subjective answers

---

### 🟠 National OS Features (v10)

- **CBSE/ICSE API Integration** — Official curriculum data, syllabus updates, and board result ingestion
- **DigiLocker KYC** — Student identity verification via DigiLocker (Aadhaar-linked)
- **National Leaderboard** — Real-time ranking across all CrackIt students by exam category
- **Regional Language Support** — Full platform in Hindi, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati
- **Open API for Partners** — Third-party coaching institutes, schools, and EdTech apps can build on CrackIt
- **Government Dashboard** — Analytics for state education departments and central bodies

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend Web** | Next.js 14 + React | App Router, SSR + SSG |
| **Frontend Mobile** | React Native / Expo | iOS + Android from single codebase |
| **PWA** | Next.js PWA plugin | Offline support for low-bandwidth users |
| **Backend API** | Node.js (Express) + Python (FastAPI) | Node for core API, FastAPI for AI services |
| **Database** | PostgreSQL (via Supabase) | Primary relational store |
| **Cache** | Redis | Sessions, rate limiting, leaderboards |
| **Auth** | JWT + OAuth 2.0 | Google, Apple sign-in + phone OTP |
| **File Storage** | AWS S3 / Cloudinary | Videos, PDFs, images |
| **SMS / WhatsApp** | MSG91 / Twilio | OTP, notifications, alerts |
| **Email** | Resend / SendGrid | Transactional email |
| **AI / LLM** | Anthropic Claude + OpenAI | Question gen, doubt solving, feedback |
| **Vector DB** | Pinecone / Weaviate | Semantic search over questions and content |
| **Search** | Meilisearch / Typesense | Fast full-text search |
| **Payments** | Razorpay | INR subscriptions, fee collection |
| **Analytics** | PostHog + Mixpanel | Product analytics and funnel tracking |
| **Monitoring** | Sentry + Datadog | Error tracking, APM |
| **Deployment — Frontend** | Vercel | Global CDN, preview deployments |
| **Deployment — Backend** | Railway / Supabase | Managed Postgres + API hosting |
| **CI/CD** | GitHub Actions | Lint, test, deploy on push |

---

## System Architecture

```
                    ┌─────────────────────────────────────┐
                    │           CLIENT LAYER              │
                    │  Next.js Web  │  React Native App  │
                    └──────────────┬──────────────────────┘
                                   │ HTTPS / WebSocket
                    ┌──────────────▼──────────────────────┐
                    │           API GATEWAY               │
                    │     (Rate Limiting · Auth · CDN)    │
                    └──────┬───────────────┬──────────────┘
                           │               │
           ┌───────────────▼───┐   ┌───────▼───────────────┐
           │   Core API        │   │   AI Services          │
           │  (Node/Express)   │   │   (FastAPI + LLMs)     │
           │                   │   │                         │
           │ · Auth            │   │ · Question Generation   │
           │ · Students        │   │ · Doubt Solver          │
           │ · Tests           │   │ · Adaptive Engine       │
           │ · Payments        │   │ · Semantic Search       │
           └───────┬───────────┘   └──────────┬────────────┘
                   │                           │
     ┌─────────────▼─────────────────────────-▼──────────┐
     │                  DATA LAYER                         │
     │                                                     │
     │  PostgreSQL (Supabase)  │  Redis  │  Pinecone      │
     │  S3 / Cloudinary        │  Meilisearch             │
     └─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+ (for AI services)
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/crackit.git
cd crackit

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Seed the database with sample data
pnpm db:seed

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Running AI Services

```bash
cd services/ai

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the AI service
uvicorn main:app --reload --port 8000
```

---

## Project Structure

```
crackit/
├── apps/
│   ├── web/                    # Next.js 14 web application
│   │   ├── app/                # App Router pages and layouts
│   │   ├── components/         # Shared UI components
│   │   ├── lib/                # Utilities and helpers
│   │   └── public/             # Static assets
│   └── mobile/                 # React Native / Expo app
│       ├── src/
│       │   ├── screens/        # App screens
│       │   ├── components/     # Mobile-specific components
│       │   └── navigation/     # Navigation config
│       └── assets/
├── services/
│   ├── api/                    # Node.js core API (Express)
│   │   ├── src/
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── controllers/    # Business logic
│   │   │   ├── models/         # Database models (Prisma)
│   │   │   ├── middleware/     # Auth, rate limiting, validation
│   │   │   └── utils/          # Helper functions
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── migrations/     # Migration files
│   └── ai/                     # Python FastAPI AI services
│       ├── routers/            # API routes
│       ├── agents/             # LLM agent definitions
│       ├── pipelines/          # RAG and embedding pipelines
│       └── models/             # Pydantic schemas
├── packages/
│   ├── ui/                     # Shared design system (React components)
│   ├── config/                 # Shared ESLint, TS, Tailwind config
│   └── types/                  # Shared TypeScript types
├── infra/
│   ├── docker/                 # Docker Compose for local dev
│   └── github/                 # CI/CD workflows
├── docs/                       # Architecture diagrams, API docs
├── .env.example                # Environment variable template
├── package.json                # Root workspace config
└── README.md                   # This file
```

---

## Environment Variables

Create a `.env.local` file from `.env.example`. Key variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crackit

# Auth
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=crackit-uploads
CLOUDINARY_URL=

# AI / LLM
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

# Notifications
MSG91_API_KEY=
MSG91_SENDER_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Redis
REDIS_URL=redis://localhost:6379

# Analytics
POSTHOG_API_KEY=
MIXPANEL_TOKEN=
```

---

## API Reference

The core API is RESTful with JSON responses. Base URL: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login with email + password |
| `POST` | `/auth/otp/send` | Send OTP to phone number |
| `POST` | `/auth/otp/verify` | Verify OTP and get token |
| `POST` | `/auth/refresh` | Refresh access token |
| `DELETE` | `/auth/logout` | Invalidate session |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/students` | List students (with filters) |
| `POST` | `/students` | Create student profile |
| `GET` | `/students/:id` | Get student by ID |
| `PATCH` | `/students/:id` | Update student profile |
| `GET` | `/students/:id/performance` | Get performance summary |

### Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tests` | List available tests |
| `POST` | `/tests` | Create a new test |
| `GET` | `/tests/:id` | Get test with questions |
| `POST` | `/tests/:id/attempt` | Start a test attempt |
| `PATCH` | `/tests/:id/attempt/:attemptId` | Submit answers |
| `GET` | `/tests/:id/results/:attemptId` | Get attempt results |

### AI Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/generate-questions` | Generate questions from a topic |
| `POST` | `/ai/solve-doubt` | Submit a doubt for AI explanation |
| `POST` | `/ai/search` | Semantic search across all content |
| `GET` | `/ai/recommendations/:studentId` | Get personalized study recommendations |

Full API documentation is available at `/api/docs` (Swagger UI) when running in development.

---

## Roadmap

```
2024 Q3–Q4   v1–v2    Institute MVP · First paying institutes
2025 Q1      v3       Standard B2B tier · Test engine live
2025 Q2      v4–v5    Advanced & Premium B2B · White-label launch
2025 Q3      v6       B2C Pivot · Exam engine public launch
2025 Q4      v7       Student ecosystem · Mock tests & PYQs
2026 Q1      v8       Exam intelligence · Rank & cutoff predictors
2026 Q2–Q3   v9       AI Suite · Claude-powered question gen & doubt solver
2026 Q4      v10      National OS · Government integrations · Open API
```

---

## Contributing

We welcome contributions from the community. To get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** your changes with conventional commits: `git commit -m "feat: add xyz"`
4. **Push** to your fork: `git push origin feat/your-feature-name`
5. **Open** a Pull Request with a clear description

### Code Standards

- **TypeScript** everywhere — no plain JS files
- **ESLint + Prettier** enforced via pre-commit hooks
- **Vitest** for unit tests, **Playwright** for E2E
- All PRs require at least one review before merge
- Keep components small and composable

---

## License

© 2024 CrackIt. All rights reserved.

This is a proprietary product. Unauthorized use, reproduction, or distribution is prohibited.

---

*Built with focus. One version at a time.*
