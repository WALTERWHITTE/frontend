import React, { useState, useEffect } from 'react';
import { Eye, Send, Mail, Sun, Moon } from 'lucide-react';
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
  const [productIds, setProductIds] = useState([]);
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

// Get latest status per unique email:
const latestStatuses = sendStatus.reduce((acc, curr) => {
  acc[curr.email] = curr.status;
  return acc;
}, {});

const allDone = Object.values(latestStatuses).every(status => status !== 'sending');


  const getFilterPayload = () => {
    const payload = { templateId: selectedTemplate?.templateId };
    if (filters === 'Clients who celebrate birthday') {
      payload.filterName = filters;
      return payload;
    }
   if (secondOption === 'product' && productIds.length > 0) {
  payload.filterName = `${filters} with product`;
  payload.productIds = productIds.map(Number);

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
    if (secondOption === 'product' && productIds.length === 0) return false;

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
      <div className={`min-h-screen px-6 py-4 ${isDarkMode ? 'bg-black text-neutral-200' : 'text-black bg-gray-50'}`}>
        <div className="flex justify-between items-center px-4 pb-4 mb-6 border-b">
          <h1 className="flex gap-2 items-center text-2xl font-semibold">
            Send Mail Dashboard
          </h1>
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

        <div className="flex gap-3 items-center py-4">
              <Mail className="text-gray-500 dark:text-neutral-400" size={20} />
              <div>
                <h2 className="text-xl font-semibold">Send Mail</h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Send bulk mails</p>
              </div>
            </div>

         <div className="flex justify-between items-center mb-6">
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
          ? 'text-white bg-gray-800 border-gray-700 hover:bg-gray-700'
          : 'text-black bg-white border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold">📩 Selected Template</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTemplate(null);
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          ❌ Clear
        </button>
      </div>
      <p className="font-medium text-blue-400">{selectedTemplate?.templateName || 'Unnamed Template'}</p>
      <p className="mt-1 text-sm text-gray-400">(Click to change)</p>
    </div>

            <div className={`rounded-lg p-4 border shadow-sm space-y-4 ${isDarkMode ? 'text-white bg-gray-800 border-gray-700' : 'text-black bg-white border-gray-200'}`}>
              <h2 className="text-lg font-semibold">🎯 Filter Clients</h2>
              <select value={filters} onChange={(e) => {
                setFilters(e.target.value);
                if (e.target.value === 'Clients who celebrate birthday') {
                  setSecondOption(''); setAgeValue(''); setProductIds(''); setAgeComparator('>');
                }
              }} className={`w-full border p-2 rounded ${isDarkMode ? 'text-white bg-gray-700 border-gray-600' : 'text-black bg-white border-gray-300'}`}>
                <option>All clients</option>
                <option>Family heads</option>
                <option>Male clients</option>
                <option>Female clients</option>
                <option>Clients who celebrate birthday</option>
              </select>

              <select value={secondOption} onChange={(e) => setSecondOption(e.target.value)} disabled={filters === 'Clients who celebrate birthday'} className={`w-full border p-2 rounded ${isDarkMode ? 'text-white bg-gray-700 border-gray-600' : 'text-black bg-white border-gray-300'}`}>
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
  <div className="grid grid-cols-2 gap-2">
    {productList.map((p) => (
      <label key={p.productId} className="flex gap-2 items-center text-sm">
        <input
          type="checkbox"
          checked={productIds.includes(p.productId)}
          onChange={(e) => {
            if (e.target.checked) {
              setProductIds((prev) => [...prev, p.productId]);
            } else {
              setProductIds((prev) => prev.filter((id) => id !== p.productId));
            }
          }}
        />
        {p.productName}
      </label>
    ))}
  </div>
)}


              {secondOption === 'age' && (
                <div className="flex gap-2">
                  <select value={ageComparator} onChange={(e) => setAgeComparator(e.target.value)} className={`border p-2 rounded ${isDarkMode ? 'text-white bg-gray-700 border-gray-600' : 'text-black bg-white border-gray-300'}`}>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="=">=</option>
                  </select>
                  <input type="number" value={ageValue} onChange={(e) => setAgeValue(e.target.value)} className={`flex-1 border p-2 rounded ${isDarkMode ? 'text-white bg-gray-700 border-gray-600' : 'text-black bg-white border-gray-300'}`} placeholder="Age" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button onClick={() => setShowPreviewModal(true)} className="flex gap-2 items-center px-4 py-2 text-white bg-purple-600 rounded shadow hover:bg-purple-700">
                  <Eye className="w-4 h-4" />
                  Preview Clients
                </button>
                <button
  onClick={() => {
    if (window.confirm('Are you sure you want to send mail to filtered clients?')) {
      handleSendEmails();
    }
  }}
  disabled={!isFilterValid()}
  className={`px-4 py-2 rounded shadow flex items-center gap-2 ${
    isFilterValid()
      ? 'text-white bg-blue-600 hover:bg-blue-700'
      : 'text-gray-100 bg-gray-400 cursor-not-allowed'
  }`}
>
  <Send className="w-4 h-4" />
  Send Emails
</button>
              </div>

              {sendStatus.length > 0 && (
                <div className="overflow-y-auto p-4 mt-4 max-h-64 font-mono text-sm text-green-300 bg-black rounded shadow-inner">
                  <h3 className="mb-2 font-semibold text-white">📋 Mail Sending Log</h3>
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

 {/* Mail sending complete message */}
    {allDone && (
  <div className="mt-4 font-semibold text-blue-400">
    📨 Mail sending has ended.
  </div>
)}
                </div>
              )}
              {sendStatus.length > 0 && (
  <button
    onClick={downloadCSV}
    className="px-3 py-1 mt-2 mb-4 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
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
