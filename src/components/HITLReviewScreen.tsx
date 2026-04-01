import { useState, useMemo, useCallback, useEffect } from "react";
import { sampleRecords, type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import ValidationHeader from "./hitl/ValidationHeader";
import RecordQueue from "./hitl/RecordQueue";
import AttributeValidation from "./hitl/AttributeValidation";
import SourceViewer from "./hitl/SourceViewer";
import ValidationMetrics from "./hitl/ValidationMetrics";
import { toast } from "sonner";

export default function HITLReviewScreen() {
  const [records, setRecords] = useState<ValidationRecord[]>(sampleRecords);
  const [selectedId, setSelectedId] = useState(sampleRecords[0].id);
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [completenessFilter, setCompletenessFilter] = useState("all");
  const [qcFilter, setQcFilter] = useState("all");

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (search && !r.companyName.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (completenessFilter === "complete" && r.completionPct !== 100) return false;
      if (completenessFilter === "partial" && (r.completionPct <= 0 || r.completionPct >= 100)) return false;
      if (completenessFilter === "none" && r.completionPct !== 0) return false;
      if (qcFilter === "flagged" && !r.attributes.some(a => a.qcFlag)) return false;
      if (qcFilter === "clean" && r.attributes.some(a => a.qcFlag)) return false;
      return true;
    });
  }, [records, search, statusFilter, completenessFilter, qcFilter]);

  const currentIndex = filtered.findIndex(r => r.id === selectedId);
  const currentRecord = filtered[currentIndex] || filtered[0];

  const updateAttribute = useCallback((index: number, attr: ValidationAttribute) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== currentRecord?.id) return r;
      const newAttrs = [...r.attributes];
      newAttrs[index] = attr;
      const validated = newAttrs.filter(a => a.status === "validated" || a.status === "edited").length;
      return { ...r, attributes: newAttrs, completionPct: Math.round((validated / newAttrs.length) * 100) };
    }));
  }, [currentRecord?.id]);

  const handleApprove = useCallback(() => {
    if (!currentRecord) return;
    setRecords(prev => prev.map(r => r.id === currentRecord.id ? { ...r, status: "approved" as const, completionPct: 100 } : r));
    toast.success(`Record ${currentRecord.id} approved`);
  }, [currentRecord]);

  const handleReject = useCallback(() => {
    if (!currentRecord) return;
    setRecords(prev => prev.map(r => r.id === currentRecord.id ? { ...r, status: "rejected" as const } : r));
    toast.error(`Record ${currentRecord.id} rejected`);
  }, [currentRecord]);

  const handleSave = useCallback(() => {
    toast.success("Progress saved");
  }, []);

  const goTo = useCallback((dir: number) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < filtered.length) {
      setSelectedId(filtered[next].id);
      setSelectedAttrIndex(0);
    }
  }, [currentIndex, filtered]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") {
        if (currentRecord) updateAttribute(selectedAttrIndex, { ...currentRecord.attributes[selectedAttrIndex], status: "validated", qcFlag: false });
      }
      if (e.key === "e" || e.key === "E") { /* edit handled by component */ }
      if (e.key === "f" || e.key === "F") {
        if (currentRecord) updateAttribute(selectedAttrIndex, { ...currentRecord.attributes[selectedAttrIndex], status: "flagged", qcFlag: true });
      }
      if (e.key === "ArrowRight") {
        if (currentRecord && selectedAttrIndex < currentRecord.attributes.length - 1) setSelectedAttrIndex(i => i + 1);
      }
      if (e.key === "ArrowLeft") {
        if (selectedAttrIndex > 0) setSelectedAttrIndex(i => i - 1);
      }
      if (e.ctrlKey && e.key === "Enter") handleApprove();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentRecord, selectedAttrIndex, updateAttribute, handleApprove]);

  if (!currentRecord) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No records match filters.</div>;
  }

  return (
    <div className="flex flex-col h-full -m-3">
      <ValidationHeader
        records={filtered}
        currentIndex={Math.max(currentIndex, 0)}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        completenessFilter={completenessFilter}
        onCompletenessFilter={setCompletenessFilter}
        qcFilter={qcFilter}
        onQcFilter={setQcFilter}
        onPrev={() => goTo(-1)}
        onNext={() => goTo(1)}
        onSave={handleSave}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className="flex flex-1 overflow-hidden">
        <RecordQueue records={filtered} selectedId={currentRecord.id} onSelect={id => { setSelectedId(id); setSelectedAttrIndex(0); }} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AttributeValidation
            attributes={currentRecord.attributes}
            selectedAttrIndex={selectedAttrIndex}
            onSelectAttr={setSelectedAttrIndex}
            onUpdateAttribute={updateAttribute}
          />
          <ValidationMetrics attributes={currentRecord.attributes} />
        </div>
        <SourceViewer
          sources={currentRecord.sources}
          highlightText={currentRecord.attributes[selectedAttrIndex]?.extractedValue}
        />
      </div>
    </div>
  );
}
