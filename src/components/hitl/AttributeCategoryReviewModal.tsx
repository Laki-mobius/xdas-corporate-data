import { useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { type AttributeCategory } from "@/data/attribute-category-data";

interface CategoryRecord {
  id: string;
  companyName: string;
  oldValue: string;
  newValue: string;
  confidence: number;
  source: string;
  sourceUrl: string;
  status: "pending" | "approved" | "rejected" | "edited";
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

const generateRecords = (cat: AttributeCategory): CategoryRecord[] => {
  const companies = [
    "Berkshire Hathaway Inc.", "Apple Inc.", "JPMorgan Chase & Co.", "Goldman Sachs Group",
    "Microsoft Corp.", "Amazon.com Inc.", "Tesla Inc.", "Meta Platforms Inc.",
    "Alphabet Inc.", "Johnson & Johnson", "Procter & Gamble Co.", "ExxonMobil Corp.",
    "Visa Inc.", "Mastercard Inc.", "Walt Disney Co.", "Intel Corp.",
    "Cisco Systems Inc.", "Pfizer Inc.", "Coca-Cola Co.", "PepsiCo Inc.",
  ];
  const subAttrs = cat.subAttributes.split(" · ");
  const count = Math.min(cat.totalChanges, 20);
  return Array.from({ length: count }, (_, i) => {
    const src = sources[i % sources.length];
    const attr = subAttrs[i % subAttrs.length];
    return {
      id: `${cat.id}-R${String(i + 1).padStart(3, "0")}`,
      companyName: companies[i % companies.length],
      oldValue: `Previous ${attr} #${i + 1}`,
      newValue: `Updated ${attr} #${i + 1}`,
      confidence: Math.round(60 + Math.random() * 35),
      source: src.name,
      sourceUrl: src.url,
      status: "pending" as const,
    };
  });
};

export default function AttributeCategoryReviewModal({ category, onClose }: Props) {
  const [records, setRecords] = useState(() => generateRecords(category));
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>("");
  const [activeSourceName, setActiveSourceName] = useState<string>("");

  const handleRecordClick = (rec: CategoryRecord) => {
    setSelectedRecordId(rec.id);
    setActiveSourceUrl(rec.sourceUrl);
    setActiveSourceName(rec.source);
  };

  const handleSourceClick = (src: { name: string; url: string }) => {
    setActiveSourceUrl(src.url);
    setActiveSourceName(src.name);
  };

  const stats = useMemo(() => ({
    total: records.length,
    pending: records.filter(r => r.status === "pending").length,
    approved: records.filter(r => r.status === "approved").length,
    rejected: records.filter(r => r.status === "rejected").length,
  }), [records]);

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
  };

  const handleReject = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const } : r));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
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
            <span className="text-[11px] text-muted-foreground ml-2">Instance Count: {stats.total}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-muted-foreground">Pending: <span className="font-semibold text-status-amber">{stats.pending}</span></span>
          <span className="text-muted-foreground">Approved: <span className="font-semibold text-brand">{stats.approved}</span></span>
          <span className="text-muted-foreground">Rejected: <span className="font-semibold text-destructive">{stats.rejected}</span></span>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Sources list + Webpage */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          {/* Source list bar */}
          <div className="px-3 py-1.5 border-b border-border bg-muted/30">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sources</div>
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
              <a href={activeSourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-status-blue hover:underline shrink-0">
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
            <span className="text-[12px] font-semibold text-foreground">{category.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {records.length} of {category.totalChanges.toLocaleString()} records
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
                  <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground border-r border-border/50 w-[70px]">Confidence</th>
                  <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    onClick={() => handleRecordClick(rec)}
                    className={cn(
                      "border-b border-border/40 cursor-pointer transition-colors hover:bg-accent/30",
                      selectedRecordId === rec.id && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground border-r border-border/30 text-center">{idx + 1}</td>
                    <td className="px-2 py-1.5 font-medium text-foreground border-r border-border/30">
                      <span className="hover:text-primary hover:underline cursor-pointer">{rec.companyName}</span>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground border-r border-border/30 truncate max-w-[160px]">{rec.oldValue}</td>
                    <td className="px-2 py-1.5 text-foreground font-medium border-r border-border/30 truncate max-w-[160px]">{rec.newValue}</td>
                    <td className="px-2 py-1.5 text-center border-r border-border/30">
                      <span className={cn(
                        "text-[10px] font-bold",
                        rec.confidence >= 80 ? "text-brand" : rec.confidence >= 60 ? "text-status-amber" : "text-destructive"
                      )}>
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {rec.status === "pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(rec.id); }}
                            className="px-1.5 py-0.5 text-[9px] font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(rec.id); }}
                            className="px-1.5 py-0.5 text-[9px] font-medium bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-colors"
                          >
                            ✗
                          </button>
                          <Eye className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                      ) : (
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                          rec.status === "approved" ? "bg-brand-light text-brand" : "bg-destructive/10 text-destructive"
                        )}>
                          {rec.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1 text-[11px] font-semibold bg-primary text-primary-foreground rounded hover:opacity-90 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
