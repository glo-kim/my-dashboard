import { writeFileSync } from 'fs';

// --- Helpers ---
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) =>
  +(Math.random() * (max - min) + min).toFixed(decimals);
const padId = (n) => String(n).padStart(4, '0');

// --- Constants ---
const carriers = ['FastFreight', 'PrimeLine', 'TransWay', 'NorthStar Freight', 'Summit Carriers'];
const modes = ['LTL', 'FTL', 'Parcel'];
const exceptionTypes = ['Delayed', 'Damaged', 'Address Issue', 'Customs Hold', 'Lost'];
const exceptionStatuses = ['Open', 'In Progress', 'Resolved'];

const regionData = {
  Northeast: {
    cities: [
      ['New York', 'NY'], ['Boston', 'MA'], ['Philadelphia', 'PA'],
      ['Hartford', 'CT'], ['Newark', 'NJ'], ['Baltimore', 'MD'],
      ['Pittsburgh', 'PA'], ['Providence', 'RI']
    ]
  },
  Southeast: {
    cities: [
      ['Atlanta', 'GA'], ['Miami', 'FL'], ['Charlotte', 'NC'],
      ['Nashville', 'TN'], ['Jacksonville', 'FL'], ['Tampa', 'FL'],
      ['Raleigh', 'NC'], ['Richmond', 'VA']
    ]
  },
  Midwest: {
    cities: [
      ['Chicago', 'IL'], ['Detroit', 'MI'], ['Minneapolis', 'MN'],
      ['Columbus', 'OH'], ['Indianapolis', 'IN'], ['Milwaukee', 'WI'],
      ['Kansas City', 'MO'], ['St. Louis', 'MO']
    ]
  },
  Southwest: {
    cities: [
      ['Dallas', 'TX'], ['Houston', 'TX'], ['Phoenix', 'AZ'],
      ['Denver', 'CO'], ['San Antonio', 'TX'], ['Austin', 'TX'],
      ['Albuquerque', 'NM'], ['El Paso', 'TX']
    ]
  },
  West: {
    cities: [
      ['Los Angeles', 'CA'], ['San Francisco', 'CA'], ['Seattle', 'WA'],
      ['Portland', 'OR'], ['San Diego', 'CA'], ['Sacramento', 'CA'],
      ['Las Vegas', 'NV'], ['Salt Lake City', 'UT']
    ]
  }
};

const regions = Object.keys(regionData);

function cityString(city) {
  return `${city[0]}, ${city[1]}`;
}

// --- Date helpers ---
function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function dayOfWeek(d) {
  return d.getDay(); // 0=Sun, 6=Sat
}

function isWeekend(d) {
  const dow = dayOfWeek(d);
  return dow === 0 || dow === 6;
}

// --- Generate 30 days of dates (Apr 16 – May 15, 2026) ---
const startDate = new Date(2026, 3, 16); // Apr 16
const days = [];
for (let i = 0; i < 30; i++) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + i);
  days.push(d);
}

// --- Generate ~200 shipment records ---
const shipments = [];
let shipId = 4200; // start from a realistic-looking ID

// Plan daily volumes: weekdays 8-12, weekends 2-4
const dailyTargets = days.map((d) => {
  if (isWeekend(d)) return rand(2, 5);
  return rand(7, 11);
});

// Adjust total to ~200
let total = dailyTargets.reduce((a, b) => a + b, 0);
// nudge if needed — close enough is fine

for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
  const date = days[dayIdx];
  const count = dailyTargets[dayIdx];

  for (let j = 0; j < count; j++) {
    shipId++;
    const region = pick(regions);
    const originCity = pick(regionData[region].cities);
    // destination can be any region
    const destRegion = pick(regions);
    const destCity = pick(regionData[destRegion].cities);

    const mode = pick(modes);
    const carrier = pick(carriers);

    // Transit times: Parcel 1-3, LTL 2-5, FTL 1-4
    let estDays, actualDays;
    if (mode === 'Parcel') {
      estDays = rand(1, 3);
    } else if (mode === 'LTL') {
      estDays = rand(2, 5);
    } else {
      estDays = rand(1, 4);
    }

    // ~93% on-time rate overall
    const onTimeRoll = Math.random();
    if (onTimeRoll < 0.04) {
      // early
      actualDays = Math.max(1, estDays - rand(1, 2));
    } else if (onTimeRoll < 0.93) {
      // on time
      actualDays = estDays;
    } else {
      // late
      actualDays = estDays + rand(1, 3);
    }

    // Determine status
    const deliveryDate = new Date(date);
    deliveryDate.setDate(deliveryDate.getDate() + actualDays);
    const cutoff = new Date(2026, 4, 15); // May 15

    let status;
    if (deliveryDate <= cutoff) {
      status = 'Delivered';
    } else {
      status = 'In Transit';
    }

    // ~3% are exceptions
    const isException = Math.random() < 0.035;
    if (isException) {
      status = 'Exception';
    }

    const onTime = actualDays <= estDays;

    // Revenue per shipment: Parcel $120-$450, LTL $800-$3,500, FTL $2,000-$6,000
    let revenue;
    if (mode === 'Parcel') {
      revenue = rand(120, 450);
    } else if (mode === 'LTL') {
      revenue = rand(800, 3500);
    } else {
      revenue = rand(2000, 6000);
    }

    shipments.push({
      id: `SHP-${padId(shipId)}`,
      date: dateStr(date),
      origin: cityString(originCity),
      destination: cityString(destCity),
      originRegion: region,
      carrier,
      mode,
      status,
      estimatedDays: estDays,
      actualDays: status === 'In Transit' ? null : actualDays,
      onTime: status === 'In Transit' ? null : onTime,
      revenue
    });
  }
}

