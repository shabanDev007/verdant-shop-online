import type { Coupon, Review } from "@/types";
import { products } from "./mockData";

// ---------- Coupons ----------

export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minSubtotal: 500,
    active: true,
    description: "10% off your first order over 500 EGP.",
  },
  {
    code: "PLANT50",
    type: "fixed",
    value: 50,
    minSubtotal: 800,
    active: true,
    description: "Save 50 EGP on orders over 800 EGP.",
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 50,
    active: true,
    description: "Free standard delivery.",
  },
  {
    code: "SPRING20",
    type: "percent",
    value: 20,
    minSubtotal: 1500,
    active: true,
    description: "20% off spring collection over 1,500 EGP.",
  },
];

export function validateCoupon(
  code: string,
  subtotal: number,
): { ok: true; coupon: Coupon; discount: number } | { ok: false; reason: string } {
  const c = coupons.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
  if (!c || !c.active) return { ok: false, reason: "Invalid coupon code." };
  if (c.minSubtotal && subtotal < c.minSubtotal)
    return { ok: false, reason: `Minimum order ${c.minSubtotal} EGP required.` };
  const discount = c.type === "percent" ? Math.round(subtotal * (c.value / 100)) : c.value;
  return { ok: true, coupon: c, discount: Math.min(discount, subtotal) };
}

// ---------- Reviews (seeded 2-3 per featured product) ----------

const REVIEWERS = [
  "Nour A.", "Omar H.", "Salma M.", "Youssef K.", "Farida R.",
  "Karim S.", "Layla T.", "Hassan I.", "Mona E.", "Ahmed G.",
];
const TITLES = [
  "Arrived healthy and beautiful",
  "Better than expected",
  "Exactly what I wanted",
  "Great quality plant",
  "Perfect for my space",
  "Well packaged",
];
const BODIES = [
  "Shipping was fast and the plant arrived in excellent condition. Very happy with the purchase.",
  "The packaging kept everything safe. It's been thriving in my living room.",
  "Beautiful, healthy plant. Care instructions were super helpful.",
  "Larger than I expected — great value. Would order again.",
  "Customer service was responsive and the plant looks amazing.",
];

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return Math.abs(h);
}

export const reviews: Review[] = (() => {
  const out: Review[] = [];
  for (const p of products) {
    if (!p.featured && Math.random() > 0.4) continue;
    const seed = hash(p.id);
    const count = 2 + (seed % 2);
    for (let i = 0; i < count; i++) {
      const s = hash(p.id + i);
      out.push({
        id: `rev-${p.id}-${i}`,
        productId: p.id,
        userName: REVIEWERS[s % REVIEWERS.length],
        rating: 4 + ((s % 20) / 20 > 0.3 ? 1 : 0),
        title: TITLES[s % TITLES.length],
        body: BODIES[s % BODIES.length],
        verified: s % 3 !== 0,
        createdAt: new Date(Date.now() - (s % 90) * 86400000).toISOString(),
      });
    }
  }
  return out;
})();

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

// ---------- Popular searches ----------

export const popularSearches = [
  "Monstera",
  "Snake Plant",
  "Succulents",
  "Pothos",
  "Ceramic Pot",
  "Fertilizer",
  "Air Purifying",
  "Pet Friendly",
];
