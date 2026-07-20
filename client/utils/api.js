export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('smartpark_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);

  // If download attachment file, return blob
  if (response.ok && response.headers.get('content-type')?.includes('application/octet-stream')) {
    return await response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  get: (endpoint, headers) => 
    apiRequest(endpoint, { method: 'GET', headers }),
    
  post: (endpoint, body, headers) => 
    apiRequest(endpoint, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined, 
      headers 
    }),
    
  delete: (endpoint, headers) => 
    apiRequest(endpoint, { method: 'DELETE', headers })
};
