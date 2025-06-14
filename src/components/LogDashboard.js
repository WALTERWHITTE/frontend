import React, { useEffect, useState } from 'react';
import { Search, Bookmark } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import { fetchLogs } from '../data/log';
import { getLogStatusColor } from '../utils/utils';
import { useDarkMode } from '../context/DarkModeContext';
import { downloadCSV } from './csvDownloader';


const LogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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
          isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
        onClick={() => setIsActionsOpen(false)}
      >
        {/* Dark mode toggle */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
  onClick={toggleDarkMode}
  className={`
    w-20 h-10 flex items-center justify-center rounded-full border shadow-sm transition-all duration-300 
    hover:scale-105 active:scale-95 
    hover:bg-gray-100 dark:hover:bg-gray-700
    ${isDarkMode 
    ? 'bg-gray-800 text-gray-100 border-gray-600 hover:text-gray-300' 
    : 'bg-white text-gray-700 border-gray-300 hover:text-gray-300'}
  `}
>
  {isDarkMode ? '🌙 Dark' : '☀️ Light'}
</button>
        </div>

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Log Dashboard</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          {/* Title + Search */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Bookmark className="text-gray-500 dark:text-gray-500" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Logs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Activity logs & events</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
  <button
    onClick={() => downloadCSV('logs.csv', logs)}
    className="flex items-center gap-2 px-3 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-700 transition"
  >
    Download Logs
  </button>
</div>


            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
  type="text"
  placeholder="Search templates..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className={`
    w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500
    ${isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300' 
      : 'bg-white border-gray-300 text-black placeholder-gray-500'
    }
  `}
/>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center justify-between mb-6">
            <ActionsMenu isOpen={isActionsOpen} onToggle={() => setIsActionsOpen(!isActionsOpen)} isDarkMode={isDarkMode} />
          </div>

          {/* Table */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="min-w-full text-sm">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} text-left`}>
                <tr>
                  <th className="p-4">Log ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.logId} className={`${isDarkMode ? 'border-gray-700' : 'border-gray-300'} border-t`}>
                      <td className="p-4">{log.logId}</td>
                      <td className="p-4">{log.username}</td>
                      <td className="p-4">{log.action}</td>
                      <td className="p-4 truncate max-w-xs">{log.description}</td>
                      <td className="p-4">{log.timestamp}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getLogStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan="6">
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDashboard;
