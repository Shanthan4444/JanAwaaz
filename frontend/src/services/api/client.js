const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  // Auto-detect production Vercel hostname to guarantee connection to Render backend
  if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('vercel.app')) {
      envUrl = 'https://jansetu-2ul5.onrender.com/api';
    } else {
      envUrl = 'http://localhost:5001/api';
    }
  }

  envUrl = envUrl.trim().replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = {
  get: async (endpoint, options = {}) => {
    try {
      let url = `${API_BASE_URL}${endpoint}`;
      if (options && options.params && typeof options.params === 'object') {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, val);
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }
      const headers = getHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`[API GET ERROR] ${endpoint}:`, error);
      throw normalizeError(error);
    }
  },

  post: async (endpoint, data, retries = 1) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      if (retries > 0) {
        console.warn(`[API POST RETRY] Retrying ${endpoint} after network hiccup...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return apiClient.post(endpoint, data, retries - 1);
      }
      console.error(`[API POST ERROR] ${endpoint}:`, error);
      throw normalizeError(error);
    }
  },

  put: async (endpoint, data) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`[API PUT ERROR] ${endpoint}:`, error);
      throw normalizeError(error);
    }
  },

  patch: async (endpoint, data = {}) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`[API PATCH ERROR] ${endpoint}:`, error);
      throw normalizeError(error);
    }
  },

  delete: async (endpoint) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`[API DELETE ERROR] ${endpoint}:`, error);
      throw normalizeError(error);
    }
  }
};

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const token = localStorage.getItem('jansetu_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  let json = {};
  try {
    const text = await response.text();
    if (text) {
      json = JSON.parse(text);
    }
  } catch (parseErr) {
    console.warn('[API RESPONSE PARSE WARN] Non-JSON response received:', parseErr.message);
  }

  if (response.status === 401) {
    localStorage.removeItem('jansetu_token');
    localStorage.removeItem('jansetu_role');
  }

  if (!response.ok || json.success === false) {
    const errorMsg = json?.error?.message || json?.message || `HTTP Request failed with status ${response.status}`;
    const errorCode = json?.error?.code || 'API_ERROR';
    const err = new Error(errorMsg);
    err.code = errorCode;
    err.status = response.status;
    throw err;
  }
  return json.data !== undefined ? json.data : json;
}

function normalizeError(error) {
  if (error.status !== undefined) return error;
  const netErr = new Error('Network error: Unable to reach Jansetu API server. Please check your connection or server status.');
  netErr.code = 'NETWORK_ERROR';
  netErr.status = 0;
  return netErr;
}
