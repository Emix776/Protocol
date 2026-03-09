# Overview

This is a **School Performance Tracker** — a mobile-first web application for German students to track their daily classroom participation and performance metrics. Students can log homework completion, questions asked, oral contributions, quality of contributions, early participation, and self-assessment for each class period. The app provides a statistics dashboard with charts showing trends over time.

The app is built with a React frontend and Express backend, using PostgreSQL for persistent data storage. The interface is entirely in German.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router) with two pages: `/` (Tracker) and `/stats` (Statistics)
- **State Management**: TanStack React Query for server state; local component state for form inputs
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode indigo-slate palette). Custom fonts: Inter (body) and Outfit (display headings)
- **Charts**: Recharts for statistics visualizations
- **Animations**: Framer Motion for transitions
- **Date Handling**: date-fns with German locale
- **Build**: Vite with React plugin

### Key Frontend Files
- `client/src/pages/Tracker.tsx` — Main daily tracking view with date navigation and subject cards
- `client/src/pages/Stats.tsx` — Statistics dashboard with charts for last 30 days
- `client/src/components/SubjectCard.tsx` — Expandable card for each class period with tracking controls
- `client/src/components/Navigation.tsx` — Bottom tab navigation bar
- `client/src/lib/constants.ts` — Schedule data (hardcoded timetable), quality levels, self-assessment labels
- `client/src/lib/scoring.ts` — Score calculation logic (max 100 points per entry)
- `client/src/hooks/use-entries.ts` — React Query hooks for fetching and syncing entries

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## Backend (server/)
- **Framework**: Express 5 on Node.js with TypeScript (runs via tsx)
- **API**: REST API with two endpoints:
  - `GET /api/entries?from=&to=` — List entries with optional date range filtering
  - `POST /api/entries` — Upsert (create or update) a daily entry
- **Validation**: Zod schemas (shared between client and server via `shared/routes.ts`)
- **Development**: Vite dev server middleware for HMR; in production, serves static built files

### Key Backend Files
- `server/index.ts` — Express app setup with logging middleware
- `server/routes.ts` — API route registration
- `server/storage.ts` — Database storage layer with `DatabaseStorage` class implementing `IStorage` interface
- `server/db.ts` — Drizzle ORM + pg Pool connection setup
- `server/vite.ts` — Vite dev middleware for development
- `server/static.ts` — Static file serving for production

## Shared Code (shared/)
- `shared/schema.ts` — Drizzle table definitions and Zod schemas for the `daily_entries` table
- `shared/routes.ts` — API contract definitions (paths, methods, input/output schemas) used by both client and server

## Database
- **Engine**: PostgreSQL (via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod conversion
- **Schema**: Single table `daily_entries` with columns:
  - `id` (serial PK)
  - `date` (text, YYYY-MM-DD format)
  - `subjectId` (text, e.g., 'mo-1')
  - `homework` (boolean)
  - `question` (boolean)
  - `contributions` (integer)
  - `qualityLevel` (integer, 0-3)
  - `earlyContribution` (boolean)
  - `selfAssessment` (integer, 0-5)
  - Unique constraint on `(date, subjectId)`
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database

## Build System
- **Dev**: `npm run dev` → tsx runs the server which sets up Vite middleware for the client
- **Build**: `npm run build` → Custom script (`script/build.ts`) that runs Vite build for client and esbuild for server, outputting to `dist/`
- **Production**: `npm start` → Runs the bundled server from `dist/index.cjs`

# External Dependencies

## Required Services
- **PostgreSQL Database**: Must be provisioned with connection string in `DATABASE_URL` environment variable. Used for all data persistence.

## Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express**: HTTP server framework
- **@tanstack/react-query**: Server state management
- **recharts**: Chart library for statistics page
- **framer-motion**: Animation library
- **date-fns**: Date utility library
- **zod** + **drizzle-zod**: Schema validation
- **wouter**: Client-side routing
- **shadcn/ui components**: Full suite of Radix-based UI components
- **connect-pg-simple**: PostgreSQL session store (available but not currently wired for sessions)

## Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner`: Dev-only Replit integrations