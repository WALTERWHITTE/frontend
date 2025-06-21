import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';


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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const onEmojiClick = (emojiObject) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertText(range.index, emojiObject.emoji);
      editor.setSelection(range.index + emojiObject.emoji.length);
      setShowEmojiPicker(false);
    }
  };

  // HTML sanitization, link fixing, and placeholder styling
  const generatePreviewHTML = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  doc.body.innerHTML = doc.body.innerHTML.replace(
    /\$\{(\w+)\}/g,
    '<span class="px-1 text-white bg-green-500 rounded">$1</span>'
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
    } ${darkMode ? 'text-white bg-gray-900 border-gray-700' : 'text-gray-800 bg-white border-gray-300'}`}
  >
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">{editingTemplate ? 'Edit Template' : 'Add New Template'}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setIsFullscreen(f => !f)}
          className={`px-3 py-1 text-sm rounded ${
            darkMode ? 'text-white bg-blue-800 hover:bg-blue-700' : 'bg-blue-200 hover:bg-blue-300'
          }`}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button
          onClick={() => setIsPreview(p => !p)}
          className={`px-3 py-1 text-sm rounded ${
            darkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isPreview ? 'Hide Preview' : 'Preview'}
        </button>
      </div>
    </div>

    <div className={`${isPreview ? 'grid grid-cols-2 gap-4 mx-auto max-w-screen-xl' : 'block mx-auto max-w-screen-md'}`}>
      <div>
        <input
          type="text"
          placeholder="Template Name"
          value={template.templateName}
          onChange={(e) => handleChange('templateName', e.target.value)}
          className={`w-full p-2 mb-2 border rounded ${darkMode ? 'text-white bg-gray-800 border-gray-600' : 'text-gray-800'}`}
        />
        <input
          type="text"
          placeholder="Subject"
          value={template.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className={`w-full p-2 mb-2 border rounded font-semibold text-xl ${
            darkMode ? 'text-white bg-gray-800 border-gray-600' : 'text-gray-900'
          }`}
        />

        <div className="flex flex-wrap gap-2 items-center mb-4">
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
            className={`p-1 border rounded ${darkMode ? 'text-white bg-gray-800 border-gray-600' : 'text-gray-800'}`}
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
            value={customPlaceholder}
            onChange={(e) => setCustomPlaceholder(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomPlaceholder();
              }
            }}
            className={`p-1 border rounded ${darkMode ? 'text-white bg-gray-800 border-gray-600' : 'text-gray-800'}`}
          />

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="relative">
          <CustomToolbar onEmojiClick={() => setShowEmojiPicker(p => !p)} />
          {showEmojiPicker && (
            <div className="absolute z-10" style={{top: '40px'}}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <ReactQuill
            ref={quillRef}
            value={template.content}
            onChange={(value) => handleChange('content', value)}
            theme="snow"
            modules={{
              toolbar: {
                container: '#toolbar',
              },
            }}
            className="custom-quill"
          />
        </div>
        <style>{`.custom-quill .ql-editor { color: ${darkMode ? 'white' : '#1f2937'}; }`}</style>
      </div>

      {isPreview && (
        <div className="pl-8 border-l">
          <h3 className={`font-semibold mb-4 text-2xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            📧 Email Preview
          </h3>
          <div
            className={`p-4 rounded shadow border max-h-[600px] overflow-auto ${
              darkMode ? 'text-white bg-gray-800 border-gray-700' : 'text-gray-900 bg-gray-50 border-gray-300'
            }`}
          >
            <p className="mb-6 text-xl font-bold">
              Subject: {template.subject}
            </p>

            <div
            ref={previewRef}
              className="max-w-none prose dark:prose-invert"
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
        className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-50 z-60"
        onClick={() => setShowRemoveModal(false)}
      >
        <div className={`p-6 w-full max-w-md bg-white rounded-lg dark:bg-gray-900`} onClick={(e) => e.stopPropagation()}>
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Remove Placeholders</h3>
          <div className="overflow-auto mb-4 max-h-60">
            {placeholderOptions.length === 0 && (
              <p className="text-gray-600 dark:text-gray-300">No placeholders available.</p>
            )}
            {placeholderOptions.map((ph) => (
              <label key={ph} className="flex gap-2 items-center mb-2 text-black cursor-pointer dark:text-white">
                <input
                  type="checkbox"
                  checked={placeholdersToRemove.includes(ph)}
                  onChange={() => togglePlaceholderToRemove(ph)}
                />
                {ph}
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 text-black bg-gray-300 rounded dark:bg-gray-700 dark:text-white hover:bg-gray-400"
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

const CustomToolbar = ({ onEmojiClick }) => (
  <div id="toolbar">
    <select className="ql-header" defaultValue="">
      <option value="1">Heading</option>
      <option value="2">Subheading</option>
      <option value="">Normal</option>
    </select>
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>
    <button className="ql-underline"></button>
    <button className="ql-link"></button>
    <button className="ql-list" value="ordered"></button>
    <button className="ql-list" value="bullet"></button>
    <button className="ql-clean"></button>
    <button type="button" onClick={onEmojiClick}>
      <Smile size={18} />
    </button>
  </div>
);

export default AddTemplateForm;
