import { Store, ChevronDown, Search, Bell, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#ebe6df] bg-white px-4 md:px-6">
      {/* Branch selector + open status */}
      <button type="button" className="flex h-9 items-center gap-2 rounded-lg border border-[#ebe6df] bg-white px-3 text-[13px] font-medium">
        <Store size={15} />
        <span className="hidden sm:inline">Cairo Downtown</span>
        <ChevronDown size={14} />
      </button>
      <span className="hidden items-center gap-1.5 rounded-full bg-[#e1f1ed] px-2.5 py-1 text-[11px] font-medium text-[#3b8a6e] md:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3b8a6e]" /> Cafe Open
      </span>

      {/* Search (UI only for now) */}
      <div className="relative mx-auto hidden w-full max-w-[400px] sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8f8a]" />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search orders, tables, items..."
          className="h-9 w-full rounded-lg border border-[#ebe6df] bg-[#fcf7f1] pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9a8f8a] focus:border-[#78283f]"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 sm:ml-0">
        <button type="button" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#ebe6df] bg-white">
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#78283f] text-[9px] font-semibold text-white">2</span>
        </button>
        <button type="button" className="flex h-9 items-center gap-2 rounded-lg bg-[#78283f] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#66222f]">
          <PlusCircle size={15} />
          <span className="hidden sm:inline">New order</span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f9edf1] text-[11px] font-semibold text-[#78283f]">SA</div>
      </div>
    </header>
  );
}
