import React, { useEffect, useState } from 'react';
import { Users, Search, Edit, Trash2, Plus, Copy, Sun, Moon } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import AddClientProductForm from './AddClientProductForm';
import {
  fetchClientProducts,
  deleteClientProductById,
  createClientProduct,
  updateClientProduct,
} from '../data/clientproduct';
import { fetchClients } from '../data/clients';
import { useDarkMode } from '../context/DarkModeContext';

const ClientProductsPage = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [clientProductList, setClientProductList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState(null);

  const colorClasses = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800',
    'bg-red-100 text-red-800',
    'bg-teal-100 text-teal-800',
    'bg-indigo-100 text-indigo-800',
  ];

  const loadClientProducts = async () => {
    try {
      const data = await fetchClientProducts();
      const map = {};
      data.forEach(({ clientId, clientName, productName, productId }) => {
        if (!map[clientId]) map[clientId] = { clientName, products: [] };
        map[clientId].products.push({ productName, productId });
      });
      setClientProductList(map);
    } catch (err) {
      console.error('Error loading client-products:', err);
    }
  };

  const loadUnlinkedClients = async () => {
    try {
      const clientList = await fetchClients();
      const productMappings = await fetchClientProducts();
      const linkedClientIds = new Set(productMappings.map(p => p.clientId));
      const unlinked = clientList.filter(c => !linkedClientIds.has(c.clientId));
      setClients(unlinked);
    } catch (err) {
      console.error('Error loading unlinked clients:', err);
    }
  };

  useEffect(() => {
    loadClientProducts();
  }, []);

  const handleDelete = (clientId) => {
    setDeletingClientId(clientId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingClientId) return;
    try {
      const token = localStorage.getItem('token');
      await deleteClientProductById(token, deletingClientId);
      loadClientProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingClientId(null);
    }
  };

  const handleAddOrUpdate = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      if (editData) {
        await updateClientProduct(token, formData.clientId, formData);
      } else {
        await createClientProduct(token, formData);
      }
      await loadClientProducts();
      setShowForm(false);
      setEditData(null);
    } catch (err) {
      console.error('Failed to save client-product mapping:', err);
    }
  };

  const handleOpenAdd = async () => {
    await loadUnlinkedClients();
    setEditData(null);
    setShowForm(true);
  };

  const handleOpenEdit = async (clientId) => {
    const allClients = await fetchClients();
    const productMappings = await fetchClientProducts();
    const mapped = productMappings.filter(mp => mp.clientId === clientId);
    const existingClient = allClients.find(c => c.clientId === clientId);
    const productIds = mapped.map(mp => mp.productId);
    setClients([existingClient]);
    setEditData({ clientId, productIds });
    setShowForm(true);
  };

const filteredEntries = Object.entries(clientProductList).filter(([, value]) => {
  const query = searchQuery.toLowerCase();
  const nameMatch = value.clientName?.toLowerCase().includes(query);

  const productMatch = value.products?.some(p =>
    p.productName?.toLowerCase().includes(query)
  );

  return nameMatch || productMatch;
});



  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white bg-black' : 'text-black bg-gray-50'}`} onClick={() => setIsActionsOpen(false)}>

      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className={`
            p-2 rounded-full border shadow-sm transition-all duration-300 
            hover:scale-105 active:scale-95 
            hover:bg-gray-100 dark:hover:bg-neutral-800
            ${
              isDarkMode
                ? 'text-neutral-200 bg-neutral-900 border-neutral-800 hover:text-neutral-100'
                : 'text-gray-700 bg-white border-gray-300 hover:text-gray-300'
            }
          `}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {showForm && (
  <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
    <div className={`p-4 rounded-lg w-full max-w-xl ${isDarkMode ? 'text-white bg-neutral-900' : 'text-black bg-white'}`}>
      <AddClientProductForm
        clients={clients}
        initialData={editData}
        onSubmit={handleAddOrUpdate}
        onClose={() => { setShowForm(false); setEditData(null); }}
      />
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className={`p-6 rounded-lg shadow-xl ${isDarkMode ? 'text-white bg-neutral-900' : 'bg-white'}`}>
            <h2 className="mb-4 text-lg font-semibold">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this mapping? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-md transition ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Client Products</h1>
          <button onClick={handleOpenAdd} className={`flex gap-2 items-center px-4 py-2 mr-16 rounded-lg ${isDarkMode ? 'text-white bg-neutral-800 hover:bg-neutral-700' : 'text-white bg-gray-900 hover:bg-gray-800'}`}>
            <Plus size={16} /> Add Mapping
          </button>
        </div>
      </div>

      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3 items-center">
            <Users className="text-gray-500 dark:text-neutral-400" size={20} />
            <div>
              <h2 className="text-xl font-semibold">Client View</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400">See which products are used by each client</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <ActionsMenu
            isOpen={isActionsOpen}
            onToggle={() => setIsActionsOpen(!isActionsOpen)}
            onSelect={() => setIsActionsOpen(false)}
            isDarkMode={isDarkMode} 
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" size={16} />
            <input
              type="text"
              placeholder="Search name or product..."
              className={`w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 
              ${isDarkMode ? 'placeholder-neutral-400 text-neutral-200 bg-neutral-800 border-neutral-700' : 'placeholder-gray-500 text-black bg-white border-gray-300'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map(([clientId, value], index) => (
            <div
              key={clientId}
              className={`flex flex-col justify-between p-6 transition-all duration-300 border rounded-lg shadow-sm hover:scale-[1.02] ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-300'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{value.clientName}</h3>
                    <p className="text-sm text-gray-500">{value.products.length} Products</p>
                  </div>
                   <div className="relative group">
                      <Copy 
                        className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-white" 
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value.products.map(p => p.productName).join(', ')); }} 
                      />
                       <span className="absolute -top-8 left-1/2 px-2 py-1 text-xs text-white whitespace-nowrap bg-black rounded-md opacity-0 transition-opacity -translate-x-1/2 group-hover:opacity-100">
                        Copy Client's product details
                      </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {value.products.map(({ productName, productId }, i) => (
                    <div
                      key={productId}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses[(index + i) % colorClasses.length]}`}
                    >
                      {productName}
                    </div>
                  ))}
                </div>
              </div>
               <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-neutral-800">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(parseInt(clientId)); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border ${isDarkMode ? 'border-neutral-700' : 'border-gray-300'}`}>
                      <Edit size={14}/> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(parseInt(clientId)); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
                      <Trash2 size={14}/> Delete
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientProductsPage;
