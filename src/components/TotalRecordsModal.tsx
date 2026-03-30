import { ModalShell, ModalHeader, SectionLabel } from './ModalParts';
import { Building2, Building, Network, GitBranch, Landmark } from 'lucide-react';

const companyTypes = [
  { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', icon: Building2, iconColor: 'text-status-blue' },
  { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly/monthly', icon: Building, iconColor: 'text-brand' },
  { type: 'Parent Companies', count: '4.8M', sub: '4.9% of total', icon: Network, iconColor: 'text-[hsl(25,80%,45%)]' },
  { type: 'Subsidiaries', count: '3.1M', sub: '3.1% of total', icon: GitBranch, iconColor: 'text-muted-foreground' },
  { type: 'Government / State-Owned', count: '0.6M', sub: '0.6% of total', icon: Landmark, iconColor: 'text-status-amber' },
];

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
