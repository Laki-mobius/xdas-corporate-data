import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { categorizeAttributes } from "@/data/workflow-attributes";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Edit3, CheckCircle2, AlertTriangle, Building2, DollarSign, GitBranch } from "lucide-react";
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

const getConfidenceBg = (score: number) => {
  if (score >= 90) return "bg-brand/10";
  if (score >= 70) return "bg-status-blue/10";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-950/30";
  return "bg-destructive/10";
};

const categoryIcons: Record<string, React.ReactNode> = {
  basic_data: <Building2 className="w-4 h-4" />,
  financial_data: <DollarSign className="w-4 h-4" />,
  corporate_hierarchy: <GitBranch className="w-4 h-4" />,
};

export default function RecordReviewView({
  record, records, onClose, onUpdateAttribute, onApprove, onReject, onNavigate,
}: RecordReviewViewProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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

  // Categorize attributes for profile view
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

  // Overall confidence
  const overallConfidence = useMemo(() => {
    if (record.attributes.length === 0) return 0;
    const total = record.attributes.reduce((sum, a) => sum + getConfidenceScore(a), 0);
    return Math.round(total / record.attributes.length);
  }, [record.attributes]);

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
          <div className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium ${getConfidenceBg(overallConfidence)} ${getConfidenceColor(overallConfidence)}`}>
            Overall: {overallConfidence}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Navigation */}
          {records && records.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                disabled={!hasPrev}
                onClick={() => hasPrev && onNavigate?.(records[currentIdx - 1].id)}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                title="Previous record"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-muted-foreground">{currentIdx + 1} / {records.length}</span>
              <button
                disabled={!hasNext}
                onClick={() => hasNext && onNavigate?.(records[currentIdx + 1].id)}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                title="Next record"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => { onApprove(record.id); onClose(); }}
            className="px-3 py-1.5 text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => { onReject(record.id); onClose(); }}
            className="px-3 py-1.5 text-[11px] font-medium text-destructive-foreground bg-destructive hover:opacity-90 rounded transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Split: Source (LHS) + Profile (RHS) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Source Page */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate flex-1">{activeSourceUrl || "Click a source link to load"}</span>
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
          <div className="flex-1 overflow-auto px-3 py-2">
            {categorized.map(({ category, attrs }) => (
              <div key={category.id} className="mb-4">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">{categoryIcons[category.id]}</span>
                  <span className="text-[12px] font-semibold text-foreground">{category.label}</span>
                  <span className="text-[10px] text-muted-foreground">({attrs.length} fields)</span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {attrs.map((attr) => {
                    const typedAttr = attr as ValidationAttribute;
                    const globalIdx = record.attributes.findIndex(a => a.name === typedAttr.name);
                    const confidence = getConfidenceScore(typedAttr);
                    const isLowConfidence = confidence < 70;

                    return (
                      <div key={typedAttr.name} className={`rounded px-2 py-1.5 ${isLowConfidence ? 'bg-destructive/5 border border-destructive/20' : 'bg-background'}`}>
                        {/* Field name + confidence */}
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-muted-foreground truncate" title={typedAttr.name}>
                            {typedAttr.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isLowConfidence && <AlertTriangle className="w-3 h-3 text-destructive" />}
                            <span className={`text-[10px] font-semibold ${getConfidenceColor(confidence)}`}>
                              {confidence}%
                            </span>
                          </div>
                        </div>

                        {/* Value */}
                        <div className="flex items-center gap-1">
                          {editingIdx === globalIdx ? (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="flex-1 text-[12px] bg-transparent focus:outline-none text-foreground border-b border-primary"
                                autoFocus
                                onKeyDown={e => { if (e.key === "Enter") saveEdit(globalIdx); if (e.key === "Escape") setEditingIdx(null); }}
                              />
                              <button onClick={() => saveEdit(globalIdx)} className="text-[10px] text-brand font-medium">Save</button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[12px] text-foreground flex-1 truncate" title={typedAttr.currentValue}>
                                {typedAttr.currentValue || <span className="text-muted-foreground italic">—</span>}
                              </span>
                              <button
                                onClick={() => {
                                  onUpdateAttribute(record.id, globalIdx, { ...typedAttr, status: "validated", qcFlag: false });
                                }}
                                className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-50 hover:opacity-100" title="Validate"
                              >
                                <CheckCircle2 className="w-3 h-3 text-brand" />
                              </button>
                              <button
                                onClick={() => startEdit(globalIdx, typedAttr.currentValue)}
                                className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-50 hover:opacity-100" title="Edit"
                              >
                                <Edit3 className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Source links */}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {typedAttr.sourceRefs.map((src, si) => (
                            <button
                              key={si}
                              onClick={() => src.url && src.url !== "#" && setActiveSourceUrl(src.url)}
                              className={`text-[9px] px-1 py-0.5 rounded transition-colors ${
                                activeSourceUrl === src.url
                                  ? "bg-status-blue/15 text-status-blue font-medium"
                                  : "text-muted-foreground hover:text-status-blue hover:underline cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
