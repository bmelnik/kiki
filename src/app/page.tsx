"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/menu/MenuComponents";

function Hero() {
  return (
    <section className="relative h-[300px] md:h-[350px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://ext.same-assets.com/471743189/1834863273.webp')`,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <p className="text-white text-lg md:text-2xl font-body tracking-widest">ארוחות בוקר - בר יין</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0D3B52] text-white py-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex justify-center md:justify-end">
            <Image
              src="/kiki-logo.svg"
              alt="Kiki"
              width={200}
              height={200}
              className="h-32 w-auto opacity-80"
            />
          </div>

          <div className="text-center md:text-right">
            <h4 className="font-heading text-sm tracking-widest mb-4 text-[#7e6444]">צור קשר</h4>
            <div className="font-body text-sm text-gray-300 space-y-2">
              <p>כתובת: רפאל איתן 5<br />אם המושבות<br />פתח תקווה</p>
              <p className="pt-2">טלפון: <Link href="tel:0547668877" className="hover:text-[#7e6444] transition-colors">054-7668877</Link></p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <h4 className="font-heading text-sm tracking-widest mb-4 text-[#7e6444]">שעות עבודה</h4>
            <div className="font-body text-sm text-gray-300">
              <p>א-ה 8:30-23:30</p>
              <p>יום שישי 9:00-14:00</p>
              <p>מוצ״ש 20:00-23:30</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <h4 className="font-heading text-sm tracking-widest mb-4 text-[#7e6444]">עקבו אחרינו</h4>
            <div className="font-body text-sm text-gray-300 space-y-2">
              <p><Link href="https://www.instagram.com/kiki_bar.pt/" className="hover:text-[#7e6444] transition-colors">אינסטגרם</Link></p>
              <p><Link href="https://www.facebook.com/kiki_bar.pt/" className="hover:text-[#7e6444] transition-colors">פייסבוק</Link></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function DrinksMenuPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Footer />
    </main>
  );
}
