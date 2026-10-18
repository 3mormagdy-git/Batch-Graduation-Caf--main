import { useDropzone } from 'react-dropzone';
import { Field, CardHeader, inputClass } from './fields';
import { CATEGORIES, KITCHEN_STATIONS, LIBRARY_IMAGES } from '../../data/productOptions';
import { normalizePriceInput } from './validation';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB: uploaded images are stored in localStorage for now

// Step 1: basic product info + picture.
// `product` / `errors` come from AddProduct; `update(field, value)` changes one field.
export default function DetailsStep({ product, errors, update, onBlurField, onImageError }) {
  // react-dropzone: the big preview is also a drop area (click or drag an image on it).
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    onDropRejected: () => onImageError('Please choose an image up to 2 MB'),
    onDrop: (files) => {
      if (!files[0]) return;
      // Read the file as a data URL so it can be previewed AND saved in localStorage.
      // With a real backend this is where the file would be uploaded instead.
      const reader = new FileReader();
      reader.onload = () => {
        update('imageUrl', reader.result);
        update('imageName', files[0].name);
      };
      reader.readAsDataURL(files[0]);
    },
  });

  const isUploaded = Boolean(product.imageName);
  // Library pictures are bundled files, so their internal path is not shown in the URL field.
  const isLibraryImage = LIBRARY_IMAGES.some((img) => img.src === product.imageUrl);

  return (
    <section className="rounded-xl border border-line bg-white p-5" aria-labelledby="details-title">
      <CardHeader id="details-title" title="Product details" />

      <div className="grid gap-5 md:grid-cols-[132px_1fr]">
        {/* Left column: preview + library */}
        <div>
          <div
            {...getRootProps()}
            className={`relative flex h-[132px] w-[132px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-sand ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDragActive ? 'ring-2 ring-primary' : ''
            }`}
          >
            <input {...getInputProps()} aria-label="Upload product image" />
            {product.imageUrl && <img src={product.imageUrl} alt="Product preview" className="h-full w-full object-cover" />}
          </div>

          <p className="mb-2 mt-3 text-[11px] font-semibold text-ink">Choose from library</p>
          <div className="grid grid-cols-4 gap-1.5">
            {LIBRARY_IMAGES.map((img) => {
              const selected = product.imageUrl === img.src;
              return (
                <button
                  key={img.id}
                  type="button"
                  aria-label="Use this library image"
                  aria-pressed={selected}
                  onClick={() => {
                    update('imageUrl', img.src);
                    update('imageName', '');
                  }}
                  className={`h-[28px] w-[28px] overflow-hidden rounded-md border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    selected ? 'border-ink' : 'border-transparent'
                  }`}
                >
                  <img src={img.src} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: fields */}
        <div className="space-y-4">
          <Field id="name" label="Product name" required error={errors.name}>
            <input
              id="name"
              className={inputClass(errors.name)}
              placeholder="e.g. Spanish Latte"
              value={product.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </Field>

          <Field id="description" label="Description">
            <textarea
              id="description"
              rows={3}
              className={`${inputClass(false)} h-auto resize-none py-2.5`}
              placeholder="Short line shown on POS cards"
              value={product.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="category" label="Category" required error={errors.category}>
              <select
                id="category"
                className={inputClass(errors.category)}
                value={product.category}
                onChange={(e) => update('category', e.target.value)}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <option value="" />
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field id="sku" label="SKU" required error={errors.sku}>
              <input
                id="sku"
                className={inputClass(errors.sku)}
                placeholder="HC-001"
                maxLength={20}
                value={product.sku}
                onChange={(e) => update('sku', e.target.value.toUpperCase())}
                onBlur={() => onBlurField('sku')}
                aria-invalid={Boolean(errors.sku)}
                aria-describedby={errors.sku ? 'sku-error' : undefined}
              />
            </Field>

            <Field id="basePrice" label="Base price" required error={errors.basePrice}>
              <div className="relative">
                <input
                  id="basePrice"
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  className={`${inputClass(errors.basePrice)} pr-12`}
                  placeholder="0.00"
                  value={product.basePrice}
                  onChange={(e) => update('basePrice', normalizePriceInput(e.target.value))}
                  onBlur={() => onBlurField('basePrice')}
                  aria-invalid={Boolean(errors.basePrice)}
                  aria-describedby={errors.basePrice ? 'basePrice-error' : undefined}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">EGP</span>
              </div>
            </Field>

            <Field id="kitchenStation" label="Kitchen station" hint="Routes the ticket on the kitchen display">
              <select
                id="kitchenStation"
                className={inputClass(false)}
                value={product.kitchenStation}
                onChange={(e) => update('kitchenStation', e.target.value)}
              >
                <option value="" />
                {KITCHEN_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field id="imageUrl" label="Image URL" hint="Paste a hosted image or pick from the library">
            <input
              id="imageUrl"
              className={inputClass(false)}
              // Uploaded files are data URLs (very long), so show the file name instead.
              value={isUploaded ? `Uploaded: ${product.imageName}` : isLibraryImage || product.imageUrl.startsWith('data:') ? '' : product.imageUrl}
              onChange={(e) => {
                update('imageUrl', e.target.value);
                update('imageName', '');
              }}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
