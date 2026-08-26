"use client";

import { useState } from "react";
import { StockBadge } from "@/components/admin/StockBadge";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { ProductDetailPanel } from "@/components/admin/ProductDetailPanel";
import type { AdminProductRow } from "@/lib/db/queries/adminProducts";

const HEADERS = [
  "SKU",
  "Product Name",
  "Category",
  "Part / Type",
  "Variants",
  "Supplier(s)",
  "Stock",
  "SEO",
  "Retail Price",
  "Sale",
];

export function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <AdminTableCard>
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="bg-[#f0ede9]">
              <th className="w-8 px-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === products.length}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(products.map((p) => p.id)) : new Set())
                  }
                />
              </th>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase"
                >
                  {h}
                </th>
              ))}
              <th className="w-16 px-2.5 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className={`cursor-pointer border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                  i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                } ${selected.has(p.id) ? "!bg-[#fff5f4]" : ""}`}
                onClick={() => setOpenId(p.id)}
              >
                <td className="px-2.5 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#5a5450]">
                  {p.sku || "—"}
                </td>
                <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{p.name}</td>
                <td className="px-2.5 py-1.5">
                  <AdminBadge tone="category">{p.category}</AdminBadge>
                </td>
                <td className="px-2.5 py-1.5 text-[#5a5450]">{p.type || "—"}</td>
                <td className="px-2.5 py-1.5">
                  {p.variantLabels.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.variantLabels.slice(0, 3).map((label, idx) => (
                        <span
                          key={idx}
                          className="rounded-[3px] border border-[#e4e1dc] bg-[#f7f5f2] px-1.5 py-px text-[12px] whitespace-nowrap text-[#5a5450]"
                        >
                          {label}
                        </span>
                      ))}
                      {p.variantLabels.length > 3 && (
                        <span className="rounded-[3px] border border-[#e4e1dc] bg-[#f7f5f2] px-1.5 py-px text-[12px] text-[#5a5450]">
                          +{p.variantLabels.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2.5 py-1.5">
                  {p.supplierNames.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.supplierNames.map((s) => (
                        <AdminBadge key={s} tone="blue" mono>
                          {s.split(" ")[0]}
                        </AdminBadge>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2.5 py-1.5">
                  <StockBadge state={p.stockState} />
                </td>
                <td className="px-2.5 py-1.5">
                  {p.seoComplete ? (
                    <span className="text-[14px] font-bold text-[#1e8a4a]">✓ Complete</span>
                  ) : (
                    <span className="text-[14px] font-bold text-[#c48a00]">⚠ Missing</span>
                  )}
                </td>
                <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
                  {p.retailPrice != null ? `$${p.retailPrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-2.5 py-1.5">
                  {p.salePercent != null && <AdminBadge tone="amber">-{p.salePercent}%</AdminBadge>}
                </td>
                <td className="px-2.5 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setOpenId(p.id)}
                    className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]"
                    aria-label="Edit"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-[#9a9490]">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableCard>

      <ProductDetailPanel productId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
