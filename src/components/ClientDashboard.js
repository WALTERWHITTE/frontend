import React, { useEffect, useState } from 'react';
import { Search, Users, Copy, Edit, Trash2, Plus, Bookmark, Sun, Moon } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState(null);

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

  const handleDelete = (clientId) => {
    setDeletingClientId(clientId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingClientId) return;
    try {
      const token = localStorage.getItem('token');
      await deleteClientById(token, deletingClientId);
      setClients((prev) => prev.filter((c) => c.clientId !== deletingClientId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete client.');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingClientId(null);
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
    <div className="flex gap-2 justify-between truncate">
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs font-medium text-gray-400 truncate">{value}</span>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-neutral-200' : 'text-gray-900 bg-gray-50'}`} onClick={() => setIsActionsOpen(false)}>

        {/* Dark Mode Toggle */}
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

        {/* Add Client Modal */}
        {showAddForm && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className={`p-6 rounded-lg shadow-xl ${isDarkMode ? 'text-white bg-neutral-900' : 'bg-white'}`}>
              <h2 className="mb-4 text-lg font-semibold">Confirm Deletion</h2>
              <p className="mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
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

        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedClient(null)}>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl transform transition-all duration-300 ${isDarkMode ? 'text-neutral-200 bg-neutral-900' : 'text-gray-900 bg-white'}`} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setSelectedClient(null)}>✕</button>
              <h2 className="mb-4 text-xl font-bold">{selectedClient.clientName}'s Details</h2>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-neutral-200">
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
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Client Dashboard</h1>
            <button onClick={() => { setShowAddForm(true); setEditingClient(null); }} className={`flex gap-2 items-center px-4 py-2 mr-16 rounded-lg ${isDarkMode ? 'text-white bg-neutral-800 hover:bg-neutral-700' : 'text-white bg-gray-900 hover:bg-gray-800'}`}>
              <Plus size={16} />
              Add Client
            </button>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3 items-center">
              <Users className="text-gray-500 dark:text-neutral-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Clients</h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Manage your clients</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" size={16} />
              <input
                type="text"
                placeholder="Search Clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500
                  ${isDarkMode 
                    ? 'placeholder-neutral-400 text-neutral-200 bg-neutral-800 border-neutral-700' 
                    : 'placeholder-gray-500 text-black bg-white border-gray-300'
                  }
                `}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <ActionsMenu isOpen={isActionsOpen} onToggle={() => setIsActionsOpen(!isActionsOpen)} isDarkMode={isDarkMode} />
            <div className="flex gap-2 items-center text-gray-600 cursor-pointer hover:text-gray-800 dark:text-neutral-400 dark:hover:text-white">
              <Bookmark size={16} />
              <span className="text-sm">Saved Clients</span>
            </div>
          </div>

          {/* Client Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <div key={client.clientId} className={`flex flex-col justify-between p-4 border rounded-lg shadow-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-300'}`} onClick={() => setSelectedClient(client)}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{client.clientName}</h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-500">ID: {client.clientId}</p>
                    </div>
                    <div className="relative group">
                       <Copy 
                        className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-white" 
                        onClick={(e) => { e.stopPropagation(); handleCopy(client); }} 
                      />
                       <span className="absolute -top-8 left-1/2 px-2 py-1 text-xs text-white whitespace-nowrap bg-black rounded-md opacity-0 transition-opacity -translate-x-1/2 group-hover:opacity-100">
                        Copy Client's details
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-neutral-200">
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
                <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-neutral-800">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border ${isDarkMode ? 'border-neutral-700' : 'border-gray-300'}`}>
                    <Edit size={14}/> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(client.clientId); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
                    <Trash2 size={14}/> Delete
                  </button>
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
