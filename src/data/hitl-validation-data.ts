export interface ValidationAttribute {
  name: string;
  extractedValue: string;
  currentValue: string;
  status: "validated" | "pending" | "flagged" | "edited";
  qcFlag: boolean;
  sourceRef: string;
}

export interface SourceData {
  url: string;
  type: "Website" | "PDF" | "API" | "Database";
  snippet: string;
  highlightedText: string;
}

export interface ValidationRecord {
  id: string;
  companyName: string;
  attributeType: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  completionPct: number;
  confidenceScore: number;
  source: string;
  lastUpdated: string;
  existingValue: string;
  suggestedValue: string;
  attributes: ValidationAttribute[];
  sources: SourceData[];
}

export interface AuditAction {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  recordRef: string;
}

export const auditTrail: AuditAction[] = [
  { id: "A1", user: "Sarah Chen", action: "Record Approved", timestamp: "2026-03-31 14:45", recordRef: "REC-10041" },
  { id: "A2", user: "James Miller", action: "Attribute Edited", timestamp: "2026-03-31 14:30", recordRef: "REC-10044" },
  { id: "A3", user: "Sarah Chen", action: "QC Flag Raised", timestamp: "2026-03-31 14:12", recordRef: "REC-10048" },
  { id: "A4", user: "Priya Sharma", action: "Record Rejected", timestamp: "2026-03-31 13:58", recordRef: "REC-10044" },
  { id: "A5", user: "James Miller", action: "Record Approved", timestamp: "2026-03-31 13:40", recordRef: "REC-10043" },
  { id: "A6", user: "Sarah Chen", action: "Attribute Edited", timestamp: "2026-03-31 13:15", recordRef: "REC-10046" },
  { id: "A7", user: "Priya Sharma", action: "Record Approved", timestamp: "2026-03-31 12:50", recordRef: "REC-10042" },
];

