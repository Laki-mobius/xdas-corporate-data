import { useState, useMemo } from 'react';
import { ModalShell, ModalHeader, SectionLabel, SegmentCards, TierBreakdown, HeroCard, StatusPill, AttributeTable, FilterToolbar } from './ModalParts';
import { accData, dataGroups, getAccuracyColor } from '@/data/dashboard-data';
import { cn } from '@/lib/utils';

export default function AccuracyModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return accData.filter(a =>
      (a.name.toLowerCase().includes(search.toLowerCase()) || a.src.toLowerCase().includes(search.toLowerCase())) &&
      (group === 'all' || a.g === group) &&
      (filter === 'all' || (filter === 'good' && a.v >= 95) || (filter === 'warn' && a.v >= 90 && a.v < 95) || (filter === 'low' && a.v < 90))
    );
  }, [search, group, filter]);

  const tiers = [
    { label: 'T1', name: 'Public — US', value: '99.1%', width: '99.1%', color: '#185FA5', tierClass: 'bg-status-blue-light text-status-blue' },
    { label: 'T2', name: 'Public — Non-US', value: '97.8%', width: '97.8%', color: '#1A7A4A', tierClass: 'bg-brand-light text-brand' },
    { label: 'T3', name: 'Private — US', value: '96.9%', width: '96.9%', color: '#C97A00', tierClass: 'bg-status-amber-light text-status-amber' },
    { label: 'T4', name: 'Private — Non-US', value: '95.7%', width: '95.7%', color: '#534AB7', tierClass: 'bg-status-purple-light text-status-purple' },
  ];

  const errors = [
    { rank: 1, name: 'Parsing error', pct: 42, color: '#C0392B', cnt: '1,202' },
    { rank: 2, name: 'Mapping error', pct: 28, color: '#C97A00', cnt: '801' },
    { rank: 3, name: 'Source misinterpretation', pct: 18, color: '#185FA5', cnt: '515' },
    { rank: 4, name: 'Data currency error', pct: 12, color: 'hsl(var(--gray-400))', cnt: '343' },
  ];

  const sources = [
    { code: 'SE', name: 'SEC EDGAR', seg: 'Public', pct: 99.2, color: '#1A7A4A', bg: '#1A7A4A', status: 'good', label: 'Excellent' },
    { code: 'BB', name: 'Bloomberg', seg: 'Public', pct: 98.7, color: '#185FA5', bg: '#185FA5', status: 'good', label: 'Excellent' },
    { code: 'OR', name: 'Orbis (BvD)', seg: 'Mixed', pct: 97.1, color: '#534AB7', bg: '#534AB7', status: 'good', label: 'Good' },
    { code: 'GR', name: 'Gov. Registries', seg: 'Private', pct: 94.8, color: 'hsl(var(--gray-500))', bg: '#5C7A6B', status: 'warn', label: 'Medium' },
    { code: 'CW', name: 'Company Websites', seg: 'Mixed', pct: 89.3, color: '#C97A00', bg: '#C97A00', status: 'warn', label: 'Medium' },
    { code: 'AD', name: 'Alternative Data', seg: 'Private', pct: 82.4, color: '#C0392B', bg: '#C0392B', status: 'low', label: 'Low' },
  ];

  return (
    <ModalShell id="modal-accuracy" onClose={onClose} fullHeight>
      <ModalHeader
        title="Accuracy score"
        subtitle="Data correctness across segments, tiers and processing methods"
        iconBg="bg-brand-light"
        icon={<svg viewBox="0 0 20 20" fill="none" className="w-[19px] h-[19px] text-brand"><path d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3Z" stroke="currentColor" strokeWidth="1.5" /><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        onClose={onClose}
      />
      <div className="grid grid-cols-[280px_1fr] flex-1 overflow-hidden min-h-0">
        <div className="p-[18px_20px] overflow-y-auto border-r border-border">
          <HeroCard label="Overall accuracy" value="97.1%" subtitle="+0.3% vs previous month" ringPercent={97.1} />
          <div className="mb-4"><SectionLabel>By segment</SectionLabel><SegmentCards pubLabel="Public" pubValue="98.4%" pubSub="Daily" prvValue="96.5%" prvSub="Weekly" showBars pubBar={98.4} prvBar={96.5} /></div>
          <div className="mb-4"><SectionLabel>Tier breakdown</SectionLabel><TierBreakdown tiers={tiers} /></div>
          <div className="mb-4">
            <SectionLabel>Operational metrics</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface border border-border rounded-md p-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1">Automated</div>
                <div className="text-[17px] font-medium text-brand tracking-[-0.5px] leading-none mb-0.5">96.8%</div>
                <div className="text-[10px] text-muted-foreground">AI pipeline</div>
              </div>
              <div className="bg-surface border border-border rounded-md p-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1">HITL validated</div>
                <div className="text-[17px] font-medium text-status-blue tracking-[-0.5px] leading-none mb-0.5">99.2%</div>
                <div className="text-[10px] text-muted-foreground">Human rate</div>
              </div>
              <div className="bg-surface border border-border rounded-md p-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1">Error rate</div>
                <div className="text-[17px] font-medium text-destructive tracking-[-0.5px] leading-none mb-0.5">2.9%</div>
                <div className="text-[10px] text-muted-foreground">all records</div>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Top error categories</SectionLabel>
            {errors.map(e => (
              <div key={e.rank} className="flex items-center gap-2.5 py-[7px] px-2.5 bg-surface border border-border rounded-md mb-[5px] last:mb-0">
                <div className="w-[18px] h-[18px] rounded-full bg-border flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">{e.rank}</div>
                <div className="flex-1 text-xs font-normal text-foreground">{e.name}</div>
                <div className="flex-[2] h-[5px] bg-border rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${e.pct}%`, background: e.color }} />
                </div>
                <div className="text-[11px] font-semibold text-right shrink-0 min-w-[30px]" style={{ color: e.color }}>{e.pct}%</div>
                <div className="text-[10px] text-muted-foreground shrink-0 min-w-[36px] text-right">{e.cnt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-[18px_20px] overflow-y-auto flex flex-col gap-3.5">
          <div>
            <SectionLabel>Attribute level accuracy</SectionLabel>
            <FilterToolbar
              searchId="acc-s" searchPlaceholder="Search attribute..." onSearch={setSearch}
              groups={dataGroups} selectedGroup={group} onGroupChange={setGroup}
              pills={[{ value: 'all', label: 'All' }, { value: 'good', label: '≥95%' }, { value: 'warn', label: '90–94%' }, { value: 'low', label: '<90%' }]}
              activePill={filter} onPillClick={setFilter}
            />
            <AttributeTable
              data={filtered.map(a => ({ ...a, status: <StatusPill status={a.st} goodLabel="High" warnLabel="Medium" /> }))}
              columns={['Attribute', 'Primary source', 'Accuracy %', 'Count', 'Last validated', 'Status']}
              colorFn={getAccuracyColor}
            />
          </div>
          <div>
            <SectionLabel>Source-wise accuracy</SectionLabel>
            {sources.map(s => (
              <div key={s.code} className="flex items-center gap-2.5 py-2 px-3 bg-surface border border-border rounded-md mb-1.5 last:mb-0 transition-colors hover:border-gray-300 hover:bg-card">
                <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 text-[10px] font-bold text-primary-foreground" style={{ background: s.bg }}>{s.code}</div>
                <div className="flex-1 text-xs font-medium text-foreground">{s.name}</div>
                <div className="text-[11px] text-muted-foreground mr-2">{s.seg}</div>
                <div className="flex-[2] h-[5px] bg-border rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <div className="text-xs font-semibold text-right shrink-0 min-w-[34px] font-mono" style={{ color: s.color }}>{s.pct}%</div>
                <StatusPill status={s.status} goodLabel={s.label} warnLabel={s.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
