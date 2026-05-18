/**
 * Brand constants — single source of truth for the platform's identity.
 * Anywhere a component would otherwise hardcode "Arokoverse" or describe
 * the product, import from here instead.
 *
 * This is also the seam where i18n will plug in later (design doc §11.6).
 * When that happens, BRAND.name stays in place but BRAND.tagline becomes
 * a t() call.
 */
export const BRAND = {
  name: "Arokoverse",
  tagline: "A home for serialised fiction, articles, short stories, and poems.",
  domain: "arokoverse.com",
} as const