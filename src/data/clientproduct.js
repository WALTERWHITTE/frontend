const API_BASE_URL = 'http://localhost:3000/api';

// ✅ GET all client-products
export const fetchClientProducts = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/client-products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },  
  });

  const raw = await response.text();
  console.log('[fetchClientProducts] Status:', response.status);
  console.log('[fetchClientProducts] Raw:', raw);

  if (!response.ok) throw new Error(`Error ${response.status}: ${raw}`);

  const json = raw ? JSON.parse(raw) : [];

  // ✅ FIXED: Handle both raw array or { clientproducts: [...] }
  return Array.isArray(json) ? json : json.clientproducts || [];
};

// ✅ POST - Create a new client-product
export const createClientProduct = async (token, clientProductData) => {
  const res = await fetch(`${API_BASE_URL}/client-products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(clientProductData),
  });

  const result = await res.json();
  console.log('[createClientProduct] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to create client-product');
  return result;
};

// ✅ PUT - Update existing client-product
export const updateClientProduct = async (token, clientProductId, updatedData) => {
  const res = await fetch(`${API_BASE_URL}/client-products/${clientProductId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const result = await res.json();
  console.log('[updateClientProduct] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to update client-product');
  return result;
};

// ✅ DELETE - Delete a client-product
export const deleteClientProductById = async (token, clientProductId) => {
  const res = await fetch(`${API_BASE_URL}/client-products/${clientProductId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  console.log('[deleteClientProductById] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to delete client-product');
  return result;
};