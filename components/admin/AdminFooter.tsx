export function AdminFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-6 py-3 text-[0.74rem] text-neutral-400">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>WeDoHalal Master Admin v1.0</span>
        <span>&copy; {new Date().getFullYear()} WeDoHalal Wholesale. All rights reserved.</span>
      </div>
    </footer>
  );
}
