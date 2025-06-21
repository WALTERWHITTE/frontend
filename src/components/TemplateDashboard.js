import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Copy, Bookmark, Sun, Moon } from 'lucide-react';
import DOMPurify from 'dompurify';
import AddTemplateForm from './AddTemplateForm';
import ActionsMenu from './ActionsMenu';
import { fetchTemplates, updateTemplate, deleteTemplateById, createTemplate } from '../data/templates';
import { useDarkMode } from '../context/DarkModeContext';

const TemplateDashboard = () => {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowAddForm(true);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplateById(templateId);
      setTemplates((prev) => prev.filter((t) => t.templateId !== templateId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete template.');
    }
  };

  const handleCopy = (template) => {
    const text = `Template ID: ${template.templateId}\nName: ${template.templateName}\nSubject: ${template.subject}\nContent: ${template.content}`;
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const handleFormSubmit = async (formTemplate) => {
    const payload = {
      templateName: formTemplate.templateName,
      subject: formTemplate.subject,
      content: formTemplate.content,
    };

    try {
      if (editingTemplate) {
        await updateTemplate(formTemplate.templateId, payload);
      } else {
        await createTemplate(payload);
      }
      const updated = await fetchTemplates();
      setTemplates(updated);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save template.');
    } finally {
      setShowAddForm(false);
      setEditingTemplate(null);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.templateName?.toLowerCase().includes(term) ||
      t.subject?.toLowerCase().includes(term) ||
      String(t.templateId || '').includes(term)
    );
  });

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div
        className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-neutral-200' : 'text-gray-900 bg-gray-50'}`}
        onClick={() => setIsActionsOpen(false)}
      >
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

        {/* Add Template Modal */}
        {showAddForm && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <AddTemplateForm
              onCancel={() => {
                setShowAddForm(false);
                setEditingTemplate(null);
              }}
              darkMode={isDarkMode}
              onSubmit={handleFormSubmit}
              editingTemplate={editingTemplate}
            />
          </div>
        )}

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Template Dashboard</h1>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingTemplate(null);
              }}
              className={`flex gap-2 items-center px-4 py-2 mr-16 rounded-lg ${isDarkMode ? 'text-white bg-neutral-800 hover:bg-neutral-700' : 'text-white bg-gray-900 hover:bg-gray-800'}`}
            >
              <Plus size={16} /> Add Template
            </button>
          </div>
        </div>

        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3 items-center">
              <Bookmark className="text-gray-500 dark:text-neutral-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Templates</h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Manage your email templates</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
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
            <ActionsMenu
              isOpen={isActionsOpen}
              onToggle={() => setIsActionsOpen(!isActionsOpen)}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.templateId}
                className={`p-4 border rounded-lg shadow-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-fadeIn ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-300'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{template.templateName}</h3>
                    <p className="text-xs text-gray-300 dark:text-neutral-500">ID: {template.templateId}</p>
                  </div>

                  <div className="flex gap-2">
                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-white" onClick={() => handleCopy(template)} />
                    <Edit className="w-4 h-4 text-blue-500 hover:text-blue-700" onClick={() => handleEdit(template)} />
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" onClick={() => handleDelete(template.templateId)} />
                  </div>
                </div>

                <p className="mb-1 text-sm text-gray-600 dark:text-neutral-400">Subject: {template.subject}</p>
                <div
                  className="max-w-none text-xs text-gray-500 dark:text-neutral-400 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(template.content)
                      .replace(/\$\{(\w+)\}/g, '<span class="px-1 text-white rounded bg-neutral-700">$1</span>')
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplateDashboard;
