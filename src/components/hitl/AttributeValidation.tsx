import { useState, useCallback } from "react";
import { Check, X, Pencil, Flag, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ValidationAttribute } from "@/data/hitl-validation-data";

interface Props {
  attributes: ValidationAttribute[];
  selectedAttrIndex: number;
  onSelectAttr: (i: number) => void;
  onUpdateAttribute: (index: number, attr: ValidationAttribute) => void;
}

const statusIcon: Record<string, { icon: React.ReactNode; color: string }> = {
  validated: { icon: <Check className="w-3 h-3" />, color: "text-brand" },
  pending: { icon: <div className="w-2 h-2 rounded-full bg-status-amber" />, color: "text-status-amber" },
  flagged: { icon: <Flag className="w-3 h-3" />, color: "text-destructive" },
  edited: { icon: <Pencil className="w-3 h-3" />, color: "text-status-blue" },
};

export default function AttributeValidation({ attributes, selectedAttrIndex, onSelectAttr, onUpdateAttribute }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = useCallback((i: number) => {
    setEditingIndex(i);
    setEditValue(attributes[i].currentValue);
    onSelectAttr(i);
  }, [attributes, onSelectAttr]);

  const commitEdit = useCallback((i: number) => {
    if (editValue !== attributes[i].currentValue) {
      onUpdateAttribute(i, { ...attributes[i], currentValue: editValue, status: "edited" });
    }
    setEditingIndex(null);
  }, [editValue, attributes, onUpdateAttribute]);

  const acceptAttr = useCallback((i: number) => {
    onUpdateAttribute(i, { ...attributes[i], status: "validated", qcFlag: false });
  }, [attributes, onUpdateAttribute]);

  const flagAttr = useCallback((i: number) => {
    onUpdateAttribute(i, { ...attributes[i], status: "flagged", qcFlag: true });
  }, [attributes, onUpdateAttribute]);

  const markIncorrect = useCallback((i: number) => {
    onUpdateAttribute(i, { ...attributes[i], status: "flagged", qcFlag: true });
  }, [attributes, onUpdateAttribute]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Attribute Validation</span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1 py-px rounded bg-muted text-[9px] font-mono border border-border">A</kbd> Accept</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-px rounded bg-muted text-[9px] font-mono border border-border">E</kbd> Edit</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-px rounded bg-muted text-[9px] font-mono border border-border">F</kbd> Flag</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-px rounded bg-muted text-[9px] font-mono border border-border">→</kbd> Next</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 sticky top-0 z-10">
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[18%]">Attribute</th>
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[24%]">Extracted Value</th>
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[24%]">Current Value</th>
              <th className="text-center px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[6%]">Status</th>
              <th className="text-center px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[5%]">QC</th>
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[10%]">Source</th>
              <th className="text-center px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider w-[13%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, i) => {
              const si = statusIcon[attr.status];
              const isSelected = i === selectedAttrIndex;
              const isEditing = i === editingIndex;

              return (
                <tr
                  key={attr.name}
                  onClick={() => onSelectAttr(i)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors",
                    isSelected ? "bg-brand-light" : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-3 py-1.5 font-medium text-foreground">{attr.name}</td>
                  <td className="px-3 py-1.5 text-muted-foreground font-mono text-[10px]">{attr.extractedValue}</td>
                  <td className="px-3 py-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") commitEdit(i); if (e.key === "Escape") setEditingIndex(null); }}
                          className="h-6 text-[10px] font-mono"
                          autoFocus
                        />
                        <button onClick={() => commitEdit(i)} className="w-5 h-5 flex items-center justify-center rounded text-brand hover:bg-brand-light"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingIndex(null)} className="w-5 h-5 flex items-center justify-center rounded text-destructive hover:bg-red-light"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-foreground">{attr.currentValue}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span className={cn("inline-flex items-center justify-center", si.color)}>{si.icon}</span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {attr.qcFlag && <Flag className="w-3 h-3 text-destructive inline-block" />}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{attr.sourceRef}</span>
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={e => { e.stopPropagation(); acceptAttr(i); }} title="Accept" className="w-5 h-5 flex items-center justify-center rounded hover:bg-brand-light text-brand transition-colors"><Check className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); startEdit(i); }} title="Edit" className="w-5 h-5 flex items-center justify-center rounded hover:bg-blue-light text-status-blue transition-colors"><Pencil className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); markIncorrect(i); }} title="Mark Incorrect" className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-light text-destructive transition-colors"><X className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); flagAttr(i); }} title="Flag for QC" className="w-5 h-5 flex items-center justify-center rounded hover:bg-amber-light text-status-amber transition-colors"><Flag className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
