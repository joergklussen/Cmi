# Vercel + PayLio deployment

## Vercel Environment Variables (Production)

Set these in Vercel Project Settings → Environment Variables:

- `PAYLIO_API_KEY` = your current PayLio live API key
- `PAYLIO_WALLET_ADDRESS` = your Polygon USDC payout wallet
- `APP_BASE_URL` = `https://cryptomarketintelligence.pro`

Do not commit the API key to Git or put it in `public/` files.

## Checkout

Product checkout uses `GET /api/pay?product=starter|advanced|pro|business`.
The server function creates a PayLio hosted checkout using `POST https://paylio.org/api/v1/wallet` and redirects the customer to the returned `checkout_url`.

## Callback

PayLio calls `/api/paylio-callback`. The callback is treated as untrusted and the payment is re-verified server-to-server with PayLio `/api/v1/payment-status` before the confirmation page is shown.

## Product prices

- Starter — 1,000 leads — EUR 49 one-time
- Advanced — 10,000 leads — EUR 199 one-time
- Pro — 25,000 leads — EUR 299 one-time
- Business — 115,000 leads — EUR 999 one-time

## Social footer

Every HTML page contains the same six local SVG icons:
LinkedIn, Discord, X, WhatsApp, Instagram, Facebook.
All icons are local assets under `public/assets/social-*.svg` and all links open in a new tab.
