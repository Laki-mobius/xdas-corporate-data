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
  status: "pending" | "in_review" | "approved" | "rejected";
  completionPct: number;
  lastUpdated: string;
  attributes: ValidationAttribute[];
  sources: SourceData[];
}

export const sampleRecords: ValidationRecord[] = [
  {
    id: "REC-10041",
    companyName: "Acme Corp",
    status: "in_review",
    completionPct: 72,
    lastUpdated: "2026-03-31 14:22",
    attributes: [
      { name: "Company Name", extractedValue: "Acme Corp", currentValue: "Acme Corp", status: "validated", qcFlag: false, sourceRef: "SEC EDGAR" },
      { name: "Website", extractedValue: "https://acmecorp.com", currentValue: "https://acmecorp.com", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Technology", currentValue: "Technology", status: "pending", qcFlag: false, sourceRef: "Bloomberg" },
      { name: "Revenue", extractedValue: "$4.2B", currentValue: "$4.2B", status: "flagged", qcFlag: true, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "12,450", currentValue: "12,450", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "San Francisco, CA", currentValue: "San Francisco, CA", status: "validated", qcFlag: false, sourceRef: "Company Website" },
      { name: "Contact Email", extractedValue: "info@acmecorp.com", currentValue: "info@acmecorp.com", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Phone Number", extractedValue: "+1-415-555-0142", currentValue: "+1-415-555-0142", status: "pending", qcFlag: false, sourceRef: "Company Website" },
      { name: "Founded Year", extractedValue: "1998", currentValue: "1998", status: "validated", qcFlag: false, sourceRef: "SEC EDGAR" },
      { name: "Legal Entity Type", extractedValue: "Corporation", currentValue: "Corporation", status: "pending", qcFlag: false, sourceRef: "U.S. SOS" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=ACME", type: "API", snippet: "Acme Corp (CIK: 0001234567) filed its annual report 10-K on 2026-02-15 reporting total revenue of $4.2 billion for fiscal year 2025…", highlightedText: "total revenue of $4.2 billion" },
      { url: "https://acmecorp.com/about", type: "Website", snippet: "Founded in 1998, Acme Corp is headquartered in San Francisco, California. With over 12,000 employees worldwide, we deliver innovative technology solutions…", highlightedText: "headquartered in San Francisco, California" },
      { url: "https://bloomberg.com/profile/acme", type: "Database", snippet: "Acme Corp | Industry: Technology | Sector: Software & Services | Market Cap: $18.7B | Employees: 12,450…", highlightedText: "Industry: Technology" },
    ],
  },
  {
    id: "REC-10042",
    companyName: "GlobalTech Inc",
    status: "pending",
    completionPct: 0,
    lastUpdated: "2026-03-31 09:15",
    attributes: [
      { name: "Company Name", extractedValue: "GlobalTech Inc", currentValue: "GlobalTech Inc", status: "pending", qcFlag: false, sourceRef: "NYSE" },
      { name: "Website", extractedValue: "https://globaltech.io", currentValue: "https://globaltech.io", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Financial Services", currentValue: "Financial Services", status: "pending", qcFlag: false, sourceRef: "Reuters" },
      { name: "Revenue", extractedValue: "$890M", currentValue: "$890M", status: "pending", qcFlag: false, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "3,200", currentValue: "3,200", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "New York, NY", currentValue: "New York, NY", status: "pending", qcFlag: false, sourceRef: "Company Website" },
      { name: "Contact Email", extractedValue: "contact@globaltech.io", currentValue: "contact@globaltech.io", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Phone Number", extractedValue: "+1-212-555-0198", currentValue: "+1-212-555-0198", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?CIK=GLBT", type: "API", snippet: "GlobalTech Inc (CIK: 0009876543) annual report shows revenue of $890 million…", highlightedText: "revenue of $890 million" },
      { url: "https://globaltech.io/about", type: "Website", snippet: "GlobalTech Inc is a leading financial services technology provider based in New York City…", highlightedText: "based in New York City" },
    ],
  },
  {
    id: "REC-10043",
    companyName: "Northern Resources Ltd",
    status: "approved",
    completionPct: 100,
    lastUpdated: "2026-03-30 16:40",
    attributes: [
      { name: "Company Name", extractedValue: "Northern Resources Ltd", currentValue: "Northern Resources Ltd", status: "validated", qcFlag: false, sourceRef: "SEDAR+" },
      { name: "Website", extractedValue: "https://northernresources.ca", currentValue: "https://northernresources.ca", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Mining & Resources", currentValue: "Mining & Resources", status: "validated", qcFlag: false, sourceRef: "SEDAR+" },
      { name: "Revenue", extractedValue: "CAD $1.1B", currentValue: "CAD $1.1B", status: "validated", qcFlag: false, sourceRef: "SEDAR+ Filing" },
      { name: "Employee Count", extractedValue: "5,800", currentValue: "5,800", status: "validated", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "Toronto, ON", currentValue: "Toronto, ON", status: "validated", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://sedarplus.ca/filings/northern-resources", type: "PDF", snippet: "Northern Resources Ltd — Annual Information Form 2025. Revenue: CAD $1.1 billion. Headquarters: Toronto, Ontario…", highlightedText: "Revenue: CAD $1.1 billion" },
    ],
  },
  {
    id: "REC-10044",
    companyName: "Pacific Holdings",
    status: "rejected",
    completionPct: 45,
    lastUpdated: "2026-03-30 11:08",
    attributes: [
      { name: "Company Name", extractedValue: "Pacific Holdings LLC", currentValue: "Pacific Holdings LLC", status: "flagged", qcFlag: true, sourceRef: "U.S. SOS" },
      { name: "Website", extractedValue: "https://pacificholdings.com", currentValue: "https://pacificholdings.com", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Real Estate", currentValue: "Real Estate", status: "pending", qcFlag: false, sourceRef: "D&B" },
      { name: "Revenue", extractedValue: "$320M", currentValue: "$320M", status: "flagged", qcFlag: true, sourceRef: "FactSet" },
      { name: "Employee Count", extractedValue: "1,100", currentValue: "1,100", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "Los Angeles, CA", currentValue: "Los Angeles, CA", status: "edited", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://factset.com/company/pacific-holdings", type: "Database", snippet: "Pacific Holdings LLC | Revenue: $320M (est.) | Sector: Real Estate Investment…", highlightedText: "Revenue: $320M" },
      { url: "https://pacificholdings.com/contact", type: "Website", snippet: "Pacific Holdings — 1234 Wilshire Blvd, Los Angeles, CA 90017…", highlightedText: "Los Angeles, CA 90017" },
    ],
  },
  {
    id: "REC-10045",
    companyName: "Zenith Retail Group",
    status: "pending",
    completionPct: 0,
    lastUpdated: "2026-03-31 08:00",
    attributes: [
      { name: "Company Name", extractedValue: "Zenith Retail Group", currentValue: "Zenith Retail Group", status: "pending", qcFlag: false, sourceRef: "Companies House" },
      { name: "Website", extractedValue: "https://zenithretail.co.uk", currentValue: "https://zenithretail.co.uk", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Consumer Retail", currentValue: "Consumer Retail", status: "pending", qcFlag: true, sourceRef: "Orbis" },
      { name: "Revenue", extractedValue: "£240M", currentValue: "£240M", status: "pending", qcFlag: false, sourceRef: "Companies House" },
      { name: "Employee Count", extractedValue: "4,500", currentValue: "4,500", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "London, UK", currentValue: "London, UK", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://beta.companieshouse.gov.uk/company/zenith-retail", type: "API", snippet: "Zenith Retail Group PLC — Registered in England & Wales. Annual turnover: £240M…", highlightedText: "Annual turnover: £240M" },
    ],
  },
  {
    id: "REC-10046",
    companyName: "Maple Finance Co",
    status: "in_review",
    completionPct: 50,
    lastUpdated: "2026-03-31 13:55",
    attributes: [
      { name: "Company Name", extractedValue: "Maple Finance Co", currentValue: "Maple Finance Co", status: "validated", qcFlag: false, sourceRef: "FDIC" },
      { name: "Website", extractedValue: "https://maplefinance.com", currentValue: "https://maplefinance.com", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Banking", currentValue: "Banking", status: "validated", qcFlag: false, sourceRef: "FDIC" },
      { name: "Revenue", extractedValue: "$560M", currentValue: "$560M", status: "pending", qcFlag: false, sourceRef: "FFIEC" },
      { name: "Employee Count", extractedValue: "2,100", currentValue: "2,100", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "Chicago, IL", currentValue: "Chicago, IL", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://fdic.gov/institution/maple-finance", type: "Database", snippet: "Maple Finance Co — FDIC Certificate #12345. Total Assets: $8.2B. HQ: Chicago, IL…", highlightedText: "HQ: Chicago, IL" },
    ],
  },
  {
    id: "REC-10047",
    companyName: "SilverLine Media",
    status: "pending",
    completionPct: 0,
    lastUpdated: "2026-03-31 07:30",
    attributes: [
      { name: "Company Name", extractedValue: "SilverLine Media Inc", currentValue: "SilverLine Media Inc", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Website", extractedValue: "https://silverlinemedia.com", currentValue: "https://silverlinemedia.com", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Media & Entertainment", currentValue: "Media & Entertainment", status: "pending", qcFlag: false, sourceRef: "D&B" },
      { name: "Revenue", extractedValue: "$78M", currentValue: "$78M", status: "pending", qcFlag: false, sourceRef: "D&B" },
      { name: "Employee Count", extractedValue: "620", currentValue: "620", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "Austin, TX", currentValue: "Austin, TX", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://silverlinemedia.com/about", type: "Website", snippet: "SilverLine Media Inc — a digital-first media company headquartered in Austin, Texas…", highlightedText: "headquartered in Austin, Texas" },
    ],
  },
  {
    id: "REC-10048",
    companyName: "TechFlow Solutions",
    status: "in_review",
    completionPct: 30,
    lastUpdated: "2026-03-31 12:10",
    attributes: [
      { name: "Company Name", extractedValue: "TechFlow Solutions", currentValue: "TechFlow Solutions", status: "validated", qcFlag: false, sourceRef: "SEC EDGAR" },
      { name: "Website", extractedValue: "https://techflow.io", currentValue: "https://techflow.io", status: "validated", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Industry", extractedValue: "Cloud Computing", currentValue: "Cloud Computing", status: "pending", qcFlag: false, sourceRef: "FactSet" },
      { name: "Revenue", extractedValue: "$1.8B", currentValue: "$1.8B", status: "flagged", qcFlag: true, sourceRef: "SEC EDGAR 10-K" },
      { name: "Employee Count", extractedValue: "8,900", currentValue: "8,900", status: "pending", qcFlag: false, sourceRef: "LinkedIn" },
      { name: "HQ Location", extractedValue: "Seattle, WA", currentValue: "Seattle, WA", status: "pending", qcFlag: false, sourceRef: "Company Website" },
      { name: "Contact Email", extractedValue: "hello@techflow.io", currentValue: "hello@techflow.io", status: "pending", qcFlag: false, sourceRef: "Web Crawl" },
      { name: "Phone Number", extractedValue: "+1-206-555-0177", currentValue: "+1-206-555-0177", status: "pending", qcFlag: false, sourceRef: "Company Website" },
    ],
    sources: [
      { url: "https://www.sec.gov/cgi-bin/browse-edgar?CIK=TFLW", type: "API", snippet: "TechFlow Solutions Inc (CIK: 0005554321) — Latest 10-K filing dated 2026-01-31. Revenue: $1.8 billion…", highlightedText: "Revenue: $1.8 billion" },
      { url: "https://techflow.io/company", type: "Website", snippet: "TechFlow Solutions — Enterprise cloud computing platform. Headquarters: Seattle, Washington. 8,900+ employees…", highlightedText: "Headquarters: Seattle, Washington" },
    ],
  },
];
