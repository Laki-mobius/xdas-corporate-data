import { type ValidationRecord, type ValidationAttribute } from "@/data/hitl-validation-data";
import { categorizeAttributes, profileCategories } from "@/data/workflow-attributes";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, Edit3, Settings, X, Highlighter } from "lucide-react";
import { useState, useMemo } from "react";
import MockSourcePage from "./MockSourcePage";

interface RecordReviewViewProps {
  record: ValidationRecord;
  records?: ValidationRecord[];
  onClose: () => void;
  onUpdateAttribute: (recordId: string, attrIndex: number, attr: ValidationAttribute) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNavigate?: (id: string) => void;
}

const getConfidenceScore = (attr: ValidationAttribute): number => {
  switch (attr.status) {
    case "validated": return 96;
    case "edited": return 98;
    case "flagged": return 50;
    default: {
      const val = attr.currentValue || attr.extractedValue || "";
      if (val && val !== "N/A" && val !== "" && val.length > 1) return 85;
      return 52;
    }
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 90) return "text-brand";
  if (score >= 70) return "text-status-blue";
  if (score >= 60) return "text-status-amber";
  return "text-destructive";
};

type ConfidenceFilter = "all" | "high" | "medium" | "low";

type DisplayAttribute = {
  name: string;
  attr: ValidationAttribute | null;
};

type EditingField = {
  name: string;
  index: number;
  attr: ValidationAttribute | null;
};

const confidenceFilterOptions: { value: ConfidenceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High (90%+)" },
  { value: "medium", label: "Medium (51 - 80%)" },
  { value: "low", label: "Low (0 - 50%)" },
];

const filterDisplayByConfidence = (attrs: DisplayAttribute[], filter: ConfidenceFilter) => {
  if (filter === "all") return attrs;
  return attrs.filter(({ attr }) => {
    if (!attr) return false;
    const s = getConfidenceScore(attr);
    if (filter === "high") return s >= 90;
    if (filter === "medium") return s >= 51 && s <= 80;
    return s <= 50;
  });
};

const getCategoryLabel = (categoryId: string, fallbackLabel: string) => {
  if (categoryId === "corporate_hierarchy") return "Corporate Hierarchy Data";
  return fallbackLabel;
};

