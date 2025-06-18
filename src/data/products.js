const API_BASE_URL = 'http://localhost:3000';

// GET: Fetch all products
export const fetchProducts = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();
  console.log('[fetchProducts] Status:', response.status);
  console.log('[fetchProducts] Raw:', raw);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${raw}`);
  }

  if (!raw) return [];
const parsed = JSON.parse(raw);
return parsed.products || []; // ⬅️ this ensures only the array is returned

};

// POST: Create a new product
export const createProduct = async (productData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const payload = {
    ...productData,
    productId: productData.productId || undefined, // Include if defined
  };

  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('[createProduct] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to create product');
  return result;
};

// PUT: Update existing product
export const updateProduct = async (productId, updatedData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const payload = {
    ...updatedData,
    productId, // Ensure backend receives it in body
  };

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('[updateProduct] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to update product');
  return result;
};

// DELETE: Delete a product
export const deleteProductById = async (productId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  console.log('[deleteProductById] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to delete product');
  return result;
};
