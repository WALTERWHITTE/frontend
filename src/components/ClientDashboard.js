import React, { useEffect, useState } from 'react';
import { Search, Users, Copy, Edit, Trash2, Plus, Bookmark } from 'lucide-react';
import AddClientForm from './AddClientForm';
import ActionsMenu from './ActionsMenu';
import { fetchClients, updateClient, deleteClientById } from '../data/clients';
import { useDarkMode } from '../context/DarkModeContext';

const ClientDashboard = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchClients(token);
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('token');
      await deleteClientById(token, clientId);
      setClients((prev) => prev.filter((c) => c.clientId !== clientId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete client.');
    }
  };

  const handleCopy = (client) => {
    const text = `
Client ID: ${client.clientId}
Name: ${client.clientName}
Email: ${client.clientEmail}
Contact: ${client.clientContact}
DOB: ${client.clientDob}
Profession: ${client.clientProfession}
Gender: ${client.clientGender}
Family ID: ${client.familyId}
Family Head: ${client.familyHead}
Created At: ${client.createdAt}
Updated At: ${client.updatedAt}
    `;
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const handleFormSubmit = async (formClient) => {
    const token = localStorage.getItem('token');
    const payload = {
      name: formClient.clientName,
      email: formClient.clientEmail,
      contact: formClient.clientContact,
      dob: formClient.clientDob ? new Date(formClient.clientDob).toISOString().split('T')[0] : null,
      profession: formClient.clientProfession,
      gender: formClient.clientGender,
    };

    try {
      if (editingClient) {
        await updateClient(token, editingClient.clientId, payload);
      }
      const updated = await fetchClients(token);
      setClients(updated);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save client.');
    } finally {
      setShowAddForm(false);
      setEditingClient(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.clientName?.toLowerCase().includes(term) ||
      c.clientEmail?.toLowerCase().includes(term) ||
      String(c.clientContact || '').includes(term) ||
      String(c.clientId || '').includes(term)
    );
  });

  const detailItem = (label, value) => (
    <div className="flex justify-between gap-2 truncate">
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs text-gray-400 font-medium truncate">{value}</span>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`} onClick={() => setIsActionsOpen(false)}>

        {/* Dark Mode Toggle */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 text-sm font-medium border rounded shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Add Client Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <AddClientForm
              onClose={() => {
                setShowAddForm(false);
                setEditingClient(null);
              }}
              darkMode={isDarkMode}
              onAddClient={handleFormSubmit}
              existingClient={editingClient}
            />
          </div>
        )}

        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedClient(null)}>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl transform transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setSelectedClient(null)}>✕</button>
              <h2 className="mb-4 text-xl font-bold">{selectedClient.clientName}'s Details</h2>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-gray-200">
                {detailItem('Client ID', selectedClient.clientId)}
                {detailItem('Email', selectedClient.clientEmail)}
                {detailItem('Contact', selectedClient.clientContact)}
                {detailItem('DOB', new Date(selectedClient.clientDob).toLocaleDateString())}
                {detailItem('Gender', selectedClient.clientGender)}
                {detailItem('Profession', selectedClient.clientProfession)}
                {detailItem('Family ID', selectedClient.familyId)}
                {detailItem('Family Head', selectedClient.familyHead === 1 ? 'Yes' : 'No')}
                {detailItem('Created At', new Date(selectedClient.createdAt).toLocaleString())}
                {detailItem('Updated At', new Date(selectedClient.updatedAt).toLocaleString())}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Client Dashboard</h1>
            <button onClick={() => { setShowAddForm(true); setEditingClient(null); }} className="flex items-center gap-2 px-4 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800">
              <Plus size={16} />
              Add Client
            </button>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="text-gray-500 dark:text-gray-300" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Clients</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your clients</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <ActionsMenu isOpen={isActionsOpen} onToggle={() => setIsActionsOpen(!isActionsOpen)} isDarkMode={isDarkMode} />
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer">
              <Bookmark size={16} />
              <span className="text-sm">Saved Clients</span>
            </div>
          </div>

          {/* Client Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <div key={client.clientId} className={`p-4 border rounded-lg shadow-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onClick={() => setSelectedClient(client)}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{client.clientName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {client.clientId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); handleCopy(client); }} />
                    <Edit className="w-4 h-4 text-blue-500 hover:text-blue-700" onClick={(e) => { e.stopPropagation(); handleEdit(client); }} />
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(client.clientId); }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-200">
                  {detailItem('Email', client.clientEmail)}
                  {detailItem('Contact', client.clientContact)}
                  {detailItem('DOB', new Date(client.clientDob).toLocaleDateString())}
                  {detailItem('Gender', client.clientGender)}
                  {detailItem('Profession', client.clientProfession)}
                  {detailItem('Family ID', client.familyId)}
                  {detailItem('Family Head', client.familyHead === 1 ? 'Yes' : 'No')}
                  {detailItem('Created At', new Date(client.createdAt).toLocaleString())}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
