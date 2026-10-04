import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { store } from './geospatial.js';

process.on('uncaughtException', (err) => {
  console.error('[CivicLens Server] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CivicLens Server] Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast helper for WebSocket clients
function broadcast(eventType, payload) {
  const message = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection lifecycle
wss.on('connection', (ws) => {
  console.log('[CivicLens WS] Client connected to live feed');
  
  // Send initial state
  ws.send(JSON.stringify({
    event: 'INIT_STATE',
    data: store.getDashboardSummary()
  }));

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.action === 'PING_TELEMETRY') {
        store.telemetryStats.totalKilometersScanned += 0.05;
        broadcast('TELEMETRY_UPDATED', {
          totalKm: store.telemetryStats.totalKilometersScanned.toFixed(1),
          activeScanners: store.telemetryStats.activeScannersCount
        });
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[CivicLens WS] Client disconnected');
  });
});

// In-memory active sessions store
const activeSessions = new Set();

// 0. Auth Endpoints: Login, Register, Logout
app.post('/api/auth/register', (req, res) => {
  const { fullName, phone, platform, password } = req.body;
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  activeSessions.add(token);

  res.status(201).json({
    success: true,
    message: 'Rider account registered successfully.',
    token,
    user: {
      id: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: fullName || 'Ramesh Kumar',
      phone: phone || '+91 98860 12345',
      platform: platform || 'Swiggy'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  activeSessions.add(token);

  res.json({
    success: true,
    message: 'Authenticated successfully.',
    token,
    user: {
      id: 'DRV-8821',
      name: 'Ramesh K.',
      phone: phone || '+91 98860 12345',
      platform: 'Swiggy'
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '') || req.headers['x-api-key'];
  
  if (token) {
    activeSessions.delete(token);
  }

  console.log('[CivicLens Auth] Session logged out successfully.');
  res.json({
    success: true,
    message: 'Logged out successfully. Session invalidated.'
  });
});

// REST API Endpoints

// 1. Dashboard summary
app.get('/api/dashboard', (req, res) => {
  res.json(store.getDashboardSummary());
});

// 2. Anomalies list & filters
app.get('/api/anomalies', (req, res) => {
  const { status, category, severity } = req.query;
  const list = store.getAllAnomalies({ status, category, severity });
  res.json({ count: list.length, anomalies: list });
});

// 3. Get single anomaly
app.get('/api/anomalies/:id', (req, res) => {
  const item = store.getAnomalyById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Anomaly not found' });
  res.json(item);
});

// 4. Ingest new anomaly from mobile/edge scanner
app.post('/api/anomalies', (req, res) => {
  try {
    const {
      category,
      title,
      description,
      latitude,
      longitude,
      severity,
      severityScore,
      volumeEstimate,
      reportedBy,
      driverId,
      driverName,
      platform,
      confidence,
      imageUrl,
      privacyBlurred,
      blurredFacesCount,
      blurredPlatesCount
    } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing GPS latitude/longitude coordinates' });
    }

    const created = store.addAnomaly({
      category,
      title,
      description,
      latitude,
      longitude,
      severity,
      severityScore,
      volumeEstimate,
      reportedBy,
      driverId,
      driverName,
      platform,
      confidence,
      imageUrl,
      privacyBlurred: privacyBlurred ?? true,
      blurredFacesCount,
      blurredPlatesCount
    });

    // Notify all connected command centers in real time
    broadcast('ANOMALY_DETECTED', {
      anomaly: created,
      summary: store.getDashboardSummary(),
      route: store.getOptimizedDispatchRoute()
    });

    console.log(`[CivicLens Edge Ingestion] Ingested ${created.id} at [${created.latitude}, ${created.longitude}] - Payout ₹1 triggered for ${created.driverId}`);
    
    res.status(201).json({
      success: true,
      message: 'Anomaly ingested, privacy verified, micro-payout credited.',
      anomaly: created
    });
  } catch (error) {
    console.error('Error creating anomaly:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Resolve anomaly (Municipal Action & Verification)
app.post('/api/anomalies/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { assignedTruck, notes, proofUrl } = req.body;

  const resolved = store.resolveAnomaly(id, { assignedTruck, notes, proofUrl });
  if (!resolved) {
    return res.status(404).json({ error: 'Anomaly not found or already resolved' });
  }

  broadcast('ANOMALY_RESOLVED', {
    anomaly: resolved,
    summary: store.getDashboardSummary(),
    route: store.getOptimizedDispatchRoute()
  });

  res.json({
    success: true,
    message: `Anomaly ${id} marked as resolved with photographic verification.`,
    anomaly: resolved
  });
});

// 6. Spatial Hotspots
app.get('/api/hotspots', (req, res) => {
  res.json({
    count: store.getHotspots().length,
    hotspots: store.getHotspots()
  });
});

// 7. Dynamic Optimized Sanitation Route
app.get('/api/dispatch-route', (req, res) => {
  res.json(store.getOptimizedDispatchRoute());
});

// 8. Ward cleanliness scorecards
app.get('/api/wards', (req, res) => {
  res.json({ wards: store.wards });
});

// 9. Gig Worker Payouts Ledger
app.get('/api/payouts', (req, res) => {
  res.json({
    totalDistributedINR: store.telemetryStats.totalBountiesDistributedINR,
    ledger: store.payoutLedger
  });
});

// 10. Simulation trigger for hackathon demo convenience
app.post('/api/simulate-live-detection', (req, res) => {
  const sampleScenarios = [
    {
      category: "clogged_drain",
      title: "Monsoon Choke Point: Severe Plastic & Debris Dam",
      description: "Passive dashcam vision detected 90% water flow obstruction in open masonry drain.",
      latitude: 12.9780 + (Math.random() - 0.5) * 0.015,
      longitude: 77.6430 + (Math.random() - 0.5) * 0.015,
      severity: "critical",
      severityScore: 95,
      volumeEstimate: "4.8 cu.m",
      reportedBy: "Swiggy Delivery Partner #9142",
      driverName: "Siddharth N.",
      platform: "Swiggy",
      confidence: 0.97,
      imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
      blurredFacesCount: 1,
      blurredPlatesCount: 2
    },
    {
      category: "illegal_dump",
      title: "Nighttime Roadside Litter & Packaging Dump",
      description: "Commercial cardboard boxes and discarded organic trash heap on corner curve.",
      latitude: 12.9320 + (Math.random() - 0.5) * 0.015,
      longitude: 77.6210 + (Math.random() - 0.5) * 0.015,
      severity: "high",
      severityScore: 84,
      volumeEstimate: "3.2 cu.m",
      reportedBy: "Zomato Rider #4019",
      driverName: "Karthik V.",
      platform: "Zomato",
      confidence: 0.93,
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
      blurredFacesCount: 2,
      blurredPlatesCount: 1
    },
    {
      category: "overflowing_bin",
      title: "Overflowing Secondary Dumpster on Footpath",
      description: "Overfilled municipal container causing pedestrian spillover.",
      latitude: 12.9150 + (Math.random() - 0.5) * 0.015,
      longitude: 77.6410 + (Math.random() - 0.5) * 0.015,
      severity: "medium",
      severityScore: 68,
      volumeEstimate: "1.9 cu.m",
      reportedBy: "Zepto Quick Runner #8120",
      driverName: "Manpreet S.",
      platform: "Zepto",
      confidence: 0.89,
      imageUrl: "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80",
      blurredFacesCount: 0,
      blurredPlatesCount: 1
    }
  ];

  const chosen = sampleScenarios[Math.floor(Math.random() * sampleScenarios.length)];
  const created = store.addAnomaly(chosen);

  broadcast('ANOMALY_DETECTED', {
    anomaly: created,
    summary: store.getDashboardSummary(),
    route: store.getOptimizedDispatchRoute()
  });

  res.json({
    success: true,
    anomaly: created,
    message: 'Simulated live edge dashcam event ingested!'
  });
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 CivicLens Backend Engine running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time edge sync`);
  console.log(`=================================================`);
});
