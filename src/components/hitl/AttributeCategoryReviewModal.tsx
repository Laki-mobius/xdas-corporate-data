import { useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type AttributeCategory } from "@/data/attribute-category-data";
import { toast } from "sonner";

interface CategoryRecord {
  id: string;
  companyName: string;
  oldValue: string;
  newValue: string;
  confidence: number;
  source: string;
  sourceUrl: string;
}

interface Props {
  category: AttributeCategory;
  onClose: () => void;
}

const sources = [
  { name: "SEC Filing", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany" },
  { name: "Company Registry", url: "https://www.gleif.org/en/lei/search" },
  { name: "GLEIF Database", url: "https://search.gleif.org" },
  { name: "News Feed", url: "https://finance.yahoo.com" },
  { name: "Stock Exchange", url: "https://www.nyse.com/listings" },
  { name: "Annual Report", url: "https://www.annualreports.com" },
];

const companyNames: Record<string, [string, string][]> = {
  "Full Company Name": [
    ["Berkshire Hathway Inc.", "Berkshire Hathaway Inc."],
    ["Apple Incorp.", "Apple Inc."],
    ["JP Morgan Chase Co", "JPMorgan Chase & Co."],
    ["Goldman Sachs Grp", "Goldman Sachs Group Inc."],
    ["Microsft Corporation", "Microsoft Corp."],
    ["Amazon.com Incorporated", "Amazon.com Inc."],
    ["Tsla Inc.", "Tesla Inc."],
    ["Meta Platfroms Inc", "Meta Platforms Inc."],
    ["Alphbet Inc.", "Alphabet Inc."],
    ["Jonson & Johnson", "Johnson & Johnson"],
    ["Procter and Gamble", "Procter & Gamble Co."],
    ["Exxon Mobil Corp", "ExxonMobil Corp."],
    ["Visa Incorporated", "Visa Inc."],
    ["Master Card Inc.", "Mastercard Inc."],
    ["Walt Dysney Co.", "Walt Disney Co."],
    ["Intl Corp.", "Intel Corp."],
    ["Cisko Systems Inc", "Cisco Systems Inc."],
    ["Pfzer Inc.", "Pfizer Inc."],
    ["Cocacola Co.", "Coca-Cola Co."],
    ["Pepsi Co Inc", "PepsiCo Inc."],
    ["Netflix Incorp.", "Netflix Inc."],
    ["Adobe Systms Inc", "Adobe Systems Inc."],
    ["Salesforce.com Inc", "Salesforce Inc."],
    ["Oracle Corpration", "Oracle Corp."],
    ["NVIDIA Corportion", "NVIDIA Corp."],
    ["PayPal Holdngs Inc", "PayPal Holdings Inc."],
    ["Uber Technolgies", "Uber Technologies Inc."],
    ["Airbnb Incorp.", "Airbnb Inc."],
    ["Snowflake Comp.", "Snowflake Inc."],
    ["Shopify Incorp.", "Shopify Inc."],
  ],
};

const generateRecords = (cat: AttributeCategory): CategoryRecord[] => {
  const pairs = companyNames["Full Company Name"] || [];
  const subAttrs = cat.subAttributes.split(" · ");
  const count = Math.max(Math.min(cat.totalChanges, 30), 15);

  return Array.from({ length: count }, (_, i) => {
    const src = sources[i % sources.length];
    const pair = pairs[i % pairs.length];
    const attr = subAttrs[i % subAttrs.length];
    const isNameCategory = cat.name.toLowerCase().includes("name") || cat.name.toLowerCase().includes("company");

    return {
      id: `${cat.id}-R${String(i + 1).padStart(3, "0")}`,
      companyName: isNameCategory ? pair[1] : pair[1],
      oldValue: isNameCategory ? pair[0] : `Previous ${attr} #${i + 1}`,
      newValue: isNameCategory ? pair[1] : `Updated ${attr} #${i + 1}`,
      confidence: Math.round(60 + Math.random() * 35),
      source: src.name,
      sourceUrl: src.url,
    };
  });
};

const PAGE_SIZE = 15;

export default function AttributeCategoryReviewModal({ category, onClose }: Props) {
  const [records] = useState(() => generateRecords(category));
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>("");
  const [activeSourceName, setActiveSourceName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const paginatedRecords = useMemo(
    () => records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [records, currentPage]
  );

  const handleRecordClick = (rec: CategoryRecord) => {
    setSelectedRecordId(rec.id);
    setActiveSourceUrl(rec.sourceUrl);
    setActiveSourceName(rec.source);
  };

  const handleSourceClick = (src: { name: string; url: string }) => {
    setActiveSourceUrl(src.url);
    setActiveSourceName(src.name);
  };

  const handleSubmit = () => {
    toast.success(`${records.length} records submitted for ${category.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-[13px] font-semibold text-foreground">{category.name}</span>
            <span className="text-[11px] text-muted-foreground ml-2">Records: {records.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-muted-foreground">Category: <span className="font-semibold text-foreground">{category.group}</span></span>
          <span className="text-muted-foreground">Severity: <span className={cn("font-semibold", category.severity === "CRITICAL" ? "text-destructive" : category.severity === "HIGH" ? "text-status-amber" : "text-brand")}>{category.severity}</span></span>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Sources + Webpage */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          {/* Source list bar */}
          <div className="px-3 py-1.5 border-b border-border bg-muted/30">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Workflow Sources</div>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((src) => (
                <button
                  key={src.name}
                  onClick={() => handleSourceClick(src)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] rounded border transition-colors",
                    activeSourceName === src.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {src.name}
                </button>
              ))}
            </div>
          </div>

          {/* URL bar */}
          <div className="px-3 py-1.5 border-b border-border bg-muted/10 flex items-center gap-2">
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground truncate flex-1">
              {activeSourceUrl || "Click a source or company to load webpage"}
            </span>
            {activeSourceUrl && (
              <a href={activeSourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline shrink-0">
                Open ↗
              </a>
            )}
          </div>

          {/* Iframe */}
          <div className="flex-1 overflow-hidden">
            {activeSourceUrl ? (
              <iframe
                src={activeSourceUrl}
                title="Source page"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">Select a company or source to load the webpage</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RHS: Excel-style spreadsheet */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Title bar */}
          <div className="px-3 py-1.5 border-b border-border bg-primary/10 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-foreground">{category.name} — Records for Review</span>
            <span className="text-[10px] text-muted-foreground">
              Page {currentPage} of {totalPages} · {records.length} total records
            </span>
          </div>

          {/* Excel-style table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground border-r border-border/50 w-[36px]">#</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground border-r border-border/50">Company Name</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground border-r border-border/50">Previous Value</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground border-r border-border/50">Current Value</th>
                  <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground w-[80px]">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    onClick={() => handleRecordClick(rec)}
                    className={cn(
                      "border-b border-border/40 cursor-pointer transition-colors hover:bg-accent/30",
                      selectedRecordId === rec.id && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground border-r border-border/30 text-center">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-2 py-1.5 font-medium text-foreground border-r border-border/30">
                      <span className="hover:text-primary hover:underline cursor-pointer">{rec.companyName}</span>
                    </td>
                    <td className="px-2 py-1.5 text-destructive/80 border-r border-border/30 truncate max-w-[160px] line-through decoration-destructive/30">
                      {rec.oldValue}
                    </td>
                    <td className="px-2 py-1.5 text-brand font-medium border-r border-border/30 truncate max-w-[160px]">
                      {rec.newValue}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={cn(
                        "text-[10px] font-bold",
                        rec.confidence >= 80 ? "text-brand" : rec.confidence >= 60 ? "text-status-amber" : "text-destructive"
                      )}>
                        {rec.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination + submit */}
          <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "w-6 h-6 rounded text-[10px] font-medium transition-colors",
                    p === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              className="px-6 py-1.5 text-[12px] font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
