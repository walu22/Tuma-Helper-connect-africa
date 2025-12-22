# Tuma Helper - Quick Start Guide

## What is Tuma Helper?

A service marketplace connecting customers with verified local service professionals in Africa (Namibia-focused).

## Quick Overview

### 🎯 Core Purpose
Connect customers seeking services with vetted, local professionals for home services, trades, and expertise.

### 👥 User Types
1. **Customers** - Find and book trusted service providers
2. **Service Providers** - Grow business and manage bookings
3. **Admins** - Platform oversight and analytics
4. **Corporate/Franchise** - Business account management

### ⚡ Key Features at a Glance

**For Customers:**
- AI service matching
- Verified provider directory
- Real-time messaging
- Secure payments (Stripe)
- Booking management
- Review system

**For Providers:**
- Business dashboard
- Training center
- Earnings tracking
- Profile management
- Customer engagement tools

### 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe
- **Testing:** Vitest + Playwright
- **UI:** shadcn-ui + Radix UI

### 📁 Key Directories
```
src/
├── pages/          # Route components (37 routes)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── contexts/       # React contexts (Auth, Language)
├── integrations/   # External services (Supabase)
└── lib/            # Utilities

supabase/
├── migrations/     # Database migrations
└── functions/      # Edge functions
```

### 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### 📊 Platform Stats (Target Metrics)
- 1,000+ Active Providers (goal)
- 5,000+ Happy Customers (goal)
- 4.8 Average Rating (goal)
- 24/7 Support Available

### 🔗 Important Links
- **Detailed Docs:** [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md)
- **Main README:** [README.md](./README.md)
- **Lovable Project:** https://lovable.dev/projects/7febc6bc-6530-4253-b0f3-ec34448eae87

### 📋 Common Tasks

**Run Development Server:**
```bash
npm run dev
```

**Check Database Schema:**
```bash
ls -la supabase/migrations/
```

**Add New Component:**
```bash
# Components use shadcn-ui
npx shadcn-ui@latest add [component-name]
```

**Run E2E Tests:**
```bash
npx playwright test
```

### 🔐 Security Features
- KYC verification for providers
- Secure authentication (Supabase Auth)
- PCI-compliant payments
- Role-based access control
- ESLint security plugin

### 🌍 Localization
- Multi-language support via LanguageContext
- Primary market: Namibia
- Expandable across Africa

### 📞 Support
- In-app help center: `/help`
- Contact page: `/contact`
- Provider resources: `/provider-resources`

---

For complete documentation, see [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md)
