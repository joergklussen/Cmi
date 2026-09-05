import crypto from 'node:crypto';

export const PRODUCTS = {
  test:     { amount: '10.00',  name: 'Test Purchase — 100 Crypto Leads', leads: 100, file: 'leads_100.csv.gz' },
  starter:  { amount: '49.00',  name: 'Starter — 1,000 Crypto Leads', leads: 1000, file: 'leads_1000.csv.gz' },
  advanced: { amount: '199.00', name: 'Advanced — 10,000 Crypto Leads', leads: 10000, file: 'leads_10000.csv.gz' },
  pro:      { amount: '299.00', name: 'Pro — 25,000 Crypto Leads', leads: 25000, file: 'leads_25000.csv.gz' },
  business: { amount: '999.00', name: 'Business — 115,000 Crypto Leads', leads: 115000, file: 'leads_115000.csv.gz' },
};

export function secret() {
  const s = process.env.ORDER_SECRET || process.env.DOWNLOAD_SECRET;
  if (!s) throw new Error('ORDER_SECRET is not configured');
  return s;
}

function b64(value) { return Buffer.from(value).toString('base64url'); }
function unb64(value) { return Buffer.from(value, 'base64url').toString('utf8'); }

export function signPayload(payload) {
  const body = b64(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyPayload(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) throw new Error('Invalid token');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw new Error('Invalid token signature');
  const payload = JSON.parse(unb64(body));
  if (payload.exp && Date.now() > payload.exp) throw new Error('Token expired');
  return payload;
}

export function normalizeProduct(value) {
  let key = String(value || '').trim().toLowerCase();
  if (['report', 'signal-report', 'signal_report', 'signalreport'].includes(key)) key = 'starter';
  return PRODUCTS[key] ? key : null;
}

export function safeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : '';
}
