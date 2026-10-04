// API & WebSocket Service for CivicLens

const API_BASE = 'http://localhost:5000/api';
const WS_BASE = 'ws://localhost:5000';

const API_KEY = import.meta.env.VITE_CIVICLENS_API_KEY || '';

const getHeaders = (extraHeaders = {}) => ({
  'Content-Type': 'application/json',
  ...(API_KEY ? { 'x-api-key': API_KEY, 'Authorization': `Bearer ${API_KEY}` } : {}),
  ...extraHeaders
});

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Authentication failed');
  return res.json();
};

export const registerUser = async (registrationData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(registrationData)
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

export const logoutUser = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  } catch (err) {
    console.warn('Logout API error:', err);
    return { success: true };
  }
};

export const fetchDashboardData = async () => {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
};

export const fetchAnomalies = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/anomalies?${params.toString()}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
};

export const fetchHotspots = async () => {
  const res = await fetch(`${API_BASE}/hotspots`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  return res.json();
};

export const fetchDispatchRoute = async () => {
  const res = await fetch(`${API_BASE}/dispatch-route`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dispatch route');
  return res.json();
};

export const fetchPayoutLedger = async () => {
  const res = await fetch(`${API_BASE}/payouts`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch payouts');
  return res.json();
};

export const submitAnomaly = async (anomalyData) => {
  const res = await fetch(`${API_BASE}/anomalies`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(anomalyData)
  });
  if (!res.ok) throw new Error('Failed to post anomaly');
  return res.json();
};

export const resolveAnomaly = async (id, resolutionDetails = {}) => {
  const res = await fetch(`${API_BASE}/anomalies/${id}/resolve`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(resolutionDetails)
  });
  if (!res.ok) throw new Error('Failed to resolve anomaly');
  return res.json();
};

export const triggerLiveSimulation = async () => {
  const res = await fetch(`${API_BASE}/simulate-live-detection`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to trigger simulation');
  return res.json();
};

// WebSocket Manager
export class LiveFeedSubscriber {
  constructor(onMessageCallback) {
    this.onMessage = onMessageCallback;
    this.ws = null;
    this.reconnectTimer = null;
    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(WS_BASE);
      
      this.ws.onopen = () => {
        console.log('[CivicLens WS] Connected to live municipal stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (this.onMessage) {
            this.onMessage(payload);
          }
        } catch (err) {
          console.error('[CivicLens WS] Message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[CivicLens WS] Stream disconnected, retrying in 3s...');
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('[CivicLens WS] Connection error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.error('[CivicLens WS] Init error:', e);
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }
}
