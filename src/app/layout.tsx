import type { Metadata } from "next";
import "./globals.css";
import { ClientBody } from "./ClientBody";

export const metadata: Metadata = {
  title: "ארוחות בוקר ובר יין - קיקי בר",
  icons: {
    icon: "/kiki-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="scroll-smooth">
      <ClientBody>{children}</ClientBody>
    </html>
  );
}
