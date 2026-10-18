// TEMPORARY data layer. There is no backend yet, so products are kept in the
// browser's localStorage. When the API is ready, only the bodies of the two
// functions below need to change (e.g. axios.post('/products', product));
// the UI components do not need to be touched.

const STORAGE_KEY = 'restaurant_products';

export function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Returns a Promise so the UI already handles "loading" and "error" states
// the same way it will with a real network request.
export function addProduct(product) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const saved = { ...product, id: `p_${Date.now()}`, createdAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...getProducts(), saved]));
        resolve(saved);
      } catch {
        // e.g. storage full (large uploaded images are stored as data URLs)
        reject(new Error('Could not save the product. Please try again.'));
      }
    }, 500); // fake network delay
  });
}
