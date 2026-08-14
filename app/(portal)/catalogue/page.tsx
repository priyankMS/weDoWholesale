import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { getCategorySummaries, getLowStockProducts } from "@/lib/db/queries/catalogue";
import { RepeatOrderButton } from "@/components/portal/RepeatOrderButton";
import { LowStockAddButton } from "@/components/portal/LowStockAddButton";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function CatalogueHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  const [categories, lowStock] = await Promise.all([
    getCategorySummaries(),
    getLowStockProducts(),
  ]);

  return (
    <div className="pb-4">
      {/* Welcome card */}
      <div className="relative mx-4 mt-3.5 mb-3 overflow-hidden rounded-2xl bg-primary-500 p-5 pb-5.5 text-white lg:mx-0 lg:mt-6">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2.5 -bottom-3.5 text-[5.5rem] opacity-15"
          style={{ transform: "rotate(-12deg)" }}
        >
          🥩
        </span>
        <div className="relative z-10">
          <div className="mb-1.25 text-[0.7rem] font-extrabold tracking-wide uppercase opacity-80">
            {greeting()} 👋
          </div>
          <div className="mb-3 font-serif text-[1.45rem] leading-tight font-black">
            {user.businessName ?? "Welcome back"}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.status === "approved" && (
              <span className="rounded-full bg-white/20 px-2.75 py-1 text-[0.7rem] font-bold">
                ✓ Approved Account
              </span>
            )}
            <span className="rounded-full bg-white/20 px-2.75 py-1 text-[0.7rem] font-bold">
              Wholesale Rates
            </span>
            {user.city && (
              <span className="rounded-full bg-white/20 px-2.75 py-1 text-[0.7rem] font-bold">
                {user.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-4 mb-3.5 grid grid-cols-3 gap-2 lg:mx-0">
        {[
          { icon: "🚚", val: "Next Day", label: "Delivery" },
          { icon: "📦", val: "100 kg min", label: "Order size" },
          { icon: "🕒", val: "3 PM cutoff", label: "Order by" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[10px] border-[1.5px] border-neutral-200 bg-white px-2.5 py-3 text-center"
          >
            <div className="mb-0.75 text-xl">{s.icon}</div>
            <div className="text-[0.82rem] font-extrabold text-neutral-900">{s.val}</div>
            <div className="text-[0.62rem] text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Announcement */}
      <div className="mx-4 mb-3.5 flex items-start gap-3 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50 px-4 py-3.5 lg:mx-0">
        <div className="text-[1.3rem]">📣</div>
        <div>
          <div className="mb-0.75 text-[0.84rem] font-extrabold text-neutral-900">
            Eid al-Adha orders open
          </div>
          <div className="text-[0.76rem] leading-relaxed text-neutral-700">
            Whole goat and whole lamb orders for Eid are now available. Place
            your order 5 days in advance to guarantee availability.
          </div>
        </div>
      </div>

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="mx-4 mb-3.5 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-3.5 py-2.75">
            <span className="text-[0.72rem] font-extrabold text-neutral-900">
              ⚠️ Running low — order soon
            </span>
            <span className="text-[0.68rem] font-semibold text-neutral-400">
              {lowStock.length} item{lowStock.length !== 1 ? "s" : ""}
            </span>
          </div>
          {lowStock.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 border-b border-neutral-200 px-3.5 py-2.5 last:border-none"
            >
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[8px] bg-primary-50 text-[1.2rem]">
                {p.icon}
              </div>
              <div>
                <div className="text-[0.84rem] font-bold text-neutral-900">{p.name}</div>
                <div className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[0.62rem] font-bold text-amber-700">
                  ◐ Low Stock
                </div>
              </div>
              <LowStockAddButton name={p.name} />
            </div>
          ))}
        </div>
      )}

      {/* Category grid */}
      <div className="px-4 pt-1.5 pb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Shop by category
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-1.5 lg:grid-cols-4 lg:px-0">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/catalogue/${c.slug}`}
            className="relative overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white px-3.5 py-4 transition-colors hover:border-primary-500"
          >
            <span className="mb-2 block text-[2rem]">{c.icon}</span>
            <div className="mb-0.5 text-[0.95rem] font-extrabold text-neutral-900">
              {c.category}
            </div>
            <div className="text-[0.7rem] font-medium text-neutral-400">
              {c.count} product{c.count !== 1 ? "s" : ""}
            </div>
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-primary-200">›</span>
          </Link>
        ))}
      </div>

      <div className="px-4 pt-2.5 lg:px-0">
        <RepeatOrderButton />
      </div>
    </div>
  );
}
