const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
};

export const fetchMessages = async () => {
  const response = await fetch(`${API_URL}/api/messages?limit=150`);
  const data = await parseResponse(response);
  return data.messages || [];
};

export const postMessage = async ({ username, text, clientId }) => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, text, clientId })
  });
  const data = await parseResponse(response);
  return data.message;
};

export const markMessageRead = async (messageId, username) => {
  const response = await fetch(`${API_URL}/api/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  });
  const data = await parseResponse(response);
  return data.message;
};
