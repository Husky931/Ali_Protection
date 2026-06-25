import type { Metadata, Viewport } from "next";
import { Navbar, Footer, FloatingReportButton } from "@/components/Navbar";
import { Analytics } from "@/components/Analytics";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, OG_IMAGE, absoluteUrl } from "@/lib/site";
import "./globals.css";

// Sitewide structured data. The Organization establishes the brand entity; the
// WebSite SearchAction tells Google our internal search lives at /reports?q= so it
// can surface a sitelinks searchbox and reinforce the brand for "alibaba scammer".
const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(OG_IMAGE),
    description: SITE_TAGLINE,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/reports?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Report & Search Alibaba Scammers — AlibabaScammer.com",
    template: "%s · AlibabaScammer.com",
  },
  description:
    "AlibabaScammer.com is a group community of Alibaba scam reports. Search any Alibaba seller before you wire money, or report a fraudulent seller to warn other buyers.",
  applicationName: SITE_NAME,
  keywords: [
    "alibaba scammer",
    "alibaba scam",
    "alibaba seller scam",
    "alibaba scam reports",
    "alibaba reviews",
    "report alibaba scammer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Report & Search Alibaba Scammers — AlibabaScammer.com",
    description: SITE_TAGLINE,
    locale: "en_US",
    images: [{ url: OG_IMAGE, alt: "AlibabaScammer.com — buyer reports of Alibaba scams" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Report & Search Alibaba Scammers — AlibabaScammer.com",
    description: SITE_TAGLINE,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#171110",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD).replace(/</g, "\\u003c") }}
        />
        <div id="app">
          <Navbar />
          <main>{children}</main>
          <Footer />
          <FloatingReportButton />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
