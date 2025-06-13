import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Copy, Bookmark } from 'lucide-react';
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
        className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
        onClick={() => setIsActionsOpen(false)}
      >
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 text-sm font-medium border rounded shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Add Template Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
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
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Template Dashboard</h1>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingTemplate(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800"
            >
              <Plus size={16} /> Add Template
            </button>
          </div>
        </div>

        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Bookmark className="text-gray-500 dark:text-gray-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Templates</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your email templates</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 py-2 pl-10 pr-4 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
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
                className={`p-4 border rounded-lg shadow-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-fadeIn ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{template.templateName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {template.templateId}</p>
                  </div>

                  <div className="flex gap-2">
                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-white" onClick={() => handleCopy(template)} />
                    <Edit className="w-4 h-4 text-blue-500 hover:text-blue-700" onClick={() => handleEdit(template)} />
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" onClick={() => handleDelete(template.templateId)} />
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-700 mb-1">Subject: {template.subject}</p>
                <div
                  className="text-xs text-gray-500 dark:text-gray-400 prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(template.content)
                      .replace(/\$\{(\w+)\}/g, '<span class="bg-gray-600 text-white px-1 rounded">$1</span>')
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
