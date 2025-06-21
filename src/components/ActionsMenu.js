import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ScrollText,
  Mail,
  Database,
  LogOut,
  FileText,
  Send,
  User,
  Users,
  ShoppingBag,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionsMenu = ({ isOpen, onToggle, isDarkMode }) => {
  const [isDatabaseMenuOpen, setIsDatabaseMenuOpen] = useState(false);
  const [isMailMenuOpen, setIsMailMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`flex items-center gap-2 font-medium ${
          isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'
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
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 z-10 w-56 mt-2 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-lg shadow-lg top-full transition-all duration-300`}
        >
          <div className="py-2">

            {/* Logs */}
            <button
              className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              } transition-colors duration-300`}
              onClick={() => {
                onToggle();
                navigate('/logs');
              }}
            >
              <ScrollText size={16} className="text-green-600" />
              Logs
            </button>

            {/* Mail Messaging Nested Menu */}
            <div className="relative">
              <button
                className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                  isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                } transition-colors duration-300`}
                onClick={() => setIsMailMenuOpen(!isMailMenuOpen)}
              >
                <Mail size={16} className="text-blue-600" />
                Mail Messaging
                <ChevronRight size={16} className="ml-auto" />
              </button>

              {isMailMenuOpen && (
                <div
                  className={`absolute top-0 z-10 w-56 mt-0 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border rounded-lg shadow-lg left-full transition-all duration-300`}
                >
                  <div className="py-2">
                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/templates');
                      }}
                    >
                      <FileText size={16} className="text-purple-600" />
                      Templates
                    </button>

                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/sendmail');
                      }}
                    >
                      <Send size={16} className="text-indigo-600" />
                      Send Mail
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Database Operations Nested Menu */}
            <div className="relative">
              <button
                className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                  isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
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
                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/clients');
                      }}
                    >
                      <User size={16} className="text-blue-600" />
                      Client Details
                    </button>

                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/family');
                      }}
                    >
                      <Users size={16} className="text-green-600" />
                      Family
                    </button>

                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/clientproducts');
                      }}
                    >
                      <ShoppingBag size={16} className="text-purple-600" />
                      Client Products
                    </button>

                    <button
                      className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-300`}
                      onClick={() => {
                        onToggle();
                        navigate('/products');
                      }}
                    >
                      <Package size={16} className="text-yellow-600" />
                      Products
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className={`flex items-center w-full gap-3 px-4 py-2 text-sm text-left ${
                isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              } transition-colors duration-300`}
              onClick={() => {
                onToggle();
                navigate('/');
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
