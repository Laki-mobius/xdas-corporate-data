import { useState, useMemo } from 'react';
import { ShieldCheck, BarChart3, Target } from 'lucide-react';
import { ModalShell, ModalHeader, SectionLabel, FilterToolbar } from './ModalParts';
import { dataGroups } from '@/data/dashboard-data';
import { cn } from '@/lib/utils';

const qcAttributes = [
  { name: 'Company Name', accuracy: 99, correct: 99, total: 100, status: 'passed' as const, issues: '1 Minor Typo' },
  { name: 'Headquarters Country', accuracy: 98, correct: 98, total: 100, status: 'passed' as const, issues: '2 Abbreviation Issues' },
  { name: 'Foundation Year', accuracy: 99, correct: 99, total: 100, status: 'passed' as const, issues: '1 Null Value' },
  { name: 'Industry Sector', accuracy: 95, correct: 95, total: 100, status: 'warning' as const, issues: '5 Misclassifications' },
  { name: 'Employee Count', accuracy: 91, correct: 91, total: 100, status: 'warning' as const, issues: '9 Outdated Data' },
  { name: 'Revenue Range', accuracy: 96, correct: 96, total: 100, status: 'passed' as const, issues: '4 Formatting Errors' },
  { name: 'Street Address', accuracy: 97, correct: 97, total: 100, status: 'passed' as const, issues: '3 Formatting Issues' },
  { name: 'Phone Number', accuracy: 88, correct: 88, total: 100, status: 'failed' as const, issues: '12 Invalid Formats' },
  { name: 'NAICS Code', accuracy: 96, correct: 96, total: 100, status: 'passed' as const, issues: '4 Mapping Errors' },
  { name: 'Website', accuracy: 93, correct: 93, total: 100, status: 'warning' as const, issues: '7 Broken Links' },
  { name: 'Net Income', accuracy: 97, correct: 97, total: 100, status: 'passed' as const, issues: '3 Rounding Errors' },
  { name: 'Executive Name', accuracy: 89, correct: 89, total: 100, status: 'failed' as const, issues: '11 Outdated Records' },
];

