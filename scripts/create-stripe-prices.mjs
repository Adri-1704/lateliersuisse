/**
 * Creates all 18 Just-Tag subscription prices in Stripe.
 * Run once: node scripts/create-stripe-prices.mjs
 *
 * Requires STRIPE_SECRET_KEY in environment (reads from .env.local).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import Stripe from "stripe";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?([^"'\n]*)["']?/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

// Prices displayed per month; billing amounts:
// monthly  = per-month amount billed monthly
// semi     = per-month amount × 6 billed every 6 months
// annual   = per-month amount × 12 billed yearly

const PRICES = {
  monthly:    { 50: [49.95, 69.95], 100: [59.95, 79.95], 200: [99.95, 119.95] },
  semiannual: { 50: [44.90, 62.90], 100: [53.90, 71.90], 200: [89.90, 107.90] },
  annual:     { 50: [41.90, 58.90], 100: [49.90, 66.90], 200: [83.90, 99.90] },
};

function stripeInterval(billing) {
  if (billing === "monthly")    return { interval: "month", interval_count: 1 };
  if (billing === "semiannual") return { interval: "month", interval_count: 6 };
  if (billing === "annual")     return { interval: "year",  interval_count: 1 };
}

function totalCentimes(billing, monthlyPrice) {
  const multiplier = billing === "semiannual" ? 6 : billing === "annual" ? 12 : 1;
  return Math.round(monthlyPrice * multiplier * 100);
}

async function main() {
  console.log("Creating Just-Tag WhatsApp product...");
  const product = await stripe.products.create({
    name: "Just-Tag WhatsApp",
    description: "Fiche restaurant + broadcast WhatsApp abonnés",
    metadata: { project: "just-tag" },
  });
  console.log(`Product created: ${product.id}\n`);

  const envLines = [`STRIPE_PRODUCT_ID="${product.id}"`];

  for (const [billing, tiers] of Object.entries(PRICES)) {
    for (const [tierStr, [launchPrice, cataloguePrice]] of Object.entries(tiers)) {
      const tier = Number(tierStr);
      const iv = stripeInterval(billing);

      for (const [phase, price] of [["launch", launchPrice], ["catalogue", cataloguePrice]]) {
        const amount = totalCentimes(billing, price);
        const nickname = `Just-Tag ${tier} abonnés · ${billing} · ${phase} — CHF ${price}/mois`;

        const stripePrice = await stripe.prices.create({
          product: product.id,
          currency: "chf",
          unit_amount: amount,
          recurring: iv,
          nickname,
          metadata: { billing, tier: String(tier), phase },
        });

        const envKey = `STRIPE_PRICE_${billing.toUpperCase()}_${tier}_${phase.toUpperCase()}`;
        envLines.push(`${envKey}="${stripePrice.id}"`);
        console.log(`✓ ${envKey}="${stripePrice.id}" (${nickname} → ${amount} centimes)`);
      }
    }
  }

  console.log("\n─────────────────────────────────────────────────────");
  console.log("Add these lines to your .env.local and Vercel env vars:");
  console.log("─────────────────────────────────────────────────────");
  console.log(envLines.join("\n"));
}

main().catch((e) => { console.error(e); process.exit(1); });
