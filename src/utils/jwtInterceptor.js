const API_BASE_URL = 'http://localhost:3000';

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  // If token is expired or unauthorized
  if (response.status === 401 || response.status === 403) {
    console.warn('JWT expired or invalid. Redirecting to login...');
    localStorage.removeItem('token');
    window.location.href = `${API_BASE_URL}/login`;
    return new Promise(() => {}); // never resolves — halts execution
  }

  return response;
};
