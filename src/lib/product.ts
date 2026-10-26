export type License = "personal" | "studio";

export const PRODUCT = {
  name: "The Creator’s Toolkit",
  description: "A little structure for your big ideas. 10 thoughtfully made templates for your creative life.",
  currency: "usd",
  licenses: {
    personal: { name: "Just me", description: "For your own little universe", price: 4900, originalPrice: 6900, seats: 1 },
    studio: { name: "My studio", description: "Good things happen together", price: 8900, originalPrice: 11900, seats: 5 },
  },
} as const;

export const INCLUDES = [
  "Your personal creative dashboard",
  "Project & client management",
  "Weekly planner & habit tracker",
  "Content calendar & idea bank",
  "Finance tracker & resource library",
  "Getting-started guide & lifetime updates",
];

export const COUNTRIES = ["Australia", "Austria", "Belgium", "Brazil", "Canada", "Denmark", "Finland", "France", "Germany", "India", "Indonesia", "Ireland", "Italy", "Japan", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Philippines", "Poland", "Portugal", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "United Arab Emirates", "United Kingdom", "United States", "Other"];

export const formatMoney = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(cents / 100);
export const isLicense = (value: unknown): value is License => value === "personal" || value === "studio";
export const isEmail = (value: unknown): value is string => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function calculatePrice(license: License, promoCode = "") {
  const subtotal = PRODUCT.licenses[license].price;
  const code = promoCode.trim().toUpperCase();
  if (code && code !== "HELLO10") throw new Error("That code doesn’t look quite right. Give HELLO10 a try.");
  const discount = code === "HELLO10" ? Math.round(subtotal * 0.1) : 0;
  return { subtotal, discount, total: subtotal - discount, promoCode: code || null };
}
