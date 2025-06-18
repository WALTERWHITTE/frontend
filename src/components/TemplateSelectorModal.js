import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { fetchTemplates } from '../data/templates';
import { useDarkMode } from '../context/DarkModeContext';

const TemplateSelectorModal = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchTemplates()
        .then(setTemplates)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Base classes based on mode
  const panelClass = `
    w-full max-w-3xl transform overflow-hidden rounded-2xl
    p-6 text-left align-middle shadow-xl transition-all duration-300
    ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}
  `;

  const cardClass = `
    cursor-pointer border rounded-lg p-4 transition-colors duration-200
    ${isDarkMode
      ? 'border-gray-600 hover:bg-gray-700 text-white'
      : 'border-gray-300 hover:bg-blue-100 text-gray-900'}
  `;

  const subTextClass = `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <Transition appear show={!!isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={panelClass}>
                <Dialog.Title className="text-xl font-bold mb-4">
                  Select a Template
                </Dialog.Title>

                {loading ? (
                  <p className="text-center text-gray-500 dark:text-gray-300 transition-colors duration-300">
                    Loading templates...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.templateId}
                        onClick={() => {
                          onSelect(template);
                          onClose();
                        }}
                        className={cardClass}
                      >
                        <h3 className="font-semibold">{template.templateName}</h3>
                        <p className={`text-xs ${subTextClass}`}>{template.subject}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 text-right">
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg border border-gray-300 ${subTextClass}`}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TemplateSelectorModal;
