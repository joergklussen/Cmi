import { neon } from '@neondatabase/serverless';

function sqlClient(){
  const url=process.env.DATABASE_URL||process.env.POSTGRES_URL||'';
  if(!url) return null;
  return neon(url);
}

export function dbConfigured(){ return Boolean(process.env.DATABASE_URL||process.env.POSTGRES_URL); }

export async function ensureSchema(){
  const sql=sqlClient(); if(!sql) return false;
  await sql`CREATE TABLE IF NOT EXISTS cmi_orders (
    id BIGSERIAL PRIMARY KEY,
    provider TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    order_id TEXT,
    product TEXT NOT NULL,
    leads INTEGER NOT NULL,
    amount NUMERIC(12,2),
    currency TEXT DEFAULT 'EUR',
    customer_email TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    email_status TEXT NOT NULL DEFAULT 'pending',
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider,payment_id)
  )`;
  await sql`CREATE INDEX IF NOT EXISTS cmi_orders_created_at_idx ON cmi_orders(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS cmi_orders_email_idx ON cmi_orders(customer_email)`;
  await sql`CREATE TABLE IF NOT EXISTS cmi_dynamic_deliveries (
    fulfillment_key TEXT PRIMARY KEY,
    product TEXT NOT NULL,
    product_id TEXT,
    customer_email TEXT,
    token TEXT NOT NULL,
    download_url TEXT NOT NULL,
    dashboard_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  return true;
}

export async function getDynamicDelivery(fulfillmentKey){
  const sql=sqlClient(); if(!sql) return null;
  try{
    await ensureSchema();
    const rows=await sql`SELECT fulfillment_key,product,product_id,customer_email,token,download_url,dashboard_url,created_at FROM cmi_dynamic_deliveries WHERE fulfillment_key=${fulfillmentKey} LIMIT 1`;
    return rows[0]||null;
  }catch(error){ console.error('CMI DB getDynamicDelivery',error); return null; }
}

export async function saveDynamicDelivery(o){
  const sql=sqlClient(); if(!sql) return {stored:false};
  try{
    await ensureSchema();
    await sql`INSERT INTO cmi_dynamic_deliveries(fulfillment_key,product,product_id,customer_email,token,download_url,dashboard_url)
      VALUES(${o.fulfillment_key},${o.product},${o.product_id||null},${o.email||null},${o.token},${o.download_url},${o.dashboard_url})
      ON CONFLICT(fulfillment_key) DO NOTHING`;
    const row=await getDynamicDelivery(o.fulfillment_key);
    return {stored:Boolean(row),row};
  }catch(error){ console.error('CMI DB saveDynamicDelivery',error); return {stored:false,error:String(error?.message||error)}; }
}

export async function recordOrder(o){
  const sql=sqlClient(); if(!sql) return {stored:false};
  try{
    await ensureSchema();
    await sql`INSERT INTO cmi_orders(provider,payment_id,order_id,product,leads,amount,currency,customer_email,payment_status,delivery_status,email_status,updated_at)
      VALUES(${o.provider},${o.payment_id},${o.order_id||null},${o.product},${o.leads},${o.amount||null},${o.currency||'EUR'},${o.email||null},${o.payment_status||'PAID'},${o.delivery_status||'ready'},${o.email_status||'pending'},NOW())
      ON CONFLICT(provider,payment_id) DO UPDATE SET order_id=EXCLUDED.order_id,product=EXCLUDED.product,leads=EXCLUDED.leads,amount=EXCLUDED.amount,currency=EXCLUDED.currency,customer_email=EXCLUDED.customer_email,payment_status=EXCLUDED.payment_status,delivery_status=EXCLUDED.delivery_status,email_status=EXCLUDED.email_status,updated_at=NOW()`;
    return {stored:true};
  }catch(error){ console.error('CMI DB recordOrder',error); return {stored:false,error:String(error?.message||error)}; }
}

export async function updateOrder(provider,paymentId,patch={}){
  const sql=sqlClient(); if(!sql) return {stored:false};
  try{
    await ensureSchema();
    const d=patch.delivery_status, e=patch.email_status;
    if(d!==undefined && e!==undefined) await sql`UPDATE cmi_orders SET delivery_status=${d},email_status=${e},updated_at=NOW() WHERE provider=${provider} AND payment_id=${paymentId}`;
    else if(d!==undefined) await sql`UPDATE cmi_orders SET delivery_status=${d},updated_at=NOW() WHERE provider=${provider} AND payment_id=${paymentId}`;
    else if(e!==undefined) await sql`UPDATE cmi_orders SET email_status=${e},updated_at=NOW() WHERE provider=${provider} AND payment_id=${paymentId}`;
    return {stored:true};
  }catch(error){ console.error('CMI DB updateOrder',error); return {stored:false,error:String(error?.message||error)}; }
}

export async function getOrderByOrderId(provider, orderId){
  const sql=sqlClient(); if(!sql) return null;
  try{
    await ensureSchema();
    const rows=await sql`SELECT provider,payment_id,order_id,product,leads,amount,currency,customer_email,payment_status,delivery_status,email_status,download_count,created_at FROM cmi_orders WHERE provider=${provider} AND order_id=${orderId} ORDER BY created_at DESC LIMIT 1`;
    return rows[0]||null;
  }catch(error){ console.error('CMI DB getOrderByOrderId',error); return null; }
}

export async function recordDownload(provider,paymentId){
  const sql=sqlClient(); if(!sql) return;
  try{ await ensureSchema(); await sql`UPDATE cmi_orders SET download_count=download_count+1,updated_at=NOW() WHERE provider=${provider} AND payment_id=${paymentId}`; }catch(error){ console.error('CMI DB recordDownload',error); }
}

export async function adminStats(){
  const sql=sqlClient(); if(!sql) throw new Error('DATABASE_URL is not configured');
  await ensureSchema();
  const [summary,products,recent]=await Promise.all([
    sql`SELECT COUNT(*)::int AS orders, COALESCE(SUM(amount),0)::numeric AS revenue, COALESCE(SUM(leads),0)::bigint AS leads, COALESCE(SUM(download_count),0)::bigint AS downloads FROM cmi_orders WHERE payment_status='PAID'`,
    sql`SELECT product,COUNT(*)::int AS orders,COALESCE(SUM(amount),0)::numeric AS revenue,COALESCE(SUM(leads),0)::bigint AS leads FROM cmi_orders WHERE payment_status='PAID' GROUP BY product ORDER BY revenue DESC`,
    sql`SELECT provider,payment_id,order_id,product,leads,amount,currency,customer_email,payment_status,delivery_status,email_status,download_count,created_at FROM cmi_orders ORDER BY created_at DESC LIMIT 50`
  ]);
  return {summary:summary[0]||{},products,recent};
}
