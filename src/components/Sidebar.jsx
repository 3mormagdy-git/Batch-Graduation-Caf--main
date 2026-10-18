import {
  Coffee, LayoutDashboard, LayoutGrid, Monitor, FileText, ChefHat, BookOpen, Package,
  BarChart3, Building2, Users, Settings, PanelLeft,
} from 'lucide-react';

const MAIN_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'POS', icon: Monitor },
  { label: 'Orders', icon: FileText, dot: true },
  { label: 'Tables', icon: LayoutGrid },
  { label: 'Kitchen', icon: ChefHat, dot: true },
];
const SECOND_ITEMS = [
  { label: 'Menu catalog', icon: BookOpen, active: true },
  { label: 'Inventory', icon: Package, dot: true },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Branches', icon: Building2 },
  { label: 'Staff', icon: Users },
];

// expanded = true  -> icon + text (full width)
// expanded = false -> icon only (small width)
// The button is always full width with the same left padding, so the icon never moves:
// opening / closing only animates the sidebar width and fades the label.
function NavButton({ label, icon: Icon, dot, active, expanded, onClick, ...rest }) {
  return (
    <button
      type="button"
      title={expanded ? undefined : label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      {...rest}
      className={`relative flex h-9 w-full shrink-0 items-center gap-3 overflow-hidden whitespace-nowrap rounded-lg px-[9.5px] text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? 'bg-primary-soft text-primary' : 'text-[#6b5f5b] hover:bg-sand-light'
      }`}
    >
      <Icon size={17} strokeWidth={1.8} className="shrink-0" />
      <span className={`truncate transition-opacity duration-150 ${expanded ? 'opacity-100 delay-100' : 'opacity-0'}`}>{label}</span>
      {dot && (
        <span className={`absolute h-1.5 w-1.5 rounded-full bg-primary transition-all duration-200 ${expanded ? 'right-3 top-[15px]' : 'right-1.5 top-1.5'}`} />
      )}
    </button>
  );
}

// Props come from App: `expanded` (true/false) and `onToggle` (flip it).
export default function Sidebar({ expanded, onToggle }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-line bg-white px-2.5 py-3 transition-[width] duration-200 md:px-[18px] ${
        expanded ? 'w-56' : 'w-14 md:w-[72px]'
      }`}
    >
      <div className="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <Coffee size={18} />
      </div>

      <nav className="flex flex-col gap-2" aria-label="Main">
        {MAIN_ITEMS.map((i) => <NavButton key={i.label} {...i} expanded={expanded} />)}
        <div className={`my-1 h-px self-center bg-line transition-[width] duration-200 ${expanded ? 'w-full' : 'w-8'}`} />
        {SECOND_ITEMS.map((i) => <NavButton key={i.label} {...i} expanded={expanded} />)}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
        <NavButton label="Settings" icon={Settings} expanded={expanded} />
        {/* This is the button that opens / closes the sidebar */}
        <NavButton
          label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          icon={PanelLeft}
          expanded={expanded}
          onClick={onToggle}
          aria-expanded={expanded}
        />
      </div>
    </aside>
  );
}
