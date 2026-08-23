export function ExportLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] font-bold text-neutral-600 hover:bg-neutral-100"
    >
      ⬇ Export
    </a>
  );
}