// --- Daily volume aggregation for chart ---
const dailyVolume = days.map((d, i) => {
  // Use the higher "real" volume (the shipments we generated are a sample)
  // Scale up to reflect ~1800 MTD total
  const base = isWeekend(d) ? rand(18, 32) : rand(58, 88);
  return {
    date: dateStr(d),
    count: base,
    ltl: Math.round(base * randFloat(0.30, 0.40, 2)),
    ftl: Math.round(base * randFloat(0.25, 0.35, 2)),
    parcel: 0 // filled below
  };
}).map((d) => {
  d.parcel = d.count - d.ltl - d.ftl;
  return d;
});

// --- KPIs ---
const totalMTD = dailyVolume
  .filter((d) => d.date >= '2026-05-01')
  .reduce((s, d) => s + d.count, 0);
const totalPrevMonth = Math.round(totalMTD * randFloat(0.94, 1.02, 2));
const momChange = +(((totalMTD - totalPrevMonth) / totalPrevMonth) * 100).toFixed(1);

const kpis = {
  totalShipments: {
    value: totalMTD,
    previousMonth: totalPrevMonth,
    change: momChange,
    period: 'MTD May 2026'
  },
  onTimeDeliveryRate: {
    value: 93.7,
    target: 95.0,
    status: 'yellow',
    previousMonth: 95.1
  },
  avgTransitTime: {
    value: 3.2,
    previousMonth: 3.4,
    trend: 'down',
    unit: 'days'
  },
  openExceptions: {
    value: 23,
    critical: 4,
    warning: 11,
    info: 8
  }
};

// --- Weekly OTD (12 weeks) ---
const weeklyOtd = [
  { week: '2026-W09', start: '2026-02-23', end: '2026-03-01', otdPercent: 95.8 },
  { week: '2026-W10', start: '2026-03-02', end: '2026-03-08', otdPercent: 96.2 },
  { week: '2026-W11', start: '2026-03-09', end: '2026-03-15', otdPercent: 94.5 },
  { week: '2026-W12', start: '2026-03-16', end: '2026-03-22', otdPercent: 93.1 },
  { week: '2026-W13', start: '2026-03-23', end: '2026-03-29', otdPercent: 91.8 },
  { week: '2026-W14', start: '2026-03-30', end: '2026-04-05', otdPercent: 92.4 },
  { week: '2026-W15', start: '2026-04-06', end: '2026-04-12', otdPercent: 94.9 },
  { week: '2026-W16', start: '2026-04-13', end: '2026-04-19', otdPercent: 95.3 },
  { week: '2026-W17', start: '2026-04-20', end: '2026-04-26', otdPercent: 93.7 },
  { week: '2026-W18', start: '2026-04-27', end: '2026-05-03', otdPercent: 94.1 },
  { week: '2026-W19', start: '2026-05-04', end: '2026-05-10', otdPercent: 92.6 },
  { week: '2026-W20', start: '2026-05-11', end: '2026-05-15', otdPercent: 93.7 }
];

// --- Delivery status breakdown for doughnut ---
const deliveryStatus = {
  onTime: 1723,
  late: 89,
  early: 35,
  total: 1847
};

