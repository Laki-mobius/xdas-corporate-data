import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { categorizeAttributes } from "@/data/workflow-attributes";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Edit3, CheckCircle2, AlertTriangle, Settings, MoreVertical, X, Filter } from "lucide-react";
import { useState, useMemo } from "react";

interface RecordReviewViewProps {
  record: ValidationRecord;
  records?: ValidationRecord[];
  onClose: () => void;
  onUpdateAttribute: (recordId: string, attrIndex: number, attr: ValidationAttribute) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNavigate?: (id: string) => void;
}

const getConfidenceScore = (attr: ValidationAttribute): number => {
  switch (attr.status) {
    case "validated": return 96;
    case "edited": return 98;
    case "flagged": return 50;
    default: {
      const val = attr.currentValue || attr.extractedValue || "";
      if (val && val !== "N/A" && val !== "" && val.length > 1) return 85;
      return 52;
    }
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 90) return "text-brand";
  if (score >= 70) return "text-status-blue";
  if (score >= 60) return "text-status-amber";
  return "text-destructive";
};

type ConfidenceFilter = "all" | "high" | "medium" | "low";

const confidenceFilterOptions: { value: ConfidenceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High (90%+)" },
  { value: "medium", label: "Medium (51 - 80%)" },
  { value: "low", label: "Low (0 - 50%)" },
];

const filterByConfidence = (attrs: ValidationAttribute[], filter: ConfidenceFilter) => {
  if (filter === "all") return attrs;
  return attrs.filter(a => {
    const s = getConfidenceScore(a);
    if (filter === "high") return s >= 90;
    if (filter === "medium") return s >= 51 && s <= 80;
    return s <= 50;
  });
};

