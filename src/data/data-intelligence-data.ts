// Data Intelligence module — dataset groups, filters, and sample data

export interface DataGroup {
  id: string;
  label: string;
  icon: string; // emoji for simplicity
  description: string;
  filters: FilterDef[];
  columns: ColumnDef[];
  extraColumns: ColumnDef[];
  sampleRows: Record<string, string | number>[];
  totalRecords: number;
}

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

export interface ColumnDef {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

export const dataGroups: DataGroup[] = [
  {
    id: 'corporate-hierarchy',
    label: 'Corporate Hierarchy Intelligence',
    icon: '🏢',
    description: 'Parent-subsidiary relationships, ownership chains, and hierarchy links',
    filters: [
      { key: 'geography', label: 'Geography', options: ['All Regions', 'North America', 'Europe', 'APAC', 'Middle East', 'Latin America'] },
      { key: 'companyType', label: 'Company Type', options: ['All Companies', 'Public', 'Private'] },
      { key: 'tier', label: 'Tier', options: ['All Tiers', 'Tier 1', 'Tier 2', 'Tier 3'] },
    ],
    columns: [
      { key: 'parentName', label: 'Parent Name' },
      { key: 'subsidiaryName', label: 'Subsidiary Name' },
      { key: 'entityType', label: 'Entity Type' },
      { key: 'country', label: 'Country' },
      { key: 'ownershipPct', label: 'Ownership %', align: 'right' },
      { key: 'coverageScore', label: 'Coverage', align: 'right' },
    ],
    extraColumns: [
      { key: 'lei', label: 'LEI' },
      { key: 'incorporationDate', label: 'Inc. Date' },
      { key: 'status', label: 'Status' },
    ],
    sampleRows: [
      { parentName: 'Meridian Holdings plc', subsidiaryName: 'Meridian Capital Partners Ltd', entityType: 'Subsidiary', country: 'United Kingdom', ownershipPct: 100, coverageScore: 96.2, lei: '5493001KJTIIGC8Y1R12', incorporationDate: '2004-03-15', status: 'Active' },
      { parentName: 'Atlas Industrial Corp', subsidiaryName: 'Atlas Manufacturing GmbH', entityType: 'Subsidiary', country: 'Germany', ownershipPct: 100, coverageScore: 94.7, lei: '529900T8BM49AURSDO55', incorporationDate: '1998-07-22', status: 'Active' },
      { parentName: 'Atlas Industrial Corp', subsidiaryName: 'Atlas Logistics de México SA', entityType: 'Subsidiary', country: 'Mexico', ownershipPct: 72, coverageScore: 71.3, lei: '2138004WLKZ3GN8CG312', incorporationDate: '2011-01-10', status: 'Active' },
      { parentName: 'Pinnacle Financial Group Inc', subsidiaryName: 'Pinnacle Wealth Advisors LLC', entityType: 'Branch', country: 'United States', ownershipPct: 100, coverageScore: 98.1, lei: '549300MLUDYVRQOOXS22', incorporationDate: '2015-09-01', status: 'Active' },
      { parentName: 'Northfield Energy plc', subsidiaryName: 'Northfield Renewables BV', entityType: 'Subsidiary', country: 'Netherlands', ownershipPct: 90, coverageScore: 91.5, lei: '213800GKEMVZ91GQ3X44', incorporationDate: '2019-06-18', status: 'Active' },
      { parentName: 'Crestview Technologies Inc', subsidiaryName: 'Crestview Cloud Services Ltd', entityType: 'Subsidiary', country: 'Canada', ownershipPct: 100, coverageScore: 95.8, lei: '549300PJNK89G2H7LP61', incorporationDate: '2016-11-30', status: 'Active' },
      { parentName: 'Crestview Technologies Inc', subsidiaryName: 'Crestview AI Labs KK', entityType: 'Subsidiary', country: 'Japan', ownershipPct: 67, coverageScore: 82.1, lei: '353800XYZ1234ABCDE77', incorporationDate: '2021-04-05', status: 'Active' },
      { parentName: 'Hargrove Pharmaceuticals Ltd', subsidiaryName: 'Hargrove Biotech India Pvt Ltd', entityType: 'Subsidiary', country: 'India', ownershipPct: 100, coverageScore: 87.4, lei: '335800HGVBIOTECH9988', incorporationDate: '2013-08-20', status: 'Active' },
      { parentName: 'Sovereign Capital SA', subsidiaryName: 'Sovereign Real Estate Holdings BV', entityType: 'Subsidiary', country: 'Netherlands', ownershipPct: 80, coverageScore: 90.2, lei: '213800SVREH0LDINGS55', incorporationDate: '2010-02-14', status: 'Active' },
      { parentName: 'Broadmark Corp', subsidiaryName: 'Broadmark Digital Pty Ltd', entityType: 'Subsidiary', country: 'Australia', ownershipPct: 100, coverageScore: 91.0, lei: '549300BRDMRKDIGTL033', incorporationDate: '2017-12-01', status: 'Active' },
    ],
    totalRecords: 4_800_000,
  },
  {
    id: 'executive-data',
    label: 'Executive Data',
    icon: '👤',
    description: 'C-suite and board-level executive profiles, roles, and tenure',
    filters: [
      { key: 'geography', label: 'Geography', options: ['All Regions', 'North America', 'Europe', 'APAC', 'Middle East', 'Latin America'] },
      { key: 'companyType', label: 'Company Type', options: ['All Companies', 'Public', 'Private'] },
      { key: 'role', label: 'Role', options: ['All Roles', 'CEO', 'CFO', 'COO', 'CTO', 'Board Member'] },
    ],
    columns: [
      { key: 'name', label: 'Executive Name' },
      { key: 'title', label: 'Title' },
      { key: 'company', label: 'Company' },
      { key: 'country', label: 'Country' },
      { key: 'tenure', label: 'Tenure (yrs)', align: 'right' },
    ],
    sampleRows: [
      { name: 'James Whitfield', title: 'CEO', company: 'Meridian Holdings plc', country: 'United Kingdom', tenure: 8 },
      { name: 'Sarah Chen', title: 'CFO', company: 'Atlas Industrial Corp', country: 'United States', tenure: 5 },
      { name: 'Michael Torres', title: 'COO', company: 'Pinnacle Financial Group Inc', country: 'United States', tenure: 3 },
      { name: 'Dr. Ananya Sharma', title: 'CTO', company: 'Crestview Technologies Inc', country: 'Canada', tenure: 6 },
      { name: 'Henrik Müller', title: 'CEO', company: 'Atlas Manufacturing GmbH', country: 'Germany', tenure: 12 },
      { name: 'Laura Kim', title: 'CFO', company: 'Northfield Energy plc', country: 'United Kingdom', tenure: 4 },
      { name: 'Robert Daniels', title: 'Board Member', company: 'Sovereign Capital SA', country: 'Switzerland', tenure: 7 },
      { name: 'Emily Zhang', title: 'CTO', company: 'Broadmark Corp', country: 'Australia', tenure: 2 },
      { name: 'Carlos Rivera', title: 'CEO', company: 'Hargrove Pharmaceuticals Ltd', country: 'Ireland', tenure: 9 },
      { name: 'Fatima Al-Hassan', title: 'COO', company: 'Elysium Group AG', country: 'UAE', tenure: 4 },
    ],
    totalRecords: 2_100_000,
  },
  {
    id: 'news-events',
    label: 'News & Events',
    icon: '📰',
    description: 'Corporate announcements, M&A activity, regulatory filings, and press releases',
    filters: [
      { key: 'geography', label: 'Geography', options: ['All Regions', 'North America', 'Europe', 'APAC', 'Middle East', 'Latin America'] },
      { key: 'companyType', label: 'Company Type', options: ['All Companies', 'Public', 'Private'] },
      { key: 'tier', label: 'Tier', options: ['All Tiers', 'Tier 1', 'Tier 2', 'Tier 3'] },
    ],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'company', label: 'Company' },
      { key: 'eventType', label: 'Event Type' },
      { key: 'headline', label: 'Headline' },
      { key: 'region', label: 'Region' },
    ],
    sampleRows: [
      { date: '2026-03-27', company: 'Meridian Holdings plc', eventType: 'M&A', headline: 'Meridian acquires FinTech startup Payvault', region: 'Europe' },
      { date: '2026-03-26', company: 'Atlas Industrial Corp', eventType: 'Earnings', headline: 'Q1 2026 revenue up 12% YoY', region: 'North America' },
      { date: '2026-03-25', company: 'Pinnacle Financial Group', eventType: 'Regulatory', headline: 'SEC filing: 10-K annual report submitted', region: 'North America' },
      { date: '2026-03-24', company: 'Northfield Energy plc', eventType: 'Partnership', headline: 'JV with SolarEdge for EU grid expansion', region: 'Europe' },
      { date: '2026-03-23', company: 'Crestview Technologies', eventType: 'Product', headline: 'Launches AI-powered analytics platform', region: 'North America' },
      { date: '2026-03-22', company: 'Hargrove Pharmaceuticals', eventType: 'Clinical', headline: 'Phase III trial results for HGV-201 positive', region: 'Europe' },
      { date: '2026-03-21', company: 'Broadmark Corp', eventType: 'Leadership', headline: 'Appoints new CTO from Google DeepMind', region: 'APAC' },
      { date: '2026-03-20', company: 'Sovereign Capital SA', eventType: 'M&A', headline: 'Acquires majority stake in Nordic RE fund', region: 'Europe' },
      { date: '2026-03-19', company: 'Elysium Group AG', eventType: 'Expansion', headline: 'Opens new regional HQ in Dubai', region: 'Middle East' },
      { date: '2026-03-18', company: 'Vanguard Shipping Ltd', eventType: 'Regulatory', headline: 'IMO 2026 compliance certification obtained', region: 'APAC' },
    ],
    totalRecords: 8_400_000,
  },
  {
    id: 'company-profile',
    label: 'Company Profile',
    icon: '📋',
    description: 'Core company attributes including name, address, financials, and industry classification',
    filters: [
      { key: 'geography', label: 'Geography', options: ['All Regions', 'North America', 'Europe', 'APAC', 'Middle East', 'Latin America'] },
      { key: 'companyType', label: 'Company Type', options: ['All Companies', 'Public', 'Private'] },
      { key: 'dataScope', label: 'Data Scope', options: ['Complete', 'Basic'] },
    ],
    columns: [
      { key: 'companyName', label: 'Company Name' },
      { key: 'country', label: 'Country' },
      { key: 'industry', label: 'Industry' },
      { key: 'type', label: 'Type' },
      { key: 'employees', label: 'Employees', align: 'right' },
      { key: 'revenue', label: 'Revenue', align: 'right' },
    ],
    sampleRows: [
      { companyName: 'Meridian Holdings plc', country: 'United Kingdom', industry: 'Financial Services', type: 'Public', employees: 12400, revenue: '$4.2B' },
      { companyName: 'Atlas Industrial Corp', country: 'United States', industry: 'Manufacturing', type: 'Public', employees: 34200, revenue: '$8.7B' },
      { companyName: 'Pinnacle Financial Group Inc', country: 'United States', industry: 'Insurance', type: 'Public', employees: 8700, revenue: '$3.1B' },
      { companyName: 'Northfield Energy plc', country: 'United Kingdom', industry: 'Energy', type: 'Public', employees: 15600, revenue: '$6.4B' },
      { companyName: 'Crestview Technologies Inc', country: 'Canada', industry: 'Technology', type: 'Private', employees: 4300, revenue: '$920M' },
      { companyName: 'Hargrove Pharmaceuticals Ltd', country: 'Ireland', industry: 'Pharmaceuticals', type: 'Public', employees: 21000, revenue: '$5.8B' },
      { companyName: 'Sovereign Capital SA', country: 'Switzerland', industry: 'Asset Management', type: 'Private', employees: 1200, revenue: '$480M' },
      { companyName: 'Broadmark Corp', country: 'Australia', industry: 'Technology', type: 'Public', employees: 6800, revenue: '$1.9B' },
      { companyName: 'Elysium Group AG', country: 'Switzerland', industry: 'Consulting', type: 'Private', employees: 3400, revenue: '$710M' },
      { companyName: 'Vanguard Shipping Ltd', country: 'Singapore', industry: 'Logistics', type: 'Public', employees: 9200, revenue: '$2.6B' },
    ],
    totalRecords: 98_700_000,
  },
];

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
