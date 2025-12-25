# Operations Intelligence Platform

A comprehensive Predictive Operations & Decision Intelligence web application for enterprise process management.

## Features

- **Executive Dashboard**: High-level KPIs, risk distribution, and bottleneck analysis
- **Case Intelligence Explorer**: Detailed case-by-case analysis with interactive table and side panel
- **Bottleneck & Root Cause Analysis**: Understand why delays happen with visual analytics
- **What-If Simulation**: Test different operational scenarios before making decisions
- **Recommendations & Action Planner**: AI-recommended actions organized by queue, risk, or bottleneck
- **Reports & Insights**: Shareable operational intelligence with trend analysis

## Tech Stack

- React 18
- React Router for navigation
- Recharts for data visualization
- Tailwind CSS for styling
- PapaParse for CSV parsing
- Vite for build tooling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Data Files

The application loads two CSV files:
- `operations_input_state_FINAL.csv` - Operational state data
- `operations_decision_insights_FINAL.csv` - AI-generated insights

These files are automatically joined on `Case_ID` when the application loads.

## Application Structure

```
src/
  ├── components/
  │   └── Sidebar.jsx          # Navigation sidebar
  ├── pages/
  │   ├── ExecutiveDashboard.jsx
  │   ├── CaseIntelligenceExplorer.jsx
  │   ├── BottleneckAnalysis.jsx
  │   ├── WhatIfSimulation.jsx
  │   ├── RecommendationsPlanner.jsx
  │   └── ReportsInsights.jsx
  ├── utils/
  │   └── dataLoader.js        # CSV loading and joining logic
  ├── App.jsx                  # Main app component with routing
  ├── main.jsx                 # Entry point
  └── index.css                # Global styles
```

## Features by Page

### 1. Executive Dashboard
- Real-time KPI cards (Total cases, High/Medium/Low risk, Avg time to breach)
- Interactive filters (Queue, Case Type, Risk Level, Day, Hour)
- SLA Risk distribution chart
- Bottleneck distribution chart
- Top recommended actions summary

### 2. Case Intelligence Explorer
- Searchable and sortable case table
- Pagination for large datasets
- Click any case to view detailed side panel
- Full operational details and AI recommendations
- Risk explanation and expected outcomes

### 3. Bottleneck & Root Cause Analysis
- Queue depth vs active agents scatter plot
- Load index vs SLA risk correlation
- Complexity vs delay risk analysis
- Root cause summary cards
- Plain-English insights panel

### 4. What-If Simulation
- Interactive sliders for agents, queue depth, automation
- Real-time risk recalculation
- Current vs simulated comparison
- AI recommendation engine
- Impact explanations

### 5. Recommendations & Action Planner
- Actions grouped by Queue, Risk, Bottleneck, or Action type
- Filter by risk level
- Action cards with confidence levels
- Expected risk reduction metrics
- Downloadable action report (CSV)

### 6. Reports & Insights
- SLA risk trends over time
- Peak risk hours and days analysis
- Case type risk heatmap
- Exportable reports (CSV/PDF)
- Business language insights summary

## Design

The application uses a professional enterprise color palette:
- Primary: Dark blue/slate (#334e68, #243b53)
- Risk Colors: Red (High), Yellow (Medium), Green (Low)
- Background: Light slate (#f5f7fa)
- Cards: White with subtle shadows

## Browser Support

Modern browsers that support ES6+ features:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a demonstration application built for operational intelligence and decision support.

