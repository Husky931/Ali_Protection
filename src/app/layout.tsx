import type { Metadata } from "next";
import { Navbar, Footer, FloatingReportButton } from "@/components/Navbar";
import { Analytics } from "@/components/Analytics";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, OG_IMAGE } from "@/lib/site";
import "./globals.css";

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
