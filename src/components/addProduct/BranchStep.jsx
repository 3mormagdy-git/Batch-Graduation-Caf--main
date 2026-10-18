import { Toggle, inputClass } from './fields';
import { BRANCHES } from '../../data/productOptions';

// Step 3: which branches sell the product and at what price.
export default function BranchStep({ product, errors, update }) {
  // Change one branch's settings without touching the others.
  const updateBranch = (id, changes) =>
    update('branches', { ...product.branches, [id]: { ...product.branches[id], ...changes } });

  const masterOn = product.availableForSale;

  return (
    <section className="rounded-xl border border-[#ebe6df] bg-white p-5" aria-labelledby="branch-title">
      <div className="mb-4">
        <h2 id="branch-title" className="text-[14px] font-semibold">Branch availability</h2>
        <p className="mt-0.5 text-[11px] text-[#9a8f8a]">Leave the price empty to use the base price.</p>
      </div>

      {/* Master switch: when off, the product is hidden in every branch */}
      <div className="mb-2 flex items-center justify-between rounded-lg bg-[#fbf2eb] px-3.5 py-3">
        <div>
          <p className="text-[12px] font-semibold">Available for sale</p>
          <p className="text-[11px] text-[#9a8f8a]">Master switch — turning off hides it everywhere</p>
        </div>
        <Toggle checked={masterOn} label="Available for sale" onChange={(v) => update('availableForSale', v)} />
      </div>

      <ul className="overflow-hidden rounded-lg border border-[#ebe6df]">
        {BRANCHES.map((b) => {
          const state = product.branches[b.id];
          const err = errors[`branch-${b.id}`];
          return (
            <li key={b.id} className={`flex items-center justify-between gap-3 border-b border-[#ebe6df] px-3.5 py-3 last:border-b-0 ${masterOn ? '' : 'opacity-50'}`}>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">{b.name}</p>
                <p className="truncate text-[11px] text-[#9a8f8a]">{b.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="relative w-[110px]">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      aria-label={`${b.name} price`}
                      aria-invalid={Boolean(err)}
                      disabled={!masterOn || !state.enabled}
                      placeholder={product.basePrice || '0.00'}
                      value={state.price}
                      onChange={(e) => updateBranch(b.id, { price: e.target.value })}
                      className={`${inputClass(err)} h-8 pr-11 disabled:bg-[#faf7f3]`}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#9a8f8a]">EGP</span>
                  </div>
                  {err && <p role="alert" className="mt-1 text-[11px] text-red-600">{err}</p>}
                </div>
                <Toggle checked={state.enabled} disabled={!masterOn} label={`Sell in ${b.name}`} onChange={(v) => updateBranch(b.id, { enabled: v })} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
