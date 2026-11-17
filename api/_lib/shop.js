// Single source of truth for what is sold and what it costs. The server prices every order from here;
// prices sent by the browser are never trusted.
export const FLAVOURS = ['Mojito', 'Spritz', 'Paloma', 'Ginger Mule', 'Berry Sangria'];
export const PRICES = { can: 20, caseCans: 12, case: 240, pack: 50, delivery: 0 }; // EGP

export const GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Sharqia', 'Dakahlia', 'Gharbia', 'Monufia', 'Beheira',
  'Kafr El Sheikh', 'Damietta', 'Port Said', 'Ismailia', 'Suez', 'North Sinai', 'South Sinai', 'Red Sea',
  'Matrouh', 'Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'New Valley',
];

export const STATUSES = ['new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];

const MAX_LINES = 30, MAX_QTY = 50;

/** Egyptian mobile numbers: 01[0,1,2,5] + 8 digits. Accepts +20 / 0020 prefixes and Arabic-Indic digits. */
export function normalizePhone(raw) {
  let p = String(raw || '')
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[^\d+]/g, '');
  if (p.startsWith('+20')) p = '0' + p.slice(3);
  else if (p.startsWith('0020')) p = '0' + p.slice(4);
  else if (p.startsWith('20') && p.length === 12) p = '0' + p.slice(2);
  return /^01[0125]\d{8}$/.test(p) ? p : null;
}

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function validateCustomer(c = {}) {
  const errors = {};
  const value = {
    name: clean(c.name, 80),
    phone: normalizePhone(c.phone),
    email: clean(c.email, 120) || null,
    governorate: clean(c.governorate, 40),
    city: clean(c.city, 80),
    address: clean(c.address, 240),
    notes: clean(c.notes, 500) || null,
  };
  if (value.name.length < 2) errors.name = 'Please enter your full name.';
  if (!value.phone) errors.phone = 'Please enter a valid Egyptian mobile number (e.g. 010 1234 5678).';
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.email = 'Please enter a valid email, or leave it empty.';
  if (!GOVERNORATES.includes(value.governorate)) errors.governorate = 'Please choose your governorate.';
  if (value.city.length < 2) errors.city = 'Please enter your city or area.';
  if (value.address.length < 5) errors.address = 'Please enter your street address.';
  return { value, errors };
}

const isFlavour = f => Number.isInteger(f) && f >= 0 && f < FLAVOURS.length;

/** Turns cart lines into priced order lines. Returns { lines, subtotal } or { error }. */
export function priceItems(items) {
  if (!Array.isArray(items) || items.length === 0) return { error: 'Your cart is empty.' };
  if (items.length > MAX_LINES) return { error: 'Too many items in one order.' };
  const lines = [];
  for (const it of items) {
    const qty = Number(it?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: 'Invalid quantity.' };
    if (it.type === 'case' && isFlavour(it.flavour)) {
      lines.push({ type: 'case', flavours: [it.flavour], label: `Case of ${PRICES.caseCans} · ${FLAVOURS[it.flavour]}`, qty, unit: PRICES.case, total: PRICES.case * qty });
    } else if (it.type === 'pack' && Array.isArray(it.flavours) && it.flavours.length === 3 && it.flavours.every(isFlavour)) {
      lines.push({ type: 'pack', flavours: it.flavours, label: `3 pack · ${it.flavours.map(f => FLAVOURS[f]).join(', ')}`, qty, unit: PRICES.pack, total: PRICES.pack * qty });
    } else return { error: 'Your cart has an item we don’t recognise. Please refresh and try again.' };
  }
  return { lines, subtotal: lines.reduce((n, l) => n + l.total, 0) };
}
