"use client";

import Link from "next/link";
import { EMPTY_FILTERS, type FilterState } from "@/components/portal/FilterDrawer";

type CategorySummary = { category: string; slug: string; icon: string; count: number };

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.25 py-1.25 text-[0.82rem] text-neutral-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.75 w-3.75 rounded-sm border-neutral-300 text-primary-500 accent-primary-500"
      />
      {label}
    </label>
  );
}

function toggle<T extends string>(list: T[], val: T): T[] {
  return list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
}

// Desktop-only persistent sidebar mirroring the mockup's left rail
// (Categories + always-visible filters) instead of the mobile bottom
// sheet. Facet sections only cover condition/bone/skin/price/availability
// — the real facets present in wdh_variants — see the note in
// FilterDrawer.tsx for why slaughter method/origin aren't offered.
export function CategorySidebar({
  categories,
  activeSlug,
  conditionOptions,
  boneOptions,
  skinOptions,
  filters,
  onChange,
}: {
  categories: CategorySummary[];
  activeSlug: string;
  conditionOptions: string[];
  boneOptions: string[];
  skinOptions: string[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-24 space-y-5">
        <div>
          <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Categories
          </div>
          <nav className="flex flex-col gap-0.5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalogue/${c.slug}`}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.75 text-[0.85rem] font-semibold ${
                  c.slug === activeSlug
                    ? "bg-primary-50 text-primary-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{c.icon}</span>
                  {c.category}
                </span>
                <span className="text-[0.72rem] font-medium text-neutral-400">{c.count}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <div className="text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Filters
          </div>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-[0.74rem] font-bold text-primary-500"
          >
            Clear all
          </button>
        </div>

        {conditionOptions.length > 0 && (
          <div className="border-t border-neutral-200 pt-3.5">
            <div className="mb-1.5 text-[0.7rem] font-extrabold text-neutral-900">Condition</div>
            {conditionOptions.map((c) => (
              <CheckRow
                key={c}
                label={c}
                checked={filters.condition.includes(c)}
                onChange={() => onChange({ ...filters, condition: toggle(filters.condition, c) })}
              />
            ))}
          </div>
        )}

        {boneOptions.length > 0 && (
          <div className="border-t border-neutral-200 pt-3.5">
            <div className="mb-1.5 text-[0.7rem] font-extrabold text-neutral-900">Bone</div>
            {boneOptions.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={filters.bone.includes(b)}
                onChange={() => onChange({ ...filters, bone: toggle(filters.bone, b) })}
              />
            ))}
          </div>
        )}

        {skinOptions.length > 0 && (
          <div className="border-t border-neutral-200 pt-3.5">
            <div className="mb-1.5 text-[0.7rem] font-extrabold text-neutral-900">Skin</div>
            {skinOptions.map((s) => (
              <CheckRow
                key={s}
                label={s}
                checked={filters.skin.includes(s)}
                onChange={() => onChange({ ...filters, skin: toggle(filters.skin, s) })}
              />
            ))}
          </div>
        )}

        <div className="border-t border-neutral-200 pt-3.5">
          <div className="mb-2 text-[0.7rem] font-extrabold text-neutral-900">
            Price range (per kg)
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min"
              min={0}
              value={filters.priceMin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full min-w-0 rounded-md border border-neutral-200 px-2 py-1.5 text-[0.8rem] text-neutral-900 outline-none focus:border-primary-500"
            />
            <span className="text-[0.78rem] text-neutral-400">–</span>
            <input
              type="number"
              placeholder="Max"
              min={0}
              value={filters.priceMax ?? ""}
              onChange={(e) =>
                onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full min-w-0 rounded-md border border-neutral-200 px-2 py-1.5 text-[0.8rem] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-3.5">
          <div className="mb-1.5 text-[0.7rem] font-extrabold text-neutral-900">Availability</div>
          {(
            [
              { val: "in", label: "● In stock" },
              { val: "low", label: "◐ Low stock" },
            ] as const
          ).map((s) => (
            <CheckRow
              key={s.val}
              label={s.label}
              checked={filters.stock.includes(s.val)}
              onChange={() => onChange({ ...filters, stock: toggle(filters.stock, s.val) })}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
