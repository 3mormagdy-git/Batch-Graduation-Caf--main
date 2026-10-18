import {
  Coffee, LayoutGrid, Monitor, FileText, ChefHat, BookOpen, Package,
  BarChart3, Building2, Users, Settings, PanelLeft,
} from 'lucide-react';

const MAIN_ITEMS = [
  { label: 'Overview', icon: LayoutGrid },
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
function NavButton({ label, icon: Icon, dot, active, expanded, onClick, ...rest }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      {...rest}
      className={`relative flex h-9 items-center rounded-lg text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2740]/40 ${
        expanded ? 'w-full justify-start gap-3 px-2.5' : 'w-9 justify-center'
      } ${active ? 'bg-[#fbeaee] text-[#7b2740]' : 'text-[#6b5f5b] hover:bg-[#f5eee7]'}`}
    >
      <Icon size={17} strokeWidth={1.8} className="shrink-0" />
      {expanded && <span className="truncate">{label}</span>}
      {dot && (
        <span className={`absolute h-1.5 w-1.5 rounded-full bg-[#7b2740] ${expanded ? 'right-3 top-1/2 -translate-y-1/2' : 'right-1.5 top-1.5'}`} />
      )}
    </button>
  );
}

// Props come from App: `expanded` (true/false) and `onToggle` (flip it).
export default function Sidebar({ expanded, onToggle }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#e9e2d9] bg-white py-3 transition-all duration-200 ${
        expanded ? 'w-56 px-3' : 'w-14 items-center md:w-[72px]'
      }`}
    >
      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#7b2740] text-white ${expanded ? 'ml-0.5' : ''}`}>
        <Coffee size={18} />
      </div>

      <nav className={`flex flex-col gap-2 ${expanded ? 'items-stretch' : 'items-center'}`} aria-label="Main">
        {MAIN_ITEMS.map((i) => <NavButton key={i.label} {...i} expanded={expanded} />)}
        <div className={`my-1 h-px bg-[#e9e2d9] ${expanded ? 'w-full' : 'w-8'}`} />
        {SECOND_ITEMS.map((i) => <NavButton key={i.label} {...i} expanded={expanded} />)}
      </nav>

      <div className={`mt-auto flex flex-col gap-2 border-t border-[#e9e2d9] pt-3 ${expanded ? 'items-stretch' : 'items-center'}`}>
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