import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🥩</div>
          <div className="font-serif text-xl font-black text-white">WeDoHalal.</div>
          <div className="mt-1 text-xs font-bold tracking-widest text-neutral-500 uppercase">
            Master Admin
          </div>
        </div>

        <AdminResetPasswordForm token={token ?? ""} />

        <p className="mt-5 text-center text-xs text-neutral-600">
          Staff access only. Wholesale customers should sign in at{" "}
          <span className="text-neutral-400">/login</span>.
        </p>
      </div>
    </div>
  );
}
