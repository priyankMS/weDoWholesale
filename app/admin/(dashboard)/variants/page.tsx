import Link from "next/link";
import { listAdminVariants, getVariantFacets } from "@/lib/db/queries/adminVariants";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { StockBadge } from "@/components/admin/StockBadge";
import { AdminPageHeader, AdminHeaderSearch, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";
import { AdminToolbar, AdminFilterSelect, AdminToolbarSpacer, AdminCountBadge } from "@/components/admin/AdminToolbar";
import { AdminPagination } from "@/components/admin/AdminPagination";

const PAGE_SIZE = 25;

export default async function AdminVariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string; cut?: string; bone?: string; fat?: string; origin?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ variants, total }, categories, facets] = await Promise.all([
    listAdminVariants({
      search: sp.q,
      category: sp.category,
      condition: sp.condition,
      cut: sp.cut,
      bone: sp.bone,
      fat: sp.fat,
      origin: sp.origin,
      page,
      pageSize: PAGE_SIZE,
    }),
    getAdminProductCategories(),
    getVariantFacets(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    if (sp.condition) params.set("condition", sp.condition);
    if (sp.cut) params.set("cut", sp.cut);
    if (sp.bone) params.set("bone", sp.bone);
    if (sp.fat) params.set("fat", sp.fat);
    if (sp.origin) params.set("origin", sp.origin);
    params.set("page", String(p));
    return `/admin/variants?${params.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (sp.category) exportParams.set("category", sp.category);
  if (sp.condition) exportParams.set("condition", sp.condition);
  if (sp.cut) exportParams.set("cut", sp.cut);
  if (sp.bone) exportParams.set("bone", sp.bone);
  if (sp.fat) exportParams.set("fat", sp.fat);
  if (sp.origin) exportParams.set("origin", sp.origin);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Variants & SKUs">
        <AdminHeaderSearch action="/admin/variants" defaultValue={sp.q} placeholder="Search by SKU or title…">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          {sp.condition && <input type="hidden" name="condition" value={sp.condition} />}
          {sp.cut && <input type="hidden" name="cut" value={sp.cut} />}
          {sp.bone && <input type="hidden" name="bone" value={sp.bone} />}
          {sp.fat && <input type="hidden" name="fat" value={sp.fat} />}
          {sp.origin && <input type="hidden" name="origin" value={sp.origin} />}
        </AdminHeaderSearch>
        <AdminHeaderGhostLink href={`/api/admin/export/variants?${exportParams.toString()}`}>
          ⬇ Export
        </AdminHeaderGhostLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
        <form method="get" action="/admin/variants">
          <input type="hidden" name="q" value={sp.q ?? ""} />
          <AdminToolbar>
            <AdminFilterSelect name="category" defaultValue={sp.category ?? "All"}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="condition" defaultValue={sp.condition ?? "All"}>
              <option value="All">All Conditions</option>
              {facets.conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="cut" defaultValue={sp.cut ?? "All"}>
              <option value="All">All Cut Styles</option>
              {facets.cutTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="bone" defaultValue={sp.bone ?? "All"}>
              <option value="All">All Bone Types</option>
              {facets.bones.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="fat" defaultValue={sp.fat ?? "All"}>
              <option value="All">All Fat Levels</option>
              {facets.fatLevels.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="origin" defaultValue={sp.origin ?? "All"}>
              <option value="All">All Origins</option>
              {facets.origins.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </AdminFilterSelect>
            <button
              type="submit"
              className="rounded-md bg-[#1a1816] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#3a3632]"
            >
              Filter
            </button>
            <AdminToolbarSpacer />
            <AdminCountBadge>{total} variants</AdminCountBadge>
          </AdminToolbar>
        </form>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {["SKU", "Parent Product", "Category", "Condition", "Cut / Style", "Bone", "Skin", "Fat", "Origin", "Stock", "Price", "Supplier"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
                <th className="w-16 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                    i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                  }`}
                >
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#5a5450]">
                    {v.sku || "—"}
                  </td>
                  <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">
                    <Link href={`/admin/products/${v.productId}`} className="hover:text-[#e05a4a]">
                      {v.productName}
                    </Link>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <AdminBadge tone="category">{v.category}</AdminBadge>
                  </td>
                  <td className="px-2.5 py-1.5">
                    {v.conditionType ? <AdminBadge tone={v.conditionType === "Fresh" ? "green" : "blue"}>{v.conditionType}</AdminBadge> : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{v.cutType || "—"}</td>
                  <td className="px-2.5 py-1.5">
                    {v.boneType ? <AdminBadge tone="category">{v.boneType}</AdminBadge> : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{v.skinType || "—"}</td>
                  <td className="px-2.5 py-1.5">
                    {v.fatLevel ? <AdminBadge tone="category">{v.fatLevel}</AdminBadge> : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{v.region || "—"}</td>
                  <td className="px-2.5 py-1.5">
                    <StockBadge state={v.stockState} />
                  </td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
                    {v.price != null ? `$${v.price.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-2.5 py-1.5">
                    {v.supplierNames.length ? (
                      <div className="flex flex-wrap gap-1">
                        {v.supplierNames.map((s) => (
                          <AdminBadge key={s} tone="blue" mono>
                            {s.split(" ")[0]}
                          </AdminBadge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
                    <Link href={`/admin/variants/${v.id}`} className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]" aria-label="Edit">
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-[#9a9490]">
                    No variants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminTableCard>

        <AdminPagination page={page} totalPages={totalPages} pageHref={pageHref} />
      </div>
    </div>
  );
}
