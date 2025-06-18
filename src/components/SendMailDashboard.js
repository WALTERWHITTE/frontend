import React, { useState, useEffect } from 'react';
import { Eye, Send, Mail } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import TemplateSelectorModal from './TemplateSelectorModal';
import { fetchProducts } from '../data/products';
import FilterModal from './FilterModal';
import ActionsMenu from './ActionsMenu';


const API_BASE_URL = 'http://localhost:3000';

const SendMailDashboard = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filters, setFilters] = useState('All clients');
  const [secondOption, setSecondOption] = useState('');
  const [productId, setProductId] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState([]);
  const [ageComparator, setAgeComparator] = useState('>');
  const [ageValue, setAgeValue] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [productList, setProductList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // === SSE Handler ===
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/stream-mail-status`);

    eventSource.onmessage = (event) => {
      const log = JSON.parse(event.data);
      console.log('📥 SSE log:', log);
      setSendStatus((prev) => [...prev, log]);
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProductList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading products:', error);
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const downloadCSV = () => {
  if (!sendStatus || sendStatus.length === 0) return;

  const headers = ['Name', 'Email', 'Status', 'Reason'];
  const rows = sendStatus.map(client => [
    client.name,
    client.email,
    client.status,
    client.reason || ''
  ]);

  const csvContent =
    [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'mail_log.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  const getFilterPayload = () => {
    const payload = { templateId: selectedTemplate?.templateId };
    if (filters === 'Clients who celebrate birthday') {
      payload.filterName = filters;
      return payload;
    }
    if (secondOption === 'product' && productId) {
      payload.filterName = `${filters} with product`;
      payload.productId = Number(productId);
    } else if (secondOption === 'age' && ageValue) {
      payload.filterName = `${filters} by age`;
      payload.ageComparator = ageComparator;
      payload.ageValue = ageValue;
    } else {
      payload.filterName = filters;
    }
    return payload;
  };

  const isFilterValid = () => {
    if (secondOption === 'product' && !productId) return false;
    if (secondOption === 'age' && !ageValue) return false;
    return true;
  };

  // === Trigger the backend send process (SSE will handle logs) ===
  const handleSendEmails = async () => {
    const payload = getFilterPayload();
    setSendStatus([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/sendEmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start email sending');
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to initiate email sending.');
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen px-6 py-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="flex justify-between items-center border-b pb-4 px-4 mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Send Mail Dashboard
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`border px-4 py-2 rounded-full flex items-center gap-2 text-sm shadow ${
              isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <div className="flex items-center gap-3 py-4 ">
              <Mail className="text-gray-500 dark:text-gray-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Send Mail</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send bulk mails</p>
              </div>
            </div>

         <div className="flex items-center justify-between mb-6">
  <ActionsMenu
    isOpen={isActionsOpen}
    onToggle={() => setIsActionsOpen(!isActionsOpen)}
    isDarkMode={isDarkMode}
  />
</div>


{!selectedTemplate ? (
  <TemplateSelectorModal isOpen={true} onClose={() => {}} onSelect={setSelectedTemplate} />
) : (
  <div className="space-y-6">
    <div
      onClick={() => setShowTemplateSelector(true)}
      className={`relative rounded-lg p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
          : 'bg-white border-gray-200 text-black hover:bg-gray-100'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold">📩 Selected Template</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTemplate(null);
          }}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          ❌ Clear
        </button>
      </div>
      <p className="text-blue-400 font-medium">{selectedTemplate?.templateName || 'Unnamed Template'}</p>
      <p className="text-sm text-gray-400 mt-1">(Click to change)</p>
    </div>

            <div className={`rounded-lg p-4 border shadow-sm space-y-4 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}>
              <h2 className="text-lg font-semibold">🎯 Filter Clients</h2>
              <select value={filters} onChange={(e) => {
                setFilters(e.target.value);
                if (e.target.value === 'Clients who celebrate birthday') {
                  setSecondOption(''); setAgeValue(''); setProductId(''); setAgeComparator('>');
                }
              }} className={`w-full border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                <option>All clients</option>
                <option>Family heads</option>
                <option>Male clients</option>
                <option>Female clients</option>
                <option>Clients who celebrate birthday</option>
              </select>

              <select value={secondOption} onChange={(e) => setSecondOption(e.target.value)} disabled={filters === 'Clients who celebrate birthday'} className={`w-full border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                <option value="">None</option>
                <option value="product">With Product</option>
                <option value="age">By Age</option>
              </select>

              {filters === 'Clients who celebrate birthday' && (
                <p className="text-sm text-blue-500">
                  Additional filters are disabled when "Clients who celebrate birthday" is selected.
                </p>
              )}

              {secondOption === 'product' && (
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className={`w-full border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                  <option value="">Select Product</option>
                  {productList.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
                </select>
              )}

              {secondOption === 'age' && (
                <div className="flex gap-2">
                  <select value={ageComparator} onChange={(e) => setAgeComparator(e.target.value)} className={`border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="=">=</option>
                  </select>
                  <input type="number" value={ageValue} onChange={(e) => setAgeValue(e.target.value)} className={`flex-1 border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`} placeholder="Age" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button onClick={() => setShowPreviewModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Clients
                </button>
                <button onClick={handleSendEmails} disabled={!isFilterValid()} className={`px-4 py-2 rounded shadow flex items-center gap-2 ${isFilterValid() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-100 cursor-not-allowed'}`}>
                  <Send className="w-4 h-4" />
                  Send Emails
                </button>
              </div>

              {sendStatus.length > 0 && (
                <div className="mt-4 p-4 bg-black text-green-300 font-mono rounded shadow-inner max-h-64 overflow-y-auto text-sm">
                  <h3 className="text-white font-semibold mb-2">📋 Mail Sending Log</h3>
                  {sendStatus.map((client, idx) => (
                    <div key={idx}>
                      {client.status === 'sending' ? (
                        <p>📤 Sending to {client.name} ({client.email})...</p>
                      ) : client.status === 'sent' ? (
                        <p>✅ Sent to {client.name} ({client.email})</p>
                      ) : (
                        <p>❌ Failed to send to {client.name} ({client.email}) — {client.reason}</p>
                      )}
                    </div>
                  ))}
                  <hr className="my-2 border-gray-600" />
<div className="text-gray-400">
  <p>📦 Total: {sendStatus.filter(c => c.status === 'sent' || c.status === 'failed').length}</p>
  <p>✅ Sent: {sendStatus.filter(c => c.status === 'sent').length}</p>
  <p>❌ Failed: {sendStatus.filter(c => c.status === 'failed').length}</p>
</div>

                </div>
              )}
              {sendStatus.length > 0 && (
  <button
    onClick={downloadCSV}
    className="mt-2 mb-4 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
  >
    📥 Download CSV Log
  </button>
)}
            </div>
          </div>
        )}

        {showTemplateSelector && (
        <TemplateSelectorModal
          isOpen={true}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={(template) => {
            setSelectedTemplate(template);
            setShowTemplateSelector(false);
          }}
        />
      )}

        <FilterModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} filterPayload={getFilterPayload()} />
      </div>
    </div>
  );
};

export default SendMailDashboard;
