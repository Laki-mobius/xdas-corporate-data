import { ModalShell, ModalHeader, SectionLabel, TierBreakdown } from './ModalParts';

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const companyTypes = [
    { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', pct: '0.05%', bgClass: 'bg-gradient-to-br from-status-blue-light to-[hsl(210,80%,90%)] border-[hsl(210,50%,82%)] dark:from-[hsl(210,60%,12%)] dark:to-[hsl(210,50%,15%)] dark:border-[hsl(210,40%,25%)]', textClass: 'text-status-blue' },
    { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly', pct: '99.95%', bgClass: 'bg-gradient-to-br from-brand-light to-[hsl(148,50%,86%)] border-brand-mid dark:from-[hsl(152,38%,16%)] dark:to-[hsl(152,40%,19%)] dark:border-[hsl(152,35%,22%)]', textClass: 'text-brand' },
    { type: 'Parent Companies', count: '4.8M', sub: '% of total', pct: '4.9%', bgClass: 'bg-gradient-to-br from-status-amber-light to-[hsl(40,80%,88%)] border-[hsl(40,60%,80%)] dark:from-[hsl(40,70%,9%)] dark:to-[hsl(40,50%,13%)] dark:border-[hsl(40,50%,15%)]', textClass: 'text-status-amber' },
    { type: 'Subsidiaries', count: '3.1M', sub: '% of total', pct: '3.1%', bgClass: 'bg-gradient-to-br from-status-purple-light to-[hsl(252,50%,90%)] border-[hsl(252,40%,82%)] dark:from-[hsl(252,30%,14%)] dark:to-[hsl(252,25%,18%)] dark:border-[hsl(252,25%,25%)]', textClass: 'text-status-purple' },
    { type: 'Government / State-Owned', count: '0.6M', sub: '% of total', pct: '0.6%', bgClass: 'bg-gradient-to-br from-destructive-light to-[hsl(0,60%,92%)] border-destructive/30 dark:from-[hsl(0,50%,11%)] dark:to-[hsl(0,40%,14%)] dark:border-[hsl(0,40%,18%)]', textClass: 'text-destructive' },
  ];

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

  return (
    <ModalShell id="modal-total" onClose={onClose} inline={inline}>
      <ModalHeader
        title="Total records"
        subtitle="Data Overview · 98.7M records as of today"
        iconBg="bg-brand-light"
        icon={<svg viewBox="0 0 20 20" fill="none" className="w-[19px] h-[19px] text-brand"><ellipse cx="10" cy="6" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 6v4c0 1.4 3.1 2.5 7 2.5S17 11.4 17 10V6" stroke="currentColor" strokeWidth="1.5" /><path d="M3 10v4c0 1.4 3.1 2.5 7 2.5S17 15.4 17 14v-4" stroke="currentColor" strokeWidth="1.5" /></svg>}
        onClose={onClose}
      />
      <div className="p-[18px_24px] overflow-y-auto flex-1">
        {/* Company type cards — full-width row */}
        <div className="grid grid-cols-5 gap-2.5 mb-5">
          {companyTypes.map(ct => (
            <div key={ct.type} className={`rounded-[10px] p-3 border ${ct.bgClass}`}>
              <div className={`text-[10px] font-bold uppercase tracking-[0.05em] mb-1.5 ${ct.textClass}`}>{ct.type}</div>
              <div className={`text-[21px] font-light tracking-[-0.8px] leading-none mb-1 ${ct.textClass}`}>{ct.count}</div>
              <div className="text-[10px] text-muted-foreground">{ct.sub}</div>
              <div className={`text-[10px] font-medium mt-0.5 opacity-70 ${ct.textClass}`}>{ct.pct} of total</div>
            </div>
          ))}
        </div>

        {/* Two-column: Tier + Geography */}
        <div className="grid grid-cols-2 gap-[22px]">
          <div>
            <SectionLabel>Distribution by tier</SectionLabel>
            <TierBreakdown tiers={tiers} />
          </div>
          <div>
            <SectionLabel>Distribution by geography</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {geographyData.map(g => (
                <div key={g.region} className="bg-surface border border-border rounded-md py-2.5 px-3 flex items-center gap-2.5">
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
        </div>
      </div>
    </ModalShell>
  );
}
