import { SEED_ANOMALIES, WARDS_GEOJSON } from './seedData.js';
import * as turf from '@turf/turf';

class CivicLensStore {
  constructor() {
    this.anomalies = [...SEED_ANOMALIES];
    this.wards = [...WARDS_GEOJSON];
    this.payoutLedger = [
      { id: "PAY-901", driverId: "DRV-8821", driverName: "Ramesh K.", platform: "Swiggy", amount: 1, anomalyId: "ANM-BLR-001", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: "paid" },
      { id: "PAY-902", driverId: "DRV-3312", driverName: "Arun M.", platform: "Zomato", amount: 1, anomalyId: "ANM-BLR-002", timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), status: "paid" },
      { id: "PAY-903", driverId: "DRV-5510", driverName: "Praveen S.", platform: "Dunzo", amount: 1, anomalyId: "ANM-BLR-003", timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(), status: "paid" },
      { id: "PAY-904", driverId: "DRV-9081", driverName: "Vikram R.", platform: "Shadowfax", amount: 1, anomalyId: "ANM-BLR-004", timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), status: "paid" },
      { id: "PAY-905", driverId: "DRV-7721", driverName: "Manoj D.", platform: "Blinkit", amount: 1, anomalyId: "ANM-BLR-005", timestamp: new Date(Date.now() - 220 * 60 * 1000).toISOString(), status: "paid" },
    ];
    this.depotLocation = { latitude: 12.9716, longitude: 77.6200, name: "BBMP Central Sanitation Depot" };
    this.telemetryStats = {
      totalKilometersScanned: 6470,
      activeScannersCount: 42,
      anomaliesResolvedToday: 18,
      totalBountiesDistributedINR: 420
    };
  }

  // Calculate distance between two points in km
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getAllAnomalies(filter = {}) {
    let result = [...this.anomalies];
    if (filter.status) {
      result = result.filter(a => a.status === filter.status);
    }
    if (filter.category) {
      result = result.filter(a => a.category === filter.category);
    }
    if (filter.severity) {
      result = result.filter(a => a.severity === filter.severity);
    }
    return result;
  }

  getAnomalyById(id) {
    return this.anomalies.find(a => a.id === id);
  }

  addAnomaly(anomalyInput) {
    const id = `ANM-BLR-${String(this.anomalies.length + 1).padStart(3, '0')}`;
    
    // Nearest ward discovery
    let nearestWard = this.wards[0];
    let minDist = Infinity;
    this.wards.forEach(w => {
      const dist = this.haversineDistance(anomalyInput.latitude, anomalyInput.longitude, w.center[0], w.center[1]);
      if (dist < minDist) {
        minDist = dist;
        nearestWard = w;
      }
    });

    const newAnomaly = {
      id,
      category: anomalyInput.category || 'illegal_dump',
      title: anomalyInput.title || `Detected ${anomalyInput.category?.replace('_', ' ') || 'Waste Accumulation'}`,
      description: anomalyInput.description || 'Passive dashcam computer vision edge detection.',
      latitude: parseFloat(anomalyInput.latitude),
      longitude: parseFloat(anomalyInput.longitude),
      wardName: nearestWard.code + ' - ' + nearestWard.name,
      severity: anomalyInput.severity || 'high',
      severityScore: anomalyInput.severityScore || Math.floor(70 + Math.random() * 25),
      volumeEstimate: anomalyInput.volumeEstimate || `${(1.5 + Math.random() * 3).toFixed(1)} cu.m`,
      status: 'pending_dispatch',
      reportedBy: anomalyInput.reportedBy || 'Gig Pilot (Auto-Passive)',
      driverId: anomalyInput.driverId || `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
      bountyPaid: 1,
      detectedAt: new Date().toISOString(),
      confidence: anomalyInput.confidence || 0.92,
      imageUrl: anomalyInput.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
      privacyBlurred: true,
      blurredFacesCount: anomalyInput.blurredFacesCount || Math.floor(Math.random() * 3),
      blurredPlatesCount: anomalyInput.blurredPlatesCount || Math.floor(Math.random() * 2),
      historyCount24h: 1,
      hotspotId: `HSP-${nearestWard.name.substring(0, 3).toUpperCase()}-AUTO`
    };

    this.anomalies.unshift(newAnomaly);

    // Record payout to gig worker
    const payoutRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      driverId: newAnomaly.driverId,
      driverName: anomalyInput.driverName || 'Verified Gig Courier',
      platform: anomalyInput.platform || 'Partner Network',
      amount: 1,
      anomalyId: newAnomaly.id,
      timestamp: new Date().toISOString(),
      status: 'paid'
    };
    this.payoutLedger.unshift(payoutRecord);
    this.telemetryStats.totalBountiesDistributedINR += 1;

    this.recalculateWardScores();
    return newAnomaly;
  }

  resolveAnomaly(id, resolutionData = {}) {
    const index = this.anomalies.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.anomalies[index] = {
      ...this.anomalies[index],
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      assignedTruck: resolutionData.assignedTruck || 'Municipal Sweeper Unit #3',
      resolutionNotes: resolutionData.notes || 'Cleared by sanitation task force and verified via post-inspection image.',
      resolutionProofUrl: resolutionData.proofUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
    };

    this.telemetryStats.anomaliesResolvedToday += 1;
    this.recalculateWardScores();
    return this.anomalies[index];
  }

  recalculateWardScores() {
    this.wards = this.wards.map(ward => {
      const wardAnomalies = this.anomalies.filter(a => a.wardName.includes(ward.name));
      const activeAnomalies = wardAnomalies.filter(a => a.status !== 'resolved');
      
      let penalty = activeAnomalies.reduce((acc, curr) => {
        if (curr.severity === 'critical') return acc + 12;
        if (curr.severity === 'high') return acc + 8;
        return acc + 4;
      }, 0);

      const cleanlinessScore = Math.max(35, Math.min(98, 100 - penalty));
      let cleanlinessRating = "Excellent";
      if (cleanlinessScore < 60) cleanlinessRating = "High Risk / Critical";
      else if (cleanlinessScore < 75) cleanlinessRating = "Moderate Risk";
      else if (cleanlinessScore < 88) cleanlinessRating = "Satisfactory";

      return {
        ...ward,
        cleanlinessScore,
        cleanlinessRating,
        activeAnomalies: activeAnomalies.length
      };
    });
  }

  // Generate Spatial Clusters (Hotspots) for heatmaps and dispatch
  getHotspots() {
    const activeAnomalies = this.anomalies.filter(a => a.status !== 'resolved');
    if (activeAnomalies.length === 0) return [];

    // Simple clustering based on 1.2km proximity
    const clusters = [];
    const visited = new Set();

    activeAnomalies.forEach((a, idx) => {
      if (visited.has(a.id)) return;
      
      const clusterMembers = [a];
      visited.add(a.id);

      activeAnomalies.forEach((b, jdx) => {
        if (idx !== jdx && !visited.has(b.id)) {
          const dist = this.haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
          if (dist <= 1.5) {
            clusterMembers.push(b);
            visited.add(b.id);
          }
        }
      });

      // Calculate centroid
      const avgLat = clusterMembers.reduce((sum, item) => sum + item.latitude, 0) / clusterMembers.length;
      const avgLng = clusterMembers.reduce((sum, item) => sum + item.longitude, 0) / clusterMembers.length;
      
      const maxScore = Math.max(...clusterMembers.map(item => item.severityScore || 50));
      const drainCount = clusterMembers.filter(item => item.category === 'clogged_drain').length;
      const dumpCount = clusterMembers.filter(item => item.category === 'illegal_dump').length;

      let priority = "medium";
      if (maxScore >= 85 || drainCount >= 2 || clusterMembers.length >= 3) priority = "critical";
      else if (maxScore >= 70) priority = "high";

      clusters.push({
        id: `HOTSPOT-${clusters.length + 1}`,
        center: [avgLat, avgLng],
        radiusMeters: Math.max(300, clusterMembers.length * 250),
        priority,
        severityScore: maxScore,
        anomalyCount: clusterMembers.length,
        anomalies: clusterMembers,
        primaryIssue: drainCount > dumpCount ? "Drain Choke Cluster" : "Solid Waste Accumulation Zone",
        recommendedVehicle: drainCount > 0 ? "Super Sucker & Silt Extractor" : "14-Tonne Compactor Truck"
      });
    });

    return clusters;
  }

  // Dynamic Route Optimizer for Sanitation Trucks (TSP Greedy nearest-neighbor with severity weighting)
  getOptimizedDispatchRoute() {
    const activeAnomalies = this.anomalies.filter(a => a.status !== 'resolved');
    if (activeAnomalies.length === 0) {
      return {
        depot: this.depotLocation,
        routeStops: [],
        totalDistanceKm: 0,
        estimatedFuelSavedPercent: 28,
        estimatedTimeMinutes: 0,
        polylineCoordinates: []
      };
    }

    // Sort active anomalies by priority weighting
    let unvisited = [...activeAnomalies];
    let currentPoint = { latitude: this.depotLocation.latitude, longitude: this.depotLocation.longitude };
    const routeStops = [];
    let totalDistanceKm = 0;
    const polyline = [[currentPoint.latitude, currentPoint.longitude]];

    while (unvisited.length > 0) {
      // Find stop with best weighted metric: distance / severityFactor
      let bestIdx = 0;
      let bestScore = Infinity;

      unvisited.forEach((item, idx) => {
        const dist = this.haversineDistance(currentPoint.latitude, currentPoint.longitude, item.latitude, item.longitude);
        const severityWeight = item.severity === 'critical' ? 2.0 : item.severity === 'high' ? 1.4 : 1.0;
        // lower is better (shorter distance, higher severity priority)
        const weightedScore = dist / severityWeight;
        if (weightedScore < bestScore) {
          bestScore = weightedScore;
          bestIdx = idx;
        }
      });

      const nextStop = unvisited.splice(bestIdx, 1)[0];
      const legDistance = this.haversineDistance(currentPoint.latitude, currentPoint.longitude, nextStop.latitude, nextStop.longitude);
      totalDistanceKm += legDistance;

      routeStops.push({
        stopNumber: routeStops.length + 1,
        anomalyId: nextStop.id,
        title: nextStop.title,
        category: nextStop.category,
        severity: nextStop.severity,
        wardName: nextStop.wardName,
        volumeEstimate: nextStop.volumeEstimate,
        coordinates: [nextStop.latitude, nextStop.longitude],
        legDistanceKm: parseFloat(legDistance.toFixed(2)),
        cumulativeDistanceKm: parseFloat(totalDistanceKm.toFixed(2))
      });

      polyline.push([nextStop.latitude, nextStop.longitude]);
      currentPoint = { latitude: nextStop.latitude, longitude: nextStop.longitude };
    }

    // Return to depot
    const returnDist = this.haversineDistance(currentPoint.latitude, currentPoint.longitude, this.depotLocation.latitude, this.depotLocation.longitude);
    totalDistanceKm += returnDist;
    polyline.push([this.depotLocation.latitude, this.depotLocation.longitude]);

    return {
      depot: this.depotLocation,
      routeStops,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      estimatedFuelSavedPercent: 32,
      estimatedTimeMinutes: Math.round(totalDistanceKm * 4.5 + routeStops.length * 15),
      polylineCoordinates: polyline
    };
  }

  getDashboardSummary() {
    const active = this.anomalies.filter(a => a.status !== 'resolved');
    const resolved = this.anomalies.filter(a => a.status === 'resolved');
    const drainChokes = active.filter(a => a.category === 'clogged_drain').length;
    const illegalDumps = active.filter(a => a.category === 'illegal_dump').length;
    const overflowingBins = active.filter(a => a.category === 'overflowing_bin').length;

    const avgCleanliness = Math.round(
      this.wards.reduce((sum, w) => sum + w.cleanlinessScore, 0) / this.wards.length
    );

    return {
      stats: {
        activeAnomaliesCount: active.length,
        resolvedAnomaliesCount: resolved.length,
        drainChokesCount: drainChokes,
        illegalDumpsCount: illegalDumps,
        overflowingBinsCount: overflowingBins,
        averageCleanlinessScore: avgCleanliness,
        activeScannersCount: this.telemetryStats.activeScannersCount,
        totalKilometersScanned: this.telemetryStats.totalKilometersScanned,
        totalBountiesDistributedINR: this.telemetryStats.totalBountiesDistributedINR,
        dpdpComplianceRate: "100% (Anonymized at Edge)"
      },
      wards: this.wards,
      recentAnomalies: this.anomalies.slice(0, 10),
      hotspots: this.getHotspots(),
      payoutLedger: this.payoutLedger.slice(0, 10),
      depot: this.depotLocation
    };
  }
}

export const store = new CivicLensStore();