// --- Regional performance ---
const regionPerformance = [
  {
    region: 'Northeast',
    shipments: 412,
    onTimePercent: 95.4,
    avgTransitDays: 2.8,
    exceptions: 3,
    revenue: 287650
  },
  {
    region: 'Southeast',
    shipments: 389,
    onTimePercent: 94.1,
    avgTransitDays: 3.1,
    exceptions: 5,
    revenue: 264320
  },
  {
    region: 'Midwest',
    shipments: 371,
    onTimePercent: 93.8,
    avgTransitDays: 3.4,
    exceptions: 4,
    revenue: 241780
  },
  {
    region: 'Southwest',
    shipments: 298,
    onTimePercent: 91.2,
    avgTransitDays: 3.6,
    exceptions: 7,
    revenue: 198430
  },
  {
    region: 'West',
    shipments: 377,
    onTimePercent: 93.3,
    avgTransitDays: 3.3,
    exceptions: 4,
    revenue: 259910
  }
];

// --- Exceptions log ---
const exceptions = [
  { id: 'SHP-4219', origin: 'Houston, TX', destination: 'Phoenix, AZ', carrier: 'TransWay', type: 'Delayed', status: 'Open', daysOpen: 5, severity: 'critical', notes: 'Truck breakdown on I-10. Carrier dispatching replacement vehicle.' },
  { id: 'SHP-4227', origin: 'Chicago, IL', destination: 'Detroit, MI', carrier: 'NorthStar Freight', type: 'Damaged', status: 'Open', daysOpen: 3, severity: 'critical', notes: 'Pallet damage reported at destination dock. Claim filed.' },
  { id: 'SHP-4231', origin: 'Miami, FL', destination: 'Atlanta, GA', carrier: 'PrimeLine', type: 'Address Issue', status: 'In Progress', daysOpen: 2, severity: 'warning', notes: 'Consignee address incomplete. Awaiting updated delivery instructions.' },
  { id: 'SHP-4238', origin: 'Los Angeles, CA', destination: 'Seattle, WA', carrier: 'FastFreight', type: 'Delayed', status: 'Open', daysOpen: 4, severity: 'critical', notes: 'Weather delay — heavy snow on I-5 corridor through Oregon.' },
  { id: 'SHP-4241', origin: 'Dallas, TX', destination: 'Denver, CO', carrier: 'Summit Carriers', type: 'Customs Hold', status: 'In Progress', daysOpen: 6, severity: 'warning', notes: 'Bonded freight held for additional documentation. Broker working on release.' },
  { id: 'SHP-4244', origin: 'New York, NY', destination: 'Boston, MA', carrier: 'PrimeLine', type: 'Delayed', status: 'Open', daysOpen: 1, severity: 'warning', notes: 'Late pickup — shipper facility closed early.' },
  { id: 'SHP-4252', origin: 'San Francisco, CA', destination: 'Portland, OR', carrier: 'TransWay', type: 'Damaged', status: 'In Progress', daysOpen: 4, severity: 'warning', notes: 'Water damage to 2 of 6 cartons. Partial claim in process.' },
  { id: 'SHP-4258', origin: 'Atlanta, GA', destination: 'Jacksonville, FL', carrier: 'FastFreight', type: 'Address Issue', status: 'Open', daysOpen: 1, severity: 'info', notes: 'Suite number missing. Driver attempted delivery, left notice.' },
  { id: 'SHP-4261', origin: 'Minneapolis, MN', destination: 'Columbus, OH', carrier: 'NorthStar Freight', type: 'Delayed', status: 'In Progress', daysOpen: 3, severity: 'warning', notes: 'Mechanical issue at transfer terminal. ETA pushed 24 hrs.' },
  { id: 'SHP-4265', origin: 'Phoenix, AZ', destination: 'Albuquerque, NM', carrier: 'Summit Carriers', type: 'Lost', status: 'Open', daysOpen: 7, severity: 'critical', notes: 'Shipment not scanned since departure. Carrier investigating. Escalated to management.' },
  { id: 'SHP-4271', origin: 'Philadelphia, PA', destination: 'Newark, NJ', carrier: 'FastFreight', type: 'Delayed', status: 'Resolved', daysOpen: 0, severity: 'info', notes: 'Traffic delay. Delivered 4 hours late, within SLA window.' },
  { id: 'SHP-4278', origin: 'Nashville, TN', destination: 'Charlotte, NC', carrier: 'PrimeLine', type: 'Address Issue', status: 'Open', daysOpen: 2, severity: 'warning', notes: 'Business closed at delivery. Rescheduled for next business day.' },
  { id: 'SHP-4283', origin: 'Detroit, MI', destination: 'Indianapolis, IN', carrier: 'TransWay', type: 'Damaged', status: 'Resolved', daysOpen: 0, severity: 'info', notes: 'Minor cosmetic damage to outer packaging. Contents intact. No claim needed.' },
  { id: 'SHP-4287', origin: 'San Diego, CA', destination: 'Las Vegas, NV', carrier: 'Summit Carriers', type: 'Delayed', status: 'In Progress', daysOpen: 2, severity: 'warning', notes: 'Carrier capacity issue. Shipment rescheduled to next available truck.' },
  { id: 'SHP-4291', origin: 'Houston, TX', destination: 'San Antonio, TX', carrier: 'FastFreight', type: 'Address Issue', status: 'Resolved', daysOpen: 0, severity: 'info', notes: 'Gate code required. Obtained from consignee, delivered same day.' },
  { id: 'SHP-4296', origin: 'Boston, MA', destination: 'Hartford, CT', carrier: 'NorthStar Freight', type: 'Delayed', status: 'Open', daysOpen: 1, severity: 'info', notes: 'Missed connection at regional hub. Next dispatch tomorrow AM.' },
  { id: 'SHP-4301', origin: 'Seattle, WA', destination: 'Sacramento, CA', carrier: 'PrimeLine', type: 'Customs Hold', status: 'Open', daysOpen: 3, severity: 'warning', notes: 'Import documentation mismatch. Awaiting corrected commercial invoice.' },
  { id: 'SHP-4305', origin: 'Tampa, FL', destination: 'Raleigh, NC', carrier: 'TransWay', type: 'Delayed', status: 'In Progress', daysOpen: 2, severity: 'warning', notes: 'Driver hours-of-service limit reached. Resuming delivery in the morning.' },
  { id: 'SHP-4312', origin: 'Kansas City, MO', destination: 'St. Louis, MO', carrier: 'NorthStar Freight', type: 'Damaged', status: 'Open', daysOpen: 1, severity: 'info', notes: 'Slight dent on one box. Consignee inspecting contents.' },
  { id: 'SHP-4318', origin: 'El Paso, TX', destination: 'Austin, TX', carrier: 'Summit Carriers', type: 'Delayed', status: 'Resolved', daysOpen: 0, severity: 'info', notes: 'Flat tire en route. Repaired and delivered 2 hours late.' },
  { id: 'SHP-4324', origin: 'Baltimore, MD', destination: 'Richmond, VA', carrier: 'FastFreight', type: 'Lost', status: 'In Progress', daysOpen: 4, severity: 'warning', notes: 'Last scan at Baltimore hub 4 days ago. Trace initiated.' },
  { id: 'SHP-4329', origin: 'Salt Lake City, UT', destination: 'Denver, CO', carrier: 'PrimeLine', type: 'Address Issue', status: 'Open', daysOpen: 1, severity: 'info', notes: 'Consignee name doesn\'t match receiving dock records. Verifying.' },
  { id: 'SHP-4335', origin: 'Milwaukee, WI', destination: 'Chicago, IL', carrier: 'TransWay', type: 'Delayed', status: 'Resolved', daysOpen: 0, severity: 'info', notes: 'Construction detour added 3 hours. Delivered within tolerance.' }
];

