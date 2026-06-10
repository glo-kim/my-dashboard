# FastForward Logistics — Operations Dashboard - Project Brief

## Project Brief

**Projet Name** FastForward Ops Dashboard
**Client:** FastForward Logistic
**Stakeholder:** VP of Operations
**Purpose:** Replace scattered spreadsheets with a single internal dashboard the leadership team can pull up in meetings to see how the business is running at a glance. The dashboard must surface shipment volume, on-time delivery rates, regional performance, and open exceptions at a glance.

---

## Summary

### Problem Statement

FastForward's ops team currently tracks shipment volume, delivery performance, regional metrics, and exception cases across dozens of spreadsheets maintained by different people. Data is stale by the time it reaches leadership, formatting is inconsistent, and there is no single source of truth. The VP of Operations needs a live, self-service view she can open in any browser — no logins to three different tools, no emailing spreadsheets around.

### Core Problems

**Current State**
- Data is distributed across spreadsheets and syste,s
- Reporting is manual, slow, and error-prone
- Insights are delayed and require interpretation

**Target State**
- A single source of truth
- Real-time or near-real-time insights
- Clear, visualm and actionable data


### Primary Users
**VP of Operations (Primary)**
- Needs a fast, high-level snapshot during leadership meetings
- Prioritize clarity, speed, and presentation quality

**Regional Operations Manager (Secondary)**
- Monitor preformance for their region
- Identify issues requiring attention

**Operations manager and logistic coordinators (Secondary)**
- Monitor active shipment
- Track on-time delivery rates
- Identify and resolve shipment exceptions
- Analyze regional performance trend

**Executive Leadership (Passive)**
- Consume dashboard insights during meeting
- Does not interact directly with the tool


---

## Technical Approach

### Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Vue 3 (Composition API) | Already scaffolded |
| UI Library | Vuetify 3 | Material Design components, data tables, cards |
| Charts | Chart.js + vue-chartjs | Bar, line, doughnut, etc. |
| Routing | Vue Router 4 | Multi-page navigation |
| Build | Vite | Fast dev & production builds |
| Language | TypeScript | Type-safe codebase |
| Data | Static JSON fixtures | Prototype uses mock data; production would swap in a REST/GraphQL API |

## Design Decision
- Reponsive Layout: Desktop-first design using Vuetify grid system
- Theme Support: Light/dark mode for different viewing preferences
- Interactive ELements: Date range selector, filtering, and sorting for user control
- Professional, Enterprise Aesthetic: Clean Material Design that feels like an enterprise tool 
- Dashboard and charts should use a cohesive color palette, don't use a rainbow
- Light mode at default


### Design Principles

This dashboard is designed around: 

**Scanability over density**
- Users should understand key metrics at a glance

**Hierarchy of information**
- Most important KPIs appear first
- Supporting data reinforces the story

**Action-oriented visibility**
- Exceptions and issues are prominent

**Presentation-first UI**
- Clean, readable, and visually structured


---

## Dashboard Scope

### 1. KPI Summary Bar (top of every page)

Four headline metric cards displayed at the top of the main dashboard:

| Metric | Description | Visual |
|--------|-------------|--------|
| **Total Shipments (MTD)** | Count of shipments created this month | Number + month-over-month % change |
| **On-Time Delivery Rate** | % of shipments delivered on or before ETA | Number + colored indicator (green ≥ 95%, yellow 90-94%, red < 90%) |
| **Average Transit Time** | Mean days from pickup to delivery | Number + trend arrow |
| **Open Exceptions** | Active shipments flagged with issues | Number + severity badge |

### 2. Shipment Volume View

- **Bar chart** — daily shipment count for the current month.
- **Line chart overlay** — trailing 7-day moving average.
- Filterable by region and shipping mode (LTL, FTL, Parcel).

### 3. On-Time Delivery Performance

- **Line chart** — weekly on-time % over the last 12 weeks.
- **Doughnut chart** — breakdown of delivery status (On-Time, Late, Early).
- Target line at 95% OTD for quick visual comparison.

### 4. Regional Performance Table

- **Data table** (Vuetify `v-data-table`) listing each region with:
  - Shipment count
  - On-time %
  - Avg transit days
  - Exception count
- Sortable columns, color-coded cells for at-risk regions.

### 5. Exceptions Log

- **Filterable table** of open exceptions:
  - Shipment ID, origin, destination, carrier, exception type, age (days open).
