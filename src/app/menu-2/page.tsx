import { redirect } from "next/navigation";

export default function MenuTwoPage({
  searchParams,
}: {
  searchParams: { menu?: string | string[] };
}) {
  const menu = Array.isArray(searchParams.menu) ? searchParams.menu[0] : searchParams.menu;
  const params = new URLSearchParams({ view: "new" });
  if (menu) params.set("menu", menu);

  redirect(`/menu?${params.toString()}`);
}