// --- Monthly revenue (12 months, seasonal patterns) ---
const monthlyRevenue = [
  { month: '2025-06', label: 'Jun 2025', revenue: 52340, shipments: 1580 },
  { month: '2025-07', label: 'Jul 2025', revenue: 48920, shipments: 1490 },
  { month: '2025-08', label: 'Aug 2025', revenue: 51670, shipments: 1545 },
  { month: '2025-09', label: 'Sep 2025', revenue: 58450, shipments: 1690 },
  { month: '2025-10', label: 'Oct 2025', revenue: 63210, shipments: 1775 },
  { month: '2025-11', label: 'Nov 2025', revenue: 72840, shipments: 1920 },
  { month: '2025-12', label: 'Dec 2025', revenue: 78390, shipments: 2050 },
  { month: '2026-01', label: 'Jan 2026', revenue: 45120, shipments: 1380 },
  { month: '2026-02', label: 'Feb 2026', revenue: 49780, shipments: 1455 },
  { month: '2026-03', label: 'Mar 2026', revenue: 56930, shipments: 1640 },
  { month: '2026-04', label: 'Apr 2026', revenue: 61440, shipments: 1730 },
  { month: '2026-05', label: 'May 2026', revenue: 58710, shipments: 1847 }
];

// --- Assemble final object ---
const metrics = {
  generatedAt: '2026-05-15T09:00:00Z',
  kpis,
  dailyVolume,
  weeklyOtd,
  deliveryStatus,
  regions: regionPerformance,
  exceptions,
  shipments,
  monthlyRevenue
};

writeFileSync(
  new URL('../src/data/metrics.json', import.meta.url),
  JSON.stringify(metrics, null, 2)
);

console.log(`Generated metrics.json with ${shipments.length} shipment records, ${exceptions.length} exceptions, ${dailyVolume.length} daily volume entries.`);