export default function RecordReviewView({
  record, records, onClose, onUpdateAttribute, onApprove, onReject, onNavigate,
}: RecordReviewViewProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sectionFilters, setSectionFilters] = useState<Record<string, ConfidenceFilter>>({});
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);

  const getInitialSourceUrl = () => {
    for (const attr of record.attributes) {
      for (const ref of attr.sourceRefs) {
        if (ref.url && ref.url !== "#") return ref.url;
      }
    }
    const url = record.sources[0]?.url;
    return url && url !== "#" ? url : "";
  };

  const [activeSourceUrl, setActiveSourceUrl] = useState<string>(getInitialSourceUrl());

  const categorized = useMemo(() => categorizeAttributes(record.attributes), [record.attributes]);

  // Navigation
  const currentIdx = records ? records.findIndex(r => r.id === record.id) : -1;
  const hasPrev = currentIdx > 0;
  const hasNext = records ? currentIdx < records.length - 1 : false;

  const startEdit = (idx: number, val: string) => {
    setEditingIdx(idx);
    setEditValue(val);
  };

  const saveEdit = (globalIdx: number) => {
    const attr = record.attributes[globalIdx];
    onUpdateAttribute(record.id, globalIdx, { ...attr, currentValue: editValue, status: "edited", qcFlag: false });
    setEditingIdx(null);
  };

  const overallConfidence = useMemo(() => {
    if (record.attributes.length === 0) return 0;
    const total = record.attributes.reduce((sum, a) => sum + getConfidenceScore(a), 0);
    return Math.round(total / record.attributes.length);
  }, [record.attributes]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSectionFilter = (id: string): ConfidenceFilter => sectionFilters[id] || "all";

  const setSectionFilter = (id: string, filter: ConfidenceFilter) => {
    setSectionFilters(prev => ({ ...prev, [id]: filter }));
  };

  const clearSectionFilter = (id: string) => {
    setSectionFilters(prev => ({ ...prev, [id]: "all" }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-[13px] font-semibold text-foreground">{record.companyName}</span>
            <span className="text-[11px] text-muted-foreground ml-2">{record.id}</span>
          </div>
          <div className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium ${overallConfidence >= 85 ? 'bg-brand/10 text-brand' : overallConfidence >= 60 ? 'bg-amber-50 dark:bg-amber-950/30 text-status-amber' : 'bg-destructive/10 text-destructive'}`}>
            Overall: {overallConfidence}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          {records && records.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <button disabled={!hasPrev} onClick={() => hasPrev && onNavigate?.(records[currentIdx - 1].id)} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Previous record">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-muted-foreground">{currentIdx + 1} / {records.length}</span>
              <button disabled={!hasNext} onClick={() => hasNext && onNavigate?.(records[currentIdx + 1].id)} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Next record">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button onClick={() => { onApprove(record.id); onClose(); }} className="px-3 py-1.5 text-[11px] font-medium text-primary-foreground bg-brand hover:bg-brand-dark rounded transition-colors">
            Approve
          </button>
          <button onClick={() => { onReject(record.id); onClose(); }} className="px-3 py-1.5 text-[11px] font-medium text-destructive-foreground bg-destructive hover:opacity-90 rounded transition-colors">
            Reject
          </button>
        </div>
      </div>

      {/* Split: Source (LHS) + Profile (RHS) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Source View */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-status-blue uppercase tracking-wide">Source View</span>
            <span className="text-[11px] text-muted-foreground truncate flex-1 text-center">{activeSourceUrl || "Click a source link to load"}</span>
            {activeSourceUrl && (
              <a href={activeSourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground shrink-0">
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeSourceUrl ? (
              <iframe src={activeSourceUrl} title="Source page" className="w-full h-full border-0" sandbox="allow-same-origin allow-scripts" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">Click a source link on the right</p>
                  <p className="text-[11px] text-muted-foreground/60">to load the original webpage here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RHS: Company Profile */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Profile Title Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
            <span className="text-[13px] font-semibold text-foreground tracking-wide uppercase">
              {record.companyName} — Data Profile
            </span>
            <button
              onClick={() => setShowGlobalFilter(!showGlobalFilter)}
              className="px-2.5 py-1 text-[11px] font-medium border border-destructive/40 text-destructive rounded hover:bg-destructive/5 transition-colors"
            >
              Confidence Filter
            </button>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
            {categorized.map(({ category, attrs }) => {
              const isExpanded = expandedSections[category.id] ?? false;
              const currentFilter = getSectionFilter(category.id);
              const filteredAttrs = filterByConfidence(attrs as ValidationAttribute[], currentFilter);
              const filterLabel = confidenceFilterOptions.find(o => o.value === currentFilter)?.label || "All";

              return (
                <div key={category.id} className="border border-border rounded-lg bg-card overflow-hidden">
                  {/* Section Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleSection(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-[13px] font-semibold text-status-amber">{category.label}</span>
                    </div>

                    {/* Per-section confidence filter */}
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <select
                        value={currentFilter}
                        onChange={e => setSectionFilter(category.id, e.target.value as ConfidenceFilter)}
                        className="text-[11px] border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-[100px]"
                      >
                        {confidenceFilterOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {currentFilter !== "all" && (
                        <button onClick={() => clearSectionFilter(category.id)} className="p-0.5 hover:bg-muted rounded transition-colors" title="Clear filter">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleSection(category.id)}
                        className="p-0.5 hover:bg-muted rounded transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded content: 3-column attribute grid */}
                  {isExpanded && (
                    <div className="px-4 pb-3">
                      {filteredAttrs.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground py-2 text-center italic">No attributes match the selected filter</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {filteredAttrs.map((rawAttr) => {
                            const typedAttr = rawAttr as ValidationAttribute;
                            const globalIdx = record.attributes.findIndex(a => a.name === typedAttr.name);
                            const confidence = getConfidenceScore(typedAttr);

                            return (
                              <div key={typedAttr.name} className="flex flex-col">
                                {/* Attribute header: name + confidence + actions */}
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[11px] text-foreground truncate flex-1" title={typedAttr.name}>
                                    {typedAttr.name}
                                  </span>
                                  <span className={`text-[11px] font-semibold shrink-0 ${getConfidenceColor(confidence)}`}>
                                    {confidence}%
                                  </span>
                                  <button
                                    onClick={() => onUpdateAttribute(record.id, globalIdx, { ...typedAttr, status: "validated", qcFlag: false })}
                                    className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-60 hover:opacity-100"
                                    title="Validate"
                                  >
                                    <Settings className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => startEdit(globalIdx, typedAttr.currentValue)}
                                    className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-60 hover:opacity-100"
                                    title="More options"
                                  >
                                    <MoreVertical className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                </div>

                                {/* Value box */}
                                <div className="border border-border rounded px-2.5 py-1.5 bg-background min-h-[30px] flex items-center">
                                  {editingIdx === globalIdx ? (
                                    <div className="flex items-center gap-1 flex-1">
                                      <input
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 text-[12px] bg-transparent focus:outline-none text-foreground"
                                        autoFocus
                                        onKeyDown={e => { if (e.key === "Enter") saveEdit(globalIdx); if (e.key === "Escape") setEditingIdx(null); }}
                                      />
                                      <button onClick={() => saveEdit(globalIdx)} className="text-[10px] text-brand font-semibold">Save</button>
                                    </div>
                                  ) : (
                                    <span className="text-[12px] text-foreground truncate" title={typedAttr.currentValue}>
                                      {typedAttr.currentValue || <span className="text-muted-foreground">N/A</span>}
                                    </span>
                                  )}
                                </div>

                                {/* Source links */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {typedAttr.sourceRefs.map((src, si) => (
                                    <button
                                      key={si}
                                      onClick={() => src.url && src.url !== "#" && setActiveSourceUrl(src.url)}
                                      className={`text-[10px] transition-colors ${
                                        activeSourceUrl === src.url
                                          ? "text-status-blue font-semibold"
                                          : "text-muted-foreground hover:text-status-blue cursor-pointer"
                                      }`}
                                      title={`View source: ${src.name}`}
                                    >
                                      {src.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
