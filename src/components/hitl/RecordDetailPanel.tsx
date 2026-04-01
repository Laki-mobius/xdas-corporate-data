import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { CheckCircle2, AlertTriangle, Edit3, Flag, ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface RecordDetailPanelProps {
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

export default function RecordDetailPanel({ record, onClose, onUpdateAttribute, onApprove, onReject }: RecordDetailPanelProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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
    <div className="bg-card border border-border rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Record Detail</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{record.id} · {record.companyName}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Root Identification */}
      <div className="px-3 py-2.5 border-b border-border bg-muted/30">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Root Identification</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
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
            <span className="text-muted-foreground">Source:</span>
            <span className="ml-1 text-foreground">{record.source}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Confidence:</span>
            <span className="ml-1 text-foreground">{record.confidenceScore}%</span>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="flex-1 overflow-auto px-3 py-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Attributes</p>
        <div className="space-y-1.5">
          {record.attributes.map((attr, idx) => (
            <div
              key={attr.name}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] border ${
                attr.qcFlag ? "border-destructive/30 bg-destructive-light" : "border-border bg-background"
              }`}
            >
              <div className="w-4 shrink-0">{statusIcon[attr.status]}</div>
              <div className="w-24 shrink-0 text-muted-foreground truncate">{attr.name}</div>
              <div className="flex-1">
                {editingIdx === idx ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1 px-1.5 py-0.5 text-[11px] bg-card border border-ring rounded focus:outline-none"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(idx); if (e.key === "Escape") setEditingIdx(null); }}
                    />
                    <button onClick={() => saveEdit(idx)} className="text-[10px] text-brand font-medium">Save</button>
                    <button onClick={() => setEditingIdx(null)} className="text-[10px] text-muted-foreground">Cancel</button>
                  </div>
                ) : (
                  <span className="text-foreground">{attr.currentValue}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onUpdateAttribute(record.id, idx, { ...attr, status: "validated", qcFlag: false })}
                  className="p-0.5 hover:bg-brand-light rounded transition-colors" title="Accept"
                >
                  <CheckCircle2 className="w-3 h-3 text-brand" />
                </button>
                <button
                  onClick={() => startEdit(idx, attr.currentValue)}
                  className="p-0.5 hover:bg-status-blue-light rounded transition-colors" title="Edit"
                >
                  <Edit3 className="w-3 h-3 text-status-blue" />
                </button>
                <button
                  onClick={() => onUpdateAttribute(record.id, idx, { ...attr, status: "flagged", qcFlag: true })}
                  className="p-0.5 hover:bg-destructive-light rounded transition-colors" title="Flag"
                >
                  <Flag className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 w-16 truncate text-right" title={attr.sourceRef}>
                {attr.sourceRef}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source References */}
      <div className="px-3 py-2 border-t border-border">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Sources</p>
        <div className="space-y-1">
          {record.sources.map((src, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <ExternalLink className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-status-blue truncate block">{src.url}</span>
                <span className="text-muted-foreground text-[10px] line-clamp-1">{src.snippet}</span>
              </div>
              <span className="text-[10px] px-1 py-0.5 bg-muted rounded text-muted-foreground shrink-0">{src.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
        <button
          onClick={() => onApprove(record.id)}
          className="flex-1 py-1.5 text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary-dark rounded transition-colors"
        >
          Approve Record
        </button>
        <button
          onClick={() => onReject(record.id)}
          className="flex-1 py-1.5 text-[11px] font-medium text-destructive-foreground bg-destructive hover:opacity-90 rounded transition-colors"
        >
          Reject Record
        </button>
      </div>
    </div>
  );
}
