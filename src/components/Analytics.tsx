import Script from "next/script";

// Google Analytics 4. Loads only in production, so local/dev traffic never pollutes
// the property. The measurement ID falls back to the live property if the env var
// isn't set, so analytics works even without NEXT_PUBLIC_GA_ID wired in Vercel.
// Implemented with next/script (no extra dependency) — see seo-strategy.md.
const GA_FALLBACK_ID = "G-1SFG73Q6NB";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || GA_FALLBACK_ID;
  if (!gaId || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
