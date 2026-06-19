import type { Metadata } from "next";

// Manage pages are private and must never be indexed. `referrer: no-referrer`
// keeps any stray token (e.g. before the enter route strips it) from leaking via
// the Referer header to analytics or the image CDN.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
