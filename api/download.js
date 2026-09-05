import fs from 'node:fs';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { PRODUCTS, verifyPayload } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed.');
  try {
    const token = new URL(req.url, `https://${req.headers.host || 'cryptomarketintelligence.pro'}`).searchParams.get('token');
    const payload = verifyPayload(token);
    const product = PRODUCTS[payload.product];
    if (!product || payload.payment_verified !== true) return res.status(403).send('Access denied.');
    const file = path.join(process.cwd(), 'data', product.file);
    if (!fs.existsSync(file)) return res.status(404).send('Product file is not available.');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="CMI-${payload.product}-${product.leads}-leads.csv"`);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    fs.createReadStream(file).pipe(createGunzip()).pipe(res);
  } catch (error) {
    return res.status(403).send(error instanceof Error ? error.message : 'Invalid download token.');
  }
}
