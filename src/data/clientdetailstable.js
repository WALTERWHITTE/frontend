import React from 'react';
import clients from '../data/clients';

const ClientDetailsTable = () => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Index</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client ID</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client Name</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client Email</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client Gender</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client Contact</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client DOB</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client, index) => (
              <tr key={client.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.gender || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.dob || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.updatedAt || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDetailsTable;