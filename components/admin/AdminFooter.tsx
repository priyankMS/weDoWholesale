export function AdminFooter() {
  return (
    <footer className="shrink-0 border-t border-[#e4e1dc] bg-[#f7f5f2] px-5 py-2 text-[13px] text-[#9a9490]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>WeDoHalal Master Admin v1.0</span>
        <span>&copy; {new Date().getFullYear()} WeDoHalal Wholesale. All rights reserved.</span>
      </div>
    </footer>
  );
}
