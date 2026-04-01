import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { CheckCircle2, AlertTriangle, Edit3, Flag, ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";

interface RecordReviewViewProps {
  record: ValidationRecord;
  onClose: () => void;
  onUpdateAttribute: (recordId: string, attrIndex: number, attr: ValidationAttribute) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const statusIcon: Record<string, React.ReactNode> = {
  validated: <CheckCircle2 className="w-3.5 h-3.5 text-brand" />,
  pending: <AlertTriangle className="w-3.5 h-3.5 text-status-amber" />,
  flagged: <Flag className="w-3.5 h-3.5 text-destructive" />,
  edited: <Edit3 className="w-3.5 h-3.5 text-status-blue" />,
};

export default function RecordReviewView({ record, onClose, onUpdateAttribute, onApprove, onReject }: RecordReviewViewProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>(record.sources[0]?.url || "");

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

        {/* RHS: Record Fields with clickable sources */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Root Identification */}
          <div className="px-3 py-2.5 border-b border-border bg-muted/20">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Root Identification</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <div>
                <span className="text-muted-foreground">Record ID:</span>
                <span className="ml-1 font-mono text-foreground">{record.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <span className="ml-1 text-foreground">{record.companyName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Existing Value:</span>
                <span className="ml-1 text-foreground">{record.existingValue}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Suggested Value:</span>
                <span className="ml-1 font-medium text-brand">{record.suggestedValue}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-1 text-foreground">{record.confidenceScore}%</span>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="flex-1 overflow-auto px-3 py-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Attributes for Review</p>
            <div className="space-y-1">
              {record.attributes.map((attr, idx) => (
                <div
                  key={attr.name}
                  className={`px-3 py-2 rounded text-[13px] border ${
                    attr.qcFlag ? "border-destructive/30 bg-destructive-light" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-x-auto">
                    <div className="w-5 shrink-0 flex items-center justify-center">{statusIcon[attr.status]}</div>
                    <div className="w-28 shrink-0 text-muted-foreground">{attr.name}</div>
                    <div className="flex-1 min-w-0">
                      {editingIdx === idx ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-0.5 text-[13px] bg-card border border-ring rounded focus:outline-none"
                            autoFocus
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(idx); if (e.key === "Escape") setEditingIdx(null); }}
                          />
                          <button onClick={() => saveEdit(idx)} className="text-[12px] text-brand font-medium">Save</button>
                          <button onClick={() => setEditingIdx(null)} className="text-[12px] text-muted-foreground">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-foreground truncate block">{attr.currentValue}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onUpdateAttribute(record.id, idx, { ...attr, status: "validated", qcFlag: false })}
                        className="p-0.5 hover:bg-brand-light rounded transition-colors" title="Accept"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                      </button>
                      <button
                        onClick={() => startEdit(idx, attr.currentValue)}
                        className="p-0.5 hover:bg-status-blue-light rounded transition-colors" title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-status-blue" />
                      </button>
                      <button
                        onClick={() => onUpdateAttribute(record.id, idx, { ...attr, status: "flagged", qcFlag: true })}
                        className="p-0.5 hover:bg-destructive-light rounded transition-colors" title="Flag"
                      >
                        <Flag className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                    <div className="flex items-center shrink-0 text-[12px] text-muted-foreground whitespace-nowrap">
                      {attr.sourceRefs.map((src, si) => (
                        <button
                          key={si}
                          onClick={() => setActiveSourceUrl(src.url)}
                          className={`px-1 py-0.5 rounded transition-colors ${
                            activeSourceUrl === src.url
                              ? "bg-status-blue-light text-status-blue font-medium"
                              : "text-muted-foreground hover:text-status-blue hover:underline"
                          }`}
                          title={`Load ${src.name}`}
                        >
                          {src.name}{si < attr.sourceRefs.length - 1 ? "," : ""}
                        </button>
                      ))}
                    </div>
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
