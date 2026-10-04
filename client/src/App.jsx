import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GooeyFilter from './components/GooeyFilter';
import ExecutivePDRPage from './pages/ExecutivePDRPage';
import AuthPortalPage from './pages/AuthPortalPage';
import EdgeScannerPage from './pages/EdgeScannerPage';
import MunicipalMapPage from './pages/MunicipalMapPage';
import SpatialTwin3DPage from './pages/SpatialTwin3DPage';
import DispatchRoutingPage from './pages/DispatchRoutingPage';
import WalletGamificationPage from './pages/WalletGamificationPage';
import VerificationPage from './pages/VerificationPage';
import { 
  fetchDashboardData, 
  fetchDispatchRoute, 
  fetchPayoutLedger, 
  triggerLiveSimulation, 
  resolveAnomaly as apiResolveAnomaly,
  logoutUser,
  LiveFeedSubscriber 
} from './services/api';
import { playSound } from './services/audio';
import { initReactiveLighting } from './services/lightingEngine';
import { Bell, Sparkles } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('auth'); // Default to Auth/Registration landing
  const [dashboardData, setDashboardData] = useState(null);
  const [dispatchRoute, setDispatchRoute] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [latestAnomalyId, setLatestAnomalyId] = useState(null);
  const [liveToast, setLiveToast] = useState(null);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('pdr'); // Redirect to Executive PDR Dashboard upon successful login/creation
    playSound('resolve');
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout API:', e);
    }
    setIsAuthenticated(false);
    setActiveTab('auth');
    playSound('scan');
  };

  // Initialize Reactive Lighting Engine & Data
  useEffect(() => {
    initReactiveLighting();

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [dash, route, pay] = await Promise.all([
          fetchDashboardData(),
          fetchDispatchRoute(),
          fetchPayoutLedger()
        ]);
        setDashboardData(dash);
        setDispatchRoute(route);
        setPayouts(pay.ledger || []);
      } catch (err) {
        console.error('Error loading CivicLens data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Subscribe to WebSocket live stream
    const subscriber = new LiveFeedSubscriber((message) => {
      console.log('[Live WS Event Received]:', message);

      if (message.event === 'INIT_STATE' && message.data) {
        setDashboardData(message.data);
      } 
      else if (message.event === 'ANOMALY_DETECTED') {
        const { anomaly, summary, route } = message.data;
        setLatestAnomalyId(anomaly.id);
        
        playSound('anomaly');
        setLiveToast({
          title: '🚨 New Anomaly Detected at Edge',
          message: `${anomaly.title} (${anomaly.wardName}) - ₹1 bounty credited to ${anomaly.reportedBy}`,
          type: 'danger'
        });
        setTimeout(() => setLiveToast(null), 5000);

        if (summary) setDashboardData(summary);
        if (route) setDispatchRoute(route);
        fetchPayoutLedger().then(p => setPayouts(p.ledger || []));
      } 
      else if (message.event === 'ANOMALY_RESOLVED') {
        const { anomaly, summary, route } = message.data;
        playSound('resolve');
        setLiveToast({
          title: '✅ Municipal Resolution Verified',
          message: `${anomaly.id} verified clean. Ward score recalculated!`,
          type: 'success'
        });
        setTimeout(() => setLiveToast(null), 5000);

        if (summary) setDashboardData(summary);
        if (route) setDispatchRoute(route);
      }
    });

    return () => subscriber.disconnect();
  }, []);

  const handleQuickSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await triggerLiveSimulation();
      setLatestAnomalyId(res.anomaly?.id);
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResolveAnomaly = async (id, resolutionDetails) => {
    try {
      const res = await apiResolveAnomaly(id, resolutionDetails);
      const [dash, route] = await Promise.all([
        fetchDashboardData(),
        fetchDispatchRoute()
      ]);
      setDashboardData(dash);
      setDispatchRoute(route);
    } catch (err) {
      console.error('Failed to resolve anomaly:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0D111A] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl depth-z2 flex items-center justify-center text-cyan-400 animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Initializing CivicLens Reactive Engine</h2>
        <p className="text-xs text-slate-400 max-w-sm font-mono">
          Binding Light Source Coordinates, Viscous Fluid Matrix & 3D Spatial Twin...
        </p>
      </div>
    );
  }

  const anomalies = dashboardData?.recentAnomalies || [];
  const hotspots = dashboardData?.hotspots || [];
  const wards = dashboardData?.wards || [];
  const stats = dashboardData?.stats || {};
  const depot = dashboardData?.depot || { latitude: 12.9716, longitude: 77.6200, name: "BBMP Central Sanitation Depot" };

  return (
    <div className="min-h-screen bg-[#0D111A] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* SVG Liquid Meniscus Filter */}
      <GooeyFilter />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveStats={stats}
        onQuickSimulate={handleQuickSimulate}
        isSimulating={isSimulating}
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />

      {/* Floating Live Broadcast Notification Toast */}
      {liveToast && (
        <div className="fixed top-24 right-6 z-[3000] max-w-md depth-z2 p-4 rounded-2xl shadow-2xl flex items-start space-x-3 text-xs animate-bounce">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="font-bold text-white text-sm">{liveToast.title}</div>
            <div className="text-slate-300">{liveToast.message}</div>
          </div>
        </div>
      )}

      {/* Dedicated Multi-Page Main Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* PAGE 1: EXECUTIVE PDR & DEMO OVERVIEW */}
        {activeTab === 'pdr' && (
          <ExecutivePDRPage
            anomalies={anomalies}
            hotspots={hotspots}
            dispatchRoute={dispatchRoute}
            depot={depot}
            wards={wards}
            stats={stats}
            latestAnomalyId={latestAnomalyId}
            onQuickSimulate={handleQuickSimulate}
            onNavigateTab={(tabKey) => setActiveTab(tabKey)}
          />
        )}

        {/* SCREEN 1: CONCENTRIC 3D AUTH & REGISTRATION LANDING */}
        {activeTab === 'auth' && (
          <AuthPortalPage onAuthSuccess={handleAuthSuccess} />
        )}

        {/* SCREEN 2: ACTIVE DRIVER COCKPIT & DASHCAM HUD */}
        {activeTab === 'scanner' && (
          <EdgeScannerPage onAnomalyDetected={handleQuickSimulate} />
        )}

        {/* SCREEN 3: MUNICIPAL COMMAND & GEOSPATIAL HEATMAP */}
        {activeTab === 'map' && (
          <MunicipalMapPage
            anomalies={anomalies}
            hotspots={hotspots}
            dispatchRoute={dispatchRoute}
            depot={depot}
            wards={wards}
            stats={stats}
            latestAnomalyId={latestAnomalyId}
            onResolveAnomaly={handleResolveAnomaly}
            onNavigateTab={(tabKey) => setActiveTab(tabKey)}
          />
        )}

        {/* 3D SPATIAL DIGITAL TWIN (WEBGL) */}
        {activeTab === 'twin3d' && (
          <SpatialTwin3DPage
            hotspots={hotspots}
            dispatchRoute={dispatchRoute}
            depot={depot}
            wards={wards}
            stats={stats}
          />
        )}

        {/* DYNAMIC SANITATION FLEET ROUTING & TSP ENGINE */}
        {activeTab === 'dispatch' && (
          <DispatchRoutingPage
            dispatchRoute={dispatchRoute}
            onDispatchSuccess={() => {}}
          />
        )}

        {/* SCREEN 4: DRIVER EARNINGS, STREAKS & LIQUID RESERVOIR */}
        {activeTab === 'wallet' && (
          <WalletGamificationPage
            payouts={payouts}
            stats={stats}
          />
        )}

        {/* VERIFICATION & RESOLUTION AUDIT */}
        {activeTab === 'verification' && (
          <VerificationPage
            anomalies={anomalies}
            payouts={payouts}
            onResolveAnomaly={handleResolveAnomaly}
          />
        )}

      </main>

      {/* Global Footer */}
      <footer className="bg-[#090C14] border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-bold">CivicLens Physical Depth & Reactive Lighting Architecture</span>
          </div>
          <div className="text-slate-400">
            WCAG 2.1 AA Contrast Mitigated • OLED Thermal Optimization
          </div>
        </div>
      </footer>

    </div>
  );
}
