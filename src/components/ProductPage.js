import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Home, Plus, Edit, Trash2 } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProductById,
} from '../data/products';
import { useDarkMode } from '../context/DarkModeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const EditableRow = ({ id, name, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
   // eslint-disable-next-line no-unused-vars
  const { isDarkMode, toggleDarkMode } = useDarkMode();


  const handleSave = () => {
    if (editedName.trim()) {
      onUpdate(editedName);
      setIsEditing(false);
    }
  };

  return (
    <tr className="text-sm text-gray-800 dark:text-gray-200">
      <td className="px-4 py-2 border dark:border-gray-700">
  <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>{id}</span>
</td>
     <td className="px-4 py-2 border dark:border-gray-700">
  {isEditing ? (
    <input
      value={editedName}
      onChange={e => setEditedName(e.target.value)}
      className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    />
  ) : (
    <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>{name}</span>
  )}
</td>

      <td className="px-4 py-2 border text-right space-x-2 dark:border-gray-700">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-2 py-1 text-sm text-white bg-green-600 rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 text-sm text-blue-600 border border-blue-600 rounded"
          >
            <Edit size={14} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-2 py-1 text-sm text-red-600 border border-red-600 rounded"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

const ProductsPage = () => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  
  const loadData = async () => {
    try {
      const productList = await fetchProducts();
      setProducts(productList);

      const token = localStorage.getItem('token');
      const cpRes = await fetch('http://localhost:3000/api/client-products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const clientProducts = await cpRes.json();

      const clientCounts = {};
      productList.forEach(p => {
        clientCounts[p.productName] = 0;
      });

      clientProducts.forEach(cp => {
        const name = cp.productName;
        if (clientCounts[name] !== undefined) {
          clientCounts[name]++;
        }
      });

      setProductCounts(clientCounts);
    } catch (err) {
      console.error('Error loading data:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const AddProductForm = ({ onClose, onAdd }) => {
    const [productName, setProductName] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!productName.trim()) {
        console.error('Product name is empty');
        return;
      }
      await onAdd(productName.trim());
      onClose();
    };

    return (
      <div className={`max-w-md p-6 mx-auto rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <h2 className="mb-4 text-xl font-semibold">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300 text-black'}`}
            required
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-black'}`}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Add</button>
          </div>
        </form>
      </div>
    );
  };

  const handleAddProduct = async (name) => {
    try {
      await createProduct({ productName: name });
      await loadData();
    } catch (err) {
      console.error('Error adding product:', err.message);
    }
  };

  const pieData = {
    labels: products.map(p => p.productName),
    datasets: [
      {
        label: 'Clients',
        data: products.map(p => productCounts[p.productName] || 0),
        backgroundColor: [
          '#2563eb', '#22d3ee', '#a21caf', '#f59e42', '#10b981', '#f43f5e', '#fbbf24',
          '#6366f1', '#f472b6', '#facc15', '#4ade80', '#f87171', '#a3e635', '#fcd34d'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: products.map(p => p.productName),
    datasets: [
      {
        label: 'Clients Per Product',
        data: products.map(p => productCounts[p.productName] || 0),
        backgroundColor: '#2563eb',
      }
    ]
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'} min-h-screen`}>
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-6 py-4 border-b flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <Home className="text-gray-400" size={22} />
          <h1 className="text-2xl font-semibold">Products Dashboard</h1>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`w-20 h-10 flex items-center justify-center rounded-full border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95
          ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white hover:text-gray-300' : 'bg-white border-gray-300 text-black hover:text-gray-500'}`}
        >
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div className="flex items-start justify-between px-6 pt-6 pb-2">
        <div>
          <h2 className="text-xl font-semibold">Manage Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your products</p>
          <div className="mt-2">
            <ActionsMenu
              isOpen={isActionsOpen}
              onToggle={() => setIsActionsOpen(!isActionsOpen)}
              onSelect={() => setIsActionsOpen(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div className="flex items-center">
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded-lg hover:bg-gray-800"
            onClick={() => setShowAddProduct(true)}
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      <div className="px-6 mt-4">
        <table className={`w-full border ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-300'}`}>
          <thead>
            <tr className={`text-left text-sm ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              <th className="px-4 py-2 border dark:border-gray-700">Product ID</th>
              <th className="px-4 py-2 border dark:border-gray-700">Product Name</th>
              <th className="px-4 py-2 border text-right dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <EditableRow
                key={product.productId}
                id={product.productId}
                name={product.productName}
                onUpdate={async (newName) => {
                  try {
                    await updateProduct(product.productId, { productName: newName });
                    await loadData();
                  } catch (err) {
                    console.error('Error updating product:', err.message);
                  }
                }}
                onDelete={async () => {
                  try {
                    await deleteProductById(product.productId);
                    await loadData();
                  } catch (err) {
                    console.error('Error deleting product:', err.message);
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'} p-6 border rounded-lg shadow-sm`}>
          <h2 className="mb-4 text-lg font-semibold">
            Product Distribution (Clients)
          </h2>
          <div className="h-[300px]">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'} p-6 border rounded-lg shadow-sm`}>
          <h2 className="mb-4 text-lg font-semibold">
            Product Popularity Bar Chart
          </h2>
          <div className="h-[300px]">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AddProductForm
            onClose={() => setShowAddProduct(false)}
            onAdd={handleAddProduct}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
