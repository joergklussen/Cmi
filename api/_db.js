import { neon } from '@neondatabase/serverless';

export function db(){
  const url=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.NETLIFY_DATABASE_URL;
  if(!url) throw new Error('DATABASE_URL missing');
  return neon(url);
}

export async function ensureSchema(){
  const sql=db();
  await sql`CREATE TABLE IF NOT EXISTS cmi_orders (
    id BIGSERIAL PRIMARY KEY,
    provider TEXT NOT NULL,
    payment_id TEXT,
    order_id TEXT NOT NULL,
    product TEXT NOT NULL,
    leads INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    email TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    email_status TEXT NOT NULL DEFAULT 'pending',
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider,payment_id),
    UNIQUE(provider,order_id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS cmi_dynamic_deliveries (
    fulfillment_key TEXT PRIMARY KEY,
    product TEXT NOT NULL,
    product_id TEXT,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    download_url TEXT NOT NULL,
    dashboard_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function recordOrder(o){
  const sql=db();
  await ensureSchema();
  const rows=await sql`INSERT INTO cmi_orders(provider,payment_id,order_id,product,leads,amount,currency,email,payment_status,delivery_status,email_status,updated_at)
    VALUES(${o.provider},${o.paymentId||null},${o.orderId},${o.product},${o.leads},${o.amount},${o.currency||'EUR'},${o.email},${o.paymentStatus||'paid'},${o.deliveryStatus||'ready'},${o.emailStatus||'pending'},NOW())
    ON CONFLICT (provider,order_id) DO UPDATE SET payment_id=COALESCE(EXCLUDED.payment_id,cmi_orders.payment_id),payment_status=EXCLUDED.payment_status,delivery_status=EXCLUDED.delivery_status,email_status=EXCLUDED.email_status,updated_at=NOW()
    RETURNING *`;
  return rows[0];
}

export async function getOrderByOrderId(provider,orderId){
  const sql=db(); await ensureSchema();
  const rows=await sql`SELECT * FROM cmi_orders WHERE provider=${provider} AND order_id=${orderId} LIMIT 1`;
  return rows[0]||null;
}

export async function incrementDownload(orderId){
  const sql=db(); await ensureSchema();
  await sql`UPDATE cmi_orders SET download_count=download_count+1,updated_at=NOW() WHERE order_id=${orderId}`;
}