function CircularGauge({ value, label, subtitle, color, icon }: { value: number; label: string; subtitle: string; color: string; icon: React.ReactNode }) {
  const radius = 42;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Leave a small gap at the top (270° start with ~8% gap)
  const gapFraction = 0.15;
  const arcLength = circumference * (1 - gapFraction);
  const filledLength = arcLength * (value / 100);
  const emptyLength = arcLength - filledLength;
  const rotationDeg = 90 + (gapFraction / 2) * 360; // rotate to center the gap at the top-right

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: `rotate(${rotationDeg}deg)` }}>
          {/* Background track */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeLinecap="round" />
          {/* Filled arc */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${filledLength} ${circumference - filledLength}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-muted-foreground mb-0.5" style={{ color }}>{icon}</div>
          <div className="text-xl font-bold text-foreground leading-none">{value}%</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}

export default function AccuracyModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const [companyType, setCompanyType] = useState('all');
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return qcAttributes.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const statusPill = (status: 'passed' | 'warning' | 'failed') => {
    const cls = status === 'passed' ? 'bg-brand-light text-brand' : status === 'warning' ? 'bg-status-amber-light text-status-amber' : 'bg-destructive-light text-destructive';
    const label = status === 'passed' ? 'PASSED' : status === 'warning' ? 'WARNING' : 'FAILED';
    return <span className={cn('text-[10px] px-[7px] py-[2px] rounded-[20px] font-bold whitespace-nowrap inline-block uppercase', cls)}>{label}</span>;
  };

  return (
    <ModalShell id="modal-accuracy" onClose={onClose} fullHeight inline={inline}>
      <div className="flex-1 overflow-y-auto p-[18px_20px] flex flex-col gap-4">
        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em]">Company Type</span>
            <div className="flex gap-1">
              {[{ v: 'all', l: 'All' }, { v: 'public', l: 'Public' }, { v: 'private', l: 'Private' }].map(o => (
                <button key={o.v} onClick={() => setCompanyType(o.v)} className={cn('py-[3px] px-2.5 rounded-[20px] border text-[11px] font-medium cursor-pointer transition-colors', companyType === o.v ? 'bg-gray-900 border-gray-900 text-primary-foreground dark:bg-brand dark:border-brand' : 'bg-card border-border text-muted-foreground')}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em]">Company Tier</span>
            <div className="flex gap-1">
              {[{ v: 'all', l: 'All' }, { v: 't1', l: 'Tier 1' }, { v: 't2', l: 'Tier 2' }, { v: 't3', l: 'Tier 3' }].map(o => (
                <button key={o.v} onClick={() => setTier(o.v)} className={cn('py-[3px] px-2.5 rounded-[20px] border text-[11px] font-medium cursor-pointer transition-colors', tier === o.v ? 'bg-gray-900 border-gray-900 text-primary-foreground dark:bg-brand dark:border-brand' : 'bg-card border-border text-muted-foreground')}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em]">Record Scope</span>
            <span className="py-[3px] px-2.5 rounded-[20px] border border-border bg-surface text-[11px] font-semibold text-foreground">Sample 100</span>
          </div>
        </div>

        {/* Three Circular Gauges */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center">
            <CircularGauge value={97} label="Overall Quality" subtitle="Overall Record Accuracy" color="#1A7A4A" />
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center">
            <CircularGauge value={99} label="Attribute Fill Rate" subtitle="System Completeness" color="#185FA5" />
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center">
            <CircularGauge value={98} label="Accuracy vs QC Flag" subtitle="Avg Attribute Correctness" color="#534AB7" />
          </div>
        </div>

        {/* Attribute Level Accuracy Breakdown Table */}
        <div>
          <SectionLabel>Attribute level accuracy breakdown (Sample: 100 records)</SectionLabel>
          <div className="mb-2.5">
            <div className="relative max-w-[200px]">
              <svg viewBox="0 0 14 14" fill="none" className="absolute left-2 top-1/2 -translate-y-1/2 w-[11px] h-[11px] text-muted-foreground pointer-events-none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input className="w-full py-[5px] pr-2 pl-7 border border-border rounded-md text-[11px] bg-card text-foreground outline-none focus:border-brand" placeholder="Search attribute..." onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em] py-[7px] px-2.5 border-b-[1.5px] border-border">Attribute</th>
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em] py-[7px] px-2.5 border-b-[1.5px] border-border">Accuracy %</th>
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em] py-[7px] px-2.5 border-b-[1.5px] border-border">Correct / Total</th>
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em] py-[7px] px-2.5 border-b-[1.5px] border-border">Status</th>
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em] py-[7px] px-2.5 border-b-[1.5px] border-border">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-muted-foreground text-xs">No results</td></tr>
                  ) : filtered.map((row, i) => {
                    const barColor = row.accuracy >= 95 ? '#1A7A4A' : row.accuracy >= 90 ? '#C97A00' : '#C0392B';
                    return (
                      <tr key={i} className="hover:bg-surface">
                        <td className="py-1.5 px-2.5 border-b border-border font-medium text-foreground whitespace-nowrap text-xs">{row.name}</td>
                        <td className="py-1.5 px-2.5 border-b border-border min-w-[100px]">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-[5px] bg-border rounded-sm overflow-hidden">
                              <div className="h-full rounded-sm" style={{ width: `${row.accuracy}%`, background: barColor }} />
                            </div>
                            <span className="font-semibold text-[11px] font-mono" style={{ color: barColor }}>{row.accuracy}%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2.5 border-b border-border text-[11px] text-muted-foreground font-mono whitespace-nowrap">{row.correct}/{row.total}</td>
                        <td className="py-1.5 px-2.5 border-b border-border">{statusPill(row.status)}</td>
                        <td className="py-1.5 px-2.5 border-b border-border text-[11px] text-muted-foreground whitespace-nowrap">{row.issues}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Accuracy Split by Company Type */}
        <div>
          <SectionLabel>Accuracy split by company type</SectionLabel>
          <div className="space-y-2.5">
            {[
              { label: 'Public Companies', pct: 98, count: '231 records', color: '#185FA5' },
              { label: 'Private Companies', pct: 96, count: '961 records', color: '#1A7A4A' },
            ].map(item => (
              <div key={item.label} className="bg-surface border border-border rounded-md p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono" style={{ color: item.color }}>{item.pct}%</span>
                    <span className="text-[10px] text-muted-foreground">{item.count}</span>
                  </div>
                </div>
                <div className="h-[8px] bg-border rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
          <span>Last updated: 2026-02-27 &nbsp;|&nbsp; Next QC check: 2026-03-27</span>
        </div>
      </div>
    </ModalShell>
  );
}
