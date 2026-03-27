import { useState, useMemo } from "react";
import { ClipboardList, Clock, Flag, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import HITLRecordReview from "./HITLRecordReview";
import type { HITLRecord } from "./HITLRecordReview";

/* ── static data ─────────────────────────────────────── */

const tiers = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"];

const workflows = [
  "Registry Data", "SEC Data", "Stock Exchanges", "SEDAR+ Canada",
  "Data Extraction - Websites", "Data Extraction - Websites (IR)",
  "Data Extraction - Websites (Basic)", "Data Extraction - Reports (XBRL/HTML)",
  "Data Extraction - Reports (PDF/Unstructured)",
  "Third-party Aggregators (Financial DBs)", "Third-party Aggregators (D&B)",
  "Third-party Aggregators (Orbis/Creditsafe)",
  "Specialized Sources (Banking)", "Specialized Sources (Tax)",
  "Specialized Sources (UCC/Liens)", "Web Crawling",
  "Scoring & Refresh", "Data Consolidation", "Deduplication",
  "QC Validation", "Hierarchy Impact", "Event Monitoring",
];

const sources = [
  "U.S. SOS", "Companies House", "MCA", "ASIC",
  "SEC EDGAR (10-K/Q)", "SEC EDGAR (8-K)", "SEC EDGAR (DEF 14A)",
  "NYSE", "NASDAQ", "LSE", "HKEX", "ASX", "SEDAR+ filings",
  "Company websites", "IR pages", "Address scraping", "Management scraping",
  "SEC EDGAR structured filings", "SEDAR+", "Annual PDFs", "Registry docs",
  "Bloomberg", "Reuters", "FactSet", "Firmographics bulk API",
  "Global private API", "FDIC", "FFIEC", "IRS", "UCC Filings",
  "Contact updates across privates", "Tiered scheduling (monthly→annual)",
  "Cross-source merging", "135M+ company master", "Automated checks",
  "M&A", "Parent-subsidiary changes", "UPTIME system",
];

const statuses = ["Pending", "Flagged", "Reviewed"] as const;

const sampleRecords: HITLRecord[] = [
  { id: "HITL-001", company: "Acme Corp", tier: "Tier 1", workflow: "SEC Data", source: "SEC EDGAR (10-K/Q)", status: "Pending" },
  { id: "HITL-002", company: "GlobalTech Inc", tier: "Tier 2", workflow: "Stock Exchanges", source: "NYSE", status: "Flagged", flagReason: "Name mismatch" },
  { id: "HITL-003", company: "Northern Resources Ltd", tier: "Tier 2", workflow: "SEDAR+ Canada", source: "SEDAR+ filings", status: "Reviewed" },
  { id: "HITL-004", company: "Pacific Holdings", tier: "Tier 1", workflow: "Data Extraction - Websites (IR)", source: "IR pages", status: "Pending" },
  { id: "HITL-005", company: "Zenith Retail Group", tier: "Tier 3", workflow: "Third-party Aggregators (D&B)", source: "Firmographics bulk API", status: "Flagged", flagReason: "Duplicate suspect" },
  { id: "HITL-006", company: "Maple Finance Co", tier: "Tier 1", workflow: "Specialized Sources (Banking)", source: "FDIC", status: "Reviewed" },
  { id: "HITL-007", company: "SilverLine Media", tier: "Tier 4", workflow: "Web Crawling", source: "Company websites", status: "Pending" },
  { id: "HITL-008", company: "TechFlow Solutions", tier: "Tier 1", workflow: "Event Monitoring", source: "UPTIME system", status: "Flagged", flagReason: "IPO filing review" },
  { id: "HITL-009", company: "Delta Logistics", tier: "Tier 3", workflow: "Registry Data", source: "U.S. SOS", status: "Pending" },
  { id: "HITL-010", company: "Orion Pharma", tier: "Tier 2", workflow: "Data Extraction - Reports (XBRL/HTML)", source: "SEC EDGAR structured filings", status: "Reviewed" },
  { id: "HITL-011", company: "BlueStar Energy", tier: "Tier 4", workflow: "Scoring & Refresh", source: "Cross-source merging", status: "Pending" },
  { id: "HITL-012", company: "Crimson Ventures", tier: "Tier 3", workflow: "Specialized Sources (Tax)", source: "IRS", status: "Flagged", flagReason: "Tax ID conflict" },
];

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Flagged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Reviewed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function HITLReviewScreen() {
  const [tierFilter, setTierFilter] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<HITLRecord | null>(null);

  const filtered = useMemo(() => {
    return sampleRecords.filter((r) => {
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      if (workflowFilter !== "all" && r.workflow !== workflowFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !r.company.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tierFilter, workflowFilter, sourceFilter, statusFilter, search]);

  const counts = useMemo(() => {
    return { total: 1248, pending: 437, flagged: 186, reviewed: 625 };
  }, []);

  const metricCards = [
    { label: "Total", value: counts.total, icon: <ClipboardList className="w-[18px] h-[18px]" />, accent: "text-primary" },
    { label: "Pending", value: counts.pending, icon: <Clock className="w-[18px] h-[18px]" />, accent: "text-yellow-600 dark:text-yellow-400" },
    { label: "Flagged", value: counts.flagged, icon: <Flag className="w-[18px] h-[18px]" />, accent: "text-red-600 dark:text-red-400" },
    { label: "Reviewed", value: counts.reviewed, icon: <CheckCircle className="w-[18px] h-[18px]" />, accent: "text-emerald-600 dark:text-emerald-400" },
  ];

  if (selectedRecord) {
    return <HITLRecordReview record={selectedRecord} onBack={() => setSelectedRecord(null)} />;
  }

  return (
    <div className="space-y-3">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-4 gap-2.5">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-card rounded-lg p-3.5 shadow-card border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="text-[12px] font-medium text-foreground leading-snug">{card.label}</div>
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 opacity-50">
                {card.icon}
              </div>
            </div>
            <div className={`text-[26px] font-normal tracking-tight leading-none tabular-nums ${card.accent}`}>
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      <div className="bg-card rounded-lg border border-border shadow-card p-3.5">
        <div className="grid grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tier</label>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Tiers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Workflow</label>
            <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Workflows" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                {workflows.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Source</label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Sources" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Company</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search company…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 text-xs pl-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Review Queue</span>
          <span className="text-[11px] text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] table-fixed">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[10%]">ID</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[22%]">Company</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[8%]">Tier</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[20%]">Workflow</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[18%]">Source</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[10%]">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider w-[12%]">Flag Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">No records match the current filters.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-1.5">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="font-mono text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
                      >
                        {r.id}
                      </button>
                    </td>
                    <td className="px-4 py-1.5 font-normal text-foreground truncate">{r.company}</td>
                    <td className="px-4 py-1.5 text-muted-foreground">{r.tier}</td>
                    <td className="px-4 py-1.5 text-muted-foreground truncate">{r.workflow}</td>
                    <td className="px-4 py-1.5 text-muted-foreground truncate">{r.source}</td>
                    <td className="px-4 py-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground truncate">{r.flagReason ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
