import Link from "next/link";

export function FloatingReportButton() {
  return (
    <Link
      href="/report"
      className="fixed bottom-6 right-6 z-40 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black hover:shadow-xl"
    >
      Report Seller
    </Link>
  );
}
