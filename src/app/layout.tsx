import type { Metadata } from "next";
import { Navbar, Footer, FloatingReportButton } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scam Reports — Bad seller alerts on wholesale marketplaces",
  description:
    "A community-run wall of fraud reports about bad sellers on overseas wholesale marketplaces. Share your experience and help protect others.",
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
      </body>
    </html>
  );
}
