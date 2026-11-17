// POST  /api/orders            place an order (public)
// GET   /api/orders            list orders (admin)
// PATCH /api/orders            { id, status } update an order's status (admin)
import { db } from './_lib/db.js';
import { isAdmin } from './_lib/auth.js';
import { PRICES, STATUSES, priceItems, validateCustomer } from './_lib/shop.js';

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

async function create(req, res) {
  const b = body(req);
  if (b.website) return res.status(400).json({ error: 'Invalid request.' }); // honeypot field, bots fill it
  const { value: c, errors } = validateCustomer(b.customer);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the highlighted fields.', fields: errors });
  const priced = priceItems(b.items);
  if (priced.error) return res.status(400).json({ error: priced.error });
  const delivery = PRICES.delivery, total = priced.subtotal + delivery;
  const sql = db();
  const [row] = await sql`
    INSERT INTO orders (name, phone, email, governorate, city, address, notes, items, subtotal, delivery, total)
    VALUES (${c.name}, ${c.phone}, ${c.email}, ${c.governorate}, ${c.city}, ${c.address}, ${c.notes},
            ${JSON.stringify(priced.lines)}::jsonb, ${priced.subtotal}, ${delivery}, ${total})
    RETURNING number, total, subtotal, delivery, items, created_at`;
  return res.status(201).json({ order: row });
}

async function list(req, res) {
  const sql = db();
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000`;
  // bigserial ids arrive as strings; send numbers so the admin page can address them
  return res.status(200).json({ orders: rows.map(r => ({ ...r, id: Number(r.id) })) });
}

async function update(req, res) {
  const { status } = body(req), id = Number(body(req).id);
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid order or status.' });
  const sql = db();
  const rows = await sql`UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING id, status, updated_at`;
  if (!rows.length) return res.status(404).json({ error: 'Order not found.' });
  return res.status(200).json({ order: { ...rows[0], id: Number(rows[0].id) } });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') return await create(req, res);
    if (req.method === 'GET' || req.method === 'PATCH') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password.' });
      return req.method === 'GET' ? await list(req, res) : await update(req, res);
    }
    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  }
}
