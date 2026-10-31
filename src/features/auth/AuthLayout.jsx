import cafeInterior from '@/assets/auth/cafe-interior.png'
import brandCupIcon from '@/assets/auth/brand-cup.svg'
import chevronRightIcon from '@/assets/auth/chevron-right-sm.svg'
import shieldIcon from '@/assets/auth/shield-check.svg'

// Two-column frame shared by Sign In and Sign Up: cafe photo on the left, form on the right.
// `compact` (Sign Up) uses a smaller logo and tighter padding.
export default function AuthLayout({ compact = false, children }) {
  return (
    <div className="flex min-h-screen w-full items-stretch justify-center bg-[#faf4e8] p-0 sm:items-center sm:p-8">
      <div className="grid w-full max-w-[720px] overflow-hidden bg-[#faf4e8] sm:rounded-2xl sm:border sm:border-[#e7e0dc] sm:shadow-[0_20px_25px_-5px_rgba(231,229,228,0.6),0_8px_10px_-6px_rgba(231,229,228,0.6)] lg:min-h-[680px] lg:max-w-[1376px] lg:grid-cols-[5fr_7fr]">
        <aside
          aria-label="NAHJ Specialty Coffee"
          className="relative isolate hidden min-h-[300px] flex-col justify-between gap-10 overflow-hidden bg-[#1c1917] p-10 text-[#faf4e8] sm:flex lg:min-h-[340px]"
        >
          <img src={cafeInterior} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#78263d_0%,rgba(122,38,58,0.05)_50%,rgba(0,0,0,0.3)_100%)]"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 bg-[#faf4e8]/15 shadow-sm backdrop-blur-md">
                <img src={brandCupIcon} alt="" width={20} height={20} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[18px] leading-[22.5px] font-bold tracking-[-0.45px]">NAHJ</span>
                <span className="text-[12px] leading-4 font-medium tracking-[0.6px] text-[#faf4e8]/70 uppercase">
                  Specialty Coffee
                </span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#faf4e8]/10 px-2.5 py-1 text-[11px] leading-[16.5px] font-medium tracking-[0.275px] whitespace-nowrap text-[#faf4e8]/90 backdrop-blur-md">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              POS v2.4 Active
            </span>
          </div>

          <div className="flex flex-col gap-[7px]">
            <span className="inline-flex items-center gap-2 self-start rounded-md border border-white/20 bg-[#faf4e8]/15 px-2.5 py-1 text-[12px] leading-4 font-medium backdrop-blur-md">
              Enterprise Portal <span className="text-[#faf4e8]/40">•</span> Shift Console
            </span>
            <p className="max-w-[420px] pt-[5px] text-[24px] leading-8 font-semibold tracking-[-0.6px]">
              Precision management for live floor operations.
            </p>
            <p className="max-w-[400px] pb-[18px] text-[14px] leading-[22.75px] text-[#faf4e8]/75">
              Real-time order synchronization, barista order queue, and floor analytics crafted for seamless
              service.
            </p>
            <div className="flex justify-between gap-3 border-t border-white/15 pt-5 text-[12px] leading-4 text-[#faf4e8]/60">
              <span>Downtown Branch #01</span>
              <span>Shift: Morning Service</span>
            </div>
          </div>
        </aside>

        <div
          className={`flex min-w-0 flex-col justify-between gap-6 bg-white px-4 py-6 ${
            compact ? 'sm:p-10' : 'sm:p-14'
          }`}
        >
          <div className={`flex flex-col ${compact ? 'gap-5' : 'gap-8'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-[14px] leading-5 font-bold tracking-[0.7px] text-[#faf4e8] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  N
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={`font-bold text-primary ${
                      compact ? 'text-[14px] leading-5 tracking-[-0.35px]' : 'text-[16px] leading-6 tracking-[-0.4px]'
                    }`}
                  >
                    NAHJ Cafe
                  </span>
                  <span
                    className={`text-[#78716c] uppercase ${
                      compact
                        ? 'text-[10px] leading-[12.5px] font-semibold tracking-[0.5px]'
                        : 'text-[11px] leading-[13.75px] font-medium tracking-[0.55px]'
                    }`}
                  >
                    Management System
                  </span>
                </span>
              </div>
              <a
                href="mailto:support@nahjcafe.internal"
                className="inline-flex items-center gap-1 text-[12px] leading-4 font-medium text-[#78716c] hover:text-[#292524]"
              >
                Help Desk
                <img src={chevronRightIcon} alt="" width={14} height={14} />
              </a>
            </div>
            {children}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#f5f5f4] pt-6 text-[12px] leading-4 text-[#a8a29e]">
            <span className="inline-flex items-center gap-1.5">
              <img src={shieldIcon} alt="" width={14} height={14} />
              256-bit TLS Encrypted Staff Session
            </span>
            <span>© 2025 NAHJ Cafe System • v2.4</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
