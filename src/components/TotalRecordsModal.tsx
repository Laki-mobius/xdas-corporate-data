import { ModalShell, ModalHeader, SectionLabel } from './ModalParts';

const companyTypes = [
  { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', pct: '0.05%', bgClass: 'bg-gradient-to-br from-status-blue-light to-[hsl(210,80%,90%)] border-[hsl(210,50%,82%)] dark:from-[hsl(210,60%,12%)] dark:to-[hsl(210,50%,15%)] dark:border-[hsl(210,40%,25%)]', textClass: 'text-status-blue' },
  { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly/monthly', pct: '99.95%', bgClass: 'bg-gradient-to-br from-brand-light to-[hsl(148,50%,86%)] border-brand-mid dark:from-[hsl(152,38%,16%)] dark:to-[hsl(152,40%,19%)] dark:border-[hsl(152,35%,22%)]', textClass: 'text-brand' },
  { type: 'Parent Companies', count: '4.8M', sub: '4.9% of total', pct: '4.9%', bgClass: 'bg-gradient-to-br from-[hsl(25,80%,93%)] to-[hsl(25,70%,88%)] border-[hsl(25,60%,78%)] dark:from-[hsl(25,50%,12%)] dark:to-[hsl(25,40%,16%)] dark:border-[hsl(25,40%,22%)]', textClass: 'text-[hsl(25,80%,45%)]' },
  { type: 'Subsidiaries', count: '3.1M', sub: '3.1% of total', pct: '3.1%', bgClass: 'bg-[hsl(0,0%,95%)] border-[hsl(0,0%,85%)] dark:bg-[hsl(0,0%,14%)] dark:border-[hsl(0,0%,22%)]', textClass: 'text-muted-foreground' },
  { type: 'Government / State-Owned', count: '0.6M', sub: '0.6% of total', pct: '0.6%', bgClass: 'bg-gradient-to-br from-status-amber-light to-[hsl(40,80%,88%)] border-[hsl(40,60%,80%)] dark:from-[hsl(40,70%,9%)] dark:to-[hsl(40,50%,13%)] dark:border-[hsl(40,50%,15%)]', textClass: 'text-status-amber' },
];

const tierSegments = [
  { label: 'Tier 1', name: 'US', value: '28,100', flex: 2, color: '#185FA5', group: 'Public Companies' },
  { label: 'Tier 2', name: 'Non-US', value: '17,200', flex: 1.2, color: '#1A7A4A', group: 'Public Companies' },
  { label: 'Tier 3', name: 'US', value: '54.8M', flex: 5.5, color: '#5BAD76', group: 'Private Companies' },
  { label: 'Tier 4', name: 'Non-US', value: '35.4M', flex: 3.5, color: '#534AB7', group: 'Private Companies' },
];

const geographyBars = [
  { region: 'US', count: 31, label: '31M' },
  { region: 'Canada', count: 12, label: '12M' },
  { region: 'UK', count: 7, label: '7M' },
  { region: 'Germany', count: 5, label: '5M' },
  { region: 'France', count: 3, label: '3M' },
  { region: 'Rest of Europe', count: 11, label: '11M' },
  { region: 'China', count: 8, label: '8M' },
  { region: 'India', count: 5, label: '5M' },
  { region: 'Japan', count: 3, label: '3M' },
  { region: 'Southeast Asia', count: 3, label: '3M' },
  { region: 'Australia', count: 1, label: '1M' },
  { region: 'Latin America', count: 7, label: '7M' },
  { region: 'Middle East', count: 2, label: '2M' },
  { region: 'Africa', count: 2, label: '2M' },
];

const maxBar = Math.max(...geographyBars.map(g => g.count));
const yTicks = [0, 5, 10, 15, 20, 25, 30, 35];

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  return (
    <ModalShell id="modal-total" onClose={onClose} inline={inline}>
      <ModalHeader
        title="Total records"
        subtitle="Data Overview · 98.7M records as of today"
        iconBg="bg-brand-light"
        icon={<svg viewBox="0 0 20 20" fill="none" className="w-[19px] h-[19px] text-brand"><ellipse cx="10" cy="6" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 6v4c0 1.4 3.1 2.5 7 2.5S17 11.4 17 10V6" stroke="currentColor" strokeWidth="1.5" /><path d="M3 10v4c0 1.4 3.1 2.5 7 2.5S17 15.4 17 14v-4" stroke="currentColor" strokeWidth="1.5" /></svg>}
        onClose={onClose}
      />
      <div className="p-[14px_20px] overflow-y-auto flex-1">
        {/* BY SEGMENT */}
        <SectionLabel>By segment</SectionLabel>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {companyTypes.map(ct => (
            <div key={ct.type} className={`rounded-[10px] p-2.5 border ${ct.bgClass}`}>
              <div className={`text-[9px] font-bold uppercase tracking-[0.05em] mb-1 ${ct.textClass}`}>{ct.type}</div>
              <div className={`text-[19px] font-light tracking-[-0.8px] leading-none mb-0.5 ${ct.textClass}`}>{ct.count}</div>
              <div className="text-[9px] text-muted-foreground">{ct.sub}</div>
            </div>
          ))}
        </div>

        {/* Two-column: Tier segments + Bar chart */}
        <div className="grid grid-cols-[1fr_1.6fr] gap-3">
          {/* TIER & SEGMENT */}
          <div>
            <SectionLabel>By tier &amp; segment (proportional)</SectionLabel>
            <div className="border border-border rounded-lg p-2.5 bg-surface">
              <div className="flex mb-1" style={{ gap: '3px' }}>
                <div style={{ flex: tierSegments[0].flex + tierSegments[1].flex }} className="text-[10px] font-medium text-foreground">Public</div>
                <div style={{ flex: tierSegments[2].flex + tierSegments[3].flex }} className="text-[10px] font-medium text-foreground">Private</div>
              </div>
              <div className="flex gap-[3px] h-[60px]">
                {tierSegments.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-md flex flex-col justify-end p-2 text-white min-w-0"
                    style={{ flex: t.flex, background: t.color }}
                  >
                    <div className="text-[10px] font-semibold leading-tight">{t.label}</div>
                    <div className="text-[9px] opacity-90 leading-tight">{t.name}: {t.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BAR CHART BY GEOGRAPHY */}
          <div>
            <SectionLabel>Records by geography</SectionLabel>
            <div className="border border-border rounded-lg p-2.5 bg-surface">
              <div className="flex items-end gap-0" style={{ height: 150 }}>
                <div className="flex flex-col justify-between h-full pr-1.5 shrink-0" style={{ paddingBottom: 20 }}>
                  {yTicks.slice().reverse().map(t => (
                    <span key={t} className="text-[8px] text-muted-foreground font-mono leading-none text-right min-w-[20px]">{t}M</span>
                  ))}
                </div>
                <div className="flex-1 flex items-end justify-between gap-[2px]" style={{ height: '100%', paddingBottom: 20, position: 'relative' }}>
                  <div className="absolute inset-0" style={{ bottom: 20 }}>
                    {yTicks.map(t => (
                      <div key={t} className="absolute w-full border-t border-border" style={{ bottom: `${(t / 35) * 100}%` }} />
                    ))}
                  </div>
                  {geographyBars.map(g => (
                    <div key={g.region} className="flex flex-col items-center flex-1 min-w-0 relative z-10" style={{ height: '100%', justifyContent: 'flex-end' }}>
                      <span className="text-[8px] font-semibold text-foreground mb-0.5 font-mono">{g.label}</span>
                      <div
                        className="w-full max-w-[28px] rounded-t-[2px] bg-brand"
                        style={{ height: `${(g.count / 35) * 100}%`, minHeight: 3 }}
                      />
                      <span className="text-[7px] text-muted-foreground mt-1 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[44px]">{g.region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
