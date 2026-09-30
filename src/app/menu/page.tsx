"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "@/app/menu/MenuComponents";
import { fullMenuData } from "@/lib/mainMenuData";

const imageMenus = [
  { id: "food", label: "אוכל", pages: ["/menu-pages/food-1.png"] },
  { id: "alcohol", label: "אלכוהול", pages: ["/menu-pages/alcohol-1.png"] },
  { id: "wine", label: "יין", pages: ["/menu-pages/wine-1.png", "/menu-pages/wine-2.png"] },
  { id: "cocktails", label: "קוקטיילים", pages: ["/menu-pages/cocktails-1.png", "/menu-pages/cocktails-2.png"] },
] as const;

type ImageMenuId = (typeof imageMenus)[number]["id"];

export default function MenuPage() {
  const [activeMenuId, setActiveMenuId] = useState<ImageMenuId>("food");
  const activeMenu = imageMenus.find((menu) => menu.id === activeMenuId) ?? imageMenus[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const menuId = params.get("menu");
    if (imageMenus.some((menu) => menu.id === menuId)) {
      setActiveMenuId(menuId as ImageMenuId);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f6f2]" dir="rtl">
      <Header />
      <section className="px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-2 font-body text-sm text-[#7e6444]">KIKI</p>
            <h1 className="font-heading text-3xl text-[#0D3B52] md:text-4xl">תפריט</h1>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4" role="tablist" aria-label="סוגי תפריט">
            {imageMenus.map((menu) => {
              const isActive = menu.id === activeMenu.id;
              return (
                <button
                  key={menu.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveMenuId(menu.id)}
                  className={`min-h-14 border px-4 py-3 font-body text-base transition-colors ${
                    isActive
                      ? "border-[#0D3B52] bg-[#0D3B52] text-white"
                      : "border-[#d8d0c4] bg-white text-[#0D3B52] hover:border-[#7e6444]"
                  }`}
                >
                  {menu.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-8">
            {activeMenu.pages.map((page, index) => (
              <div key={page} className="overflow-hidden bg-white shadow-[0_2px_14px_rgba(13,59,82,0.08)]">
                <Image
                  src={page}
                  alt={`תפריט ${activeMenu.label}, עמוד ${index + 1}`}
                  width={1600}
                  height={2200}
                  className="h-auto w-full"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
