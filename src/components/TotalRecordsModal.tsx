import { ModalShell, ModalHeader, SectionLabel } from './ModalParts';

const TIER_COLORS: Record<string, string> = {
  'Tier 1': 'hsl(210, 60%, 45%)',
  'Tier 2': 'hsl(100, 35%, 55%)',
  'Tier 3': 'hsl(25, 75%, 55%)',
  'Tier 4': 'hsl(55, 65%, 55%)',
};

const tierData = [
  { tier: 'Tier 1', count: 2492, pct: 33.4 },
  { tier: 'Tier 2', count: 1938, pct: 26.0 },
  { tier: 'Tier 3', count: 1539, pct: 20.6 },
  { tier: 'Tier 4', count: 1496, pct: 20.0 },
];

const geoData = [
  { region: 'North America', count: '1.02k', pct: 13.7 },
  { region: 'Europe', count: '711', pct: 9.5 },
  { region: 'Asia Pacific', count: '982', pct: 13.2 },
  { region: 'Latin America', count: '1.07k', pct: 14.3 },
  { region: 'MEA', count: '921', pct: 12.3 },
  { region: 'Sub-Saharan Africa', count: '841', pct: 11.3 },
  { region: 'Central Asia', count: '734', pct: 9.8 },
  { region: 'Oceania', count: '582', pct: 7.8 },
  { region: 'Rest of World', count: '942', pct: 12.6 },
];

const GEO_COLORS = [
  'hsl(210, 60%, 50%)', 'hsl(152, 45%, 45%)', 'hsl(25, 75%, 55%)',
  'hsl(280, 40%, 55%)', 'hsl(355, 55%, 55%)', 'hsl(55, 65%, 50%)',
  'hsl(190, 50%, 45%)', 'hsl(100, 35%, 50%)', 'hsl(330, 40%, 55%)',
];

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const companyTypes = [
    { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', pct: '0.05%', bgClass: 'bg-gradient-to-br from-status-blue-light to-[hsl(210,80%,90%)] border-[hsl(210,50%,82%)] dark:from-[hsl(210,60%,12%)] dark:to-[hsl(210,50%,15%)] dark:border-[hsl(210,40%,25%)]', textClass: 'text-status-blue' },
    { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly', pct: '99.95%', bgClass: 'bg-gradient-to-br from-brand-light to-[hsl(148,50%,86%)] border-brand-mid dark:from-[hsl(152,38%,16%)] dark:to-[hsl(152,40%,19%)] dark:border-[hsl(152,35%,22%)]', textClass: 'text-brand' },
    { type: 'Parent Companies', count: '4.8M', sub: '% of total', pct: '4.9%', bgClass: 'bg-gradient-to-br from-status-amber-light to-[hsl(40,80%,88%)] border-[hsl(40,60%,80%)] dark:from-[hsl(40,70%,9%)] dark:to-[hsl(40,50%,13%)] dark:border-[hsl(40,50%,15%)]', textClass: 'text-status-amber' },
    { type: 'Subsidiaries', count: '3.1M', sub: '% of total', pct: '3.1%', bgClass: 'bg-gradient-to-br from-status-purple-light to-[hsl(252,50%,90%)] border-[hsl(252,40%,82%)] dark:from-[hsl(252,30%,14%)] dark:to-[hsl(252,25%,18%)] dark:border-[hsl(252,25%,25%)]', textClass: 'text-status-purple' },
    { type: 'Government / State-Owned', count: '0.6M', sub: '% of total', pct: '0.6%', bgClass: 'bg-gradient-to-br from-destructive-light to-[hsl(0,60%,92%)] border-destructive/30 dark:from-[hsl(0,50%,11%)] dark:to-[hsl(0,40%,14%)] dark:border-[hsl(0,40%,18%)]', textClass: 'text-destructive' },
  ];

  const totalTier = tierData.reduce((s, t) => s + t.count, 0);

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
        {/* Company type cards */}
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
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Distribution by Tier */}
          <div>
            <SectionLabel>Distribution by tier</SectionLabel>
            <div className="bg-surface border border-border rounded-lg p-4 mt-1 space-y-3">
              {tierData.map(t => (
                <div key={t.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: TIER_COLORS[t.tier] }} />
                      <span className="text-xs font-medium text-foreground">{t.tier}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{t.count.toLocaleString()} <span className="text-[10px]">({t.pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(t.count / totalTier) * 100}%`, background: TIER_COLORS[t.tier] }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Total</span>
                <span className="font-mono font-semibold text-foreground">{totalTier.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Distribution by Geography */}
          <div>
            <SectionLabel>Distribution by geography</SectionLabel>
            <div className="bg-surface border border-border rounded-lg p-4 mt-1 space-y-2">
              {geoData.map((g, i) => (
                <div key={g.region} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GEO_COLORS[i] }} />
                  <span className="text-[11px] text-foreground w-[110px] truncate">{g.region}</span>
                  <div className="flex-1 h-[7px] rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.pct * 5}%`, background: GEO_COLORS[i] }} />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{g.count}</span>
                  <span className="text-[10px] text-muted-foreground w-9 text-right">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
