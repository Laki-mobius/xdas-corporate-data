import { ModalShell, ModalHeader, SectionLabel } from './ModalParts';

const companyTypes = [
  { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', pct: '0.05%', bgClass: 'bg-gradient-to-br from-status-blue-light to-[hsl(210,80%,90%)] border-[hsl(210,50%,82%)] dark:from-[hsl(210,60%,12%)] dark:to-[hsl(210,50%,15%)] dark:border-[hsl(210,40%,25%)]', textClass: 'text-status-blue' },
  { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly/monthly', pct: '99.95%', bgClass: 'bg-gradient-to-br from-brand-light to-[hsl(148,50%,86%)] border-brand-mid dark:from-[hsl(152,38%,16%)] dark:to-[hsl(152,40%,19%)] dark:border-[hsl(152,35%,22%)]', textClass: 'text-brand' },
  { type: 'Parent Companies', count: '4.8M', sub: '4.9% of total', pct: '4.9%', bgClass: 'bg-gradient-to-br from-[hsl(25,80%,93%)] to-[hsl(25,70%,88%)] border-[hsl(25,60%,78%)] dark:from-[hsl(25,50%,12%)] dark:to-[hsl(25,40%,16%)] dark:border-[hsl(25,40%,22%)]', textClass: 'text-[hsl(25,80%,45%)]' },
  { type: 'Subsidiaries', count: '3.1M', sub: '3.1% of total', pct: '3.1%', bgClass: 'bg-[hsl(0,0%,95%)] border-[hsl(0,0%,85%)] dark:bg-[hsl(0,0%,14%)] dark:border-[hsl(0,0%,22%)]', textClass: 'text-muted-foreground' },
  { type: 'Government / State-Owned', count: '0.6M', sub: '0.6% of total', pct: '0.6%', bgClass: 'bg-gradient-to-br from-status-amber-light to-[hsl(40,80%,88%)] border-[hsl(40,60%,80%)] dark:from-[hsl(40,70%,9%)] dark:to-[hsl(40,50%,13%)] dark:border-[hsl(40,50%,15%)]', textClass: 'text-status-amber' },
];

const tierSegments = [
  { label: 'Tier 1', name: 'US', value: '28,100', flex: 2, color: '#185FA5' },
  { label: 'Tier 2', name: 'Non-US', value: '17,200', flex: 1.2, color: '#1A7A4A' },
  { label: 'Tier 3', name: 'US', value: '54.8M', flex: 5.5, color: '#C97A00' },
  { label: 'Tier 4', name: 'Non-US', value: '35.4M', flex: 3.5, color: '#534AB7' },
] as const;

const publicCompanyFlex = tierSegments[0].flex + tierSegments[1].flex;
const privateCompanyFlex = tierSegments[2].flex + tierSegments[3].flex;
const totalTierFlex = publicCompanyFlex + privateCompanyFlex;
const privateCompanyStart = (publicCompanyFlex / totalTierFlex) * 100;

const geographyBars = [
  { region: 'US', count: 31, label: '31M' },
  { region: 'Canada', count: 12, label: '12M' },
  { region: 'UK', count: 7, label: '7M' },
  { region: 'China', count: 8, label: '8M' },
  { region: 'India', count: 5, label: '5M' },
  { region: 'Germany', count: 5, label: '5M' },
  { region: 'Japan', count: 3, label: '3M' },
  { region: 'France', count: 3, label: '3M' },
  { region: 'SE Asia', count: 3, label: '3M' },
  { region: 'Latin Am.', count: 7, label: '7M' },
  { region: 'Rest of World', count: 5, label: '5M' },
];

const yTicks = [0, 5, 10, 15, 20, 25, 30, 35];

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  return (
    <ModalShell id="modal-total" onClose={onClose} inline={inline}>
      <div className="p-[18px_24px] overflow-y-auto flex-1">
        <div className="flex gap-5">
          {/* LEFT PANE — By Segment (25%) */}
          <div className="w-1/4 shrink-0">
            <SectionLabel>By segment</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {companyTypes.map(ct => (
                <div key={ct.type} className={`rounded-[10px] p-3 border ${ct.bgClass}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.05em] mb-1.5 ${ct.textClass}`}>{ct.type}</div>
                  <div className={`text-[21px] font-light tracking-[-0.8px] leading-none mb-1 ${ct.textClass}`}>{ct.count}</div>
                  <div className="text-[10px] text-muted-foreground">{ct.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANE — Tier & Geography (75%) */}
          <div className="flex-1 min-w-0">
            {/* TOTAL RECORDS BY TIER & SEGMENT */}
            <SectionLabel>Total records by tier &amp; segment (scale proportional)</SectionLabel>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-muted-foreground">By tier classification</span>
              <span className="text-[10px] text-muted-foreground italic">hover for details</span>
            </div>
            <div className="flex h-6 rounded-md overflow-hidden mb-2.5 gap-0.5">
              {tierSegments.map((t, i) => {
                const pct = ((t.flex / totalTierFlex) * 100).toFixed(1);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground whitespace-nowrap px-[7px] cursor-pointer transition-[filter] hover:brightness-110 relative group"
                    style={{ width: `${pct}%`, background: t.color }}
                  >
                    {t.value}
                    <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 bg-gray-900 border border-border rounded-md py-1.5 px-2.5 text-[11px] text-primary-foreground whitespace-nowrap pointer-events-none z-50 hidden group-hover:block text-center leading-relaxed">
                      {t.label} · {t.name}<br /><strong>{t.value}</strong> · {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 flex-wrap mb-5">
              {tierSegments.map((t, i) => {
                const pct = ((t.flex / totalTierFlex) * 100).toFixed(1);
                return (
                  <span key={i} className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
                    <span className="w-[9px] h-[9px] rounded-sm shrink-0" style={{ background: t.color }} />
                    {t.label} · {t.name}: {t.value} ({pct}%)
                  </span>
                );
              })}
            </div>

            {/* BAR CHART BY GEOGRAPHY */}
            <SectionLabel>Records by geography (Top 10 + Rest of World)</SectionLabel>
            <div className="border border-border rounded-lg p-4 bg-surface">
              <div className="flex items-end gap-0" style={{ height: 220 }}>
                <div className="flex flex-col justify-between h-full pr-2 shrink-0" style={{ paddingBottom: 28 }}>
                  {yTicks.slice().reverse().map(t => (
                    <span key={t} className="text-[9px] text-muted-foreground font-mono leading-none text-right min-w-[24px]">{t}M</span>
                  ))}
                </div>
                <div className="flex-1 flex items-end justify-between gap-[6px]" style={{ height: '100%', paddingBottom: 28, position: 'relative' }}>
                  <div className="absolute inset-0" style={{ bottom: 28 }}>
                    {yTicks.map(t => (
                      <div
                        key={t}
                        className="absolute w-full border-t border-border/50"
                        style={{ bottom: `${(t / 35) * 100}%` }}
                      />
                    ))}
                  </div>
                  {geographyBars.map((g, i) => {
                    const lightness = 22 + (i * 4);
                    const barGradient = `linear-gradient(to top, hsl(152, 64%, ${lightness}%), hsl(152, 54%, ${lightness + 8}%))`;
                    return (
                      <div key={g.region} className="flex flex-col items-center flex-1 min-w-0 relative z-10" style={{ height: '100%', justifyContent: 'flex-end' }}>
                        <span className="text-[9px] font-semibold text-foreground mb-1 font-mono">{g.label}</span>
                        <div
                          className="w-full max-w-[36px] rounded-full shadow-sm"
                          style={{
                            height: `${(g.count / 35) * 100}%`,
                            minHeight: 8,
                            background: barGradient,
                          }}
                        />
                        <span className="text-[8px] text-muted-foreground mt-2 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[52px]">{g.region}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
