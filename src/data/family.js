const API_BASE_URL = 'http://localhost:3000';

// Utility: Always include Authorization header
const getHeaders = (token, isJSON = true) => ({
  Authorization: `Bearer ${token}`,
  ...(isJSON ? { 'Content-Type': 'application/json' } : {})
});

// Fetch all families
export const fetchFamilies = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/families`, {
    headers: getHeaders(token, false),
  });

  const raw = await response.text();
  console.log('[fetchFamilies] Status:', response.status);
  console.log('[fetchFamilies] Raw:', raw);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${raw}`);
  }

  return raw ? JSON.parse(raw) : [];
};

// Create a new family
export const createFamily = async (token, familyData) => {
  const payload = {
    familyName: familyData.familyName,
    familyAddress: familyData.familyAddress,
    familyHeadId: parseInt(familyData.familyHeadId),
    clientIds: familyData.clientIds.map(id => parseInt(id))
  };

  const res = await fetch(`${API_BASE_URL}/families`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log('[createFamily] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to create family');
  return result;
};

// Update existing family
export const updateFamily = async (token, familyId, updatedData) => {
  console.log('[updateFamily] Updating ID:', familyId, 'Data:', updatedData);

  const payload = {
    familyName: updatedData.familyName,
    familyAddress: updatedData.familyAddress,
    familyHeadId: parseInt(updatedData.familyHeadId),
    clientIds: updatedData.clientIds.map(id => parseInt(id))
  };

  const res = await fetch(`${API_BASE_URL}/families/${familyId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log('[updateFamily] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to update family');
  return result;
};

// Delete a family by ID
export const deleteFamilyById = async (token, familyId) => {
  const res = await fetch(`${API_BASE_URL}/families/${familyId}`, {
    method: 'DELETE',
    headers: getHeaders(token, false),
  });

  const result = await res.json();
  console.log('[deleteFamilyById] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to delete family');
  return result;
};
