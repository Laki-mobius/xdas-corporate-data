import { Search, ChevronLeft, ChevronRight, Save, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ValidationRecord } from "@/data/hitl-validation-data";

interface Props {
  records: ValidationRecord[];
  currentIndex: number;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  completenessFilter: string;
  onCompletenessFilter: (v: string) => void;
  qcFilter: string;
  onQcFilter: (v: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-light text-status-amber",
  in_review: "bg-blue-light text-status-blue",
  approved: "bg-brand-light text-brand",
  rejected: "bg-red-light text-destructive",
  running: "bg-blue-light text-status-blue",
};

export default function ValidationHeader({
  records, currentIndex, search, onSearchChange,
  statusFilter, onStatusFilter,
  completenessFilter, onCompletenessFilter,
  qcFilter, onQcFilter,
  onPrev, onNext, onSave, onApprove, onReject,
}: Props) {
  const total = records.length;
  const pending = records.filter(r => r.status === "pending" || r.status === "in_review").length;
  const approved = records.filter(r => r.status === "approved").length;
  const rejected = records.filter(r => r.status === "rejected").length;

  const jobStatus = "Running";

  return (
    <div className="bg-card border-b border-border px-4 py-2.5 flex-shrink-0">
      {/* Row 1: Title + Stats */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-semibold text-foreground">Validation</h1>
          <span className="text-[11px] text-muted-foreground">SEC Filing Extraction — Q1 2026</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusBadge[jobStatus.toLowerCase()] || statusBadge.running}`}>
            {jobStatus}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-muted-foreground">Total: <span className="text-foreground font-semibold">{total}</span></span>
          <span className="text-muted-foreground">Pending: <span className="text-status-amber font-semibold">{pending}</span></span>
          <span className="text-muted-foreground">Approved: <span className="text-brand font-semibold">{approved}</span></span>
          <span className="text-muted-foreground">Rejected: <span className="text-destructive font-semibold">{rejected}</span></span>
        </div>
      </div>

      {/* Row 2: Filters + Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0 w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search records…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="h-7 text-[11px] pl-7"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilter}>
          <SelectTrigger className="h-7 text-[11px] w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={completenessFilter} onValueChange={onCompletenessFilter}>
          <SelectTrigger className="h-7 text-[11px] w-[140px]"><SelectValue placeholder="Completeness" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Completeness</SelectItem>
            <SelectItem value="complete">100%</SelectItem>
            <SelectItem value="partial">1–99%</SelectItem>
            <SelectItem value="none">0%</SelectItem>
          </SelectContent>
        </Select>
        <Select value={qcFilter} onValueChange={onQcFilter}>
          <SelectTrigger className="h-7 text-[11px] w-[120px]"><SelectValue placeholder="QC Flag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All QC</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} disabled={currentIndex <= 0} className="h-7 w-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-muted-foreground tabular-nums min-w-[40px] text-center">
            {currentIndex + 1}/{records.length}
          </span>
          <button onClick={onNext} disabled={currentIndex >= records.length - 1} className="h-7 w-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          <button onClick={onSave} className="h-7 px-2.5 flex items-center gap-1 rounded border border-border text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
            <Save className="w-3 h-3" /> Save
          </button>
          <button onClick={onApprove} className="h-7 px-2.5 flex items-center gap-1 rounded bg-brand text-primary-foreground text-[11px] font-medium hover:bg-brand-dark transition-colors">
            <CheckCircle className="w-3 h-3" /> Approve
          </button>
          <button onClick={onReject} className="h-7 px-2.5 flex items-center gap-1 rounded bg-destructive text-destructive-foreground text-[11px] font-medium hover:opacity-90 transition-colors">
            <XCircle className="w-3 h-3" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
