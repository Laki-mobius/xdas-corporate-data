import { useState, useMemo, useCallback } from "react";
import { sampleRecords, auditTrail, type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import QCSummaryCards from "./hitl/QCSummaryCards";
import ValidationQueueTable from "./hitl/ValidationQueueTable";
import BulkActionToolbar from "./hitl/BulkActionToolbar";
import RecordDetailPanel from "./hitl/RecordDetailPanel";

import SamplingModal from "./hitl/SamplingModal";
import { toast } from "sonner";

export default function HITLReviewScreen() {
  const [records, setRecords] = useState<ValidationRecord[]>(sampleRecords);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [samplingOpen, setSamplingOpen] = useState(false);
  

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (search && !r.companyName.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, search, statusFilter]);

  const activeRecord = activeRecordId ? records.find(r => r.id === activeRecordId) : null;

  const metrics = useMemo(() => ({
    total: records.length,
    pending: records.filter(r => r.status === "pending" || r.status === "in_review").length,
    approved: records.filter(r => r.status === "approved").length,
    rejected: records.filter(r => r.status === "rejected").length,
    preHitlScore: 82,
  }), [records]);


  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(r => r.id));
  }, [filtered]);

  const handleReview = useCallback((id: string) => {
    setActiveRecordId(id);
  }, []);

  const updateAttribute = useCallback((recordId: string, attrIndex: number, attr: ValidationAttribute) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      const newAttrs = [...r.attributes];
      newAttrs[attrIndex] = attr;
      const validated = newAttrs.filter(a => a.status === "validated" || a.status === "edited").length;
      return { ...r, attributes: newAttrs, completionPct: Math.round((validated / newAttrs.length) * 100) };
    }));
  }, []);

  const approveRecord = useCallback((id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const, completionPct: 100 } : r));
    toast.success(`Record ${id} approved`);
  }, []);

  const rejectRecord = useCallback((id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const } : r));
    addAudit("Record Rejected", id);
    toast.error(`Record ${id} rejected`);
  }, [addAudit]);

  const bulkApprove = useCallback(() => {
    setRecords(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: "approved" as const, completionPct: 100 } : r));
    selectedIds.forEach(id => addAudit("Record Approved", id));
    toast.success(`${selectedIds.length} records approved`);
    setSelectedIds([]);
  }, [selectedIds, addAudit]);

  const bulkReject = useCallback(() => {
    setRecords(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: "rejected" as const } : r));
    selectedIds.forEach(id => addAudit("Record Rejected", id));
    toast.error(`${selectedIds.length} records rejected`);
    setSelectedIds([]);
  }, [selectedIds, addAudit]);

  const handleSample = useCallback((method: string, value: number) => {
    toast.success(`Sampling complete: ${method === "percentage" ? `${value}% sampled` : method === "random" ? `${value} records sampled` : "Category-based sampling done"}`);
  }, []);

  const handleDistribute = useCallback(() => {
    toast.success("Records distributed to reviewers");
  }, []);

  return (
    <div className="flex flex-col h-full -m-3 overflow-hidden">
      {/* Top Metrics */}
      <div className="px-3 pt-3 pb-2">
        <QCSummaryCards
          totalRecords={metrics.total}
          pendingReview={metrics.pending}
          approvedToday={metrics.approved}
          rejected={metrics.rejected}
          preHitlScore={metrics.preHitlScore}
          onSample={() => setSamplingOpen(true)}
          onDistribute={handleDistribute}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-2.5 px-3 pb-3 overflow-hidden min-h-0">
        {/* Left: Queue + Audit */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-0">
          <BulkActionToolbar
            selectedCount={selectedIds.length}
            onBulkApprove={bulkApprove}
            onBulkReject={bulkReject}
          />
          <div className="flex-1 overflow-hidden">
            <ValidationQueueTable
              records={filtered}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleAll={toggleAll}
              onReview={handleReview}
              activeRecordId={activeRecordId}
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
            />
          </div>
          <AuditTrailPanel actions={auditActions} />
        </div>

        {/* Right: Record Detail */}
        {activeRecord && (
          <div className="w-[340px] shrink-0 overflow-hidden">
            <RecordDetailPanel
              record={activeRecord}
              onClose={() => setActiveRecordId(null)}
              onUpdateAttribute={updateAttribute}
              onApprove={approveRecord}
              onReject={rejectRecord}
            />
          </div>
        )}
      </div>

      <SamplingModal
        open={samplingOpen}
        onClose={() => setSamplingOpen(false)}
        onSample={handleSample}
        totalRecords={metrics.total}
      />
    </div>
  );
}
