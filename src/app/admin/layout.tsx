import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiki Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-100 min-h-screen font-sans">{children}</body>
    </html>
  );
}
