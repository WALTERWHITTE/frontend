import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import { fetchProducts } from '../data/products'; // Adjust path based on your project structure

const AddClientProductForm = ({ clients, initialData, onSubmit, onClose }) => {
  const { isDarkMode } = useDarkMode();

  const [clientId, setClientId] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId || '');
      setSelectedProductIds(initialData.productIds || []);
    } else {
      setClientId('');
      setSelectedProductIds([]);
    }
  }, [initialData]);

  const handleCheckboxChange = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      clientId: Number(clientId),
      productIds: selectedProductIds
    };

    onSubmit(formData);
  };

  return (
    <div className={`w-full max-w-lg p-6 rounded-lg transform transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h2 className="mb-4 text-xl font-semibold">{initialData ? 'Edit Client Products' : 'Add Client Products'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">Select Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.clientId} value={client.clientId}>
                {client.clientName} (ID: {client.clientId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Select Products</label>
          <div className={`max-h-48 overflow-y-auto border rounded p-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
            {loadingProducts ? (
              <div className="text-sm text-center text-gray-400">Loading products...</div>
            ) : error ? (
              <div className="text-sm text-center text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-sm text-center text-gray-400">No products available</div>
            ) : (
              products.map((product) => (
                <div key={product.productId} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.productId)}
                    onChange={() => handleCheckboxChange(product.productId)}
                    className="mr-2"
                  />
                  <span>{product.productName} (ID: {product.productId})</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-black'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded"
            disabled={!clientId || selectedProductIds.length === 0}
          >
            {initialData ? 'Update' : 'Add'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddClientProductForm;
