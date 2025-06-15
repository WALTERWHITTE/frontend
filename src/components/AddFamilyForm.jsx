import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../context/DarkModeContext'; // adjust path accordingly

const AddFamilyForm = ({ clients, initialData, onSubmit, onClose }) => {
  const { isDarkMode } = useDarkMode();  // Context-based dark mode

  const [familyName, setFamilyName] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [clientIds, setClientIds] = useState([]);
  const [familyHeadId, setFamilyHeadId] = useState(null);
  const [headCandidates, setHeadCandidates] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFamilyName(initialData.familyName || '');
      setFamilyAddress(initialData.familyAddress || '');
      setClientIds(initialData.clientIds || []);
      setFamilyHeadId(initialData.familyHeadId || null);
      setHeadCandidates(initialData.headCandidates || clients || []);
    } else {
      setFamilyName('');
      setFamilyAddress('');
      setClientIds([]);
      setFamilyHeadId(null);
      setHeadCandidates(clients || []);
    }
  }, [initialData, clients]);

  const handleCheckboxChange = (clientId) => {
    setClientIds(prev => {
      const newClientIds = prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId];

      if (!newClientIds.includes(familyHeadId)) {
        setFamilyHeadId(null);
      }
      return newClientIds;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      familyName,
      familyAddress,
      clientIds,
      familyHeadId,
      ...(initialData?.familyId && { familyId: initialData.familyId })
    };

    onSubmit(formData);
  };

  return (
    <div className={`w-full max-w-lg p-6 rounded-lg shadow-lg transform transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h2 className="mb-4 text-xl font-semibold">{initialData ? 'Edit Family' : 'Add Family'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">Family Name</label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Family Address</label>
          <input
            type="text"
            value={familyAddress}
            onChange={(e) => setFamilyAddress(e.target.value)}
            className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Family Members</label>
          <div className={`max-h-40 overflow-y-auto border rounded p-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
            {headCandidates.length === 0 ? (
              <div className="text-sm text-center text-gray-400">No unlinked clients available</div>
            ) : (
              headCandidates.map((client) => (
                <div key={client.clientId} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={clientIds.includes(client.clientId)}
                    onChange={() => handleCheckboxChange(client.clientId)}
                    className="mr-2"
                  />
                  <span>{client.clientName} (ID: {client.clientId})</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Family Head</label>
          <select
            value={familyHeadId || ''}
            onChange={(e) => setFamilyHeadId(Number(e.target.value) || null)}
            className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          >
            <option value="">-- Select Head --</option>
            {headCandidates
              .filter(c => clientIds.includes(c.clientId))
              .map(client => (
                <option key={client.clientId} value={client.clientId}>
                  {client.clientName} (ID: {client.clientId})
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-black'}`}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
            {initialData ? 'Update' : 'Add'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddFamilyForm;
