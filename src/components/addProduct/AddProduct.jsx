import { useEffect, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import DetailsStep from './DetailsStep';
import OptionsStep from './OptionsStep';
import BranchStep from './BranchStep';
import { VALIDATORS, validateDetails } from './validation';
import { createEmptyProduct } from '../../data/productOptions';
import { addProduct } from '../../services/productService';

const STEPS = ['Details', 'Options', 'Branch availability'];

// Add Product wizard (3 steps). This component owns ALL form state; the step
// components only display it and call `update` when something changes.
//
// Props:
//   onBackToCatalog() - called by "Menu catalog" link and "Cancel". Connect it
//                       to the Menu Catalog page when it exists.
//   onProductAdded(product) - optional; called with the saved product so the
//                       Menu Catalog / Dashboard can refresh their data.
export default function AddProduct({ onBackToCatalog, onProductAdded }) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState(createEmptyProduct);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  // Hide the toast automatically after 4 seconds.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Change one field and clear its old error message (if any).
  // Branch price errors are keyed "branch-<id>", so editing any branch clears them.
  const update = (field, value) => {
    setProduct((p) => ({ ...p, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      if (field === 'branches') Object.keys(next).forEach((k) => k.startsWith('branch-') && delete next[k]);
      return next;
    });
  };

  // Bring the new step into view when the user moves between steps.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Run the validator of one step; returns true when the step is valid.
  // On failure, focus moves to the first invalid field once the errors have rendered.
  const validateStep = (index) => {
    const found = VALIDATORS[index](product);
    setErrors(found);
    const valid = Object.keys(found).length === 0;
    if (!valid) setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
    return valid;
  };

  // Validate a single field when the user leaves it (onBlur).
  const validateField = (field) => {
    const found = validateDetails(product);
    setErrors((e) => {
      const next = { ...e };
      if (found[field]) next[field] = found[field];
      else delete next[field];
      return next;
    });
  };

  // Tabs: going back is always allowed; going forward requires the steps in between to be valid.
  const goToStep = (target) => {
    if (target <= step) {
      setErrors({});
      setStep(target);
      return;
    }
    for (let i = step; i < target; i += 1) {
      if (!validateStep(i)) return;
    }
    setStep(target);
  };

  const reset = () => {
    setProduct(createEmptyProduct());
    setErrors({});
    setStep(0);
  };

  const handleCancel = () => {
    reset();
    if (onBackToCatalog) onBackToCatalog();
  };

  const handleSave = async () => {
    // Validate every step so nothing invalid is saved; jump to the first step with errors.
    for (let i = 0; i < STEPS.length; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setSaving(true);
    try {
      // BACKEND: addProduct() lives in services/productService.js (currently localStorage).
      const saved = await addProduct({ ...product, name: product.name.trim(), sku: product.sku.trim().toUpperCase() });
      setToast({ type: 'success', message: `"${saved.name}" was added to the menu (saved locally for now).` });
      if (onProductAdded) onProductAdded(saved);
      reset();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === STEPS.length - 1;
  const handlePrimary = () => (isLast ? handleSave() : validateStep(step) && setStep(step + 1));
  const handleSecondary = () => (step === 0 ? handleCancel() : goToStep(step - 1));

  const btnBase = 'h-10 rounded-lg px-4 text-[14px] transition enabled:active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <button type="button" onClick={onBackToCatalog} className="mb-2 flex items-center gap-1 text-[12px] text-[#6b5f5b] hover:text-ink">
        <ChevronLeft size={13} /> Menu catalog
      </button>
      <h1 className="text-[22px] font-bold leading-tight">Add product</h1>
      <p className="mb-5 mt-1 text-[12px] text-muted">Products sync to every POS terminal as soon as you save.</p>

      {/* Stepper */}
      <ol className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Progress">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => goToStep(i)}
                aria-current={active ? 'step' : undefined}
                className={`flex h-[43px] w-full items-center gap-2 rounded-lg border px-3 text-left text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active ? 'border-primary bg-primary-soft text-primary' : done ? 'border-line bg-white text-success hover:border-success' : 'border-line bg-white text-muted'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  active ? 'bg-primary text-white' : done ? 'bg-success text-white' : 'bg-sand text-muted'
                }`}>
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 0 && <DetailsStep product={product} errors={errors} update={update} onBlurField={validateField} onImageError={(m) => setToast({ type: 'error', message: m })} />}
      {step === 1 && <OptionsStep product={product} update={update} />}
      {step === 2 && <BranchStep product={product} errors={errors} update={update} />}

      {/* Footer buttons */}
      <div className="mt-5 flex items-center justify-between">
        <button type="button" onClick={handleSecondary} disabled={saving} className={`${btnBase} border border-line bg-white font-semibold text-ink hover:bg-page disabled:opacity-50`}>
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <button type="button" onClick={handlePrimary} disabled={saving} className={`${btnBase} bg-primary font-medium text-white hover:bg-primary-hover disabled:opacity-60`}>
          {saving ? 'Saving…' : isLast ? 'Save Product' : 'Continue'}
        </button>
      </div>

      {/* Simple feedback message (not in the reference; needed for success/error feedback) */}
      {toast && (
        <div role="status" className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-4 py-3 text-[12px] font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
