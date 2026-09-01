# CMI Automation v1 — Vercel + PayLio

This build adds an automated delivery flow after a confirmed PayLio settlement.

## Required Vercel environment variables

PAYLIO_API_KEY=your-new-PayLio-live-key
PAYLIO_WALLET_ADDRESS=0x4d418536aabd50ddaac84c2099a5faa3b926e1d8
APP_BASE_URL=https://cryptomarketintelligence.pro
ORDER_SECRET=a-long-random-secret-at-least-32-characters

## Optional automated email delivery

RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=verified-sender@your-domain

If the mail variables are absent, the confirmed-payment page still provides the download and dashboard links.

## Flow

1. Customer enters email on /checkout.
2. /api/pay creates the PayLio hosted checkout with a signed order reference.
3. PayLio returns to /api/paylio-callback.
4. Callback verifies the payment server-to-server using PayLio payment-status.
5. A signed 30-day entitlement token is created.
6. Customer receives a protected CSV download and dashboard link.
7. If Resend is configured, the same links are emailed automatically.

## Data

The four product files are private to the deployment and are not under /public:
- data/leads_1000.csv.gz
- data/leads_10000.csv.gz
- data/leads_25000.csv.gz
- data/leads_115000.csv.gz

They are streamed through /api/download only after a verified PayLio payment and valid signed token.

## Important

This v1 uses signed entitlements rather than a database. It is intentionally simple for launch. For a later scale-up, add Postgres/Neon for durable customer, order, entitlement and analytics records.

The lead data contains personal information in some records. Product use, delivery, marketing and outreach must comply with applicable privacy, data-protection and anti-spam rules. The system does not automatically send outreach to purchased leads.
