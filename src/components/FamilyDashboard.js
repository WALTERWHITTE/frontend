import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Copy, Edit, Trash2, Sun, Moon } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import AddFamilyForm from './AddFamilyForm';
import { useDarkMode } from '../context/DarkModeContext'; // Adjust path

const API_BASE_URL = 'http://localhost:3000/api';

const FamilyDashboard = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [families, setFamilies] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editFamily, setEditFamily] = useState(null);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [deletingFamilyId, setDeletingFamilyId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [familyRes, clientRes] = await Promise.all([
        fetch(`${API_BASE_URL}/families`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const familyData = await familyRes.json();
      const clientData = await clientRes.json();

      setFamilies(familyData);
      setClients(clientData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const getLabelTextColor = (isDarkMode) => {
  return isDarkMode ? 'text-gray-300' : 'text-gray-600';
};


  const handleOpenAddForm = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allClients = await res.json();
      const unlinkedClients = allClients.filter(c => !c.familyId);
      setClients(unlinkedClients);
      setEditFamily(null);
      setShowForm(true);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const handleOpenEditForm = async (family) => {
  const token = localStorage.getItem('token');
  try {
    // Fetch all clients
    const clientRes = await fetch(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const clientData = await clientRes.json();
    
    const assignedClients = clientData.filter(c => c.familyId === family.familyId);
    const unlinkedClients = clientData.filter(c => !c.familyId || c.familyId === null);
    
    const mergedClients = [
      ...assignedClients,
      ...unlinkedClients.filter(unlinked =>
        !assignedClients.some(assigned => assigned.clientId === unlinked.clientId)
      )
    ];

    setEditFamily({
      ...family,
      clientIds: assignedClients.map(c => c.clientId),
      headCandidates: mergedClients
    });

    setShowForm(true);
  } catch (err) {
    console.error('Failed to load clients for editing:', err);
  }
};


  // Inside handleAddOrUpdateFamily
const handleAddOrUpdateFamily = async (family) => {
  const token = localStorage.getItem('token');
  const url = editFamily ? `${API_BASE_URL}/families/${family.familyId}` : `${API_BASE_URL}/families`;
  const method = editFamily ? 'PUT' : 'POST';
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(family),
    });

    if (res.ok) {
      await fetchData();  // Fetch before closing
      setShowForm(false);
      setEditFamily(null);
    } else {
      console.error('Failed to save family');
    }
  } catch (err) {
    console.error('Error saving family:', err);
  }
};

  const handleDelete = (familyId) => {
    setDeletingFamilyId(familyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingFamilyId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/families/${deletingFamilyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      } else {
        console.error('Failed to delete family');
      }
    } catch (err) {
      console.error('Failed to delete family:', err);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingFamilyId(null);
    }
  };


  const filteredFamilies = families.filter(f =>
    f.familyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHeadName = (headId) => {
    const headClient = clients.find(c => c.clientId === headId);
    return headClient ? headClient.clientName : 'N/A';
  };

  return (
  <div className={`min-h-screen ${isDarkMode ? 'text-white bg-black' : 'text-black bg-gray-50'}`} onClick={() => setIsActionsMenuOpen(false)}>

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

    {/* Add Family Modal */}
    {showForm && (
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
        <AddFamilyForm
          clients={clients}
          initialData={editFamily}
          onClose={() => { setShowForm(false); setEditFamily(null); }}
          onSubmit={handleAddOrUpdateFamily}
        />
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
        <div className={`p-6 rounded-lg shadow-xl ${isDarkMode ? 'text-white bg-neutral-900' : 'bg-white'}`}>
          <h2 className="mb-4 text-lg font-semibold">Confirm Deletion</h2>
          <p className="mb-6">Are you sure you want to delete this family? This action cannot be undone.</p>
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

    {/* Family Details Modal */}
    {selectedFamily && (
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSelectedFamily(null)}>
        <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl transform transition-all duration-300 ${isDarkMode ? 'text-white bg-neutral-900' : 'text-black bg-white'}`} onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setSelectedFamily(null)}>✕</button>
          <h2 className="mb-4 text-xl font-bold">Family Details</h2>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div><strong>ID:</strong> {selectedFamily.familyId}</div>
            <div><strong>Name:</strong> {selectedFamily.familyName}</div>
            <div><strong>Address:</strong> {selectedFamily.familyAddress}</div>
            <div><strong>Head:</strong> {getHeadName(selectedFamily.familyHeadId)}</div>
            <div><strong>Created:</strong> {selectedFamily.createdAt ? new Date(selectedFamily.createdAt).toLocaleString() : '--'}</div>
          </div>
        </div>
      </div>
    )}

    {/* Header */}
    <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Family Dashboard</h1>
        <button onClick={handleOpenAddForm} className={`flex gap-2 items-center px-4 py-2 mr-16 rounded-lg ${isDarkMode ? 'text-white bg-neutral-800 hover:bg-neutral-700' : 'text-white bg-gray-900 hover:bg-gray-800'}`}>
          <Plus size={16} /> Add Family
        </button>
      </div>
    </div>

    {/* Search & Actions */}
    <div className="p-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-3 items-center">
          <Users className="text-gray-500 dark:text-neutral-400" size={20} />
          <div>
            <h2 className="text-xl font-semibold">Families</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Manage your families</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" size={16} />
          <input
            type="text"
            placeholder="Search families..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 
            ${isDarkMode ? 'placeholder-neutral-400 text-neutral-200 bg-neutral-800 border-neutral-700' : 'placeholder-gray-500 text-black bg-white border-gray-300'}`}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <ActionsMenu isDarkMode={isDarkMode} isOpen={isActionsMenuOpen} onToggle={() => setIsActionsMenuOpen(!isActionsMenuOpen)} />
      </div>

      {/* Family Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFamilies.map((family) => (
          <div 
            key={family.familyId} 
            onClick={() => setSelectedFamily(family)} 
            className={`flex flex-col justify-between p-4 border rounded-lg shadow-sm hover:scale-[1.02] transition cursor-pointer ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-300'}`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{family.familyName}</h3>
                  <p className={`text-xs ${getLabelTextColor(isDarkMode)}`}>ID: {family.familyId}</p>
                </div>
                <div className="relative group">
                  <Copy 
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-white" 
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(family, null, 2)); }} 
                  />
                  <span className="absolute -top-8 left-1/2 px-2 py-1 text-xs text-white whitespace-nowrap bg-black rounded-md opacity-0 transition-opacity -translate-x-1/2 group-hover:opacity-100">
                    Copy Family details
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-300 dark:text-neutral-400">
                <div><span className={`text-xs ${getLabelTextColor(isDarkMode)}`}>Address:</span> {family.familyAddress}</div>
                <div><span className={`text-xs ${getLabelTextColor(isDarkMode)}`}>Head:</span> {getHeadName(family.familyHeadId)}</div>
                <div><span className={`text-xs ${getLabelTextColor(isDarkMode)}`}>Created:</span> {family.createdAt ? new Date(family.createdAt).toLocaleString() : '--'}</div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-neutral-800">
              <button onClick={(e) => { e.stopPropagation(); handleOpenEditForm(family); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border ${isDarkMode ? 'border-neutral-700' : 'border-gray-300'}`}>
                <Edit size={14}/> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(family.familyId); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
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

export default FamilyDashboard;
