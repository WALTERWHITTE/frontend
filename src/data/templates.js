const API_BASE_URL = 'http://localhost:3000';

// GET: Fetch all templates
export const fetchTemplates = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();
  console.log('[fetchTemplates] Status:', response.status);
  console.log('[fetchTemplates] Raw:', raw);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${raw}`);
  }

  if (!raw) return [];
  return JSON.parse(raw);
};

// POST: Create a new template
export const createTemplate = async (templateData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const payload = {
    ...templateData,
    templateId: templateData.templateId || undefined, // Include if defined
  };

  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('[createTemplate] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to create template');
  return result;
};

// PUT: Update existing template (templateId must also be in body)
export const updateTemplate = async (templateId, updatedData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const payload = {
    ...updatedData,
    templateId, // Ensure backend receives it in body
  };

  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('[updateTemplate] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to update template');
  return result;
};

// DELETE: Delete a template
export const deleteTemplateById = async (templateId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  console.log('[deleteTemplateById] Response:', result);

  if (!response.ok) throw new Error(result.message || 'Failed to delete template');
  return result;
};
