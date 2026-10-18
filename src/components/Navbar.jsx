import { Store, ChevronDown, Search, Bell, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white px-4 md:px-6">
      {/* Branch selector + open status */}
      <button type="button" className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-[14px] font-semibold text-ink transition-colors hover:border-primary sm:w-48 sm:justify-between">
        <Store size={16} className="text-primary" />
        <span className="hidden sm:inline">Cairo Downtown</span>
        <ChevronDown size={16} className="text-muted" />
      </button>
      <span className="hidden h-6 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-[12px] font-semibold text-success md:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Cafe Open
      </span>

      {/* Search (UI only for now) */}
      <div className="relative mx-auto hidden w-full max-w-[384px] sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search orders, tables, items..."
          className="h-10 w-full rounded-lg border border-line bg-page/60 pl-9 pr-3 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-[3px] focus:ring-primary/25"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 sm:ml-0">
        <button type="button" aria-label="Notifications, 2 unread" className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white transition-colors hover:border-primary">
          <Bell size={18} />
          <span className="absolute -right-px -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">2</span>
        </button>
        <button type="button" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-medium text-white transition hover:bg-primary-hover active:scale-[0.98]">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">New order</span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary">SA</div>
      </div>
    </header>
  );
}
