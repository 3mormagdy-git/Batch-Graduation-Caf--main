import { CardHeader } from '@/components/addProduct/fields.jsx';
import { PRODUCT_TYPES, SIZES, ADDONS } from '@/data/productOptions.js';

// Selected chips/cards get the pink background + maroon border from the reference.
const selectedClass = 'border-primary bg-primary-soft text-primary';
const idleClass = 'border-line bg-white text-[#4a3f3b] hover:border-[#d8c9c4]';

// Adds the id to the array if missing, removes it if present.
const toggleInList = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

// Step 2: product type, sizes/portions and add-ons.
export default function OptionsStep({ product, update }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5" aria-labelledby="options-title">
      <CardHeader id="options-title" title="Options" subtitle="What guests can customise at the POS." />

      {/* Product type: choose exactly one */}
      <div className="mb-6" role="radiogroup" aria-label="Product type">
        <p className="mb-2 text-[12px] font-semibold">Product type</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_TYPES.map((t) => {
            const checked = product.productType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => update('productType', t.id)}
                className={`h-9 rounded-lg border px-3 text-[12px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${checked ? selectedClass : idleClass}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes: choose any number */}
      <fieldset className="mb-6">
        <legend className="mb-2 text-[12px] font-semibold">Sizes / portions</legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const checked = product.sizes.includes(s.id);
            return (
              <label key={s.id} className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[12px] font-medium focus-within:ring-2 focus-within:ring-primary/40 ${checked ? selectedClass : idleClass}`}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" checked={checked} onChange={() => update('sizes', toggleInList(product.sizes, s.id))} />
                {s.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Add-ons: choose any number; price 0 is shown as "Free" */}
      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold">Add-ons &amp; toppings</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ADDONS.map((a) => {
            const checked = product.addons.includes(a.id);
            return (
              <label key={a.id} className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[12px] focus-within:ring-2 focus-within:ring-primary/40 ${checked ? selectedClass : idleClass}`}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" checked={checked} onChange={() => update('addons', toggleInList(product.addons, a.id))} />
                <span className="flex-1">{a.label}</span>
                <span className="text-[11px] text-muted">{a.price === 0 ? 'Free' : `+${a.price}`}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
