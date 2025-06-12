// src/data/logs.js

const API_URL = 'http://localhost:3000/api/activity-log';

export const fetchLogs = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Missing token');

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch logs');
    }

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected log format');

    const formattedLogs = data.map(log => ({
      logId: `${log.logId}`,  // 👈 Fixed: Avoids double prefix
      userId: `${log.userId?.toString().padStart(3, '0') || '000'}`,
      timestamp: new Date(log.timestamp).toLocaleString(),
      action: log.action,
      description: log.description,
      username: log.username,
      status: inferStatus(log.action, log.description),
    }));

    return formattedLogs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

const inferStatus = (action, description) => {
  const failedKeywords = ['fail', 'insufficient', 'error', 'denied', 'unauthorized'];
  const isFailure = failedKeywords.some(keyword =>
    (description || '').toLowerCase().includes(keyword)
  );
  return isFailure ? 'Failed' : 'Success';
};
