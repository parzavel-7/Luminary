# Luminary Development Guide

## Overview

Luminary is a full-stack accessibility scanning and monitoring platform built with Next.js (frontend) and Node.js/Express (backend).

- **Frontend**: Next.js 16.2.0 with Tailwind CSS (apps/web)
- **Backend**: Node.js/Express with TypeScript (apps/api)
- **Build System**: Turborepo monorepo
- **Database**: Supabase (PostgreSQL)
- **Queue**: BullMQ + Redis

---

## Prerequisites

- Node.js 18+
- npm 9+
- Redis (for BullMQ queue)
- Supabase project (for auth and database)

---

## Environment Setup

### 1. Install Dependencies

```bash
cd d:\prac\PROJECTS\Luminary
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Google Gemini (for AI analysis)
GOOGLE_API_KEY=your_gemini_api_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Redis
REDIS_URL=redis://localhost:6379

# Node environment
NODE_ENV=development
DEBUG=*
```

---

## Running the Development Environment

### Start Both Web and API Servers

```bash
cd d:\prac\PROJECTS\Luminary
npm exec turbo run dev --filter=web --filter=api
```

This starts:
- **Web**: http://localhost:3000 (Next.js with Webpack)
- **API**: http://localhost:8080 (Express server)
- **Redis**: Requires running separately or via Docker

**Output:**
```
✓ Ready in 1335ms
Local:         http://localhost:3000
Network:       http://192.168.1.7:3000
API server running on port 8080
```

### Start Only the Web Server

```bash
cd d:\prac\PROJECTS\Luminary\apps\web
npm run dev
```

### Start Only the API Server

```bash
cd d:\prac\PROJECTS\Luminary\apps\api
npm run dev
```

---

## Important Notes

### Webpack vs Turbopack

The web dev server uses **Webpack** instead of Turbopack to avoid memory/thread exhaustion on resource-constrained systems:

```json
// apps/web/package.json
"dev": "next dev --webpack --port 3000"
```

If your system has ample memory, you can switch to Turbopack by changing the script to:
```json
"dev": "next dev --turbopack --port 3000"
```

### Turbopack Root Configuration

The monorepo uses an explicit Turbopack root in `next.config.js` to prevent lockfile inference warnings:

```javascript
// apps/web/next.config.js
turbopack: {
  root: path.join(__dirname, '..', '..'),
}
```

---

## Building for Production

### Build All Packages

```bash
npm exec turbo run build
```

### Build Only Web

```bash
npm exec turbo run build --filter=web
```

### Start Production Build

```bash
cd d:\prac\PROJECTS\Luminary\apps\web
npm run start
```

---

## Project Structure

```
apps/
├── api/                    # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── queues/         # BullMQ workers
│   │   └── lib/            # Redis, etc
│   └── package.json
└── web/                    # Frontend (Next.js)
    ├── app/                # Next.js App Router
    ├── components/         # React components
    ├── lib/                # Utilities
    ├── public/             # Static assets
    └── package.json

packages/
├── eslint-config/
├── typescript-config/
└── ui/                     # Shared UI components

schema.sql                  # Supabase schema
```

---

## Key Features

### Web App (apps/web)
- Landing page with scan entry
- Dashboard with monitored sites (watchlist)
- Live scan results page
- PDF export of reports
- Violation cards with AI-powered explanations
- Team management
- Settings and profile

### API (apps/api)
- Headless browser scanning with Playwright
- Axe accessibility audit integration
- AI analysis of violations (Google Gemini)
- Accessibility scoring algorithm
- Background job queue (BullMQ)
- Public API for integrations
- Webhook notifications
- Email notifications (Resend)

---

## Recent Fixes

### 1. Frontend Build Issues (Fixed)
- **Issue**: TypeScript errors in `ExportPDF.tsx`, `ScrollReveal.tsx`, `ShareModal.tsx`
- **Solution**: Fixed color array indexing and cloneElement type mismatches
- **Files**: 
  - [ExportPDF.tsx](apps/web/components/ExportPDF.tsx#L1-L50)
  - [ScrollReveal.tsx](apps/web/components/ScrollReveal.tsx)
  - [ShareModal.tsx](apps/web/components/ShareModal.tsx)

### 2. Workspace Configuration (Fixed)
- **Issue**: Multiple lockfiles causing Turbopack root inference warning
- **Solution**: Set explicit `turbopack.root` in `next.config.js`
- **File**: [next.config.js](apps/web/next.config.js)

### 3. Site Delete Flow (Fixed)
- **Issue**: Clicking delete button on monitored sites opened Guardian Report instead of delete confirmation
- **Solution**: Added `e.stopPropagation()` to all action buttons in watchlist cards
- **File**: [dashboard/page.tsx](apps/web/app/(dashboard)/dashboard/page.tsx#L400-L430)

### 4. Dev Server Memory Issues (Fixed)
- **Issue**: Turbopack crashed due to OS paging file/thread limits
- **Solution**: Switched web dev to Webpack via `--webpack` flag
- **File**: [package.json](apps/web/package.json#L5)

---

## Debugging

### Enable Debug Output

```bash
set DEBUG=*
npm exec turbo run dev --filter=web --filter=api
```

### Check API Health

```bash
curl -I http://localhost:8080/health
```

### Check Redis Connection

The API logs Redis connection status on startup:
```
Connected to Redis successfully
```

### Browser Dev Tools

Next.js includes built-in dev tools. Press `Shift+Alt+T` in the browser to toggle.

---

## Common Issues

### Port 3000 Already in Use

```bash
netstat -aon | findstr ":3000"
taskkill /PID <PID> /F
```

### Redis Connection Error

Ensure Redis is running:
```bash
# Check Redis
redis-cli ping
# Should return: PONG
```

### Supabase Auth Not Working

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase project has Auth enabled
- Verify redirect URLs are configured in Supabase

### API Endpoints Not Responding

- Verify `NEXT_PUBLIC_API_URL` is set to `http://localhost:8080`
- Check API server logs for errors
- Ensure API server is running on port 8080

---

## Testing the Delete Flow (Site Watchlist)

1. Navigate to `/dashboard`
2. Log in with your Supabase credentials
3. Add a site to monitor using the input at the top of the "Site Watchlist" section
4. Hover over the added site card
5. Click the red trash icon (delete button)
6. A delete confirmation modal should appear (NOT the Guardian Report modal)
7. Confirm deletion

The fix ensures action buttons in the watchlist don't trigger the card click handler.

---

## Performance Optimization

### Build Cache

Turbo caches build artifacts. Clear cache if needed:
```bash
npm exec turbo prune --scope=web
```

### Next.js Cache

Clear Next.js build cache:
```bash
rm -r apps/web/.next
npm exec turbo run build --filter=web
```

### Development with Source Maps

Source maps are enabled by default. Disable for faster builds:
```bash
next dev --webpack --disable-source-maps
```

---

## Deployment

See [README.md](README.md) for deployment instructions to Vercel or other platforms.

---

## Contributing

1. Create a feature branch
2. Make changes
3. Run `npm exec turbo run lint` to check code quality
4. Run `npm exec turbo run build` to ensure builds pass
5. Commit and push

---

## Support

For issues or questions, check:
- [Main Implementation Plan](Main%20Implementation%20Plan)
- [schema.sql](schema.sql) for database structure
- Supabase documentation
- Next.js documentation

---

**Last Updated**: May 22, 2026
