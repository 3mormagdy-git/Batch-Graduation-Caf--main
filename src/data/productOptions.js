import lib1 from '@/assets/library/1.jpg';
import lib2 from '@/assets/library/2.jpg';
import lib3 from '@/assets/library/3.jpg';
import lib4 from '@/assets/library/4.jpg';
import lib5 from '@/assets/library/5.jpg';
import lib6 from '@/assets/library/6.jpg';
import lib7 from '@/assets/library/7.jpg';
import lib8 from '@/assets/library/8.jpg';
import lib9 from '@/assets/library/9.jpg';
import lib10 from '@/assets/library/10.jpg';
import lib11 from '@/assets/library/11.jpg';
import lib12 from '@/assets/library/12.jpg';

// Mock data for the Add Product form. Everything here is temporary:
// when the backend is ready these lists should come from API calls.

export const PRODUCT_TYPES = [
  { id: 'beverage', label: 'Beverage (milk & shots)' },
  { id: 'food', label: 'Food' },
];

export const SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'regular', label: 'Regular' },
  { id: 'large', label: 'Large' },
  { id: 'portion', label: '1 Portion' },
  { id: 'sharing', label: 'Sharing (2)' },
];

// price 0 is shown as "Free" in the UI
export const ADDONS = [
  { id: 'vanilla-syrup', label: 'Vanilla Syrup', price: 15 },
  { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 15 },
  { id: 'whipped-cream', label: 'Whipped Cream', price: 10 },
  { id: 'pistachio-crumble', label: 'Pistachio Crumble', price: 25 },
  { id: 'cinnamon-dust', label: 'Cinnamon Dust', price: 0 },
  { id: 'warmed', label: 'Warmed', price: 0 },
  { id: 'belgian-chocolate-dip', label: 'Belgian Chocolate Dip', price: 25 },
  { id: 'vanilla-ice-cream', label: 'Vanilla Ice Cream', price: 30 },
  { id: 'extra-halloumi', label: 'Extra Halloumi', price: 35 },
];

export const BRANCHES = [
  { id: 'cairo-downtown', name: 'Cairo Downtown', location: 'Downtown, Cairo' },
  { id: 'zamalek', name: 'Zamalek', location: 'Zamalek, Cairo' },
  { id: 'new-cairo', name: 'New Cairo', location: '5th Settlement, New Cairo' },
];

// ASSUMPTION: the reference shows these two dropdowns empty, so these values
// are placeholders. Replace them with the real categories / stations.
export const CATEGORIES = ['Hot drinks', 'Cold drinks', 'Desserts', 'Breakfast', 'Mains'];
export const KITCHEN_STATIONS = ['Bar', 'Grill', 'Cold station', 'Pastry'];

// "Choose from library" thumbnails. These are cropped from the design reference
// (low resolution). Replace the files in src/assets/library/ with real photos
// (same names) to improve quality.
export const LIBRARY_IMAGES = [lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8, lib9, lib10, lib11, lib12].map(
  (src, i) => ({ id: `lib-${i + 1}`, src })
);

// Shape of one product. This object is what the service saves and what the
// Menu Catalog / Dashboard can read later (see SUMMARY.md, "Product shape").
export function createEmptyProduct() {
  const branches = {};
  BRANCHES.forEach((b) => {
    // price '' means "use the base price" (as written in the reference)
    branches[b.id] = { enabled: true, price: '' };
  });
  return {
    name: '',
    description: '',
    category: '',
    sku: '',
    basePrice: '',
    kitchenStation: '',
    imageUrl: LIBRARY_IMAGES[0].src,
    imageName: '', // only set when the user uploads a file
    productType: 'beverage',
    sizes: ['regular'],
    addons: [],
    availableForSale: true,
    branches,
  };
}
