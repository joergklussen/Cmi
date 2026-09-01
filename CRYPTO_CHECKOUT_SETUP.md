# Crypto checkout setup

CMI now offers three payment choices on checkout:

- Mollie — card checkout
- PayLio — crypto checkout
- BTCPay — Bitcoin / Lightning, pure crypto checkout

BTCPay is optional until configured. Set these Vercel Production variables:

- `BTCPAY_INSTANCE` e.g. `https://your-btcpay.example`
- `BTCPAY_STORE_ID`
- `BTCPAY_API_KEY`
- `BTCPAY_WEBHOOK_SECRET`

The API key should be restricted to the CMI store and given only the permissions needed to create/view/modify invoices and manage the webhook. BTCPay's Greenfield API creates invoices at `/api/v1/stores/{storeId}/invoices` and returns a `checkoutLink`; webhook requests are authenticated with `BTCPay-Sig` HMAC. See https://docs.btcpayserver.org/Development/ecommerce-integration-guide/.
