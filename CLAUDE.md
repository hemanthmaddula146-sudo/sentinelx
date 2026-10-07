# SentinelX

## Project
SentinelX is an AI-Powered Real-Time Community Safety Platform.

It combines:
- Citizen incident reporting
- GIS/live maps
- IoT sensor telemetry
- AI analysis
- Risk assessment
- Real-time alerts
- Authority command center
- Disaster intelligence

## Technology Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- PostGIS
- Grok API
- Vercel

## Existing Supabase Backend

The Supabase project already exists.

Existing tables:
- profiles
- incidents
- sensors
- sensor_readings
- alerts
- risk_assessments
- ai_analyses

Do NOT recreate, drop, or destroy these tables.

Existing backend features include:
- Authentication
- Row Level Security
- PostGIS
- Realtime
- Private incident image storage
- Citizen and authority roles

## Security Rules

1. Never expose Supabase service-role keys in frontend code.
2. Never hardcode API keys, passwords, tokens, or secrets.
3. Use environment variables for secrets.
4. Respect existing Supabase RLS policies.
5. Validate user input.
6. Protect authenticated routes and privileged authority functionality.
7. Never create fake security or authentication logic.
8. Do not expose private storage files publicly.

## Development Rules

1. Build incrementally.
2. Inspect existing code before changing it.
3. Do not overwrite working code unnecessarily.
4. Use reusable components.
5. Use clean TypeScript architecture.
6. Handle loading, empty, error, and success states.
7. Make the application responsive.
8. Do not create fake statistics or fake production data.
9. Do not create fake AI responses.
10. Do not connect GitHub yet.
11. Do not deploy to Vercel yet.
12. Do not modify the Supabase database unless explicitly instructed.
13. Verify important changes after implementation.
14. Keep the UI professional and production-oriented.

## Product Modules

Planned modules:
- Landing page
- Authentication
- Citizen dashboard
- Incident reporting
- Incident image upload
- Live GIS map
- Real-time alerts
- Sensor monitoring
- Risk assessment
- AI emergency assistant
- AI incident analysis
- Authority command center
- Incident management
- Analytics
- Disaster intelligence

## Design Direction

SentinelX should look like a professional real-world emergency intelligence SaaS platform.

Design should be:
- Modern
- Professional
- Trustworthy
- Responsive
- Accessible
- Clean
- Information-dense without being cluttered

Use strong visual hierarchy, clear status indicators, maps, charts, cards, useful animations, and consistent spacing.

Avoid:
- Cartoon-style UI
- Excessive gradients
- Excessive glassmorphism
- Unnecessary animations
- Fake dashboard numbers
- Placeholder buttons that do nothing

## Development Method

For every major feature:

1. Inspect the existing implementation.
2. Explain the intended change.
3. Implement a complete working version.
4. Verify the implementation.
5. Fix errors before moving forward.

Do not attempt to build the entire application in one giant change.

## Current Goal

The immediate goal is to establish a clean, professional SentinelX foundation and then build each production feature incrementally.
