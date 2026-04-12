import Image from "next/image";
import { fullMenuData } from "@/lib/mainMenuData";

const printDesign = {
  colors: {
    pageBackground: "bg-white",
    primaryText: "text-[#FFFFFF]",
    mutedText: "text-[#0D3B52]/70",
    headerBorder: "border-[#0D3B52]/20",
    categoryText: "text-[#FFFFFF]",
    subcategoryText: "text-[#FFFFFF]",
    sectionCard: "bg-[#0D3B52]/[0.04]",
    tableHeaderBorder: "border-[#0D3B52]/20",
    tableRowBorder: "border-[#0D3B52]/10",
  },
  spacing: {
    page: "px-8 py-10",
    header: "mb-8 pb-6 print:mb-6 print:pb-4",
    categorySpacing: "mb-6",
    sectionStack: "space-y-4",
    sectionCard: "rounded-lg p-4",
    subcategorySpacing: "mb-3",
    tableCell: "py-2",
  },
  typography: {
    title: "text-2xl tracking-wide",
    subtitle: "text-sm tracking-[0.3em] mt-2",
    category: "text-xl",
    subcategory: "text-xl",
    table: "text-sm",
  },
} as const;

export default function MenuPrintPage() {
  return (
    <main
      className={`menu-print-page min-h-screen ${printDesign.colors.pageBackground} ${printDesign.colors.primaryText}`}
      dir="rtl"
    >
      <section className={`max-w-5xl mx-auto ${printDesign.spacing.page}`}>
        <header className={`menu-print-header border-b ${printDesign.colors.headerBorder} ${printDesign.spacing.header}`}>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className={`font-heading ${printDesign.typography.title}`}>תפריט KIKI</h1>
              <p className={`font-body ${printDesign.typography.subtitle} ${printDesign.colors.mutedText}`}>
                BREAKFAST &amp; WINE
              </p>
            </div>
            <Image src="/kiki-logo.svg" alt="Kiki" width={180} height={90} className="h-16 w-auto" priority />
          </div>
        </header>

        {Object.entries(fullMenuData).map(([category, subcategories], categoryIndex) => (
          <article key={category} className={`menu-print-category ${categoryIndex > 0 ? "pt-6" : ""}`}>
            <h2
              className={`font-heading text-center menu-print-no-break ${printDesign.typography.category} ${printDesign.colors.categoryText} ${printDesign.spacing.categorySpacing}`}
            >
              {category}
            </h2>

            {category === "אוכל" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-14 gap-y-8">
                {(["בוקר", "ערב"] as const).map((subcategory) => {
                  const items = subcategories[subcategory] ?? [];
                  const outsideSide = subcategory === "בוקר" ? "right" : "left";

                  return (
                    <section
                      key={subcategory}
                      className={`menu-print-subcategory menu-print-no-break ${printDesign.colors.sectionCard} ${printDesign.spacing.sectionCard}`}
                    >
                      <h3
                        className={`font-heading text-center ${printDesign.typography.subcategory} ${printDesign.colors.subcategoryText} ${printDesign.spacing.subcategorySpacing}`}
                      >
                        {subcategory}
                      </h3>

                      <div className={printDesign.spacing.sectionStack}>
                        {items.map((item) => (
                          <div key={item.name} className={`menu-print-no-break border-b ${printDesign.colors.tableRowBorder} pb-2`}>
                            <div
                              className={`flex items-start gap-4 ${outsideSide === "right" ? "flex-row" : "flex-row-reverse"}`}
                            >
                              <span className="font-body font-semibold text-base leading-tight min-w-[3.5rem] text-center">
                                {item.price}
                              </span>
                              <div className="flex-1">
                                <p className="font-body font-semibold leading-tight">{item.name}</p>
                                {item.desc && (
                                  <p className={`font-body text-xs leading-relaxed mt-1 ${printDesign.colors.mutedText}`}>
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-14 gap-y-8">
                {Object.entries(subcategories).map(([subcategory, items]) => (
                  <section
                    key={subcategory}
                    className={`menu-print-subcategory menu-print-no-break ${printDesign.colors.sectionCard} ${printDesign.spacing.sectionCard}`}
                  >
                    <h3
                      className={`font-heading text-center ${printDesign.typography.subcategory} ${printDesign.colors.subcategoryText} ${printDesign.spacing.subcategorySpacing}`}
                    >
                      {subcategory}
                    </h3>

                    <div className={printDesign.spacing.sectionStack}>
                      {items.map((item) => (
                        <div key={item.name} className={`menu-print-no-break border-b ${printDesign.colors.tableRowBorder} pb-2`}>
                          <div className="flex flex-row items-start gap-4">
                            <span className="font-body font-semibold text-base leading-tight min-w-[3.5rem] text-center">
                              {item.price}
                            </span>
                            <div className="flex-1">
                              <p className="font-body font-semibold leading-tight">{item.name}</p>
                              {item.desc && (
                                <p className={`font-body text-xs leading-relaxed mt-1 ${printDesign.colors.mutedText}`}>
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
