import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

interface Reviewer {
  name: string;
  role: string;
  percentage: number;
  count: number;
}

interface DistributeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (assignments: Reviewer[]) => void;
  totalPending: number;
}

const defaultReviewers = [
  { name: "User 3", role: "QC Specialist" },
  { name: "User 4", role: "Junior Analyst" },
  { name: "User 5", role: "Data Analyst" },
  { name: "User 6", role: "QC Specialist" },
  { name: "User 7", role: "Senior Analyst" },
  { name: "User 8", role: "Junior Analyst" },
];

export default function DistributeModal({ open, onClose, onConfirm, totalPending }: DistributeModalProps) {
  const evenPct = Math.floor(100 / defaultReviewers.length);
  const [percentages, setPercentages] = useState<number[]>(
    defaultReviewers.map((_, i) => i === defaultReviewers.length - 1 ? 100 - evenPct * (defaultReviewers.length - 1) : evenPct)
  );

  const totalAssigned = useMemo(() => percentages.reduce((a, b) => a + b, 0), [percentages]);
  const unassigned = 100 - totalAssigned;

  const handleSliderChange = (index: number, newVal: number) => {
    setPercentages(prev => {
      const updated = [...prev];
      updated[index] = newVal;
      return updated;
    });
  };

  const reviewers: Reviewer[] = defaultReviewers.map((r, i) => ({
    ...r,
    percentage: percentages[i],
    count: Math.round((percentages[i] / 100) * totalPending),
  }));

  const handleConfirm = () => {
    onConfirm(reviewers);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <DialogTitle className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
            Distribute Records
          </DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Pending */}
        <div className="text-center py-5 border-b border-border bg-muted/30">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Total Records Pending Review</p>
          <p className="text-[32px] font-semibold text-primary leading-none tabular-nums">
            {totalPending.toLocaleString()}
          </p>
        </div>

        {/* User Assignments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">User Assignments</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Unassigned:</span>
              <span className={`text-[11px] font-semibold tabular-nums ${unassigned > 0 ? 'text-status-amber' : 'text-brand'}`}>
                {unassigned}%
              </span>
              <span className={`w-2 h-2 rounded-full ${unassigned > 0 ? 'bg-status-amber' : 'bg-brand'}`} />
            </div>
          </div>

          <div className="space-y-1">
            {reviewers.map((reviewer, i) => (
              <div key={reviewer.name} className="flex items-center gap-3 py-2 px-3 rounded-md border border-border bg-card hover:bg-muted/30 transition-colors">
                {/* Name & Role */}
                <div className="w-[100px] flex-shrink-0">
                  <p className="text-[12px] font-medium text-foreground leading-tight">{reviewer.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{reviewer.role}</p>
                </div>

                {/* Slider */}
                <div className="flex-1 min-w-0">
                  <Slider
                    value={[percentages[i]]}
                    onValueChange={([v]) => handleSliderChange(i, v)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Percentage */}
                <span className="text-[11px] text-muted-foreground tabular-nums w-[32px] text-right">
                  {percentages[i]}%
                </span>

                {/* Count */}
                <span className="text-[18px] font-semibold text-primary tabular-nums w-[48px] text-right leading-none">
                  {reviewer.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-border bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[12px]">
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} className="text-[12px]">
            Confirm Distribution
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
