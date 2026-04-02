import { useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, Edit3, CheckCircle2, Flag, Settings, MoreVertical } from "lucide-react";
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

const generateRecords = (cat: AttributeCategory): CategoryRecord[] => {
  const companies = [
    "Berkshire Hathaway Inc.", "Apple Inc.", "JPMorgan Chase & Co.", "Goldman Sachs Group",
    "Microsoft Corp.", "Amazon.com Inc.", "Tesla Inc.", "Meta Platforms Inc.",
    "Alphabet Inc.", "Johnson & Johnson", "Procter & Gamble Co.", "ExxonMobil Corp.",
    "Visa Inc.", "Mastercard Inc.", "Walt Disney Co.", "Intel Corp.",
    "Cisco Systems Inc.", "Pfizer Inc.", "Coca-Cola Co.", "PepsiCo Inc.",
  ];
  const sources = [
    { name: "SEC Filing", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany" },
    { name: "Company Registry", url: "https://www.gleif.org/en/lei/search" },
    { name: "GLEIF Database", url: "https://search.gleif.org" },
    { name: "News Feed", url: "https://finance.yahoo.com" },
    { name: "Stock Exchange", url: "https://www.nyse.com/listings" },
    { name: "Annual Report", url: "https://www.annualreports.com" },
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

const statusStyles: Record<string, string> = {
  pending: "bg-status-amber-light text-status-amber",
  approved: "bg-brand-light text-brand",
  rejected: "bg-destructive/10 text-destructive",
  edited: "bg-status-blue-light text-status-blue",
};

export default function AttributeCategoryReviewModal({ category, onClose }: Props) {
  const [records, setRecords] = useState(() => generateRecords(category));
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>("");

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  const handleSourceClick = (url: string) => {
    setActiveSourceUrl(url);
  };

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
  };

  const handleReject = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const } : r));
  };

  const stats = useMemo(() => ({
    total: records.length,
    pending: records.filter(r => r.status === "pending").length,
    approved: records.filter(r => r.status === "approved").length,
    rejected: records.filter(r => r.status === "rejected").length,
  }), [records]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-[13px] font-semibold text-foreground">{category.name}</span>
            <span className="text-[11px] text-muted-foreground ml-2">{category.subAttributes}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{stats.total}</span></span>
          <span className="text-muted-foreground">Pending: <span className="font-semibold text-status-amber">{stats.pending}</span></span>
          <span className="text-muted-foreground">Approved: <span className="font-semibold text-brand">{stats.approved}</span></span>
          <span className="text-muted-foreground">Rejected: <span className="font-semibold text-destructive">{stats.rejected}</span></span>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Source Webpage */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate flex-1">
              {activeSourceUrl || "Click a source link to load webpage"}
            </span>
            {activeSourceUrl && (
              <a href={activeSourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-status-blue hover:underline shrink-0">
                Open in new tab
              </a>
            )}
          </div>
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
                  <ExternalLink className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">Select a record and click its source to load the webpage</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RHS: Records list */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
              Records — {category.name}
            </span>
            <span className="text-[10px] text-muted-foreground ml-2">
              {records.length} of {category.totalChanges.toLocaleString()} records shown
            </span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_70px_80px_90px] gap-1 px-3 py-1.5 border-b border-border text-[9px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/10">
            <div>#</div>
            <div>Company</div>
            <div>Previous Value</div>
            <div>New Value</div>
            <div className="text-center">Conf.</div>
            <div>Source</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Scrollable records */}
          <div className="flex-1 overflow-y-auto">
            {records.map((rec, idx) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecordId(rec.id)}
                className={cn(
                  "grid grid-cols-[40px_1fr_1fr_1fr_70px_80px_90px] gap-1 px-3 py-2 border-b border-border/50 cursor-pointer transition-colors hover:bg-surface/50 items-center",
                  selectedRecordId === rec.id && "bg-brand-light"
                )}
              >
                <div className="text-[10px] text-muted-foreground">{idx + 1}</div>
                <div className="text-[11px] font-medium text-foreground truncate">{rec.companyName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{rec.oldValue}</div>
                <div className="text-[11px] text-foreground truncate font-medium">{rec.newValue}</div>
                <div className="text-center">
                  <span className={cn(
                    "text-[10px] font-semibold",
                    rec.confidence >= 80 ? "text-brand" : rec.confidence >= 60 ? "text-status-amber" : "text-destructive"
                  )}>
                    {rec.confidence}%
                  </span>
                </div>
                <div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSourceClick(rec.sourceUrl); }}
                    className="text-[10px] text-status-blue hover:underline truncate"
                  >
                    {rec.source}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {rec.status === "pending" ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(rec.id); }}
                        className="px-1.5 py-0.5 text-[9px] font-medium bg-primary text-primary-foreground rounded hover:bg-primary-dark transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(rec.id); }}
                        className="px-1.5 py-0.5 text-[9px] font-medium bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", statusStyles[rec.status])}>
                      {rec.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
