import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
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
                  <TableHead className="w-[10%] text-[11px] py-1.5 h-8">Job ID</TableHead>
                  <TableHead className="w-[28%] text-[11px] py-1.5 h-8">Workflow Name</TableHead>
                  <TableHead className="w-[10%] text-[11px] py-1.5 h-8">Tier</TableHead>
                  <TableHead className="w-[12%] text-[11px] py-1.5 h-8">Status</TableHead>
                  <TableHead className="w-[12%] text-[11px] py-1.5 h-8">Records</TableHead>
                  <TableHead className="w-[20%] text-[11px] py-1.5 h-8">Progress</TableHead>
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
                      <TableCell className="text-[11px] text-muted-foreground py-1.5">{job.tier}</TableCell>
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
                        <TableCell colSpan={7} className="p-0">
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
  const [tier, setTier] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [manualInput, setManualInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileEntities, setFileEntities] = useState<string[]>([]);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileCsvRows, setFileCsvRows] = useState<string[][]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entityCount = inputMode === 'text'
    ? manualInput.split(/[\n,]+/).filter(s => s.trim()).length
    : fileEntities.length;

  const canSubmit = jobName.trim() && tier && entityCount > 0;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      if (rows.length === 0) return;
      // First row is header
      const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      setFileColumns(headers);
      const dataRows = rows.slice(1).filter(r => r.split(',').some(c => c.trim()));
      setFileEntities(dataRows.map(r => r.split(',')[0]?.trim() || ''));
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
    const attrList = inputMode === 'file' && fileColumns.length > 0
      ? fileColumns.join(', ')
      : 'entity identifiers';
    const newJob: Job = {
      id: nextId,
      name: jobName,
      status: 'Running',
      records: entityCount,
      progress: 10,
      group: 'extraction',
      tier: `Tier ${tier}`,
      flowSteps: runningFlow,
      logs: [
        { time: now(), level: 'INFO', message: `Job initialized. ${entityCount} entities targeted.` },
        { time: now(), level: 'INFO', message: `Extracting attributes: ${attrList}` },
        { time: now(), level: 'SUCCESS', message: 'Connection established. Extraction started.' },
      ],
      runtime: '0h 00m 00s',
      errorRate: '0.00%',
      _csvColumns: inputMode === 'file' ? fileColumns : undefined,
      _csvRows: inputMode === 'file' ? fileCsvRows : undefined,
    } as Job & { _csvColumns?: string[]; _csvRows?: string[][] };
    onSubmit(newJob);
    // reset
    setJobName('');
    setTier('');
    setManualInput('');
    setFileName(null);
    setFileEntities([]);
    setFileColumns([]);
    setFileCsvRows([]);
    setInputMode('text');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Run New Job</DialogTitle>
              <DialogDescription className="text-[12px]">
                Ad-hoc extraction for custom entity list
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

          {/* Source Selection (was Tier Mapping) */}
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">
              Workflow Selection
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '1', label: 'Company Data Extraction' },
                { value: '2', label: 'Registry Data Extraction' },
                { value: '3', label: 'SEC Data' },
                { value: '4', label: 'Stock Exchanges' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTier(opt.value)}
                  className={cn(
                    "rounded-lg border-2 px-3 py-3 text-center transition-colors cursor-pointer",
                    tier === opt.value
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"
                  )}
                >
                  <span className="block text-[12px] leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
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
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">{fileName}</span>
                    <span className="text-[11px] text-muted-foreground">({fileEntities.length} entities)</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => { setFileName(null); setFileEntities([]); }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [adhocJobs, setAdhocJobs] = useState<Job[]>([]);

  const allJobs = useMemo(() => [...adhocJobs, ...jobsData], [adhocJobs]);

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

  const handleNewJob = (job: Job) => {
    setAdhocJobs(prev => [job, ...prev]);

    // Simulate extraction: progress updates then completion
    const startTime = Date.now();
    const totalDuration = 8000; // 8 seconds simulation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
      
      if (pct < 100) {
        setAdhocJobs(prev => prev.map(j => j.id === job.id ? {
          ...j,
          progress: pct,
          status: 'Running' as JobStatus,
          flowSteps: [
            { label: 'Source', state: 'complete' as const },
            { label: 'Extract', state: pct < 30 ? 'active' as const : 'complete' as const },
            { label: 'Transform', state: pct >= 30 && pct < 60 ? 'active' as const : pct >= 60 ? 'complete' as const : 'pending' as const },
            { label: 'Validate', state: pct >= 60 && pct < 85 ? 'active' as const : pct >= 85 ? 'complete' as const : 'pending' as const },
            { label: 'Load', state: pct >= 85 ? 'active' as const : 'pending' as const },
          ],
          runtime: `0h 00m ${String(Math.floor(elapsed / 1000)).padStart(2, '0')}s`,
        } : j));
      } else {
        clearInterval(interval);
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        setAdhocJobs(prev => prev.map(j => j.id === job.id ? {
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
          runtime: `0h 00m ${String(Math.round(totalDuration / 1000)).padStart(2, '0')}s`,
          errorRate: '0.00%',
          logs: [
            ...j.logs,
            { time: now, level: 'INFO' as const, message: `Extracted ${j.records} records successfully.` },
            { time: now, level: 'SUCCESS' as const, message: 'All attributes extracted. Job completed.' },
          ],
        } : j));
      }
    }, 500);
  };

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
