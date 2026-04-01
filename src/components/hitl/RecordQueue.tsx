import type { ValidationRecord } from "@/data/hitl-validation-data";
import { cn } from "@/lib/utils";

interface Props {
  records: ValidationRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  pending: { label: "Pending", dot: "bg-status-amber", bg: "bg-amber-light" },
  in_review: { label: "In Review", dot: "bg-status-blue", bg: "bg-blue-light" },
  approved: { label: "Approved", dot: "bg-brand", bg: "bg-brand-light" },
  rejected: { label: "Rejected", dot: "bg-destructive", bg: "bg-red-light" },
};

export default function RecordQueue({ records, selectedId, onSelect }: Props) {
  return (
    <div className="w-[220px] flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Record Queue</span>
        <span className="text-[10px] text-muted-foreground ml-1.5">({records.length})</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {records.map(r => {
          const sc = statusConfig[r.status];
          const selected = r.id === selectedId;
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={cn(
                "w-full text-left px-3 py-2 border-b border-border transition-colors",
                selected ? "bg-brand-light border-l-2 border-l-brand" : "hover:bg-muted/50 border-l-2 border-l-transparent"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12px] font-medium text-foreground truncate">{r.companyName}</span>
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sc.dot)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">{r.id}</span>
                <span className={cn("text-[9px] font-medium px-1.5 py-px rounded", sc.bg, sc.dot.replace("bg-", "text-"))}>{sc.label}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="flex-1 h-[3px] rounded-full bg-secondary overflow-hidden max-w-[80px]">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${r.completionPct}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{r.completionPct}%</span>
                </div>
                <span className="text-[9px] text-muted-foreground">{r.lastUpdated.split(" ")[1]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
