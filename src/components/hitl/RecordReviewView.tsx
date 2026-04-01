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

          {/* Attributes */}
          <div className="flex-1 overflow-auto px-3 py-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Attributes for Review</p>
            <table className="w-full text-[13px]">
              <tbody>
              {record.attributes.map((attr, idx) => (
                <tr
                  key={attr.name}
                  className={`border-b last:border-b-0 ${
                    attr.qcFlag ? "border-destructive/30 bg-destructive-light" : "border-border bg-background"
                  }`}
                >
                  <td className="px-2 py-2 w-6">
                    <div className="flex items-center justify-center">{statusIcon[attr.status]}</div>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground whitespace-nowrap" style={{ width: "110px" }}>
                    {attr.name}
                  </td>
                  <td className="px-2 py-2 text-foreground">
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
                      <span>{attr.currentValue}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap" style={{ width: "80px" }}>
                    <div className="flex items-center gap-2">
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
                  </td>
                  <td className="px-2 py-2 text-[12px] text-muted-foreground whitespace-nowrap text-right">
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
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
