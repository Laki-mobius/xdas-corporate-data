import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import {
  Clock, Activity, CheckCircle2, XCircle, Search, ChevronDown, ChevronUp,
  MoreHorizontal, Download, RotateCcw, StopCircle, Play, Upload, X, FileText,
  CalendarIcon, Timer,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import InsightDrawer from "@/components/InsightDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  jobsData, summaryStats, alertsData, scheduleData, formatNumber,
  type Job, type JobStatus, type FlowStep,
} from "@/data/job-status-data";

/* ── Status badge ── */
function StatusBadge({ status }: { status: JobStatus }) {
  const config: Record<JobStatus, { bg: string; icon: React.ReactNode }> = {
    Running: {
      bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      icon: <Activity className="w-3 h-3 animate-pulse" />,
    },
    Completed: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Failed: {
      bg: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <XCircle className="w-3 h-3" />,
    },
    Scheduled: {
      bg: "bg-muted text-muted-foreground border-border",
      icon: <Clock className="w-3 h-3" />,
    },
    Pending: {
      bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${c.bg}`}>
      {c.icon} {status}
    </span>
  );
}

/* ── Execution flow diagram ── */
function ExecutionFlow({ job }: { job: Job }) {
  const stateStyles: Record<string, string> = {
    complete: "bg-emerald-500 border-emerald-500",
    active: "bg-blue-500 border-blue-500 animate-pulse",
    pending: "bg-transparent border-muted-foreground/40",
    failed: "bg-destructive border-destructive",
  };
  const stateIcon = (state: string) => {
    if (state === 'complete') return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
    return <span className={`w-2 h-2 rounded-full ${state === 'active' ? 'bg-white' : state === 'failed' ? 'bg-white' : 'bg-muted-foreground/40'}`} />;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Execution Flow</span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">REAL-TIME VIEW</span>
      </div>
      <div className="relative flex items-center justify-between px-4">
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
        {job.flowSteps.map((step, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${stateStyles[step.state]}`}>
              {stateIcon(step.state)}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <Card className="flex-1 p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Runtime</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{job.runtime}</p>
        </Card>
        <Card className="flex-1 p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Error Rate</p>
          <p className={`text-sm font-bold mt-0.5 ${parseFloat(job.errorRate) < 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>{job.errorRate}</p>
        </Card>
      </div>
    </div>
  );
}

/* ── Execution log ── */
function ExecutionLog({ job }: { job: Job }) {
  const levelColor: Record<string, string> = {
    INFO: 'text-blue-400',
    SUCCESS: 'text-emerald-400',
    WARN: 'text-amber-400',
    ERROR: 'text-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Execution Log</span>
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">View JSON</Button>
      </div>
      <div className="bg-slate-950 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {job.logs.length === 0 ? (
          <span className="text-slate-500">No log entries yet.</span>
        ) : (
          job.logs.map((entry, i) => (
            <div key={i}>
              <span className="text-slate-500">[{entry.time}]</span>{" "}
              <span className={levelColor[entry.level]}>{entry.level}</span>{" "}
              <span className="text-slate-300">{entry.message}</span>
            </div>
          ))
        )}
        {job.status === 'Running' && (
          <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse mt-1" />
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5">
          <RotateCcw className="w-3 h-3" /> Restart
        </Button>
        <Button variant="destructive" size="sm" className="h-7 text-[11px] gap-1.5">
          <StopCircle className="w-3 h-3" /> Terminate
        </Button>
      </div>
    </div>
  );
}

/* ── Job group panel ── */
function JobGroup({ label, jobs, expandedId, onToggle }: {
  label: string;
  jobs: Job[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const activeCount = jobs.filter(j => j.status === 'Running').length + jobs.filter(j => j.status === 'Pending').length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="shadow-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2.5">
              {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              <span className="text-[13px] font-medium text-foreground">{label}</span>
              <Badge variant="secondary" className="text-[10px] font-semibold">{activeCount} Active</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[12%] text-[11px] py-1.5 h-8">Job ID</TableHead>
                  <TableHead className="w-[30%] text-[11px] py-1.5 h-8">Workflow Name</TableHead>
                  <TableHead className="w-[14%] text-[11px] py-1.5 h-8">Status</TableHead>
                  <TableHead className="w-[14%] text-[11px] py-1.5 h-8">Records</TableHead>
                  <TableHead className="w-[22%] text-[11px] py-1.5 h-8">Progress</TableHead>
                  <TableHead className="w-[8%] text-right text-[11px] py-1.5 h-8">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <>
                    <TableRow
                      key={job.id}
                      onClick={() => onToggle(job.id)}
                      className={`cursor-pointer transition-colors ${expandedId === job.id ? 'bg-muted/30' : 'hover:bg-muted/10'}`}
                    >
                      <TableCell className="font-mono text-[11px] text-muted-foreground py-1.5">{job.id}</TableCell>
                      <TableCell className="text-[12px] font-normal py-1.5">{job.name}</TableCell>
                      <TableCell className="py-1.5"><StatusBadge status={job.status} /></TableCell>
                      <TableCell className="text-[12px] tabular-nums py-1.5">{job.records > 0 ? formatNumber(job.records) : '—'}</TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2">
                          <Progress value={job.progress} className="h-1.5 flex-1" />
                          <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">{job.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={job.status !== 'Completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            const anyJob = job as Job & { _csvColumns?: string[]; _csvRows?: string[][] };
                            if (anyJob._csvColumns && anyJob._csvRows) {
                              const csvContent = [
                                anyJob._csvColumns.join(','),
                                ...anyJob._csvRows.map(row => row.join(','))
                              ].join('\n');
                              const blob = new Blob([csvContent], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${job.id}_output.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === job.id && (
                      <TableRow key={`${job.id}-detail`} className="hover:bg-transparent">
                        <TableCell colSpan={6} className="p-0">
                          <div className="grid grid-cols-2 gap-6 p-5 bg-muted/20 border-t border-border">
                            <ExecutionFlow job={job} />
                            <ExecutionLog job={job} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/* ── Right panel ── */
function RightPanel() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof alertsData[number] | null>(null);

  const typeColor: Record<string, string> = {
    Error: 'border-destructive text-destructive',
    Warning: 'border-amber-500 text-amber-600 dark:text-amber-400',
    Event: 'border-blue-400 text-blue-600 dark:text-blue-400',
    Insight: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  };

  const jobAlerts = alertsData.filter(a => a.category === 'job' || a.category === 'workflow');
  const macroAlerts = alertsData.filter(a => a.category === 'macro');

  const handleViewDetails = (alert: typeof alertsData[number]) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const renderAlert = (alert: typeof alertsData[number], i: number) => (
    <div key={i} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="outline" className={`text-[9px] font-semibold ${typeColor[alert.type]}`}>{alert.type}</Badge>
        <span className="text-[10px] text-muted-foreground">{alert.time}</span>
      </div>
      <p className="text-[12px] font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">{alert.title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
      <Button variant="link" className="h-auto p-0 mt-1 text-[10px]" onClick={() => handleViewDetails(alert)}>View Details</Button>
    </div>
  );

  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-5">
      <Card className="shadow-card">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-[13px] font-bold text-foreground">Workflow Activity</span>
          <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 dark:text-emerald-400">{macroAlerts.length} Insights</Badge>
        </div>
        <CardContent className="p-0 divide-y divide-border max-h-[420px] overflow-y-auto">
          {macroAlerts.map(renderAlert)}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <div className="px-5 py-3.5 border-b border-border">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Upcoming Schedule</span>
        </div>
        <CardContent className="p-0 divide-y divide-border">
          {scheduleData.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-[12px] font-semibold text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.frequency}</p>
              </div>
              <span className="font-mono text-[11px] font-semibold bg-muted px-2 py-1 rounded">{item.nextRun}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <InsightDrawer open={drawerOpen} onOpenChange={setDrawerOpen} alert={selectedAlert} />
    </div>
  );
}

/* ── Run New Job Modal ── */
function RunNewJobModal({ open, onOpenChange, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (job: Job) => void;
}) {
  const [jobName, setJobName] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('file');
  const [manualInput, setManualInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileEntities, setFileEntities] = useState<string[]>([]);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileCsvRows, setFileCsvRows] = useState<string[][]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const entityCount = inputMode === 'text'
    ? manualInput.split(/[\n,]+/).filter(s => s.trim()).length
    : fileEntities.length;

  const canSubmit = jobName.trim() && selectedWorkflows.length > 0 && entityCount > 0;

  const workflowDefs = [
    { id: 'company_data', label: 'Company Data Extraction', desc: 'Website profile data',
      attributes: ["Company Name","Legal Name","Address","City","State","Zip Code","Phone Number","Email ID","Website URL","Industry / Sector","CEO / Founder","LinkedIn URL","Twitter URL"] },
    { id: 'registry_data', label: 'Registry Data Extraction', desc: 'Registration & structure',
      attributes: ["Company Name","Office Address","Registration Number","Incorporation Date","Company Status","Parent Name","Subsidiary Name","Entity Type","Country","Ownership %","Coverage","LEI","Status","SIC Code","Jurisdiction","Ultimate Parent","Hierarchy Level"] },
    { id: 'sec_data', label: 'SEC Data', desc: 'SEC filings & financials',
      attributes: ["Company Name","CIK","Ticker Symbol","Revenue","Net Income","EBITDA","Total Assets","Liabilities","Shares Outstanding"] },
    { id: 'stock_exchange', label: 'Stock Exchange Data', desc: 'Trading & market data',
      attributes: ["Company Name","Address","Stock Price (Current)","Stock Price (Open)","Stock Price (Close)","Market Capitalization","Exchange Name","Trading Status"] },
  ];

  const mergedAttributes = useMemo(() => {
    const attrSet = new Set<string>();
    for (const id of selectedWorkflows) {
      const wf = workflowDefs.find(w => w.id === id);
      if (wf) wf.attributes.forEach(a => attrSet.add(a));
    }
    return Array.from(attrSet);
  }, [selectedWorkflows]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      if (rows.length === 0) return;
      const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const attributeColumns = headers.slice(1);
      setFileColumns(attributeColumns);
      const dataRows = rows.slice(1).filter(r => r.split(',').some(c => c.trim()));
      setFileEntities(dataRows.map(r => r.split(',')[0]?.trim().replace(/^"|"$/g, '') || ''));
      setFileCsvRows(dataRows.map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, ''))));
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    const nextId = `JOB-${9000 + Math.floor(Math.random() * 999)}`;
    const runningFlow: FlowStep[] = [
      { label: 'Source', state: 'complete' },
      { label: 'Extract', state: 'active' },
      { label: 'Transform', state: 'pending' },
      { label: 'Validate', state: 'pending' },
      { label: 'Load', state: 'pending' },
    ];
    const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    const extractionAttrs = inputMode === 'file' && fileColumns.length > 0 ? fileColumns : mergedAttributes;
    const companiesForExtraction = inputMode === 'file' ? fileCsvRows.map(r => r[0] || '') : manualInput.split(/[\n,]+/).filter(s => s.trim());
    const workflowLabels = selectedWorkflows.map(id => workflowDefs.find(w => w.id === id)?.label || id);

    const newJob: Job = {
      id: nextId,
      name: jobName,
      status: 'Running',
      records: entityCount,
      progress: 10,
      group: 'extraction',
      tier: workflowLabels.join(', '),
      flowSteps: runningFlow,
      logs: [
        { time: now(), level: 'INFO', message: `Job initialized. ${entityCount} entities targeted.` },
        { time: now(), level: 'INFO', message: `Workflows: ${workflowLabels.join(', ')}` },
        { time: now(), level: 'INFO', message: `Extracting ${extractionAttrs.length} attributes` },
        { time: now(), level: 'SUCCESS', message: 'Connection established. Extraction started.' },
      ],
      runtime: '0h 00m 00s',
      errorRate: '0.00%',
      _csvColumns: undefined,
      _csvRows: undefined,
      _companiesForExtraction: companiesForExtraction,
      _attributesForExtraction: extractionAttrs,
    } as Job & { _csvColumns?: string[]; _csvRows?: string[][]; _companiesForExtraction?: string[]; _attributesForExtraction?: string[] };
    onSubmit(newJob);
    setJobName('');
    setSelectedWorkflows([]);
    setManualInput('');
    setFileName(null);
    setFileEntities([]);
    setFileColumns([]);
    setFileCsvRows([]);
    setInputMode('file');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Run New Job</DialogTitle>
              <DialogDescription className="text-[12px]">
                Select workflows and provide entities for extraction
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Job Name */}
          <div className="space-y-1.5">
            <Label htmlFor="job-name" className="text-[13px] font-semibold">
              Job Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="job-name"
              placeholder="e.g. Q2 Fintech Ad-hoc Enrichment"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="h-10 text-[13px]"
            />
          </div>

          {/* Workflow Selection - Multi-select */}
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">
              Workflow Selection <span className="text-destructive">*</span>
              <span className="text-[11px] font-normal text-muted-foreground ml-2">Select one or more</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {workflowDefs.map((wf) => {
                const selected = selectedWorkflows.includes(wf.id);
                return (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => toggleWorkflow(wf.id)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-3 text-left transition-colors cursor-pointer",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                        selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className={cn("text-[12px] leading-tight", selected ? "text-primary font-semibold" : "text-foreground")}>{wf.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 ml-6">{wf.desc}</p>
                  </button>
                );
              })}
            </div>
            {selectedWorkflows.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {mergedAttributes.length} attributes will be extracted
              </p>
            )}
          </div>

          {/* Entity Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold">
                Entity Identifiers <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={inputMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[11px] rounded-full px-3"
                  onClick={() => setInputMode('file')}
                >
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[11px] rounded-full px-3"
                  onClick={() => setInputMode('text')}
                >
                  Manual Entry
                </Button>
              </div>
            </div>

            {inputMode === 'text' ? (
              <Textarea
                placeholder={"Enter one entity identifier per line:\nAAPL\nMSFT\n0000078814\nGB00BH4HKS39"}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="text-[13px] min-h-[130px] font-mono"
              />
            ) : (
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  className="hidden"
                  onChange={handleFile}
                />
                {fileName ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-foreground">{fileName}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => { setFileName(null); setFileEntities([]); setFileColumns([]); setFileCsvRows([]); }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{fileEntities.length} entities detected</span>
                      {fileColumns.length > 0 && (
                        <span className="text-muted-foreground">• {fileColumns.length} attributes</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-[12px] text-muted-foreground mb-1">Drop a CSV or TXT file, or</p>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => fileRef.current?.click()}>
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Accepted: ticker symbols, registration numbers, LEIs, CIK codes
            </p>

            {/* Schedule Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[12px] gap-1.5 px-4 border-primary text-primary hover:bg-primary/5"
                onClick={() => setShowScheduleModal(true)}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-2">
          <Button variant="outline" size="sm" className="h-9 text-[12px] px-5" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="h-9 text-[12px] gap-1.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white" disabled={!canSubmit} onClick={handleSubmit}>
            <Play className="w-3.5 h-3.5" /> Run Job
          </Button>
        </div>
      </DialogContent>

      {/* Schedule Modal */}
      <ScheduleModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
    </Dialog>
  );
}

/* ── Schedule Modal ── */
function ScheduleModal({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [project, setProject] = useState('');
  const [timezone, setTimezone] = useState('(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi');
  const [frequency, setFrequency] = useState<'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('ONCE');
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');

  const handleSchedule = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] z-[200]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Add Schedule</DialogTitle>
          <DialogDescription className="sr-only">Configure job scheduling</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Projects */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Projects</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="h-9 text-[13px] flex-1">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                <SelectItem value="initiatives">Initiatives</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="enrichment">Enrichment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Input</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-4 border-primary text-primary">
                Upload Options
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-4 border-primary text-primary">
                Download Template
              </Button>
            </div>
          </div>

          {/* Timezone */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-9 text-[13px] flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                <SelectItem value="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</SelectItem>
                <SelectItem value="(UTC+00:00) London, Dublin">(UTC+00:00) London, Dublin</SelectItem>
                <SelectItem value="(UTC-05:00) Eastern Time">(UTC-05:00) Eastern Time</SelectItem>
                <SelectItem value="(UTC-08:00) Pacific Time">(UTC-08:00) Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Frequency</Label>
            <div className="flex gap-2">
              {(['ONCE', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors",
                    frequency === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] h-9 justify-start text-left text-[13px] font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[300]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center cursor-pointer">
              <CalendarIcon className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-semibold w-28 shrink-0">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-[180px] h-9 text-[13px]"
            />
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Timer className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-2">
          <Button variant="outline" size="sm" className="h-9 text-[12px] px-5" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="h-9 text-[12px] px-5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSchedule}>
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main component ── */
export default function JobStatusDashboard() {
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [adhocJobs, setAdhocJobs] = useState<Job[]>([]);
  const [dbIdMap, setDbIdMap] = useState<Record<string, string>>({});

  // Load jobs from Supabase on mount
  useEffect(() => {
    if (!session?.user?.id) return;
    const loadJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const mapped: Job[] = data.map((row: any) => ({
          id: row.job_id,
          name: row.name,
          status: row.status as JobStatus,
          records: row.records,
          progress: row.progress,
          group: 'extraction' as const,
          tier: row.tier,
          flowSteps: row.flow_steps as FlowStep[],
          logs: row.logs as any[],
          runtime: row.runtime,
          errorRate: row.error_rate,
          _csvColumns: row.csv_columns,
          _csvRows: row.csv_rows,
        }));
        setAdhocJobs(mapped);
        const idMap: Record<string, string> = {};
        data.forEach((row: any) => { idMap[row.job_id] = row.id; });
        setDbIdMap(idMap);
      }
    };
    loadJobs();
  }, [session?.user?.id]);

  const allJobs = useMemo(() => [...adhocJobs, ...jobsData], [adhocJobs]);

  const saveJobToDb = useCallback(async (job: Job & { _csvColumns?: string[]; _csvRows?: string[][] }, dbId?: string): Promise<string | undefined> => {
    if (!session?.user?.id) return undefined;
    const payload = {
      user_id: session.user.id,
      job_id: job.id,
      name: job.name,
      status: job.status,
      records: job.records,
      progress: job.progress,
      tier: job.tier,
      runtime: job.runtime,
      error_rate: job.errorRate,
      flow_steps: job.flowSteps as any,
      logs: job.logs as any,
      csv_columns: job._csvColumns || null,
      csv_rows: job._csvRows || null,
    };
    if (dbId) {
      await supabase.from('jobs').update(payload).eq('id', dbId);
      return dbId;
    } else {
      const { data } = await supabase.from('jobs').insert(payload).select('id').single();
      if (data) {
        setDbIdMap(prev => ({ ...prev, [job.id]: data.id }));
        return data.id;
      }
    }
    return undefined;
  }, [session?.user?.id]);

  const handleNewJob = useCallback(async (job: Job) => {
    const extJob = job as Job & { _csvColumns?: string[]; _csvRows?: string[][]; _companiesForExtraction?: string[]; _attributesForExtraction?: string[] };
    const companies = extJob._companiesForExtraction || [];
    const attributes = extJob._attributesForExtraction || [];
    setAdhocJobs(prev => [extJob, ...prev]);
    
    // Save initial job to DB and get DB id
    const dbIdResult = await saveJobToDb(extJob);

    // Start progress animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      setAdhocJobs(prev => prev.map(j => j.id === job.id && j.status === 'Running' ? {
        ...j,
        progress: Math.min(90, Math.round((elapsed / 60000) * 90)),
        flowSteps: [
          { label: 'Source', state: 'complete' as const },
          { label: 'Extract', state: seconds < 5 ? 'active' as const : 'complete' as const },
          { label: 'Transform', state: seconds >= 5 && seconds < 15 ? 'active' as const : seconds >= 15 ? 'complete' as const : 'pending' as const },
          { label: 'Validate', state: seconds >= 15 && seconds < 25 ? 'active' as const : seconds >= 25 ? 'complete' as const : 'pending' as const },
          { label: 'Load', state: seconds >= 25 ? 'active' as const : 'pending' as const },
        ],
        runtime: `0h ${String(Math.floor(seconds / 60)).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`,
      } : j));
    }, 1000);

    // Call edge function for real extraction
    try {
      const response = await supabase.functions.invoke('extract-data', {
        body: {
          companies,
          attributes,
          jobDbId: dbIdResult,
        },
      });

      clearInterval(progressInterval);

      if (response.error) throw new Error(response.error.message || 'Extraction failed');

      const { columns, rows } = response.data;
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);

      setAdhocJobs(prev => {
        const updated = prev.map(j => j.id === job.id ? {
          ...j,
          progress: 100,
          status: 'Completed' as JobStatus,
          flowSteps: [
            { label: 'Source', state: 'complete' as const },
            { label: 'Extract', state: 'complete' as const },
            { label: 'Transform', state: 'complete' as const },
            { label: 'Validate', state: 'complete' as const },
            { label: 'Load', state: 'complete' as const },
          ],
          runtime: `0h ${String(Math.floor(seconds / 60)).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`,
          errorRate: '0.00%',
          _csvColumns: columns,
          _csvRows: rows,
          logs: [
            ...j.logs,
            { time: nowTime, level: 'INFO' as const, message: `Extracted ${j.records} records successfully.` },
            { time: nowTime, level: 'SUCCESS' as const, message: 'All attributes extracted. Job completed.' },
          ],
        } : j);
        // Persist completed state
        const completedJob = updated.find(j => j.id === job.id);
        if (completedJob) {
          setDbIdMap(prev => {
            const dbIdVal = prev[job.id];
            if (dbIdVal) saveJobToDb(completedJob as any, dbIdVal);
            return prev;
          });
        }
        return updated;
      });
    } catch (err) {
      clearInterval(progressInterval);
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      console.error('Extraction error:', err);
      setAdhocJobs(prev => prev.map(j => j.id === job.id ? {
        ...j,
        progress: 100,
        status: 'Failed' as JobStatus,
        runtime: `0h ${String(Math.floor(seconds / 60)).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`,
        logs: [
          ...j.logs,
          { time: nowTime, level: 'ERROR' as const, message: `Extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
        ],
      } : j));
    }
  }, [saveJobToDb]);

  const filtered = useMemo(() => {
    return allJobs.filter(j => {
      const matchSearch = search === '' ||
        j.id.toLowerCase().includes(search.toLowerCase()) ||
        j.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, allJobs]);

  const extractionJobs = filtered.filter(j => j.group === 'extraction');
  const aggregatorJobs = filtered.filter(j => j.group === 'aggregators');
  const specializedJobs = filtered.filter(j => j.group === 'specialized');
  const processingJobs = filtered.filter(j => j.group === 'processing');

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const statChips = [
    { label: 'Total Jobs Today', value: summaryStats.totalToday.toLocaleString(), icon: Clock, color: 'text-foreground', sub: 'All automation workflows' },
    { label: 'Running', value: summaryStats.running.toString(), icon: Activity, color: 'text-blue-600 dark:text-blue-400', sub: 'Currently in progress' },
    { label: 'Completed', value: summaryStats.completed.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', sub: 'Successfully finished' },
    { label: 'Failed', value: summaryStats.failed.toString(), icon: XCircle, color: 'text-destructive', sub: 'Requires attention' },
  ];

  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between">
          <div className="border-l-[3px] border-primary pl-4">
            <h1 className="text-[18px] font-bold text-foreground">Job Status Dashboard</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Real-time operational visibility into data automation jobs.</p>
          </div>
          <Button className="gap-1.5 text-[12px] h-8" onClick={() => setShowNewJobModal(true)}>
            <Play className="w-3.5 h-3.5" /> Run New Job
          </Button>
        </div>

        <RunNewJobModal open={showNewJobModal} onOpenChange={setShowNewJobModal} onSubmit={handleNewJob} />

        <div className="grid grid-cols-4 gap-2.5 mb-3">
          {statChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <div key={chip.label} className="bg-card border border-border rounded-lg p-3.5 cursor-default transition-all duration-150 hover:bg-brand-light hover:border-brand-mid hover:shadow-[0_2px_10px_rgba(26,122,74,0.07)] hover:-translate-y-px">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-normal text-foreground leading-tight">{chip.label}</div>
                  <div className="text-muted-foreground shrink-0 opacity-55">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <div className="text-[28px] font-normal text-foreground tracking-[-1.5px] leading-none">
                    {chip.value}
                  </div>
                </div>
                {chip.sub && <div className="text-xs text-muted-foreground">{chip.sub}</div>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Job ID, Category, or Name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[12px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-[12px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-[12px] px-3">Last 24 Hours</Button>
        </div>

        <div className="space-y-3">
          {extractionJobs.length > 0 && (
            <JobGroup label="Data Extraction & Sources" jobs={extractionJobs} expandedId={expandedId} onToggle={toggleExpand} />
          )}
          {aggregatorJobs.length > 0 && (
            <JobGroup label="Third-party Aggregators" jobs={aggregatorJobs} expandedId={expandedId} onToggle={toggleExpand} />
          )}
          {specializedJobs.length > 0 && (
            <JobGroup label="Specialized Sources" jobs={specializedJobs} expandedId={expandedId} onToggle={toggleExpand} />
          )}
          {processingJobs.length > 0 && (
            <JobGroup label="Data Processing & QC" jobs={processingJobs} expandedId={expandedId} onToggle={toggleExpand} />
          )}
        </div>
      </div>

      <RightPanel />
    </div>
  );
}
