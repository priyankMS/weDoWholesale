"use client";

export type FilterState = {
  condition: string[];
  bone: string[];
  skin: string[];
  stock: string[];
  priceMin: number | null;
  priceMax: number | null;
};

export const EMPTY_FILTERS: FilterState = {
  condition: [],
  bone: [],
  skin: [],
  stock: [],
  priceMin: null,
  priceMax: null,
};

export function countActiveFilters(f: FilterState): number {
  let n = f.condition.length + f.bone.length + f.skin.length + f.stock.length;
  if (f.priceMin != null || f.priceMax != null) n++;
  return n;
}

function toggle(list: string[], val: string): string[] {
  return list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-[1.5px] px-3.25 py-1.75 text-[0.78rem] font-semibold ${
        active
          ? "border-primary-500 bg-primary-500 text-white"
          : "border-neutral-200 bg-white text-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}

// Facet options are derived from what's actually queryable in the real
// wdh_variants data (condition, bone, skin, price, stock) — the mockup's
// filter drawer also had "Slaughter method", "Origin" and "Cuisine"
// sections, but wdh_products.region/cuisine are blank on every row and
// there's no slaughter-method column at all in the current schema, so
// those facets are left out rather than shipped as filters that would
// always return zero results. See the query layer notes in
// lib/db/queries/catalogue.ts for details.
export function FilterDrawer({
  open,
  onClose,
  conditionOptions,
  boneOptions,
  skinOptions,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  conditionOptions: string[];
  boneOptions: string[];
  skinOptions: string[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-100 bg-neutral-900/45 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-101 max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-white transition-transform duration-300 lg:inset-x-auto lg:top-1/2 lg:right-auto lg:left-1/2 lg:max-h-[80vh] lg:w-110 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl ${
          open ? "translate-y-0" : "translate-y-full lg:scale-95 lg:opacity-0"
        }`}
      >
        <div className="mx-auto mt-3 mb-1 h-1 w-9.5 rounded-full bg-neutral-200 lg:hidden" />
        <div className="flex items-center justify-between border-b border-neutral-200 px-4.5 py-3.5">
          <div className="font-serif text-[1.1rem] font-bold text-neutral-900">
            Filter products
          </div>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-[0.8rem] font-bold text-primary-500"
          >
            Clear all
          </button>
        </div>

        {conditionOptions.length > 0 && (
          <div className="px-4.5 pt-3.5">
            <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
              Condition
            </div>
            <div className="mb-3.5 flex flex-wrap gap-1.75">
              {conditionOptions.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={filters.condition.includes(c)}
                  onClick={() =>
                    onChange({ ...filters, condition: toggle(filters.condition, c) })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {boneOptions.length > 0 && (
          <div className="border-t border-neutral-200 px-4.5 pt-3.5">
            <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
              Bone
            </div>
            <div className="mb-3.5 flex flex-wrap gap-1.75">
              {boneOptions.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  active={filters.bone.includes(b)}
                  onClick={() => onChange({ ...filters, bone: toggle(filters.bone, b) })}
                />
              ))}
            </div>
          </div>
        )}

        {skinOptions.length > 0 && (
          <div className="border-t border-neutral-200 px-4.5 pt-3.5">
            <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
              Skin
            </div>
            <div className="mb-3.5 flex flex-wrap gap-1.75">
              {skinOptions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={filters.skin.includes(s)}
                  onClick={() => onChange({ ...filters, skin: toggle(filters.skin, s) })}
                />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-neutral-200 px-4.5 pt-3.5">
          <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Price range
          </div>
          <div className="mb-3.5 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min $"
              min={0}
              value={filters.priceMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMin: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="flex-1 rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.9rem] text-neutral-900 outline-none focus:border-primary-500"
            />
            <span className="text-[0.9rem] font-semibold text-neutral-400">to</span>
            <input
              type="number"
              placeholder="Max $"
              min={0}
              value={filters.priceMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMax: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="flex-1 rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.9rem] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="border-t border-neutral-200 px-4.5 pt-3.5">
          <div className="mb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Availability
          </div>
          <div className="mb-3.5 flex flex-wrap gap-1.75">
            {[
              { val: "in", label: "● In stock" },
              { val: "low", label: "◐ Low stock" },
            ].map((s) => (
              <Chip
                key={s.val}
                label={s.label}
                active={filters.stock.includes(s.val)}
                onClick={() => onChange({ ...filters, stock: toggle(filters.stock, s.val) })}
              />
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4.5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary-500 py-3.5 text-[1rem] font-extrabold text-white hover:bg-primary-600"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}
