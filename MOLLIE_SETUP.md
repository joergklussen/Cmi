# Mollie setup for Crypto Market Intelligence

The site now uses Mollie as the primary card-payment provider. PayLio remains available as an optional fallback if `PAYMENT_PROVIDER=paylio` is explicitly set.

## Vercel Production variables

Required:
- `MOLLIE_API_KEY` — your Mollie API key
- `ORDER_SECRET` — existing order/download signing secret
- `APP_BASE_URL=https://cryptomarketintelligence.pro`

Optional:
- `PAYMENT_PROVIDER=mollie` (recommended; this is the default)
- `RESEND_API_KEY`
- `FROM_EMAIL`

## Flow

`/api/pay?product=test&email=...` creates a Mollie one-off EUR payment with `method=creditcard`, then redirects to Mollie's hosted checkout.

Mollie calls `/api/mollie-webhook` with the payment ID. The server fetches the payment from Mollie and only fulfills the order when the status is `paid`.

After checkout, Mollie redirects to `/api/mollie-return?id=...`; this page independently fetches the payment status and only shows the download after Mollie confirms `paid`.

The same product delivery code is used for the €10 test offer and the €49/€199/€299/€999 products.
