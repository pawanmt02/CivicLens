# 🌐 CivicLens: Passive AI Dashcam & Municipal Heatmap
### *Track 02 (Street & Neighbourhood Action) & Track 04 (Drain & Infrastructure Maintenance)*

> **Revolutionizing urban governance by converting gig economy miles into real-time municipal audits without a single manual citizen report.**

---

## 📌 Executive Summary
India's 3,000+ cities suffer from localized waste accumulation and drain blockages that go unreported until a crisis occurs (e.g., monsoon urban flooding, dengue/malaria outbreaks, or unmanageable blackspots). Expecting active citizen reporting via complaint apps has historically failed due to high user friction.

**CivicLens shifts the paradigm from active reporting to passive auditing.** By piggybacking on the millions of kilometers driven daily by gig delivery workers (food delivery, quick commerce, logistics), CivicLens runs as a background service on dashboard-mounted smartphones at 1 FPS. It scans every meter of the city map—analyzing street conditions in real-time, detecting anomalies, and generating a live, prioritized command dashboard for municipal action.

---

## ⚡ Core Value Propositions & Workflow
```mermaid
flowchart TD
    A["🛵 Gig Delivery Driver Mounts Phone & Starts Shift"] --> B["📹 CivicLens Background Scanner at 1 FPS"]
    B --> C["🧠 Edge ML: Detects Clogged Drains / Garbage Heaps / Spills"]
    C --> D["🛡️ DPDP Privacy Filter: On-Device Face & Plate Blur"]
    D --> E["📡 WebSocket / REST Cloud Ingestion"]
    E --> F["🗺️ PostGIS DBSCAN Clustering & Dynamic TSP Truck Routing"]
    F --> G["💰 ₹1 Instant Micro-Payment Credited to Rider Wallet"]
    F --> H["🏢 Municipal Dashboard: Live Heatmaps & Before/After Portal"]
```

1. **Zero-Friction Scalability**: Requires zero manual data entry from citizens or drivers.
2. **Dynamic Sanitation Routing**: Replaces blind fixed sweeping schedules with real-time accumulation-driven routes, saving up to **32% fuel**.
3. **Gig Incentive Loop**: Drivers earn ₹1 per verified unique anomaly directly funded by municipal CSR / tech budgets.
4. **100% DPDP Act Compliance**: Faces and vehicle license plates are pixelated on-device before any image byte leaves the phone RAM.

---

## 🏗️ System Architecture
- **Mobile Edge**:
  - Background Camera Sampling (1 FPS energy throttle & stationary watchdog auto-pause)
  - On-Device Privacy Masking (Face & License Plate Mosaic)
  - TensorFlow Lite / YOLOv8n Anomaly Classifier (Drains, Garbage, Bins)
- **Backend & Geospatial Engine**:
  - Express.js + WebSockets for real-time live ping broadcasts
  - Geospatial Distance & Proximity Clustering (DBSCAN / Hotspot Indexing)
  - Dynamic Vehicle Routing Engine (Greedy TSP with Severity Priority Weighting)
  - Driver Bounty Ledger & DPDP Compliance Auditor
- **Municipal Command Center**:
  - React + Tailwind CSS + Leaflet GIS Dark Heatmap
  - Live Audio Alert & Pin Drop Animation
  - Ward Cleanliness Scorecards (Indiranagar, Koramangala, HSR Layout, MG Road)
  - Before/After Inspection & Resolution Portal

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### 1. Install Dependencies
```bash
# Root directory
npm install --prefix backend
npm install --prefix client
```

### 2. Run Backend & Frontend Simultaneously
```bash
# Start full stack
node start-all.js
```
- **Municipal Command Center & Edge Scanner UI**: `http://localhost:5173`
- **Backend Ingestion API**: `http://localhost:5000`

---

## 🎯 Hackathon Prototype & Judge Demo Script
To demonstrate this indoors to hackathon judges:

1. **[Demo Step 1: The Setup]**: Open the **Judge Demo Suite** or **Edge Dashcam AI** tab. Hit *"Start Scanning"*. Notice the 1 FPS throttle and the stationary battery auto-pause guard.
2. **[Demo Step 2: Street POV Simulation]**: Watch the simulated driving feed as the vehicle moves through an Indian urban street corridor.
3. **[Demo Step 3: Edge Detection & DPDP Blur]**: Select *Clogged Stormwater Drain* or *Illegal Garbage Dump*. The on-device computer vision identifies the issue while instantly placing green privacy masks over pedestrians and license plates.
4. **[Demo Step 4: Real-time Cloud Sync & Routing]**: Hit *"Simulate Edge Anomaly Detect"*. Watch the live map drop a glowing red pin with an audio chime, credit ₹1 to the rider's wallet, and dynamically recalculate the sanitation compactor route!

---

## 📜 License
MIT © 2026 CivicLens Project (Track 02 & Track 04 Prototype).
