# Crypto Market Intelligence — PayLio / Vercel

Static Vercel site with PayLio serverless checkout, SEO metadata, sitemap, robots.txt and structured data.

## Vercel Environment Variables

Set these in the Vercel project for Production (and Preview if desired):

- `PAYLIO_API_KEY` — your PayLio live API key
- `PAYLIO_WALLET_ADDRESS` — Polygon USDC payout wallet
- `APP_BASE_URL` — `https://cryptomarketintelligence.pro`

The Merchant ID is retained in the PayLio dashboard but is not required by the REST API used by this build; the API documentation authenticates requests with the API key and uses the payout wallet in the checkout payload.

## Checkout

- `/api/pay?product=starter`
- `/api/pay?product=advanced`
- `/api/pay?product=pro`
- `/api/pay?product=business`
- legacy `/api/pay?product=report` and `signal-report` aliases resolve to Starter.

The API key is server-side only and is never exposed to browser JavaScript.

## PayLio callback

`/api/paylio-callback` verifies the callback reference against PayLio's `/api/v1/payment-status` endpoint before showing payment confirmation.

## Direct Crypto Checkout

Added zero-custody direct crypto checkout for BTC, ETH, USDT (TRC-20) and SOL using the configured public receiving addresses. No private keys are required. The checkout quotes the EUR product price, creates a unique signed order, displays the exact crypto amount/address, and polls server-side blockchain verification before issuing dashboard/download access.

Optional `CRYPTO_PRICES_EUR_JSON` can override BTC/ETH/SOL EUR prices, e.g. `{"BTC":100000,"ETH":4000,"SOL":200}`. Otherwise the quote endpoint uses CoinGecko's public simple-price endpoint.
