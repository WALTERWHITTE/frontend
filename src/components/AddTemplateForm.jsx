// AddTemplateForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';


const defaultTemplate = {
  templateName: '',
  subject: '',
  content: '',
};

const localStorageKey = 'templatePlaceholders';
/* eslint-disable no-template-curly-in-string */
const initialPlaceholders = ['${name}', '${monthYear}', '${products}'];

const AddTemplateForm = ({ onSubmit, onCancel, editingTemplate, darkMode = false }) => {
  const [template, setTemplate] = useState(editingTemplate || defaultTemplate);
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customPlaceholder, setCustomPlaceholder] = useState('');
  const [placeholderOptions, setPlaceholderOptions] = useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : initialPlaceholders;
  });
  const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [placeholdersToRemove, setPlaceholdersToRemove] = useState([]);

  const quillRef = useRef(null);

  const previewRef = useRef(null);

  
  useEffect(() => {
  if (!isPreview || !previewRef.current) return;

  const links = previewRef.current.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      window.open(href, '_blank');
    });
  });

  // Clean up listeners when unmounting or updating
  return () => {
    links.forEach(link => {
      link.replaceWith(link.cloneNode(true)); // simple way to remove old listeners
    });
  };
}, [template.content, isPreview]);


  useEffect(() => {
    setTemplate(editingTemplate || defaultTemplate);
  }, [editingTemplate]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(placeholderOptions));
  }, [placeholderOptions]);

  const handleChange = (field, value) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  };

  const insertPlaceholder = (placeholder) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      const text = placeholder;
      if (range) {
        editor.insertText(range.index, text);
        editor.setSelection(range.index + text.length);
      } else {
        const length = editor.getLength();
        editor.insertText(length, text);
        editor.setSelection(length + text.length);
      }
    }
  };

  const handleAddCustomPlaceholder = () => {
    let ph = customPlaceholder.trim();
    if (!ph) return;

    if (!ph.startsWith('${') || !ph.endsWith('}')) {
      ph = '${' + ph.replace(/[{}$]/g, '') + '}';
    }

    if (!placeholderOptions.includes(ph)) {
      setPlaceholderOptions((prev) => [...prev, ph]);
    }

    insertPlaceholder(ph);
    setCustomPlaceholder('');
  };

  const togglePlaceholderToRemove = (ph) => {
    setPlaceholdersToRemove((prev) =>
      prev.includes(ph) ? prev.filter((p) => p !== ph) : [...prev, ph]
    );
  };

  const confirmRemovePlaceholders = () => {
    if (placeholdersToRemove.length === 0) return;
    setPlaceholderOptions((prev) => prev.filter((ph) => !placeholdersToRemove.includes(ph)));
    setPlaceholdersToRemove([]);
    setShowRemoveModal(false);
    setSelectedPlaceholder('');
  };

  const validateTemplate = () => {
    if (!template.templateName || !template.subject || !template.content) {
      alert('Please fill all fields.');
      return false;
    }
    if (!template.content.includes('${name}')) {
      alert('Template must include the placeholder ${name}.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateTemplate()) {
      const submission = { ...template };
      if (editingTemplate?.templateId) {
        submission.templateId = editingTemplate.templateId;
      }
      onSubmit(submission);
    }
  };

  // HTML sanitization, link fixing, and placeholder styling
  const generatePreviewHTML = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  doc.body.innerHTML = doc.body.innerHTML.replace(
    /\$\{(\w+)\}/g,
    '<span class="bg-green-500 text-white px-1 rounded">$1</span>'
  );

  const anchors = doc.querySelectorAll('a');
  anchors.forEach(a => {
    let href = a.getAttribute('href');
    if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
      href = `https://${href}`;
      a.setAttribute('href', href);
    }
    
    // Instead of target blank, intercept click event
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(href, '_blank');
    });

    // Styling stays
    a.setAttribute('style', 'color:#2563eb;text-decoration:underline;cursor:pointer;');
  });

  return DOMPurify.sanitize(doc.body.innerHTML);
};


  return (
  <div
    className={`p-4 rounded-lg shadow-md border transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    } ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
  >
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">{editingTemplate ? 'Edit Template' : 'Add New Template'}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setIsFullscreen(f => !f)}
          className={`px-3 py-1 text-sm rounded ${
            darkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-200 hover:bg-blue-300'
          }`}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button
          onClick={() => setIsPreview(p => !p)}
          className={`px-3 py-1 text-sm rounded ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isPreview ? 'Hide Preview' : 'Preview'}
        </button>
      </div>
    </div>

    <div className={`${isPreview ? 'grid grid-cols-2 gap-4 max-w-screen-xl mx-auto' : 'block max-w-screen-md mx-auto'}`}>
      <div>
        <input
          type="text"
          placeholder="Template Name"
          value={template.templateName}
          onChange={(e) => handleChange('templateName', e.target.value)}
          className={`w-full p-2 mb-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'text-gray-800'}`}
        />
        <input
          type="text"
          placeholder="Subject"
          value={template.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className={`w-full p-2 mb-2 border rounded font-semibold text-xl ${
            darkMode ? 'bg-gray-800 text-white border-gray-600' : 'text-gray-900'
          }`}
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <label className="text-sm">Insert Placeholder:</label>
          <select
            value={selectedPlaceholder}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedPlaceholder(val);
              if (val) {
                insertPlaceholder(val);
                setSelectedPlaceholder('');
              }
            }}
            className={`p-1 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'text-gray-800'}`}
          >
            <option value="">Select</option>
            {placeholderOptions.map((ph) => (
              <option key={ph} value={ph}>{ph}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowRemoveModal(true)}
            className={`px-2 py-1 text-sm rounded ${
              placeholderOptions.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : darkMode
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            disabled={placeholderOptions.length === 0}
            title={placeholderOptions.length === 0 ? 'No placeholders to remove' : 'Remove placeholders'}
          >
            Remove
          </button>

          <input
            type="text"
            placeholder="Custom Placeholder"
            className={`p-1 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'text-gray-800'}`}
            value={customPlaceholder}
            onChange={(e) => setCustomPlaceholder(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomPlaceholder();
              }
            }}
          />

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>

        <ReactQuill
          ref={quillRef}
          value={template.content}
          onChange={(value) => handleChange('content', value)}
          theme="snow"
          className="custom-quill"
        />
        <style>{`.custom-quill .ql-editor { color: ${darkMode ? 'white' : '#1f2937'}; }`}</style>
      </div>

      {isPreview && (
        <div className="border-l pl-8">
          <h3 className={`font-semibold mb-4 text-2xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            📧 Email Preview
          </h3>
          <div
            className={`p-4 rounded shadow border max-h-[600px] overflow-auto ${
              darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'
            }`}
          >
            <p className="font-bold text-xl mb-6">
              Subject: {template.subject}
            </p>

            <div
            ref={previewRef}
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: generatePreviewHTML(template.content)
              }}
            />
          </div>
        </div>
      )}
    </div>

    {showRemoveModal && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60"
        onClick={() => setShowRemoveModal(false)}
      >
        <div className={`bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full`} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Remove Placeholders</h3>
          <div className="max-h-60 overflow-auto mb-4">
            {placeholderOptions.length === 0 && (
              <p className="text-gray-600 dark:text-gray-300">No placeholders available.</p>
            )}
            {placeholderOptions.map((ph) => (
              <label key={ph} className="flex items-center gap-2 mb-2 cursor-pointer text-black dark:text-white">
                <input
                  type="checkbox"
                  checked={placeholdersToRemove.includes(ph)}
                  onChange={() => togglePlaceholderToRemove(ph)}
                />
                {ph}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemovePlaceholders}
              disabled={placeholdersToRemove.length === 0}
              className={`px-4 py-2 rounded ${
                placeholdersToRemove.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Remove Selected
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default AddTemplateForm;
