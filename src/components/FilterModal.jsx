import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { useDarkMode } from '../context/DarkModeContext';

const API_BASE_URL = 'http://localhost:3000';

export default function FilterModal({ isOpen, onClose, filterPayload }) {
  const { isDarkMode } = useDarkMode();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFilteredClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/clientsFilter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filterPayload),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw);

      const parsed = JSON.parse(raw);
      setClients(parsed.clients || []);
    } catch (err) {
      console.error('Error fetching filtered clients:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [filterPayload]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchFilteredClients();
    }
  }, [isOpen, fetchFilteredClients]);

  const formatDate = (dob) => {
    const d = new Date(dob);
    return d.toLocaleDateString();
  };

  const containerClass = `p-6 rounded-xl max-w-5xl w-full z-10 shadow-xl max-h-[80vh] overflow-y-auto transition-colors duration-300 ${
    isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'
  }`;

  const titleClass = `text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`;

  const textClass = `${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`;

  const tableHeaderClass = `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`;
  const tableBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const hoverRow = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const buttonClass = `px-4 py-2 rounded-md border ${
    isDarkMode
      ? 'border-gray-600 text-white bg-gray-700 hover:bg-gray-600'
      : 'border-gray-300 text-black bg-white hover:bg-gray-100'
  } transition-all duration-200`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black bg-opacity-40" />
      <div className={containerClass}>
        <Dialog.Title className={titleClass}>Filtered Clients</Dialog.Title>

        {loading ? (
          <p className={`text-center ${textClass}`}>Loading clients...</p>
        ) : clients.length === 0 ? (
          <p className={`text-center ${textClass}`}>No matching clients found.</p>
        ) : (
          <table className={`w-full text-sm text-left border ${tableBorder}`}>
            <thead className={tableHeaderClass}>
              <tr>
                <th className={`p-2 border ${tableBorder}`}>Client ID</th>
                <th className={`p-2 border ${tableBorder}`}>Name</th>
                <th className={`p-2 border ${tableBorder}`}>Email</th>
                <th className={`p-2 border ${tableBorder}`}>Gender</th>
                <th className={`p-2 border ${tableBorder}`}>DOB</th>
                <th className={`p-2 border ${tableBorder}`}>Products</th>
                <th className={`p-2 border ${tableBorder}`}>Family Head</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.clientId} className={`${hoverRow} transition-colors`}>
                  <td className={`p-2 border ${tableBorder}`}>{client.clientId}</td>
                  <td className={`p-2 border ${tableBorder}`}>{client.clientName}</td>
                  <td className={`p-2 border ${tableBorder}`}>{client.clientEmail}</td>
                  <td className={`p-2 border ${tableBorder}`}>{client.clientGender}</td>
                  <td className={`p-2 border ${tableBorder}`}>{formatDate(client.clientDOB)}</td>
                  <td className={`p-2 border ${tableBorder}`}>{client.clientProducts || '—'}</td>
                  <td className={`p-2 border ${tableBorder} text-center`}>
                    {client.familyHead ? '✔️' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 text-right">
          <button onClick={onClose} className={buttonClass}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
