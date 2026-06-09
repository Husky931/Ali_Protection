// Single source of truth for the site's public identity (URL, name, OG image).
// Used by metadata (layout/generateMetadata), sitemap.ts, robots.ts, and JSON-LD.

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const url = explicit || vercel || "https://alibabascammer.com";
  return url.replace(/\/+$/, ""); // strip trailing slash so absoluteUrl() concatenation is safe
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Alibaba Scammer";

export const SITE_TAGLINE =
  "Search any Alibaba seller before you wire money. Real buyer reports of Alibaba scams.";

// TODO: replace with a purpose-built 1200x630 social card at /og-default.png.
// Until then we fall back to the existing hero screenshot.
export const OG_IMAGE = "/hero-alibaba.png";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
