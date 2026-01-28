# Follow-Up Health Dashboard

A single-page calculator tool for healthcare clinics to assess their follow-up operations. Displays live-updating results (grade, revenue-at-risk, leakage drivers) based on 5 inputs.

## Features

- **Live Calculator**: Real-time scoring as users adjust inputs
- **Grade Assessment**: A+ to F grading based on response time, follow-up depth, and coverage
- **Revenue at Risk**: Estimates monthly revenue leakage
- **Leakage Drivers**: Identifies top 3 areas for improvement
- **Email Capture**: Send personalized snapshot reports
- **Admin Dashboard**: View submissions, stats, and manage email templates

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (Postgres)
- **Email**: Mailgun

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain

# Admin
ADMIN_PASSWORD=your-admin-password

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

Run the SQL schema in your Supabase SQL Editor:

```sql
-- See supabase-schema.sql for full schema
```

Or copy and run the contents of `supabase-schema.sql` in the Supabase dashboard.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the calculator.

Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main calculator page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── api/
│       ├── submit/           # Store submission + send email
│       ├── submissions/      # Get submissions (admin)
│       └── email-templates/  # CRUD email templates
├── components/
│   ├── InputsPanel.tsx       # Calculator inputs
│   ├── ResultsDashboard.tsx  # Live results display
│   ├── KPICard.tsx           # Grade/Revenue/Severity cards
│   ├── LeakageDrivers.tsx    # Top 3 drivers display
│   ├── ScoreChart.tsx        # Component score bars
│   ├── EmailCapture.tsx      # Email input + submit
│   ├── Slider.tsx            # Custom slider
│   └── ChipSelect.tsx        # Button chip selector
├── lib/
│   ├── scoring.ts            # All calculation logic
│   ├── drivers.ts            # Driver selection logic
│   ├── supabase.ts           # Supabase client
│   └── mailgun.ts            # Mailgun client
└── types/
    └── index.ts              # TypeScript interfaces
```

## Scoring Logic

### Multipliers

- **Response Time**: Under 5 min (0.9) → Next day+ (1.45)
- **Follow-Up Depth**: 4-6 touches (0.9) → Not sure (1.35)
- **Coverage**: Yes (1.0) → No (1.2)

### Grade Calculation

Score starts at 100 and deducts points:
- Response time: 0-30 points
- Follow-up depth: 0-22 points
- After-hours coverage: 0-10 points

### Test Case

**Inputs:**
- Monthly inquiries: 100
- Response time: 5-30 minutes
- Follow-up depth: Not sure
- Patient value: $250-$500
- After-hours: Yes

**Expected:**
- Grade: C (score 73)
- Revenue at Risk: ~$2,835 - $5,265
- Severity: Moderate (11% drop-off)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set all `.env.local` variables in your hosting platform's environment configuration.

## License

Private - All rights reserved.
