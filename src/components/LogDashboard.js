import React, { useEffect, useState } from 'react';
import { Search, Bookmark, Sun, Moon } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import { fetchLogs, clearLogs as clearLogsAPI } from '../data/log';

import { getLogStatusColor } from '../utils/utils';
import { useDarkMode } from '../context/DarkModeContext';
import { downloadCSV } from './csvDownloader';


const LogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const rawLogs = await fetchLogs();

      if (!Array.isArray(rawLogs)) {
        console.error('Logs response not an array:', rawLogs);
        throw new Error('Invalid logs format');
      }

      const transformed = rawLogs.map((log) => ({
        logId: `LOG${log.logId.toString().padStart(3, '0')}`,
        userId: `USR${log.userId?.toString().padStart(3, '0') || '000'}`,
        timestamp: new Date(log.timestamp).toLocaleString(),
        action: log.action,
        description: log.description,
        username: log.username || 'Unknown',
        status: /(fail|error|denied|unauthorized|insufficient)/i.test(log.description)
          ? 'Failed'
          : 'Success',
      }));

      setLogs(transformed);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const clearLogs = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = async () => {
    setShowClearConfirm(false);
    const success = await clearLogsAPI();
    if (success) {
      await loadLogs();
    } else {
      alert('Failed to clear logs. Check console for more details.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
    log.logId?.toString().includes(term) || 
      log.username?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          isDarkMode ? 'bg-black text-neutral-200' : 'text-gray-900 bg-gray-50'
        }`}
        onClick={() => setIsActionsOpen(false)}
      >
        {/* Dark mode toggle */}
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

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Log Dashboard</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3 items-center">
              <Bookmark className="text-gray-500 dark:text-neutral-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">System Logs</h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Review system and user actions</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
               <div className="relative">
              <Search className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" size={16} />
             <input
  type="text"
  placeholder="Search logs..."
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
            <button onClick={() => downloadCSV('logs.csv', filteredLogs)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isDarkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'text-gray-800 bg-gray-200 hover:bg-gray-300'}`}>Download CSV</button>
            <button onClick={clearLogs} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition hover:bg-red-700">Clear Logs</button>
            </div>
           
          </div>

          <div className="flex justify-between items-center mb-6">
            <ActionsMenu
              isOpen={isActionsOpen}
              onToggle={() => setIsActionsOpen((prev) => !prev)}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="overflow-x-auto">
            <table className={`min-w-full border-collapse ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}>
              <thead>
                <tr className={isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}>
                  <th className="px-4 py-2 text-sm font-semibold text-left">Log ID</th>
                  <th className="px-4 py-2 text-sm font-semibold text-left">User</th>
                  <th className="px-4 py-2 text-sm font-semibold text-left">Timestamp</th>
                  <th className="px-4 py-2 text-sm font-semibold text-left">Action</th>
                  <th className="px-4 py-2 text-sm font-semibold text-left">Description</th>
                  <th className="px-4 py-2 text-sm font-semibold text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={index} className={`border-b ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
                    <td className="px-4 py-2 text-sm">{log.logId}</td>
                    <td className="px-4 py-2 text-sm">{log.username}</td>
                    <td className="px-4 py-2 text-sm">{log.timestamp}</td>
                    <td className="px-4 py-2 text-sm">{log.action}</td>
                    <td className="px-4 py-2 text-sm">{log.description}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
         {showClearConfirm && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className={`p-6 rounded-lg shadow-xl ${isDarkMode ? 'text-white bg-neutral-900' : 'bg-white'}`}>
              <h2 className="mb-4 text-lg font-semibold">Confirm Clear Logs</h2>
              <p className="mb-6">Are you sure you want to clear all logs? This action cannot be undone.</p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`px-4 py-2 rounded-md transition ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="px-4 py-2 text-white bg-red-600 rounded-md transition hover:bg-red-700"
                >
                  Confirm Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogDashboard;
