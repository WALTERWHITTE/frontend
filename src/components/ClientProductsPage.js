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

  const handleDelete = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      await deleteClientProductById(token, clientId);
      loadClientProducts();
    } catch (err) {
      console.error('Delete failed:', err);
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
              className={`p-6 transition-all duration-300 border rounded-lg shadow-sm hover:scale-[1.02] ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-300'}`}
            >
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{value.clientName}</h3>
                  <p className="text-sm text-gray-500">{value.products.length} Products</p>
                </div>
                <div className="flex gap-2">
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-white" />
                  <Edit className="w-4 h-4 text-blue-500 hover:text-blue-700" onClick={() => handleOpenEdit(parseInt(clientId))} />
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" onClick={() => handleDelete(parseInt(clientId))} />
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientProductsPage;
