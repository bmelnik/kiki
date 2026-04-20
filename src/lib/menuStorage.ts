import fs from "fs";
import path from "path";
import { fullMenuData } from "@/lib/mainMenuData";

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");

export function readMenuData(): object {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch {
    // fall through to default data
  }
  return fullMenuData as object;
}

export function writeMenuData(data: object): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}