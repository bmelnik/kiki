"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type MenuItem = {
  name: string;
  price: number;
  desc?: string;
  extras?: string;
  hidden?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuNode = MenuItem[] | { [key: string]: MenuNode };

type MenuData = { [key: string]: MenuNode };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAtPath(data: MenuData, path: string[]): MenuNode | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.reduce<any>((acc, key) => acc?.[key], data);
}

function setAtPath(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  path: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return { ...data, [head]: setAtPath(data[head] ?? {}, rest, value) };
}

function deleteAtPath(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  path: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (path.length === 1) {
    const copy = { ...data };
    delete copy[path[0]];
    return copy;
  }
  const [head, ...rest] = path;
  return { ...data, [head]: deleteAtPath(data[head], rest) };
}

// ─── Item Form ───────────────────────────────────────────────────────────────

type ItemFormProps = {
  initial?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
};

function ItemForm({ initial, onSave, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [extras, setExtras] = useState(initial?.extras ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    if (!trimmedName || isNaN(parsedPrice) || parsedPrice < 0) return;
    const item: MenuItem = { name: trimmedName, price: parsedPrice };
    if (desc.trim()) item.desc = desc.trim();
    if (extras.trim()) item.extras = extras.trim();
    onSave(item);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
    >
      <h3 className="font-semibold text-gray-800 text-lg">
        {initial ? "עריכת פריט" : "הוספת פריט חדש"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            שם הפריט *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B52]"
            placeholder="לדוגמה: קפוצ'ינו"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            מחיר (₪) *
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B52]"
            placeholder="0"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            תיאור (אופציונאלי)
          </label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B52]"
            placeholder="תיאור קצר של המנה"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            תוספות / הערות (אופציונאלי)
          </label>
          <input
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B52]"
            placeholder="לדוגמה: תוספת: קצפת"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          ביטול
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-[#0D3B52] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2e40]"
        >
          שמור
        </button>
      </div>
    </form>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<
    string | null
  >(null);

  // Fetch menu data on mount
  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setMenu(data);
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  // Save menu to server
  const save = useCallback(
    async (updatedMenu: MenuData) => {
      setSaving(true);
      setSaveMsg("");
      try {
        const res = await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMenu),
        });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          setSaveMsg(errorBody?.error ?? "שגיאה בשמירה");
          return;
        }
        setSaveMsg("✓ נשמר בהצלחה");
        setTimeout(() => setSaveMsg(""), 3000);
      } catch {
        setSaveMsg("שגיאה בשמירה");
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D3B52] text-white text-lg">
        טוען...
      </div>
    );
  }

  const currentNode = path.length === 0 ? menu : getAtPath(menu, path);
  const isItemsList = Array.isArray(currentNode);
  const items = isItemsList ? (currentNode as MenuItem[]) : [];
  const subcategories = isItemsList
    ? []
    : Object.keys(currentNode as object);

  // ── Item operations ────────────────────────────────────────────────────────

  function handleAddItem(item: MenuItem) {
    const updated = setAtPath(menu!, path, [...items, item]);
    setMenu(updated);
    save(updated);
    setShowAddItem(false);
  }

  function handleEditItem(index: number, item: MenuItem) {
    const newItems = items.map((it, i) => (i === index ? item : it));
    const updated = setAtPath(menu!, path, newItems);
    setMenu(updated);
    save(updated);
    setEditIndex(null);
  }

  function handleDeleteItem(index: number) {
    const newItems = items.filter((_, i) => i !== index);
    const updated = setAtPath(menu!, path, newItems);
    setMenu(updated);
    save(updated);
    setConfirmDelete(null);
  }

  function handleToggleHidden(index: number) {
    const newItems = items.map((it, i) =>
      i === index ? { ...it, hidden: !it.hidden } : it
    );
    const updated = setAtPath(menu!, path, newItems);
    setMenu(updated);
    save(updated);
  }

  // ── Category operations ────────────────────────────────────────────────────

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    // New category starts as an empty items array
    const updated = setAtPath(menu!, [...path, name], []);
    setMenu(updated);
    save(updated);
    setNewCategoryName("");
    setShowAddCategory(false);
  }

  function handleDeleteCategory(key: string) {
    const updated = deleteAtPath(menu!, [...path, key]);
    setMenu(updated);
    save(updated);
    setConfirmDeleteCategory(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-[#0D3B52] text-white flex items-center justify-between px-6 py-4 shadow">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">Kiki — ניהול תפריט</span>
          {saveMsg && (
            <span className="text-green-300 text-sm font-medium">
              {saveMsg}
            </span>
          )}
          {saving && (
            <span className="text-yellow-300 text-sm">שומר...</span>
          )}
        </div>
        <button
          onClick={logout}
          className="text-sm border border-white/30 rounded-lg px-4 py-1.5 hover:bg-white/10"
        >
          יציאה
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <button
            onClick={() => setPath([])}
            className="text-[#0D3B52] hover:underline font-medium"
          >
            ראשי
          </button>
          {path.map((segment, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              <button
                onClick={() => setPath(path.slice(0, i + 1))}
                className="text-[#0D3B52] hover:underline font-medium"
              >
                {segment}
              </button>
            </span>
          ))}
        </nav>

        {/* Subcategory view */}
        {!isItemsList && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {path.length === 0 ? "קטגוריות ראשיות" : `קטגוריות: ${path[path.length - 1]}`}
              </h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className="text-sm bg-[#0D3B52] text-white px-4 py-2 rounded-lg hover:bg-[#0a2e40]"
              >
                + הוספת תת-קטגוריה
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {subcategories.map((key) => (
                <div
                  key={key}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-[#0D3B52] transition-colors group"
                  onClick={() => setPath([...path, key])}
                >
                  <span className="font-semibold text-gray-800">{key}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteCategory(key);
                    }}
                    className="absolute top-2 left-2 text-red-400 opacity-0 group-hover:opacity-100 text-xs hover:text-red-600"
                    title="מחק קטגוריה"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add category form */}
            {showAddCategory && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex gap-3 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    שם קטגוריה חדשה
                  </label>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B52]"
                    placeholder="לדוגמה: מנות עיקריות"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className="px-5 py-2 bg-[#0D3B52] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2e40]"
                >
                  הוסף
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  ביטול
                </button>
              </div>
            )}

            {/* Confirm delete category */}
            {confirmDeleteCategory && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
                  <p className="text-gray-800 mb-4 font-medium">
                    למחוק את הקטגוריה &quot;{confirmDeleteCategory}&quot; וכל
                    תוכנה?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setConfirmDeleteCategory(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCategory(confirmDeleteCategory)
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items list view */}
        {isItemsList && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                פריטים: {path[path.length - 1]}
              </h2>
              <button
                onClick={() => {
                  setShowAddItem(true);
                  setEditIndex(null);
                }}
                className="text-sm bg-[#0D3B52] text-white px-4 py-2 rounded-lg hover:bg-[#0a2e40]"
              >
                + הוספת פריט
              </button>
            </div>

            {/* Add item form */}
            {showAddItem && !editIndex && (
              <div className="mb-4">
                <ItemForm
                  onSave={handleAddItem}
                  onCancel={() => setShowAddItem(false)}
                />
              </div>
            )}

            {/* Items table */}
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                אין פריטים עדיין. לחץ &quot;+ הוספת פריט&quot; כדי להתחיל.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div key={index}>
                    {editIndex === index ? (
                      <ItemForm
                        initial={item}
                        onSave={(updated) => handleEditItem(index, updated)}
                        onCancel={() => setEditIndex(null)}
                      />
                    ) : (
                      <div className={`rounded-xl border px-5 py-4 flex items-start gap-4 ${item.hidden ? "bg-gray-100 border-gray-200 opacity-60" : "bg-white border-gray-200"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className={`font-semibold ${item.hidden ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {item.name}
                            </span>
                            <span className="text-[#0D3B52] font-bold text-sm">
                              ₪{item.price}
                            </span>
                            {item.hidden && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded px-1.5 py-0.5">מוסתר</span>
                            )}
                          </div>
                          {item.desc && (
                            <p className="text-sm text-gray-500 mt-0.5 truncate">
                              {item.desc}
                            </p>
                          )}
                          {item.extras && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {item.extras}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setShowAddItem(false);
                            }}
                            className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
                          >
                            עריכה
                          </button>
                          <button
                            onClick={() => handleToggleHidden(index)}
                            className={`text-xs border rounded px-3 py-1 ${
                              item.hidden
                                ? "border-green-300 text-green-700 hover:bg-green-50"
                                : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            }`}
                          >
                            {item.hidden ? "הצג" : "הסתר"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(index)}
                            className="text-xs border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-50"
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Confirm delete item */}
            {confirmDelete !== null && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
                  <p className="text-gray-800 mb-4 font-medium">
                    למחוק את &quot;{items[confirmDelete]?.name}&quot;?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={() => handleDeleteItem(confirmDelete)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