export default function RecordReviewView({
  record, records, onClose, onUpdateAttribute, onApprove, onReject, onNavigate,
}: RecordReviewViewProps) {
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ basic_data: true, financial_data: true, corporate_hierarchy: true });
  const [sectionFilters, setSectionFilters] = useState<Record<string, ConfidenceFilter>>({});
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [sourceMode, setSourceMode] = useState<"mock" | "live">("mock");

  const getInitialSourceUrl = () => {
    for (const attr of record.attributes) {
      for (const ref of attr.sourceRefs) {
        if (ref.url && ref.url !== "#") return ref.url;
      }
    }
    const url = record.sources[0]?.url;
    return url && url !== "#" ? url : "";
  };

  const [activeSourceUrl, setActiveSourceUrl] = useState<string>(getInitialSourceUrl());
  const [highlightedField, setHighlightedField] = useState<{
    fieldName: string;
    value: string;
    sourceName: string;
    sourceUrl: string;
  } | null>(null);

  const focusFieldInSource = (fieldName: string, value: string, attr: ValidationAttribute | null) => {
    if (!value || value.trim() === "" || value === "N/A") return;
    const ref = attr?.sourceRefs?.find(r => r.url && r.url !== "#") ?? null;
    const sourceUrl = ref?.url ?? activeSourceUrl;
    const sourceName = ref?.name ?? "Source";
    if (sourceUrl) setActiveSourceUrl(sourceUrl);
    setHighlightedField({ fieldName, value, sourceName, sourceUrl: sourceUrl || "" });
    setSourceMode("mock");
  };

  const categorized = useMemo(() => categorizeAttributes(record.attributes), [record.attributes]);

  const profileSections = useMemo(() => {
    return profileCategories.map((category) => {
      const matchedAttrs = (categorized.find(section => section.category.id === category.id)?.attrs as ValidationAttribute[] | undefined) ?? [];
      const matchedByName = new Map(matchedAttrs.map(attr => [attr.name, attr] as const));

      const orderedAttrs: DisplayAttribute[] = category.attributes.map((name) => ({
        name,
        attr: matchedByName.get(name) ?? null,
      }));

      const extraAttrs: DisplayAttribute[] = matchedAttrs
        .filter(attr => !category.attributes.includes(attr.name))
        .map(attr => ({ name: attr.name, attr }));

      return {
        category,
        attrs: [...orderedAttrs, ...extraAttrs],
      };
    });
  }, [categorized]);

  const currentIdx = records ? records.findIndex(r => r.id === record.id) : -1;
  const hasPrev = currentIdx > 0;
  const hasNext = records ? currentIdx < records.length - 1 : false;

  const getAttributeValue = (attr: ValidationAttribute | null) => {
    return attr?.currentValue || attr?.extractedValue || "";
  };

  const startEdit = (name: string, idx: number, attr: ValidationAttribute | null) => {
    setEditingField({ name, index: idx, attr });
    setEditValue(getAttributeValue(attr));
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = () => {
    if (!editingField) return;

    const targetIndex = editingField.index >= 0 ? editingField.index : record.attributes.length;
    const nextAttr: ValidationAttribute = editingField.attr
      ? {
          ...editingField.attr,
          currentValue: editValue,
          status: "edited",
          qcFlag: false,
        }
      : {
          name: editingField.name,
          extractedValue: "",
          currentValue: editValue,
          status: "edited",
          qcFlag: false,
          sourceRefs: [],
        };

    onUpdateAttribute(record.id, targetIndex, nextAttr);
    cancelEdit();
  };

  const overallConfidence = useMemo(() => {
    if (record.attributes.length === 0) return 0;
    const total = record.attributes.reduce((sum, a) => sum + getConfidenceScore(a), 0);
    return Math.round(total / record.attributes.length);
  }, [record.attributes]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSectionFilter = (id: string): ConfidenceFilter => sectionFilters[id] || "all";

  const setSectionFilter = (id: string, filter: ConfidenceFilter) => {
    setSectionFilters(prev => ({ ...prev, [id]: filter }));
  };

  const clearSectionFilter = (id: string) => {
    setSectionFilters(prev => ({ ...prev, [id]: "all" }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-[13px] font-semibold text-foreground">{record.companyName}</span>
            <span className="text-[11px] text-muted-foreground ml-2">{record.id}</span>
          </div>
          <div className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium ${overallConfidence >= 85 ? 'bg-brand/10 text-brand' : overallConfidence >= 60 ? 'bg-amber-50 dark:bg-amber-950/30 text-status-amber' : 'bg-destructive/10 text-destructive'}`}>
            Overall: {overallConfidence}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          {records && records.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <button disabled={!hasPrev} onClick={() => hasPrev && onNavigate?.(records[currentIdx - 1].id)} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Previous record">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-muted-foreground">{currentIdx + 1} / {records.length}</span>
              <button disabled={!hasNext} onClick={() => hasNext && onNavigate?.(records[currentIdx + 1].id)} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Next record">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button onClick={() => { onApprove(record.id); onClose(); }} className="px-3 py-1.5 text-[11px] font-medium text-primary-foreground bg-brand hover:bg-brand-dark rounded transition-colors">
            Approve
          </button>
          <button onClick={() => { onReject(record.id); onClose(); }} className="px-3 py-1.5 text-[11px] font-medium text-destructive-foreground bg-destructive hover:opacity-90 rounded transition-colors">
            Reject
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-status-blue uppercase tracking-wide">Source View</span>
            {highlightedField && sourceMode === "mock" && (
              <span className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded px-1.5 py-0.5">
                <Highlighter className="w-3 h-3" />
                {highlightedField.fieldName}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground truncate flex-1 text-center">
              {activeSourceUrl || "Click a field on the right to load its source"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSourceMode("mock")}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  sourceMode === "mock"
                    ? "bg-status-blue/10 border-status-blue/40 text-status-blue font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Show mock source page with in-place highlighting"
              >
                Mock
              </button>
              <button
                onClick={() => setSourceMode("live")}
                disabled={!activeSourceUrl}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors disabled:opacity-40 ${
                  sourceMode === "live"
                    ? "bg-status-blue/10 border-status-blue/40 text-status-blue font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Load live source in iframe"
              >
                Live
              </button>
              {activeSourceUrl && (
                <a
                  href={
                    highlightedField && highlightedField.value
                      ? activeSourceUrl.split("#")[0] +
                        `#:~:text=${encodeURIComponent(highlightedField.value.slice(0, 80))}`
                      : activeSourceUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground ml-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {sourceMode === "mock" ? (
              <MockSourcePage
                record={record}
                sourceName={highlightedField?.sourceName ?? ""}
                sourceUrl={activeSourceUrl}
                highlightedField={
                  highlightedField
                    ? { fieldName: highlightedField.fieldName, value: highlightedField.value }
                    : null
                }
              />
            ) : activeSourceUrl ? (
              <iframe
                src={activeSourceUrl}
                title="Live source page"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">Click a field on the right</p>
                  <p className="text-[11px] text-muted-foreground/60">to view and highlight it in the source</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
            <span className="text-[13px] font-semibold text-foreground tracking-wide uppercase">
              {record.companyName} — Data Profile
            </span>
            <button
              onClick={() => setShowGlobalFilter(!showGlobalFilter)}
              className="px-2.5 py-1 text-[11px] font-medium border border-destructive/40 text-destructive rounded hover:bg-destructive/5 transition-colors"
            >
              Confidence Filter
            </button>
          </div>

          <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
            {profileSections.map(({ category, attrs }) => {
              const isExpanded = expandedSections[category.id] ?? false;
              const currentFilter = getSectionFilter(category.id);
              const filteredAttrs = filterDisplayByConfidence(attrs, currentFilter);

              return (
                <div key={category.id} className="border border-border rounded-lg bg-card overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleSection(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-[13px] font-semibold text-status-amber">{getCategoryLabel(category.id, category.label)}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <select
                        value={currentFilter}
                        onChange={e => setSectionFilter(category.id, e.target.value as ConfidenceFilter)}
                        className="text-[11px] border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-[100px]"
                      >
                        {confidenceFilterOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {currentFilter !== "all" && (
                        <button onClick={() => clearSectionFilter(category.id)} className="p-0.5 hover:bg-muted rounded transition-colors" title="Clear filter">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleSection(category.id)}
                        className="p-0.5 hover:bg-muted rounded transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3">
                      {filteredAttrs.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground py-2 text-center italic">No attributes match the selected filter</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {filteredAttrs.map(({ name, attr: typedAttr }) => {
                            const globalIdx = typedAttr ? record.attributes.findIndex(a => a.name === typedAttr.name) : -1;
                            const confidence = typedAttr ? getConfidenceScore(typedAttr) : null;
                            const displayValue = getAttributeValue(typedAttr);
                            const isEditing = editingField?.name === name;
                            const isEmpty = !displayValue || displayValue.trim() === "";

                            return (
                              <div key={name} className="flex flex-col">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[11px] text-foreground truncate flex-1" title={name}>
                                    {name}
                                  </span>
                                  {confidence !== null ? (
                                    <span className={`text-[11px] font-semibold shrink-0 ${getConfidenceColor(confidence)}`}>
                                      {confidence}%
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-semibold shrink-0 text-muted-foreground">—</span>
                                  )}
                                  {typedAttr && globalIdx >= 0 && (
                                    <button
                                      onClick={() => onUpdateAttribute(record.id, globalIdx, { ...typedAttr, status: "validated", qcFlag: false })}
                                      className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-60 hover:opacity-100"
                                      title="Validate"
                                    >
                                      <Settings className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => startEdit(name, globalIdx, typedAttr)}
                                    className="p-0.5 hover:bg-muted rounded transition-colors shrink-0 opacity-80 hover:opacity-100"
                                    title={isEmpty ? "Add value" : "Edit value"}
                                  >
                                    <Edit3 className={`w-3 h-3 ${isEmpty ? "text-primary" : "text-muted-foreground"}`} />
                                  </button>
                                </div>

                                <div className={`border rounded px-2.5 py-1.5 min-h-[30px] flex items-center ${isEmpty ? "border-dashed border-border bg-muted/30" : "border-border bg-background"}`}>
                                  {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <input
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 text-[12px] bg-transparent focus:outline-none text-foreground"
                                        placeholder={`Enter ${name.toLowerCase()}...`}
                                        autoFocus
                                        onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                                      />
                                      <button onClick={saveEdit} className="text-[10px] text-primary font-semibold">Save</button>
                                      <button onClick={cancelEdit} className="p-0.5 hover:bg-muted rounded transition-colors" title="Cancel">
                                        <X className="w-3 h-3 text-muted-foreground" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => isEmpty ? startEdit(name, globalIdx, typedAttr) : focusFieldInSource(name, displayValue, typedAttr)}
                                      onDoubleClick={() => startEdit(name, globalIdx, typedAttr)}
                                      className="w-full text-left"
                                      title={isEmpty ? `Add ${name}` : `Click to highlight in source · Double-click to edit`}
                                    >
                                      <span className={`block text-[12px] ${isEmpty ? "text-muted-foreground italic" : highlightedField?.fieldName === name ? "text-amber-700 dark:text-amber-300 font-medium truncate" : "text-foreground truncate"}`}>
                                        {isEmpty ? "Click to add value" : displayValue}
                                      </span>
                                    </button>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-1">
                                  {typedAttr?.sourceRefs.length ? (
                                    typedAttr.sourceRefs.map((src, si) => (
                                      <button
                                        key={si}
                                        onClick={() => {
                                           if (!src.url || src.url === "#") return;
                                           setActiveSourceUrl(src.url);
                                           setSourceMode("mock");
                                           if (!isEmpty) {
                                             setHighlightedField({ fieldName: name, value: displayValue, sourceName: src.name, sourceUrl: src.url });
                                           }
                                         }}
                                        className={`text-[10px] transition-colors ${
                                          activeSourceUrl === src.url
                                            ? "text-status-blue font-semibold"
                                            : "text-muted-foreground hover:text-status-blue cursor-pointer"
                                        }`}
                                        title={`View source: ${src.name}`}
                                      >
                                        {src.name}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">No source available</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
