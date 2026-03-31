import { useState, useMemo } from 'react';
import { ModalShell, ModalHeader, SectionLabel, SegmentCards, TierBreakdown, HeroCard, StatusPill, AttributeTable, FilterToolbar } from './ModalParts';
import { covData, dataGroups, getColorForValue } from '@/data/dashboard-data';

export default function CoverageModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [filter, setFilter] = useState('all');

  // Ensure Company Name and Address appear first with 100% coverage
  const adjustedCovData = useMemo(() => {
    return covData.map(a => {
      if (a.name === 'Company Name' || a.name === 'Street Address') {
        return { ...a, v: 100, cnt: '98.7M', st: 'good' as const };
      }
      return a;
    });
  }, []);

  const sorted = useMemo(() => {
    const priority = ['Company Name', 'Street Address'];
    return [...adjustedCovData].sort((a, b) => {
      const aIdx = priority.indexOf(a.name);
      const bIdx = priority.indexOf(b.name);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });
  }, [adjustedCovData]);

  const filtered = useMemo(() => {
    return sorted.filter(a =>
      (a.name.toLowerCase().includes(search.toLowerCase()) || a.src.toLowerCase().includes(search.toLowerCase())) &&
      (group === 'all' || a.g === group) &&
      (filter === 'all' || (filter === 'good' && a.v >= 80) || (filter === 'warn' && a.v >= 60 && a.v < 80) || (filter === 'low' && a.v < 60))
    );
  }, [search, group, filter, sorted]);

  const tiers = [
    { label: 'T1', name: 'Public — US', value: '98.2%', width: '98.2%', color: '#185FA5', tierClass: 'bg-status-blue-light text-status-blue' },
    { label: 'T2', name: 'Public — Non-US', value: '95.4%', width: '95.4%', color: '#1A7A4A', tierClass: 'bg-brand-light text-brand' },
    { label: 'T3', name: 'Private — US', value: '94.0%', width: '94%', color: '#C97A00', tierClass: 'bg-status-amber-light text-status-amber' },
    { label: 'T4', name: 'Private — Non-US', value: '91.8%', width: '91.8%', color: '#534AB7', tierClass: 'bg-status-purple-light text-status-purple' },
  ];

  return (
    <ModalShell id="modal-coverage" onClose={onClose} fullHeight inline={inline}>
      <div className="grid grid-cols-[280px_1fr] flex-1 overflow-hidden min-h-0">
        {/* Left Pane */}
        <div className="p-[18px_20px] overflow-y-auto border-r border-border">
          {/* Overall card — matching Total Records metric box style */}
          <div className="rounded-lg border border-border bg-surface p-2.5 mb-3.5 transition-all hover:border-brand/40 hover:bg-brand-light hover:shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-semibold text-foreground">Overall</span>
              <div className="relative w-[40px] h-[40px] shrink-0">
                <svg viewBox="0 0 40 40" className="w-[40px] h-[40px] -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--border))" strokeWidth="3.5" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--brand))" strokeWidth="3.5" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - 94.2 / 100)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-brand">94%</div>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-light tracking-[-0.5px] leading-none text-foreground">94.2%</span>
              <span className="text-[10px] text-muted-foreground leading-snug">+1.4% vs last month</span>
            </div>
          </div>
          <div className="mb-4">
            <SectionLabel>By segment</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-surface p-2.5 transition-all hover:border-brand/40 hover:bg-brand-light hover:shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-foreground">Public</span>
                  <div className="w-[24px] h-[24px] rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 9h8M3 9V5.5L6 3l3 2.5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-light tracking-[-0.5px] leading-none text-foreground">96.8%</span>
                  <span className="text-[10px] text-muted-foreground leading-snug">Daily</span>
                </div>
                <div className="h-[3px] bg-border rounded-sm overflow-hidden mt-1.5">
                  <div className="h-full rounded-sm bg-status-blue" style={{ width: '96.8%' }} />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2.5 transition-all hover:border-brand/40 hover:bg-brand-light hover:shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-foreground">Private</span>
                  <div className="w-[24px] h-[24px] rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground" /><path d="M4 5V4a2 2 0 1 1 4 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-muted-foreground" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-light tracking-[-0.5px] leading-none text-foreground">93.1%</span>
                  <span className="text-[10px] text-muted-foreground leading-snug">Weekly</span>
                </div>
                <div className="h-[3px] bg-border rounded-sm overflow-hidden mt-1.5">
                  <div className="h-full rounded-sm bg-brand" style={{ width: '93.1%' }} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Tier breakdown</SectionLabel>
            <TierBreakdown tiers={tiers} />
          </div>
        </div>

        {/* Right Pane */}
        <div className="p-[18px_20px] overflow-y-auto flex flex-col gap-3.5">
          <div>
            <SectionLabel>Record completeness — all 98.7M records</SectionLabel>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-muted-foreground">By field population level</span>
              <span className="text-[10px] text-muted-foreground italic">hover for details</span>
            </div>
            {/* Stacked bar */}
            <div className="flex h-6 rounded-md overflow-hidden mb-2.5 gap-0.5">
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground whitespace-nowrap px-[7px] cursor-pointer transition-[filter] hover:brightness-110 relative group" style={{ width: '5.4%', background: '#1A7A4A' }}>
                5.3M
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 border border-border rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">
                  ✓ Fully filled<br /><strong>5.3M</strong> · 5.4%
                </div>
              </div>
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground whitespace-nowrap px-[7px] cursor-pointer transition-[filter] hover:brightness-110 relative group" style={{ width: '12.4%', background: '#C97A00' }}>
                Partial 12.2M
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 border border-border rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">
                  ⚠ Partially filled<br /><strong>12.2M</strong> · 12.4%
                </div>
              </div>
              <div className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground whitespace-nowrap px-[7px] cursor-pointer transition-[filter] hover:brightness-110 relative group" style={{ width: '82.2%', background: '#1E3A5A' }}>
                Below threshold ≤60% — 82.2%
                <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 border border-border rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">
                  ○ Below threshold<br /><strong>81.2M</strong> · 82.2%
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#1A7A4A' }} />Fully filled: 5.3M (5.4%)</span>
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#C97A00' }} />Partially filled: 12.2M (12.4%)</span>
              <span className="flex items-center gap-[5px] text-[11px] text-muted-foreground"><span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: '#1E3A5A' }} />Below threshold: 81.2M (82.2%)</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <SectionLabel>Attribute level completeness</SectionLabel>
            <FilterToolbar
              searchId="cov-s"
              searchPlaceholder="Search attribute..."
              onSearch={setSearch}
              groups={dataGroups}
              selectedGroup={group}
              onGroupChange={setGroup}
              pills={[
                { value: 'all', label: 'All' },
                { value: 'good', label: '≥80%' },
                { value: 'warn', label: '60–79%' },
                { value: 'low', label: '<60%' },
              ]}
              activePill={filter}
              onPillClick={setFilter}
            />
            <AttributeTable
              data={filtered.map(a => ({ ...a, status: <StatusPill status={a.st} goodLabel="Good" warnLabel="Medium" /> }))}
              columns={['Attribute', 'Primary source', 'Coverage %', 'Count', 'Last refreshed', 'Status']}
              colorFn={getColorForValue}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
