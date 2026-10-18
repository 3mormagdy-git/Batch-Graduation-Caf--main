import { getProducts } from '../../services/productService';

// Client-side validation. Each function returns an object { fieldName: message }.
// An empty object means the step is valid.

export function validateSku(value) {
  const sku = value.trim().toUpperCase();
  if (!sku) return 'SKU is required';
  if (sku.length < 3 || sku.length > 20) return 'SKU must be 3–20 characters';
  // letters/numbers, with single hyphens between parts (e.g. HC-001)
  if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(sku)) return 'Use letters, numbers and hyphens only (e.g. HC-001)';
  // temporary check against locally saved products; later the backend should check this
  if (getProducts().some((p) => (p.sku || '').toUpperCase() === sku)) return 'This SKU already exists';
  return '';
}

export function validateBasePrice(value) {
  const v = String(value).trim();
  if (v === '') return 'Base price is required';
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Enter a valid price (up to 2 decimals)';
  const n = Number(v);
  if (n <= 0) return 'Price must be greater than 0';
  if (n > 100000) return 'Price is too high';
  return '';
}

export function validateDetails(p) {
  const errors = {};
  if (!p.name.trim()) errors.name = 'Product name is required';
  if (!p.category) errors.category = 'Choose a category';
  const skuError = validateSku(p.sku);
  if (skuError) errors.sku = skuError;
  const priceError = validateBasePrice(p.basePrice);
  if (priceError) errors.basePrice = priceError;
  return errors;
}

// Options step has no required fields in the reference.
export function validateOptions() {
  return {};
}

// A branch price is optional (empty = use base price), but if typed it must be a number >= 0.
export function validateBranches(p) {
  const errors = {};
  Object.entries(p.branches).forEach(([id, b]) => {
    if (b.price !== '' && (Number.isNaN(Number(b.price)) || Number(b.price) < 0)) {
      errors[`branch-${id}`] = 'Enter a valid price';
    }
  });
  return errors;
}

// Cleans what the user types in a price field: Arabic digits -> 0-9,
// "," or Arabic decimal mark -> ".", removes any other character
// and keeps at most 2 decimals.
export function normalizePriceInput(raw) {
  const v = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫,،]/g, '.')
    .replace(/[^0-9.]/g, '');
  const [int, ...rest] = v.split('.');
  return rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int;
}

export const VALIDATORS = [validateDetails, validateOptions, validateBranches];
