import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Navigation, 
  Truck, 
  Eye, 
  Clock, 
  Building2,
  Maximize2
} from 'lucide-react';

// Custom Map Marker Icons using SVG Data URIs
const createCustomIcon = (type, severity, isNew = false) => {
  let color = '#EF4444'; // red
  if (severity === 'high') color = '#F59E0B'; // orange
  if (severity === 'medium') color = '#EAB308'; // yellow
  if (severity === 'resolved') color = '#10B981'; // green

  let iconLetter = '⚠';
  if (type === 'clogged_drain') iconLetter = '💧';
  else if (type === 'illegal_dump') iconLetter = '🗑';
  else if (type === 'overflowing_bin') iconLetter = '📦';

  const html = `
    <div class="relative flex items-center justify-center">
      ${isNew ? '<div class="absolute -inset-2 rounded-full bg-cyan-400 opacity-75 animate-ping"></div>' : ''}
      <div style="background-color: ${color}; box-shadow: 0 0 12px ${color};" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg transform transition hover:scale-110">
        ${iconLetter}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const depotIcon = L.divIcon({
  html: `
    <div class="w-9 h-9 rounded-xl bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold">
      🏢
    </div>
  `,
  className: 'custom-depot-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20]
});

// Map View Controller to handle smooth flyTo / pan when new anomalies are selected or ingested
function MapAutoPanner({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MunicipalMap({
  anomalies = [],
  hotspots = [],
  dispatchRoute = null,
  depot = { latitude: 12.9716, longitude: 77.6200 },
  onSelectAnomaly,
  onResolveAnomaly,
  latestAnomalyId = null
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [mapCenter, setMapCenter] = useState([12.9550, 77.6350]);

  // Filter anomalies
  const filteredAnomalies = anomalies.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Layer Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5 mr-1 font-mono">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === 'all' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Issues ({anomalies.length})
          </button>

          <button
            onClick={() => setSelectedCategory('clogged_drain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'clogged_drain' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>💧</span> Clogged Drains (Track 04)
          </button>

          <button
            onClick={() => setSelectedCategory('illegal_dump')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'illegal_dump' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>🗑</span> Illegal Dumps (Track 02)
          </button>

          <button
            onClick={() => setSelectedCategory('overflowing_bin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'overflowing_bin' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>📦</span> Overflowing Bins
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5 mr-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Layers:
          </span>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              showHotspots 
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Hotspots ({hotspots.length})
          </button>

          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1 ${
              showRoute 
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Truck Route</span>
          </button>
        </div>

      </div>

      {/* Map Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative h-[600px] w-full">
        
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          {/* Open-Source CartoDB & OpenStreetMap Dark Tiles (No Key Required) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            maxZoom={19}
          />

          <MapAutoPanner center={mapCenter} />

          {/* Municipal Sanitation Depot Marker */}
          {depot && (
            <Marker position={[depot.latitude, depot.longitude]} icon={depotIcon}>
              <Popup>
                <div className="p-1 space-y-1 font-sans">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Sanitation HQ</div>
                  <div className="text-sm font-extrabold text-white">{depot.name}</div>
                  <div className="text-xs text-slate-300">Fleet Dispatch Center & Compactor Terminal</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Hotspot Heatmap Aura Circles */}
          {showHotspots && hotspots.map((h, i) => {
            const color = h.priority === 'critical' ? '#EF4444' : h.priority === 'high' ? '#F59E0B' : '#10B981';
            return (
              <Circle
                key={h.id || i}
                center={h.center}
                radius={h.radiusMeters}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.22,
                  weight: 2,
                  dashArray: '4, 6'
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 font-sans text-xs">
                    <div className="font-bold text-red-400 uppercase tracking-wider">{h.id} • {h.priority} Priority</div>
                    <div className="font-extrabold text-sm text-white">{h.primaryIssue}</div>
                    <div className="text-slate-300">Density: <span className="text-amber-400 font-bold">{h.anomalyCount} anomalies clustered</span></div>
                    <div className="text-cyan-400 font-semibold mt-1">Recommended Unit: {h.recommendedVehicle}</div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Dynamic Sanitation Vehicle Optimized Route Polyline */}
          {showRoute && dispatchRoute && dispatchRoute.polylineCoordinates && dispatchRoute.polylineCoordinates.length > 1 && (
            <Polyline
              positions={dispatchRoute.polylineCoordinates}
              pathOptions={{
                color: '#6366F1',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 8'
              }}
            />
          )}

          {/* Individual Anomaly Pins */}
          {filteredAnomalies.map((item) => {
            const isNew = item.id === latestAnomalyId;
            return (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={createCustomIcon(item.category, item.severity, isNew)}
                eventHandlers={{
                  click: () => {
                    if (onSelectAnomaly) onSelectAnomaly(item);
                  }
                }}
              >
                <Popup>
                  <div className="p-1 max-w-xs space-y-2 font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                        item.severity === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {item.severity} severity
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>

                    {item.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-700">
                        <img src={item.imageUrl} alt="Detection Proof" className="w-full h-24 object-cover" />
                        <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-emerald-400 font-mono">
                          🛡️ DPDP Blurred
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-mono">Vol: {item.volumeEstimate}</span>
                      <button
                        onClick={() => onSelectAnomaly(item)}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition"
                      >
                        Inspect Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Overlay HUD - Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl shadow-xl text-xs space-y-2 font-mono pointer-events-auto">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live GIS Map Legend</div>
          <div className="flex items-center space-x-2 text-slate-200">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500"></span>
            <span>Critical Hotspot (Drains &gt; 80% Choked)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-200">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
            <span>High Severity Waste Accumulation</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-200">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
            <span>Resolved / Verified Clean Zone</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-200">
            <span className="w-3 h-1 bg-indigo-500"></span>
            <span>Optimized Compactor Dispatch Route</span>
          </div>
        </div>

      </div>

    </div>
  );
}
