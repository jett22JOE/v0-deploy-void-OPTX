// Stripe product ID → subscription tier mapping
export const STRIPE_PRODUCT_TO_TIER: Record<string, string> = {
  "prod_Tu0RaGRXBaaLGp": "dojo",      // DOJO - Developer Jett Optics ($28.88/6mo)
  "prod_Tu0OGpffZsf6pw": "mojo",      // MOJO - Mobile Jett Optics ($8.88/mo)
  "prod_TwZUBhoeIlmtqo": "unlimited", // UNLIMITED - Full platform ($88.88/mo)
}

// Price IDs for checkout session creation
export const STRIPE_PRICES = {
  DOJO: "price_1SwCQlJxIltc1pGhxniYuaop",      // $28.88/6mo
  MOJO: "price_1SwCO5JxIltc1pGhzgc1GkAs",      // $8.88/mo
  UNLIMITED: "price_1SygMXJxIltc1pGhnJpmQRGX",  // $88.88/mo
} as const

export const VALID_PRICE_IDS = new Set<string>(Object.values(STRIPE_PRICES))

// Price ID → tier mapping (used in checkout route to embed tier in metadata)
export const STRIPE_PRICE_TO_TIER: Record<string, string> = {
  [STRIPE_PRICES.DOJO]: "dojo",
  [STRIPE_PRICES.MOJO]: "mojo",
  [STRIPE_PRICES.UNLIMITED]: "unlimited",
}
