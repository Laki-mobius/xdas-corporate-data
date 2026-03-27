import { ModalShell, ModalHeader, SectionLabel, SegmentCards, TierBreakdown } from './ModalParts';

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const tiers = [
    { label: 'Tier 1', name: 'Public — US', value: '28,100', width: '62%', color: '#185FA5', tierClass: 'bg-status-blue-light text-status-blue' },
    { label: 'Tier 2', name: 'Public — Non-US', value: '17,200', width: '38%', color: '#1A7A4A', tierClass: 'bg-brand-light text-brand' },
    { label: 'Tier 3', name: 'Private — US', value: '54.8M', width: '70%', color: '#C97A00', tierClass: 'bg-status-amber-light text-status-amber' },
    { label: 'Tier 4', name: 'Private — Non-US', value: '35.4M', width: '45%', color: '#534AB7', tierClass: 'bg-status-purple-light text-status-purple' },
  ];

  const geographyData = [
    { region: 'North America', count: '42.1M', pct: '42.7%', width: '100%', color: '#185FA5' },
    { region: 'Europe', count: '25.3M', pct: '25.6%', width: '60%', color: '#1A7A4A' },
    { region: 'Asia Pacific', count: '18.7M', pct: '18.9%', width: '44%', color: '#C97A00' },
    { region: 'Latin America', count: '7.2M', pct: '7.3%', width: '17%', color: '#534AB7' },
    { region: 'MEA', count: '3.8M', pct: '3.9%', width: '9%', color: '#C0392B' },
    { region: 'Rest of World', count: '1.6M', pct: '1.6%', width: '4%', color: '#6B7280' },
  ];

  const companyTypes = [
    { type: 'Public Companies', count: '45,300', pct: '0.05%', color: '#185FA5', bgClass: 'bg-status-blue-light border-[hsl(210,50%,82%)] dark:bg-[hsl(210,60%,12%)] dark:border-[hsl(210,40%,25%)]' },
    { type: 'Private Companies', count: '90.2M', pct: '91.4%', color: '#1A7A4A', bgClass: 'bg-brand-light border-brand-mid dark:bg-[hsl(152,38%,16%)] dark:border-[hsl(152,35%,22%)]' },
    { type: 'Parent Companies', count: '4.8M', pct: '4.9%', color: '#534AB7', bgClass: 'bg-status-purple-light border-[hsl(252,40%,82%)] dark:bg-[hsl(252,30%,14%)] dark:border-[hsl(252,25%,25%)]' },
    { type: 'Subsidiaries', count: '3.1M', pct: '3.1%', color: '#C97A00', bgClass: 'bg-status-amber-light border-[hsl(40,60%,80%)] dark:bg-[hsl(40,70%,9%)] dark:border-[hsl(40,50%,15%)]' },
    { type: 'Government / State-Owned', count: '0.6M', pct: '0.6%', color: '#C0392B', bgClass: 'bg-destructive-light border-destructive/30 dark:bg-[hsl(0,50%,11%)] dark:border-[hsl(0,40%,18%)]' },
  ];

  return (
    <ModalShell id="modal-total" onClose={onClose} inline={inline}>
      <ModalHeader
        title="Total records"
        subtitle="All segments combined · 98.7M records as of today"
        iconBg="bg-brand-light"
        icon={<svg viewBox="0 0 20 20" fill="none" className="w-[19px] h-[19px] text-brand"><ellipse cx="10" cy="6" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 6v4c0 1.4 3.1 2.5 7 2.5S17 11.4 17 10V6" stroke="currentColor" strokeWidth="1.5" /><path d="M3 10v4c0 1.4 3.1 2.5 7 2.5S17 15.4 17 14v-4" stroke="currentColor" strokeWidth="1.5" /></svg>}
        onClose={onClose}
      />
      <div className="p-[18px_24px] overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-[22px] items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <div>
              <SectionLabel>By segment</SectionLabel>
              <SegmentCards pubValue="45,300" pubSub="Exchange-listed · daily" prvValue="98.655M" prvSub="Registry-sourced · weekly" />
            </div>
            <div>
              <SectionLabel>By tier</SectionLabel>
              <TierBreakdown tiers={tiers} />
            </div>
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div>
              <SectionLabel>By geography</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {geographyData.map(g => (
                  <div key={g.region} className="bg-surface border border-border rounded-md py-2 px-3 flex items-center gap-2.5">
                    <span className="text-[11px] font-normal text-foreground min-w-[100px]">{g.region}</span>
                    <div className="flex-1 h-[4px] bg-border rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: g.width, background: g.color }} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground font-mono min-w-[42px] text-right">{g.count}</span>
                    <span className="text-[10px] text-muted-foreground min-w-[36px] text-right">{g.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>By company type</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {companyTypes.map(ct => (
                  <div key={ct.type} className={`rounded-[10px] p-3 border ${ct.bgClass}`}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] mb-1" style={{ color: ct.color }}>{ct.type}</div>
                    <div className="text-[19px] font-light tracking-[-0.8px] leading-none mb-0.5" style={{ color: ct.color }}>{ct.count}</div>
                    <div className="text-[10px] font-medium opacity-70" style={{ color: ct.color }}>{ct.pct} of total</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
