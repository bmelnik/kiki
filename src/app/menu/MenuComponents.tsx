"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type MenuBranchMap, type MenuData, type MenuItem } from "@/lib/mainMenuData";
import { getGroupedRows } from "@/lib/menuGrouping";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { name: "בית", href: "#" },
    { name: "תפריט", href: "/menu" },
    { name: "הזמנת מקום", href: "https://sl.assento.co.il/1Xhix8tUJO" },
    { name: "אודות", href: "#" },
  ];

  return (
    <header className="bg-[#0D3B52] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/kiki-logo.svg"
              alt="Kiki"
              width={200}
              height={200}
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white text-sm font-medium hover:text-[#7e6444] transition-colors font-body uppercase tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="tel:0547668877" className="text-white hover:text-[#7e6444] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Link>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "סגור תפריט ניווט" : "פתח תפריט ניווט"}
              aria-expanded={mobileMenuOpen}
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

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D3B52] border-t border-[#333]">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
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

function MenuDivider() {
  return <div className="border-t border-dashed border-gray-300 my-6" />;
}

export function MainMenuSection({ menuData }: { menuData: MenuData }) {
  const categories = Object.keys(menuData);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  if (!activeCategory) {
    return null;
  }

  const activeBranch = menuData[activeCategory];
  const sections = Object.entries(activeBranch as MenuBranchMap);
  const middle = Math.ceil(sections.length / 2);
  const leftColumn = sections.slice(0, middle);
  const rightColumn = sections.slice(middle);
  const isMenuItemArray = (branch: MenuItem[] | MenuBranchMap): branch is MenuItem[] => Array.isArray(branch);

  const renderItems = (subcategory: string, items: MenuItem[]) => {
    const visibleItems = items.filter((item) => !item.hidden);
    const grouped = getGroupedRows(subcategory, visibleItems);

    if (grouped) {
      return (
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
              {row.desc && <p className="text-gray-500 text-xs italic font-body whitespace-pre-line">{row.desc}</p>}
              {row.extras && <p className="text-gray-400 text-[11px] font-body whitespace-pre-line">{row.extras}</p>}
            </div>
          ))}
        </>
      );
    }

    return visibleItems.map((item, itemIndex) => (
      <div key={item.name + itemIndex} className="mb-4">
        <div className="flex justify-between items-start gap-4">
          <span className="text-[#0D3B52] font-semibold font-body">{item.name}</span>
          <span className="font-medium font-body whitespace-nowrap">{item.price}</span>
        </div>
        {item.desc && <p className="text-gray-500 text-xs italic font-body whitespace-pre-line">{item.desc}</p>}
        {item.extras && <p className="text-gray-400 text-[11px] font-body whitespace-pre-line">{item.extras}</p>}
      </div>
    ));
  };

  const renderBranch = (
    title: string,
    branch: MenuItem[] | MenuBranchMap,
    index: number,
    total: number,
    nested = false,
  ) => {
    const headingClass = nested
      ? "font-heading text-lg md:text-xl text-[#7e6444] mb-3 tracking-wider"
      : "font-heading text-xl md:text-2xl text-[#7e6444] mb-4 tracking-wider";

    return (
      <div key={`${title}-${index}`}>
        <h3 className={headingClass}>{title}</h3>
        {isMenuItemArray(branch) ? (
          renderItems(title, branch)
        ) : (
          <div className="space-y-8">
            {Object.entries(branch).map(([nestedTitle, nestedBranch], nestedIndex, nestedEntries) => (
              <div key={`${title}-${nestedTitle}`}>
                {renderBranch(nestedTitle, nestedBranch, nestedIndex, nestedEntries.length, true)}
              </div>
            ))}
          </div>
        )}
        {index !== total - 1 && !nested && <MenuDivider />}
      </div>
    );
  };

  return (
    <section id="main-menu" className="py-12 md:py-16 bg-white border-t border-gray-100 scroll-mt-24" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading text-[#0D3B52]">תפריט</h2>
        </div>
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
          <div>{leftColumn.map(([title, branch], index) => renderBranch(title, branch, index, leftColumn.length))}</div>
          <div>{rightColumn.map(([title, branch], index) => renderBranch(title, branch, index, rightColumn.length))}</div>
        </div>
      </div>
    </section>
  );
}