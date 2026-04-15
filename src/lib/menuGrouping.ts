import type { MenuItem } from "@/lib/mainMenuData";

export type GroupedRow = {
  baseName: string;
  leftPrice?: number;
  rightPrice?: number;
  desc?: string;
  extras?: string;
};

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

export function getGroupedRows(subcategory: string, items: MenuItem[]) {
  const isBeerTap = subcategory === "בירה חבית";
  const isSpiritLike = spiritLikeSubcategories.has(subcategory);
  const isWinePairing = items.some((item) => /(?:\s-\s|\s)(כוס|בקבוק)$/.test(item.name));

  if (!isBeerTap && !isSpiritLike && !isWinePairing) {
    return null;
  }

  const rowsMap = new Map<string, GroupedRow>();
  const leftLabel = isBeerTap ? "0.33" : isWinePairing ? "כוס" : "צ'ייסר";
  const rightLabel = isBeerTap ? "0.5" : isWinePairing ? "בקבוק" : "מנה";

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
    } else if (isWinePairing) {
      const match = item.name.match(/^(.*?)(?:\s-\s|\s)(כוס|בקבוק)$/);
      if (!match) {
        return;
      }
      baseName = match[1].trim();
      side = match[2] === "כוס" ? "left" : "right";
    } else if (item.name.endsWith(" צ'ייסר")) {
      baseName = item.name.replace(/\sצ'ייסר$/, "").trim();
      side = "left";
    } else if (item.name.endsWith(" מנה")) {
      baseName = item.name.replace(/\sמנה$/, "").trim();
      side = "right";
    } else {
      return;
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
}