- Exception types: *Delayed*, *Damaged*, *Address Issue*, *Customs Hold*, *Lost*.
- Status chips (Open / In Progress / Resolved).
- Click-to-expand row for notes/details.

### 6. Navigation & Layout

- **Sidebar nav** (Vuetify `v-navigation-drawer`) with links:
  - Overview (default)
  - Shipments
  - Exceptions
- **App bar** with company logo placeholder and current date.
- Responsive — usable on a laptop projected in a meeting room.

---

## Mock Data Strategy

All data lives in static JSON files under a `data/` directory. Each file represents what a real API endpoint would return.

| File | Contents |
|------|----------|
| `data/kpis.json` | Headline metrics for the KPI cards |
| `data/shipments.json` | Daily shipment records (≈ 200 rows, 30-day window) |
| `data/regions.json` | Aggregated regional performance |
| `data/exceptions.json` | Open and recently resolved exception records |

Data should look realistic: believable carrier names (e.g., FastFreight, PrimeLine, TransWay), realistic U.S. city pairs, plausible transit times.

---

## Page & Route Map

| Route | View Component | Description |
|-------|---------------|-------------|
| `/` | `OverviewView.vue` | KPI cards + shipment volume chart + OTD chart |
| `/shipments` | `ShipmentsView.vue` | Full shipment volume analysis with filters |
| `/exceptions` | `ExceptionsView.vue` | Exceptions log table with filters and detail expansion |

---

## Component Breakdown

```
components/
  layout/
    AppSidebar.vue          # Navigation drawer
    AppBar.vue              # Top app bar
  dashboard/
    KpiCard.vue             # Single KPI metric card (reusable)
    KpiBar.vue              # Row of 4 KPI cards
    ShipmentVolumeChart.vue # Bar + line chart for daily volumes
    OtdLineChart.vue        # Weekly on-time delivery trend
    DeliveryStatusDonut.vue # Doughnut chart of delivery outcomes
    RegionTable.vue         # Regional performance data table
    ExceptionTable.vue      # Exceptions log with filters
```

---

## Implementation Phases

### Phase 1 — Layout & Navigation
- [ ] Set up Vuetify theme with FastForward brand colors (navy `#1B2A4A`, orange accent `#F57C00`)
- [ ] Build `AppSidebar.vue` and `AppBar.vue`
- [ ] Update `App.vue` to use the new layout shell
- [ ] Add routes for Overview, Shipments, and Exceptions

### Phase 2 — Mock Data & KPIs
- [ ] Create JSON fixture files in `data/`
- [ ] Build `KpiCard.vue` and `KpiBar.vue`
- [ ] Wire KPI bar into `OverviewView.vue`

### Phase 3 — Charts
- [ ] Build `ShipmentVolumeChart.vue` (bar + moving average line)
- [ ] Build `OtdLineChart.vue` (weekly trend with 95% target line)
- [ ] Build `DeliveryStatusDonut.vue`
- [ ] Add charts to Overview and Shipments views

### Phase 4 — Tables
- [ ] Build `RegionTable.vue` with conditional cell formatting
- [ ] Build `ExceptionTable.vue` with filters, status chips, expandable rows
- [ ] Add tables to respective views

### Phase 5 — Polish
- [ ] Responsive tweaks for tablet/projector use
- [ ] Loading states and empty states
- [ ] Final color, spacing, and typography pass

---

## Design Decisions & Assumptions

1. **No auth.** This is an internal tool behind a VPN; authentication is out of scope for the prototype.
2. **No backend.** Mock JSON keeps the prototype self-contained. The data layer is isolated so swapping in real API calls later is straightforward.
3. **No real-time updates.** Dashboard shows point-in-time data. Live refresh can be added later via polling or WebSockets.
4. **U.S.-only regions.** Mock data uses domestic U.S. lanes (Northeast, Southeast, Midwest, Southwest, West).
5. **English only.** No i18n for the prototype.

---

## Success Criteria

The VP of Operations should be able to:

1. Open the dashboard and immediately see whether the business is healthy (KPI cards).
2. Identify volume trends and seasonal patterns (shipment charts).
3. Spot regions that are underperforming on delivery (regional table).
4. Drill into active exceptions and understand what needs attention (exceptions log).
5. Use this in a leadership meeting without needing a tutorial.