export const sampleRecords: ValidationRecord[] = [
  {
    id: "REC-10041",
    companyName: "Acme Corp",
    attributeType: "Financial",
    status: "in_review",
    completionPct: 72,
    confidenceScore: 87,
    source: "SEC EDGAR",
    lastUpdated: "2026-03-31 14:22",
    existingValue: "$4.0B",
    suggestedValue: "$4.2B",
    attributes: [
      { name: "Company Name", extractedValue: "Acme Corp", currentValue: "Acme Corp", status: "validated", qcFlag: false, sourceRef: "SEC EDGAR" },
      { name: "Website", extractedValue: "https://acmecorp.com", currentValue: "https://acmecorp.com", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Technology", currentValue: "Technology", status: "pending", qcFlag: false, sourceRef: "Bloomberg" },
      { name: "Revenue", extractedValue: "$4.2B", currentValue: "$4.2B", status: "flagged", qcFlag: true, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "12,450", currentValue: "12,450", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "San Francisco, CA", currentValue: "San Francisco, CA", status: "validated", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=ACME", type: "API", snippet: "Acme Corp (CIK: 0001234567) filed its annual report 10-K reporting total revenue of $4.2 billion for fiscal year 2025…", highlightedText: "total revenue of $4.2 billion" },
      { url: "https://acmecorp.com/about", type: "Website", snippet: "Founded in 1998, Acme Corp is headquartered in San Francisco, California. With over 12,000 employees worldwide…", highlightedText: "headquartered in San Francisco, California" },
    ],
  },
  {
    id: "REC-10042",
    companyName: "GlobalTech Inc",
    attributeType: "Contact",
    status: "pending",
    completionPct: 0,
    confidenceScore: 72,
    source: "NYSE",
    lastUpdated: "2026-03-31 09:15",
    existingValue: "New York, NY",
    suggestedValue: "New York City, NY",
    attributes: [
      { name: "Company Name", extractedValue: "GlobalTech Inc", currentValue: "GlobalTech Inc", status: "pending", qcFlag: false, sourceRef: "NYSE" },
      { name: "Website", extractedValue: "https://globaltech.io", currentValue: "https://globaltech.io", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Financial Services", currentValue: "Financial Services", status: "pending", qcFlag: false, sourceRef: "Reuters" },
      { name: "Revenue", extractedValue: "$890M", currentValue: "$890M", status: "pending", qcFlag: false, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "3,200", currentValue: "3,200", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?CIK=GLBT", type: "API", snippet: "GlobalTech Inc (CIK: 0009876543) annual report shows revenue of $890 million…", highlightedText: "revenue of $890 million" },
    ],
  },
  {
    id: "REC-10043",
    companyName: "Northern Resources Ltd",
    attributeType: "Corporate",
    status: "approved",
    completionPct: 100,
    confidenceScore: 95,
    source: "SEDAR+",
    lastUpdated: "2026-03-30 16:40",
    existingValue: "CAD $1.0B",
    suggestedValue: "CAD $1.1B",
    attributes: [
      { name: "Company Name", extractedValue: "Northern Resources Ltd", currentValue: "Northern Resources Ltd", status: "validated", qcFlag: false, sourceRef: "SEDAR+" },
      { name: "Industry", extractedValue: "Mining & Resources", currentValue: "Mining & Resources", status: "validated", qcFlag: false, sourceRef: "SEDAR+" },
      { name: "Revenue", extractedValue: "CAD $1.1B", currentValue: "CAD $1.1B", status: "validated", qcFlag: false, sourceRef: "SEDAR+ Filing" },
      { name: "Employee Count", extractedValue: "5,800", currentValue: "5,800", status: "validated", qcFlag: false, sourceRef: "LinkedIn" },
    ],
    sources: [
      { url: "https://sedarplus.ca/filings/northern-resources", type: "PDF", snippet: "Northern Resources Ltd — Annual Information Form 2025. Revenue: CAD $1.1 billion…", highlightedText: "Revenue: CAD $1.1 billion" },
    ],
  },
  {
    id: "REC-10044",
    companyName: "Pacific Holdings",
    attributeType: "Financial",
    status: "rejected",
    completionPct: 45,
    confidenceScore: 54,
    source: "FactSet",
    lastUpdated: "2026-03-30 11:08",
    existingValue: "Pacific Holdings Inc",
    suggestedValue: "Pacific Holdings LLC",
    attributes: [
      { name: "Company Name", extractedValue: "Pacific Holdings LLC", currentValue: "Pacific Holdings LLC", status: "flagged", qcFlag: true, sourceRef: "U.S. SOS" },
      { name: "Industry", extractedValue: "Real Estate", currentValue: "Real Estate", status: "pending", qcFlag: false, sourceRef: "D&B" },
      { name: "Revenue", extractedValue: "$320M", currentValue: "$320M", status: "flagged", qcFlag: true, sourceRef: "FactSet" },
      { name: "HQ Location", extractedValue: "Los Angeles, CA", currentValue: "Los Angeles, CA", status: "edited", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://factset.com/company/pacific-holdings", type: "Database", snippet: "Pacific Holdings LLC | Revenue: $320M (est.) | Sector: Real Estate…", highlightedText: "Revenue: $320M" },
    ],
  },
  {
    id: "REC-10045",
    companyName: "Zenith Retail Group",
    attributeType: "Contact",
    status: "pending",
    completionPct: 0,
    confidenceScore: 68,
    source: "Companies House",
    lastUpdated: "2026-03-31 08:00",
    existingValue: "Consumer Goods",
    suggestedValue: "Consumer Retail",
    attributes: [
      { name: "Company Name", extractedValue: "Zenith Retail Group", currentValue: "Zenith Retail Group", status: "pending", qcFlag: false, sourceRef: "Companies House" },
      { name: "Industry", extractedValue: "Consumer Retail", currentValue: "Consumer Retail", status: "pending", qcFlag: true, sourceRef: "Orbis" },
      { name: "Revenue", extractedValue: "£240M", currentValue: "£240M", status: "pending", qcFlag: false, sourceRef: "Companies House" },
      { name: "HQ Location", extractedValue: "London, UK", currentValue: "London, UK", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://beta.companieshouse.gov.uk/company/zenith-retail", type: "API", snippet: "Zenith Retail Group PLC — Annual turnover: £240M…", highlightedText: "Annual turnover: £240M" },
    ],
  },
  {
    id: "REC-10046",
    companyName: "Maple Finance Co",
    attributeType: "Financial",
    status: "in_review",
    completionPct: 50,
    confidenceScore: 81,
    source: "FDIC",
    lastUpdated: "2026-03-31 13:55",
    existingValue: "$540M",
    suggestedValue: "$560M",
    attributes: [
      { name: "Company Name", extractedValue: "Maple Finance Co", currentValue: "Maple Finance Co", status: "validated", qcFlag: false, sourceRef: "FDIC" },
      { name: "Industry", extractedValue: "Banking", currentValue: "Banking", status: "validated", qcFlag: false, sourceRef: "FDIC" },
      { name: "Revenue", extractedValue: "$560M", currentValue: "$560M", status: "pending", qcFlag: false, sourceRef: "FFIEC" },
      { name: "Employee Count", extractedValue: "2,100", currentValue: "2,100", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
    ],
    sources: [
      { url: "https://fdic.gov/institution/maple-finance", type: "Database", snippet: "Maple Finance Co — FDIC Certificate #12345. Total Assets: $8.2B. HQ: Chicago, IL…", highlightedText: "HQ: Chicago, IL" },
    ],
  },
  {
    id: "REC-10047",
    companyName: "SilverLine Media",
    attributeType: "Corporate",
    status: "pending",
    completionPct: 0,
    confidenceScore: 63,
    source: "D&B",
    lastUpdated: "2026-03-31 07:30",
    existingValue: "SilverLine Media Corp",
    suggestedValue: "SilverLine Media Inc",
    attributes: [
      { name: "Company Name", extractedValue: "SilverLine Media Inc", currentValue: "SilverLine Media Inc", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Media & Entertainment", currentValue: "Media & Entertainment", status: "pending", qcFlag: false, sourceRef: "D&B" },
      { name: "Revenue", extractedValue: "$78M", currentValue: "$78M", status: "pending", qcFlag: false, sourceRef: "D&B" },
    ],
    sources: [
      { url: "https://silverlinemedia.com/about", type: "Website", snippet: "SilverLine Media Inc — digital-first media company headquartered in Austin, Texas…", highlightedText: "headquartered in Austin, Texas" },
    ],
  },
  {
    id: "REC-10048",
    companyName: "TechFlow Solutions",
    attributeType: "Financial",
    status: "in_review",
    completionPct: 30,
    confidenceScore: 76,
    source: "SEC EDGAR",
    lastUpdated: "2026-03-31 12:10",
    existingValue: "$1.6B",
    suggestedValue: "$1.8B",
    attributes: [
      { name: "Company Name", extractedValue: "TechFlow Solutions", currentValue: "TechFlow Solutions", status: "validated", qcFlag: false, sourceRef: "SEC EDGAR" },
      { name: "Industry", extractedValue: "Cloud Computing", currentValue: "Cloud Computing", status: "pending", qcFlag: false, sourceRef: "FactSet" },
      { name: "Revenue", extractedValue: "$1.8B", currentValue: "$1.8B", status: "flagged", qcFlag: true, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "8,900", currentValue: "8,900", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?CIK=TFLW", type: "API", snippet: "TechFlow Solutions Inc — Latest 10-K filing. Revenue: $1.8 billion…", highlightedText: "Revenue: $1.8 billion" },
    ],
  },
];
