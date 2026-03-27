import { ModalShell, ModalHeader, SectionLabel, SegmentCards, TierBreakdown } from './ModalParts';

export default function TotalRecordsModal({ onClose }: { onClose: () => void }) {
  const tiers = [
    { label: 'Tier 1', name: 'Public — US', value: '28,100', width: '62%', color: '#185FA5', tierClass: 'bg-status-blue-light text-status-blue' },
    { label: 'Tier 2', name: 'Public — Non-US', value: '17,200', width: '38%', color: '#1A7A4A', tierClass: 'bg-brand-light text-brand' },
    { label: 'Tier 3', name: 'Private — US', value: '54.8M', width: '70%', color: '#C97A00', tierClass: 'bg-status-amber-light text-status-amber' },
    { label: 'Tier 4', name: 'Private — Non-US', value: '35.4M', width: '45%', color: '#534AB7', tierClass: 'bg-status-purple-light text-status-purple' },
  ];

  return (
    <ModalShell id="modal-total" onClose={onClose}>
      <ModalHeader
        title="Total records processed"
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
              <SectionLabel>Average processing time per record</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface border border-border rounded-lg p-3.5 flex gap-3 items-start">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-brand-light to-[hsl(148,50%,82%)] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 18 18" fill="none" className="w-[15px] h-[15px]"><circle cx="9" cy="9" r="6.5" stroke="#1A7A4A" strokeWidth="1.4" /><path d="M9 5.5v4l2.5 2" stroke="#1A7A4A" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1">AI avg processing time</div>
                    <div className="text-xl font-normal text-foreground tracking-[-0.5px] mb-0.5">1.4 <span className="text-xs text-muted-foreground font-normal">sec</span></div>
                    <div className="text-[10px] text-muted-foreground mb-1.5">per record · automation pipeline</div>
                    <span className="inline-block text-[10px] py-0.5 px-[7px] rounded-[20px] font-medium bg-brand-light text-brand">↓ 0.2s vs last week</span>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-3.5 flex gap-3 items-start">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-status-blue-light to-[hsl(210,60%,88%)] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 18 18" fill="none" className="w-[15px] h-[15px]"><circle cx="9" cy="9" r="6.5" stroke="#185FA5" strokeWidth="1.4" /><path d="M9 5.5v4l2.5 2" stroke="#185FA5" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1">HITL avg processing time</div>
                    <div className="text-xl font-normal text-foreground tracking-[-0.5px] mb-0.5">4.2 <span className="text-xs text-muted-foreground font-normal">min</span></div>
                    <div className="text-[10px] text-muted-foreground mb-1.5">per record · human validation</div>
                    <span className="inline-block text-[10px] py-0.5 px-[7px] rounded-[20px] font-medium bg-status-amber-light text-status-amber">↑ 0.3 min vs last week</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <SectionLabel>By processing method</SectionLabel>
              <div className="flex items-center gap-[18px] p-3.5 bg-surface border border-border rounded-lg">
                {/* Donut */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1A7A4A" strokeWidth="11" strokeDasharray="165.67 35.62" strokeLinecap="butt" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#185FA5" strokeWidth="11" strokeDasharray="35.62 165.67" strokeDashoffset="-167.67" strokeLinecap="butt" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-sm font-medium text-foreground leading-none">98.7M</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">total</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-[9px] h-[9px] rounded-full bg-brand shrink-0 mt-[3px]" />
                    <div className="flex-1"><div className="text-xs text-muted-foreground">Automation processed</div><div className="text-[10px] text-muted-foreground">AI pipeline · no human review</div></div>
                    <div className="text-right"><div className="text-[13px] font-semibold text-foreground font-mono">81.2M</div><div className="text-[10px] text-muted-foreground">82.3%</div></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-[9px] h-[9px] rounded-full bg-status-blue shrink-0 mt-[3px]" />
                    <div className="flex-1"><div className="text-xs text-muted-foreground">Human validation (HITL)</div><div className="text-[10px] text-muted-foreground">Editor reviewed · approved</div></div>
                    <div className="text-right"><div className="text-[13px] font-semibold text-foreground font-mono">17.5M</div><div className="text-[10px] text-muted-foreground">17.7%</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
