"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { fullMenuData, type MenuItem } from "@/lib/mainMenuData";

// Components
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuCategories = Object.keys(fullMenuData);

  const navLinks = [
    { name: "בית", href: "#" },
    { name: "תפריט", href: "#main-menu" },
    { name: "הזמנת מקום", href: "#" },
    { name: "אודות", href: "#" },
  ];

  return (
    <header className="bg-[#0D3B52] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="#" className="flex-shrink-0">
            <Image
              src="/kiki-logo.svg"
              alt="Kiki"
              width={200}
              height={200}
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) =>
              link.name === "תפריט" ? (
                <div key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-white text-sm font-medium hover:text-[#7e6444] transition-colors font-body uppercase tracking-wide"
                  >
                    {link.name}
                    <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute left-1/2 top-full hidden min-w-40 -translate-x-1/2 bg-[#0D3B52] border border-[#333] shadow-lg group-hover:block z-50" dir="rtl">
                    {menuCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('main-menu');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          // trigger category via custom event
                          window.dispatchEvent(new CustomEvent('set-menu-category', { detail: cat }));
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-white hover:bg-[#2a2522] transition-colors font-body"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-sm font-medium hover:text-[#7e6444] transition-colors font-body uppercase tracking-wide"
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Phone icon */}
            <Link href="tel:0547668877" className="text-white hover:text-[#7e6444] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Link>

            {/* Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-[#7e6444] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D3B52] border-t border-[#333]">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-white text-sm font-medium hover:text-[#7e6444] transition-colors font-body uppercase tracking-wide py-2"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

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

function MenuDivider() {
  return <div className="border-t border-dashed border-gray-300 my-6" />;
}

function MainMenuSection() {
  const categories = Object.keys(fullMenuData);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // Listen for category selection from the header dropdown
  useEffect(() => {
    const handler = (e: Event) => {
      setActiveCategory((e as CustomEvent<string>).detail);
    };
    window.addEventListener('set-menu-category', handler);
    return () => window.removeEventListener('set-menu-category', handler);
  }, []);
  const subcategories = Object.entries(fullMenuData[activeCategory] as Record<string, MenuItem[]>);
  const middle = Math.ceil(subcategories.length / 2);
  const leftColumn = subcategories.slice(0, middle);
  const rightColumn = subcategories.slice(middle);

  const spiritLikeSubcategories = new Set([
    "וודקה",
    "ג'ין",
    "וויסקי",
    "סינגל מאלט",
    "רום",
    "טקילה",
    "אניס",
    "קוניאק",
    "אפרטיף",
    "ליקרים",
  ]);

  type GroupedRow = {
    baseName: string;
    leftPrice?: number;
    rightPrice?: number;
    desc?: string;
    extras?: string;
  };

  const getGroupedRows = (subcategory: string, items: MenuItem[]) => {
    if (subcategory !== "בירה חבית" && !spiritLikeSubcategories.has(subcategory)) {
      return null;
    }

    const rowsMap = new Map<string, GroupedRow>();
    const isBeerTap = subcategory === "בירה חבית";
    const leftLabel = isBeerTap ? "0.33" : "צ'ייסר";
    const rightLabel = isBeerTap ? "0.5" : "מנה";

    items.forEach((item) => {
      let baseName = item.name;
      let side: "left" | "right" | null = null;

      if (isBeerTap) {
        const match = item.name.match(/^(.*)\s(0\.33|0\.5)$/);
        if (!match) {
          return;
        }
        baseName = match[1].trim();
        side = match[2] === "0.33" ? "left" : "right";
      } else {
        if (item.name.endsWith(" צ'ייסר")) {
          baseName = item.name.replace(/\sצ'ייסר$/, "").trim();
          side = "left";
        } else if (item.name.endsWith(" מנה")) {
          baseName = item.name.replace(/\sמנה$/, "").trim();
          side = "right";
        } else {
          return;
        }
      }

      const existing = rowsMap.get(baseName) ?? { baseName };
      if (side === "left") {
        existing.leftPrice = item.price;
      }
      if (side === "right") {
        existing.rightPrice = item.price;
      }
      if (!existing.desc && item.desc) {
        existing.desc = item.desc;
      }
      if (!existing.extras && item.extras) {
        existing.extras = item.extras;
      }
      rowsMap.set(baseName, existing);
    });

    if (rowsMap.size === 0) {
      return null;
    }

    return {
      leftLabel,
      rightLabel,
      rows: Array.from(rowsMap.values()),
    };
  };

  const renderSubcategory = (
    subcategory: string,
    items: MenuItem[],
    index: number,
    total: number,
  ) => {
    const grouped = getGroupedRows(subcategory, items);

    return (
      <div key={subcategory}>
        <h3 className="font-heading text-xl md:text-2xl text-[#7e6444] mb-4 tracking-wider">{subcategory}</h3>

        {grouped ? (
          <>
            <div className="mb-2 flex justify-end text-xs text-gray-500 font-body space-x-6 pr-2">
              <span className="w-12 text-right">{grouped.leftLabel}</span>
              <span className="w-12 text-right">{grouped.rightLabel}</span>
            </div>
            {grouped.rows.map((row, rowIndex) => (
              <div key={`${row.baseName}-${rowIndex}`} className="mb-3">
                <div className="flex justify-between items-center py-1 font-body text-sm">
                  <span className="text-[#0D3B52] font-semibold">{row.baseName}</span>
                  <div className="flex space-x-6">
                    <span className="w-12 text-right font-medium">{row.leftPrice ?? "-"}</span>
                    <span className="w-12 text-right font-medium">{row.rightPrice ?? "-"}</span>
                  </div>
                </div>
                {row.desc && (
                  <p className="text-gray-500 text-xs italic font-body whitespace-pre-line">{row.desc}</p>
                )}
                {row.extras && (
                  <p className="text-gray-400 text-[11px] font-body whitespace-pre-line">{row.extras}</p>
                )}
              </div>
            ))}
          </>
        ) : (
          items.map((item, itemIndex) => (
            <div key={item.name + itemIndex} className="mb-4">
              <div className="flex justify-between items-start gap-4">
                <span className="text-[#0D3B52] font-semibold font-body">{item.name}</span>
                <span className="font-medium font-body whitespace-nowrap">{item.price}</span>
              </div>
              {item.desc && (
                <p className="text-gray-500 text-xs italic font-body whitespace-pre-line">{item.desc}</p>
              )}
              {item.extras && (
                <p className="text-gray-400 text-[11px] font-body whitespace-pre-line">{item.extras}</p>
              )}
            </div>
          ))
        )}

        {index !== total - 1 && <MenuDivider />}
      </div>
    );
  };

  return (
    <section id="main-menu" className="py-12 md:py-16 bg-white border-t border-gray-100 scroll-mt-24" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full border font-body text-sm transition-colors ${
                activeCategory === category
                  ? "bg-[#0D3B52] text-white border-[#0D3B52]"
                  : "bg-white text-[#0D3B52] border-gray-300 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
          <div>
            {leftColumn.map(([subcategory, items], index) =>
              renderSubcategory(subcategory, items, index, leftColumn.length),
            )}
          </div>

          <div>
            {rightColumn.map(([subcategory, items], index) =>
              renderSubcategory(subcategory, items, index, rightColumn.length),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0D3B52] text-white py-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="flex justify-center md:justify-end">
            <Image
              src="/kiki-logo.svg"
              alt="Kiki"
              width={200}
              height={200}
              className="h-32 w-auto opacity-80"
            />
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h4 className="font-heading text-sm tracking-widest mb-4 text-[#7e6444]">צור קשר</h4>
            <div className="font-body text-sm text-gray-300 space-y-2">
              <p>כתובת: רפאל איתן 5<br />אם המושבות<br />פתח תקווה</p>
              <p className="pt-2">טלפון: <Link href="tel:0547668877" className="hover:text-[#7e6444] transition-colors">054-7668877</Link></p>
              <p className="pt-2">אימייל:<br /><Link href="mailto:admin@kiki.rest.co.il" className="hover:text-[#7e6444] transition-colors">admin@kiki.rest.co.il</Link></p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="text-center md:text-right">
            <h4 className="font-heading text-sm tracking-widest mb-4 text-[#7e6444]">שעות פתיחה</h4>
            <div className="font-body text-sm text-gray-300">
              <p>א - ה: 08:00 - 00:00</p>
              <p>ו: 08:00 - 15:00</p>
              <p>ש: סגור</p>
            </div>
          </div>

          {/* Connect */}
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
      <MainMenuSection />
      <Footer />
    </main>
  );
}
