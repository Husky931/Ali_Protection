import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alibaba Scam Reports - Share Your Story | Community Protection",
  description: "Have you been scammed by a bad deal on Alibaba? Share your experience and help protect others from fraudulent sellers. Join our community of honest buyers sharing their stories.",
  openGraph: {
    title: "Alibaba Scam Reports - Share Your Story",
    description: "Have you been scammed by a bad deal on Alibaba? Share your experience and help protect others.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
