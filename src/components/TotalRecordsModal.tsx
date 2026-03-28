import { ModalShell, ModalHeader, SectionLabel } from './ModalParts';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';

const TIER_COLORS = {
  tier1: 'hsl(210, 60%, 45%)',
  tier2: 'hsl(100, 35%, 55%)',
  tier3: 'hsl(25, 75%, 55%)',
  tier4: 'hsl(55, 65%, 55%)',
};

const geoTierData = [
  { region: 'North America', tier1: 274, tier2: 219, tier3: 152, tier4: 372, total: '1.02k' },
  { region: 'Europe',        tier1: 262, tier2: 180, tier3: 166, tier4: 103, total: '711' },
  { region: 'Asia Pacific',  tier1: 289, tier2: 306, tier3: 103, tier4: 284, total: '982' },
  { region: 'Latin America', tier1: 373, tier2: 292, tier3: 210, tier4: 193, total: '1.07k' },
  { region: 'MEA',           tier1: 307, tier2: 139, tier3: 159, tier4: 316, total: '921' },
  { region: 'Sub-Saharan Africa', tier1: 346, tier2: 185, tier3: 141, tier4: 169, total: '841' },
  { region: 'Central Asia',  tier1: 219, tier2: 277, tier3: 128, tier4: 110, total: '734' },
  { region: 'Oceania',       tier1: 149, tier2: 162, tier3: 102, tier4: 169, total: '582' },
  { region: 'Rest of World', tier1: 273, tier2: 178, tier3: 378, tier4: 113, total: '942' },
];

const tierTotals = {
  'Tier 1': geoTierData.reduce((s, r) => s + r.tier1, 0),
  'Tier 2': geoTierData.reduce((s, r) => s + r.tier2, 0),
  'Tier 3': geoTierData.reduce((s, r) => s + r.tier3, 0),
  'Tier 4': geoTierData.reduce((s, r) => s + r.tier4, 0),
};

interface TierTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function TierTooltip({ active, payload, label }: TierTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold text-foreground mb-1.5">{label} — {total.toLocaleString()} total</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-mono font-medium text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t border-border mt-1.5 pt-1.5 text-[10px] text-muted-foreground">
        {Object.entries(tierTotals).map(([k, v]) => (
          <span key={k} className="mr-3">{k}: {v.toLocaleString()}</span>
        ))}
      </div>
    </div>
  );
}

export default function TotalRecordsModal({ onClose, inline = false }: { onClose: () => void; inline?: boolean }) {
  const companyTypes = [
    { type: 'Public Companies', count: '45,300', sub: 'Exchange-listed · daily', pct: '0.05%', bgClass: 'bg-gradient-to-br from-status-blue-light to-[hsl(210,80%,90%)] border-[hsl(210,50%,82%)] dark:from-[hsl(210,60%,12%)] dark:to-[hsl(210,50%,15%)] dark:border-[hsl(210,40%,25%)]', textClass: 'text-status-blue' },
    { type: 'Private Companies', count: '98.655M', sub: 'Registry-sourced · weekly', pct: '99.95%', bgClass: 'bg-gradient-to-br from-brand-light to-[hsl(148,50%,86%)] border-brand-mid dark:from-[hsl(152,38%,16%)] dark:to-[hsl(152,40%,19%)] dark:border-[hsl(152,35%,22%)]', textClass: 'text-brand' },
    { type: 'Parent Companies', count: '4.8M', sub: '% of total', pct: '4.9%', bgClass: 'bg-gradient-to-br from-status-amber-light to-[hsl(40,80%,88%)] border-[hsl(40,60%,80%)] dark:from-[hsl(40,70%,9%)] dark:to-[hsl(40,50%,13%)] dark:border-[hsl(40,50%,15%)]', textClass: 'text-status-amber' },
    { type: 'Subsidiaries', count: '3.1M', sub: '% of total', pct: '3.1%', bgClass: 'bg-gradient-to-br from-status-purple-light to-[hsl(252,50%,90%)] border-[hsl(252,40%,82%)] dark:from-[hsl(252,30%,14%)] dark:to-[hsl(252,25%,18%)] dark:border-[hsl(252,25%,25%)]', textClass: 'text-status-purple' },
    { type: 'Government / State-Owned', count: '0.6M', sub: '% of total', pct: '0.6%', bgClass: 'bg-gradient-to-br from-destructive-light to-[hsl(0,60%,92%)] border-destructive/30 dark:from-[hsl(0,50%,11%)] dark:to-[hsl(0,40%,14%)] dark:border-[hsl(0,40%,18%)]', textClass: 'text-destructive' },
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

        {/* Stacked bar chart: Geography × Tier */}
        <SectionLabel>Distribution by geography &amp; tier</SectionLabel>
        <div className="bg-surface border border-border rounded-lg p-4 mt-1">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={geoTierData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
              barSize={22}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="region"
                type="category"
                width={120}
                tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<TierTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Legend
                formatter={(value: string) => {
                  const key = value as keyof typeof tierTotals;
                  const label = value.replace('tier', 'Tier ');
                  const total = tierTotals[`Tier ${value.replace('tier', '')}`  as keyof typeof tierTotals];
                  return <span className="text-xs text-foreground">{label} — {total?.toLocaleString()}</span>;
                }}
                iconSize={10}
              />
              <Bar dataKey="tier1" name="Tier 1" stackId="a" fill={TIER_COLORS.tier1} radius={[0, 0, 0, 0]}>
                <LabelList dataKey="tier1" position="center" style={{ fontSize: 9, fill: '#fff', fontWeight: 600 }} />
              </Bar>
              <Bar dataKey="tier2" name="Tier 2" stackId="a" fill={TIER_COLORS.tier2}>
                <LabelList dataKey="tier2" position="center" style={{ fontSize: 9, fill: '#fff', fontWeight: 600 }} />
              </Bar>
              <Bar dataKey="tier3" name="Tier 3" stackId="a" fill={TIER_COLORS.tier3}>
                <LabelList dataKey="tier3" position="center" style={{ fontSize: 9, fill: '#fff', fontWeight: 600 }} />
              </Bar>
              <Bar dataKey="tier4" name="Tier 4" stackId="a" fill={TIER_COLORS.tier4} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="tier4" position="center" style={{ fontSize: 9, fill: '#fff', fontWeight: 600 }} />
              </Bar>
              {/* Total label at end of bar */}
              <Bar dataKey="tier4" stackId="b" fill="transparent" >
                <LabelList
                  dataKey="total"
                  position="right"
                  style={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                  offset={8}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ModalShell>
  );
}
