import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { CheckCircle2, AlertTriangle, Edit3, Flag, ArrowLeft, ExternalLink, Settings, MoreVertical } from "lucide-react";
import { useState } from "react";

interface RecordReviewViewProps {
  record: ValidationRecord;
  onClose: () => void;
  onUpdateAttribute: (recordId: string, attrIndex: number, attr: ValidationAttribute) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const getConfidenceColor = (status: string) => {
  switch (status) {
    case "validated": return "text-brand";
    case "edited": return "text-status-blue";
    case "flagged": return "text-destructive";
    default: return "text-status-amber";
  }
};

const getConfidencePct = (attr: { status: string; currentValue: string; extractedValue: string }) => {
  switch (attr.status) {
    case "validated": return "95%";
    case "edited": return "88%";
    case "flagged": return "50%";
    default: {
      // For pending: if value is filled and non-trivial, show higher confidence
      const val = attr.currentValue || attr.extractedValue || "";
      if (val && val !== "N/A" && val !== "" && val.length > 1) return "85%";
      return "52%";
    }
  }
};

export default function RecordReviewView({ record, onClose, onUpdateAttribute, onApprove, onReject }: RecordReviewViewProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const getInitialSourceUrl = () => {
    const url = record.sources[0]?.url;
    if (url && url !== "#") return url;
    // Try to find a real URL from attribute sourceRefs
    for (const attr of record.attributes) {
      for (const ref of attr.sourceRefs) {
        if (ref.url && ref.url !== "#") return ref.url;
      }
    }
    return "";
  };
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>(getInitialSourceUrl());

  const startEdit = (idx: number, val: string) => {
    setEditingIdx(idx);
    setEditValue(val);
  };

  const saveEdit = (idx: number) => {
    const attr = record.attributes[idx];
    onUpdateAttribute(record.id, idx, { ...attr, currentValue: editValue, status: "edited", qcFlag: false });
    setEditingIdx(null);
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
            <span className="text-[13px] font-semibold text-foreground">{record.id}</span>
            <span className="text-[12px] text-muted-foreground ml-2">{record.companyName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onApprove(record.id); onClose(); }}
            className="px-3 py-1.5 text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary-dark rounded transition-colors"
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

      {/* Split: Source (LHS) + Fields (RHS) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LHS: Source Page */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate flex-1">{activeSourceUrl || "No source URL"}</span>
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
                <p className="text-[12px] text-muted-foreground">Click a source name to load its page</p>
              </div>
            )}
          </div>
        </div>

        {/* RHS: Attributes Grid (matching RecordDetailPanel layout) */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-3 py-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Attributes for Review</p>
            <div className="grid grid-cols-3 gap-2">
              {record.attributes.map((attr, idx) => (
                <div key={attr.name} className="flex flex-col">
                  {/* Attribute header row */}
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[12px] text-foreground truncate flex-1" title={attr.name}>
                      {attr.name}
                    </span>
                    <span className={`text-[12px] font-medium shrink-0 ${getConfidenceColor(attr.status)}`}>
                      {getConfidencePct(attr.status)}
                    </span>
                    <button
                      onClick={() => onUpdateAttribute(record.id, idx, { ...attr, status: "validated", qcFlag: false })}
                      className="p-0.5 hover:bg-muted rounded transition-colors shrink-0" title="Accept"
                    >
                      <Settings className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => startEdit(idx, attr.currentValue)}
                      className="p-0.5 hover:bg-muted rounded transition-colors shrink-0" title="Edit"
                    >
                      <MoreVertical className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  {/* Value box */}
                  <div className="border border-border rounded px-2 py-1.5 bg-background">
                    {editingIdx === idx ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="flex-1 text-[12px] bg-transparent focus:outline-none text-foreground"
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(idx); if (e.key === "Escape") setEditingIdx(null); }}
                        />
                        <button onClick={() => saveEdit(idx)} className="text-[10px] text-brand font-medium">Save</button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-foreground">{attr.currentValue}</span>
                    )}
                  </div>
                  {/* Source links */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attr.sourceRefs.map((src, si) => (
                      <button
                        key={si}
                        onClick={() => setActiveSourceUrl(src.url)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                          activeSourceUrl === src.url
                            ? "bg-status-blue-light text-status-blue font-medium"
                            : "text-muted-foreground hover:text-status-blue hover:underline"
                        }`}
                        title={`Load ${src.name}`}
                      >
                        {src.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}