import { useState, useMemo } from 'react';
import { ModalShell, ModalHeader, SectionLabel, SegmentCards, TierBreakdown, HeroCard, AttributeTable, FilterToolbar } from './ModalParts';
import { compData, dataGroups, getColorForValue, getFreshnessPill } from '@/data/dashboard-data';
import { cn } from '@/lib/utils';

export default function CompletenessModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [filter, setFilter] = useState('all');

  const daysSince = (d: string) => (Date.now() - new Date(d).getTime()) / 86400000;

  const filtered = useMemo(() => {
    return compData.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      (group === 'all' || a.g === group) &&
      (filter === 'all' || (filter === 'fresh' && daysSince(a.ref) < 30) || (filter === 'mid' && daysSince(a.ref) >= 30 && daysSince(a.ref) < 90) || (filter === 'stale' && daysSince(a.ref) >= 90))
    );
  }, [search, group, filter]);

  const tiers = [
    { label: 'T1', name: 'Public — US', value: '95.3%', width: '95.3%', color: '#185FA5', tierClass: 'bg-status-blue-light text-status-blue' },
    { label: 'T2', name: 'Public — Non-US', value: '91.6%', width: '91.6%', color: '#1A7A4A', tierClass: 'bg-brand-light text-brand' },
    { label: 'T3', name: 'Private — US', value: '91.2%', width: '91.2%', color: '#C97A00', tierClass: 'bg-status-amber-light text-status-amber' },
    { label: 'T4', name: 'Private — Non-US', value: '89.3%', width: '89.3%', color: '#534AB7', tierClass: 'bg-status-purple-light text-status-purple' },
  ];

  const freshness = [
    { label: 'Updated <30 days', value: '76.4M', pct: '77.4% of total', color: '#1A7A4A', bgClass: 'bg-brand-light border-brand-mid dark:bg-[hsl(152,38%,16%)] dark:border-[hsl(152,35%,22%)]', icon: <svg viewBox="0 0 18 18" fill="none" className="w-[17px] h-[17px] text-brand"><path d="M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3Z" stroke="currentColor" strokeWidth="1.4" /><path d="M9 6v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg> },
    { label: 'Updated 30–90 days', value: '14.8M', pct: '15.0% of total', color: '#C97A00', bgClass: 'bg-status-amber-light border-status-amber-mid dark:bg-[hsl(40,70%,9%)] dark:border-[hsl(40,50%,15%)]', icon: <svg viewBox="0 0 18 18" fill="none" className="w-[17px] h-[17px] text-status-amber"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M9 6v3.5M9 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg> },
    { label: 'Stale >90 days', value: '7.5M', pct: '7.6% of total', color: '#C0392B', bgClass: 'bg-destructive-light border-destructive/30 dark:bg-[hsl(0,50%,11%)] dark:border-[hsl(0,40%,18%)]', icon: <svg viewBox="0 0 18 18" fill="none" className="w-[17px] h-[17px] text-destructive"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg> },
  ];

  return (
    <ModalShell id="modal-completeness" onClose={onClose} fullHeight>
      <ModalHeader
        title="Completeness score"
        subtitle="Field population rates and data freshness across all segments"
        iconBg="bg-status-amber-light"
        icon={<svg viewBox="0 0 20 20" fill="none" className="w-[19px] h-[19px] text-status-amber"><rect x="3" y="11" width="3" height="6" rx="1" fill="currentColor" opacity=".4" /><rect x="8.5" y="7" width="3" height="10" rx="1" fill="currentColor" opacity=".7" /><rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor" /></svg>}
        onClose={onClose}
      />
      <div className="grid grid-cols-[280px_1fr] flex-1 overflow-hidden min-h-0">
        <div className="p-[18px_20px] overflow-y-auto border-r border-border">
          <HeroCard label="Overall completeness" value="91.8%" subtitle="+0.8% vs previous month" ringPercent={91.8} />
          <div className="mb-4"><SectionLabel>By segment</SectionLabel><SegmentCards pubLabel="Public" pubValue="93.5%" pubSub="Daily" prvValue="90.7%" prvSub="Weekly" showBars pubBar={93.5} prvBar={90.7} /></div>
          <div><SectionLabel>Tier breakdown</SectionLabel><TierBreakdown tiers={tiers} /></div>
        </div>

        <div className="p-[18px_20px] overflow-y-auto flex flex-col gap-3.5">
          <div>
            <SectionLabel>Data freshness distribution — all 98.7M records</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {freshness.map(f => (
                <div key={f.label} className={cn('rounded-[10px] p-3.5 border flex items-center gap-3.5', f.bgClass)}>
                  <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0" style={{ background: `${f.color}1F` }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.05em] mb-1" style={{ color: f.color }}>{f.label}</div>
                    <div className="text-xl font-medium tracking-[-0.5px] leading-none mb-0.5" style={{ color: f.color }}>{f.value}</div>
                    <div className="text-[11px] font-medium opacity-75" style={{ color: f.color }}>{f.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Freshness distribution</SectionLabel>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-muted-foreground">By last update recency</span>
              <span className="text-[10px] text-muted-foreground italic">hover for details</span>
            </div>
            <div className="flex h-6 rounded-md overflow-hidden mb-2.5 gap-0.5">
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground px-[7px] cursor-pointer hover:brightness-110 relative group" style={{ width: '77.4%', background: '#1A7A4A' }}>
                &lt;30 days — 77.4%
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">✓ Updated &lt;30 days<br /><strong>76.4M</strong> · 77.4%</div>
              </div>
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground px-[7px] cursor-pointer hover:brightness-110 relative group" style={{ width: '15%', background: '#C97A00' }}>
                30–90d 15%
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">⚠ 30–90 days<br /><strong>14.8M</strong> · 15.0%</div>
              </div>
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground px-[7px] cursor-pointer hover:brightness-110 relative group" style={{ width: '7.6%', background: '#C0392B' }}>
                7.6%
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">✗ Stale &gt;90 days<br /><strong>7.5M</strong> · 7.6%</div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#1A7A4A' }} />&lt;30d: 76.4M (77.4%)</span>
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#C97A00' }} />30–90d: 14.8M (15.0%)</span>
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#C0392B' }} />Stale: 7.5M (7.6%)</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <SectionLabel>Last verified update by attribute</SectionLabel>
            <FilterToolbar
              searchId="comp-s" searchPlaceholder="Search attribute..." onSearch={setSearch}
              groups={dataGroups} selectedGroup={group} onGroupChange={setGroup}
              pills={[{ value: 'all', label: 'All' }, { value: 'fresh', label: '<30d' }, { value: 'mid', label: '30–90d' }, { value: 'stale', label: '>90d' }]}
              activePill={filter} onPillClick={setFilter}
            />
            <AttributeTable
              data={filtered.map(a => {
                const fp = getFreshnessPill(a.ref);
                const cls = fp.class === 'good' ? 'bg-brand-light text-brand' : fp.class === 'warn' ? 'bg-status-amber-light text-status-amber' : 'bg-destructive-light text-destructive';
                return { ...a, src: a.g, status: <span className={cn('text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium whitespace-nowrap inline-block', cls)}>{fp.label}</span> };
              })}
              columns={['Attribute', 'Data group', 'Fill rate %', 'Record count', 'Last verified', 'Freshness']}
              colorFn={getColorForValue}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
