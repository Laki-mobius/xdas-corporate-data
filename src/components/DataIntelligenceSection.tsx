import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Upload, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dataGroups, formatCount } from '@/data/data-intelligence-data';
import type { DataGroup } from '@/data/data-intelligence-data';

export default function DataIntelligenceSection() {
  const [selectedGroupId, setSelectedGroupId] = useState(dataGroups[0].id);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searched, setSearched] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const group: DataGroup = dataGroups.find(g => g.id === selectedGroupId) ?? dataGroups[0];

  const handleGroupChange = (id: string) => {
    setSelectedGroupId(id);
    setFilters({});
    setSearched(false);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setSearched(true);
  };

  const handleReset = () => {
    setFilters({});
    setSearched(false);
  };

  const appliedCount = Object.values(filters).filter(v => v && !v.startsWith('All') && v !== 'Complete').length;

  const simulateProgress = useCallback((label: string, onDone: () => void) => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return p + 7;
      });
    }, 110);
  }, []);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    simulateProgress('download', () => {
      setDownloading(false);
      toast({ title: 'Download ready', description: `${formatCount(group.totalRecords)} records exported as ${exportFormat.toUpperCase()}.` });
    });
  }, [group.totalRecords, exportFormat, simulateProgress]);

  const handlePush = useCallback(() => {
    setPushing(true);
    simulateProgress('push', () => {
      setPushing(false);
      toast({ title: 'API push complete', description: `${formatCount(group.totalRecords)} records pushed to configured endpoint.` });
    });
  }, [group.totalRecords, simulateProgress]);

  const isProcessing = downloading || pushing;

  return (
    <section id="data-intelligence" className="mt-3">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground leading-tight">Data Intelligence</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Query, preview, and export datasets across multiple data groups</p>
          </div>
          <span className="ml-auto text-[12px] font-bold px-2.5 py-1 rounded-full bg-brand text-primary-foreground tabular-nums">
            {formatCount(group.totalRecords)} records
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* ── Dataset Group Selector ── */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Select Dataset</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dataGroups.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleGroupChange(g.id)}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-all cursor-pointer',
                    'hover:border-brand/40',
                    selectedGroupId === g.id
                      ? 'border-brand bg-brand-light shadow-sm'
                      : 'border-border bg-surface'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{g.icon}</span>
                    <span className={cn('text-[12px] font-semibold', selectedGroupId === g.id ? 'text-brand' : 'text-foreground')}>{g.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{g.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Filters (max 3 per group) ── */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Filters</h3>
            <div className="flex items-end gap-3 flex-wrap">
              {group.filters.map(f => (
                <div key={f.key} className="space-y-1 min-w-[160px]">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{f.label}</label>
                  <Select value={filters[f.key] ?? f.options[0]} onValueChange={v => updateFilter(f.key, v)}>
                    <SelectTrigger className="h-9 text-[13px] bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map(opt => (
                        <SelectItem key={opt} value={opt} className="text-[13px]">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className={cn(
                    'h-9 px-5 rounded-lg text-[13px] font-semibold border-none cursor-pointer transition-colors flex items-center gap-2 active:scale-[0.97]',
                    'bg-brand text-primary-foreground hover:bg-brand-dark'
                  )}
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="h-9 px-4 rounded-lg text-[13px] font-medium border border-border text-muted-foreground bg-card cursor-pointer transition-colors hover:bg-secondary active:scale-[0.97]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* ── Selection Summary ── */}
          <div className="flex items-center gap-4 bg-surface rounded-lg px-4 py-3 border border-border">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wide">Selection Summary</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums mt-0.5">
                {formatCount(group.totalRecords)} records · {group.label}
              </p>
              {appliedCount > 0 ? (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {appliedCount} filter{appliedCount > 1 ? 's' : ''} applied
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1">No filters applied — full dataset selected</p>
              )}
            </div>
          </div>

          {/* ── Preview Table ── */}
          {searched && (
            <div>
              <h3 className="text-[13px] font-semibold text-foreground mb-2">Data Preview</h3>
              <div className="border border-border rounded-lg overflow-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-surface text-muted-foreground">
                      {group.columns.map(col => (
                        <th key={col.key} className={cn('font-semibold px-3 py-2', col.align === 'right' ? 'text-right' : 'text-left')}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.sampleRows.map((row, i) => (
                      <tr key={i} className="border-t border-border hover:bg-surface/60 transition-colors">
                        {group.columns.map(col => (
                          <td key={col.key} className={cn('px-3 py-2', col.align === 'right' ? 'text-right tabular-nums text-foreground' : 'text-foreground')}>
                            {typeof row[col.key] === 'number' && col.key === 'coverageScore' ? (
                              <CoverageDot score={row[col.key] as number} />
                            ) : col.key === 'entityType' || col.key === 'eventType' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-brand-light text-brand">
                                {String(row[col.key])}
                              </span>
                            ) : col.key === 'employees' && typeof row[col.key] === 'number' ? (
                              (row[col.key] as number).toLocaleString()
                            ) : (
                              String(row[col.key] ?? '')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Showing {group.sampleRows.length} of {formatCount(group.totalRecords)} records · Full data available via Download or API Push
              </p>
            </div>
          )}

          {!searched && (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-[13px]">
              Select filters above and click <span className="font-semibold text-brand mx-1">Apply Filters</span> to preview data
            </div>
          )}

          {/* ── Export Actions ── */}
          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border">
            {/* Format Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Format</span>
              <div className="flex gap-1">
                {(['csv', 'json'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={cn(
                      'py-[3px] px-2.5 rounded-[20px] border text-[11px] font-medium cursor-pointer transition-colors uppercase',
                      exportFormat === fmt
                        ? 'bg-foreground border-foreground text-background'
                        : 'bg-card border-border text-muted-foreground'
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isProcessing || !searched}
              className={cn(
                'h-9 px-4 rounded-lg text-[13px] font-semibold border-none cursor-pointer transition-colors flex items-center gap-2 active:scale-[0.97]',
                'bg-brand text-primary-foreground hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Download className="w-4 h-4" />
              {downloading ? `Generating ${exportFormat.toUpperCase()}…` : `Download ${exportFormat.toUpperCase()}`}
            </button>

            <button
              onClick={handlePush}
              disabled={isProcessing || !searched}
              className={cn(
                'h-9 px-4 rounded-lg text-[13px] font-semibold border border-brand text-brand bg-card cursor-pointer transition-colors flex items-center gap-2 active:scale-[0.97]',
                'hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Upload className="w-4 h-4" />
              {pushing ? 'Pushing…' : 'Push to API'}
            </button>

            {isProcessing && (
              <div className="flex-1 min-w-[120px] max-w-[260px]">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-150" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">{Math.min(progress, 100)}% complete</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Coverage dot (reused from old component) ─── */
function CoverageDot({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-status-good' : score >= 70 ? 'bg-status-amber' : 'bg-status-red';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', color)} />
      <span>{score.toFixed(1)}%</span>
    </span>
  );
}
