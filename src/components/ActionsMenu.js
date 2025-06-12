import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ScrollText , Mail, Database, LogOut } from 'lucide-react';

const ActionsMenu = ({ isOpen, onToggle, onSelect, isDarkMode }) => {
  const navigate = useNavigate();

  <button
  onClick={() => {
    onToggle();
    onSelect('clientDetails');
    navigate('/client-details');
  }}

  
>
  Client Details
</button>

  const [isDatabaseMenuOpen, setIsDatabaseMenuOpen] = useState(false);

  return (
  <div className="relative">
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 font-medium ${
        isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
      } focus:outline-none transition-colors duration-300`}
    >
      Actions
      <ChevronDown
        size={16}
        className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>

    {isOpen && (
      <div
        className={`absolute left-0 z-10 w-56 mt-2 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border rounded-lg shadow-lg top-full transition-all duration-300`}
      >
        <div className="py-2">
          <button
            className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
              isDarkMode
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
            } transition-colors duration-300`}
            onClick={() => {
              onToggle();
              onSelect('logs');
            }}
          >
            <ScrollText size={16} className="text-green-600" />
            Logs
          </button>

          <button
            className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
              isDarkMode
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
            } transition-colors duration-300`}
            onClick={() => {
              onToggle();
              onSelect('mail');
            }}
          >
            <Mail size={16} className="text-blue-600" />
            Mail messaging
          </button>

          <div className="relative">
            <button
              className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                isDarkMode
                  ? 'text-gray-200 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } transition-colors duration-300`}
              onClick={() => setIsDatabaseMenuOpen(!isDatabaseMenuOpen)}
            >
              <Database size={16} className="text-yellow-600" />
              Database Operations
              <ChevronRight size={16} className="ml-auto" />
            </button>

            {isDatabaseMenuOpen && (
              <div
                className={`absolute top-0 z-10 w-56 mt-0 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg left-full transition-all duration-300`}
              >
                <div className="py-2">
                  {[
                    { label: 'Client Details', value: 'clientDetails' },
                    { label: 'Family', value: 'family' },
                    { label: 'Client Products', value: 'clientProducts' },
                    { label: 'Products', value: 'products' },
                    { label: 'Back to Main', value: 'main' },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        onSelect(value);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
              isDarkMode
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
            } transition-colors duration-300`}
            onClick={() => {
              onToggle();
              onSelect('exit');
            }}
          >
            <LogOut size={16} className="text-red-600" />
            Exit
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default ActionsMenu;
