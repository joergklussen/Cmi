# PayLio API — Vercel

This build uses PayLio's REST API to create hosted checkout sessions server-side.

## Vercel Environment Variables

`PAYLIO_API_KEY=your PayLio live API key`
`PAYLIO_WALLET_ADDRESS=0x4d418536aabd50ddaac84c2099a5faa3b926e1d8`
`APP_BASE_URL=https://cryptomarketintelligence.pro`

The PayLio Merchant ID is `cmtfox3f200bdqm01z6e4ejj8` in the account, but the REST API used here authenticates with the API key and sends the payout wallet in the checkout request, so Merchant ID is not currently required by the code.

## Products

- Starter — 1,000 leads — EUR 49.00 — one-time
- Advanced — 10,000 leads — EUR 199.00 — one-time
- Pro — 25,000 leads — EUR 299.00 — currently one-time through the REST API
- Business — 115,000 leads — EUR 999.00 — one-time

## Checkout

`/api/pay?product=starter`
`/api/pay?product=advanced`
`/api/pay?product=pro`
`/api/pay?product=business`

## Verification

PayLio documents server-to-server verification through `/api/v1/payment-status`. The callback implementation re-verifies the payment before showing the confirmation page.
