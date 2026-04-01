import { FlaskConical, Users, Clock, CheckCircle2, XCircle, Gauge } from "lucide-react";
import { toast } from "sonner";

interface QCSummaryCardsProps {
  totalRecords: number;
  pendingReview: number;
  approvedToday: number;
  rejected: number;
  preHitlScore: number;
  onSample: () => void;
  onDistribute: () => void;
}

export default function QCSummaryCards({
  totalRecords, pendingReview, approvedToday, rejected, preHitlScore, onSample, onDistribute
}: QCSummaryCardsProps) {
  const cards = [
    {
      label: "Sampling",
      value: totalRecords.toLocaleString(),
      subtitle: "Total records",
      icon: <FlaskConical className="w-4 h-4" />,
      action: onSample,
      actionLabel: "Run Sample",
      trend: null,
    },
    {
      label: "Distribute Records",
      value: "",
      subtitle: "Assign to reviewers",
      icon: <Users className="w-4 h-4" />,
      action: onDistribute,
      actionLabel: "Distribute",
      trend: null,
    },
    {
      label: "Pending Review",
      value: pendingReview.toLocaleString(),
      subtitle: "Awaiting QC",
      icon: <Clock className="w-4 h-4" />,
      action: null,
      actionLabel: null,
      trend: pendingReview > 0 ? "needs-attention" : "good",
    },
    {
      label: "Approved Today",
      value: approvedToday.toLocaleString(),
      subtitle: "Records approved",
      icon: <CheckCircle2 className="w-4 h-4" />,
      action: null,
      actionLabel: null,
      trend: "up",
    },
    {
      label: "Rejected",
      value: rejected.toLocaleString(),
      subtitle: "Records rejected",
      icon: <XCircle className="w-4 h-4" />,
      action: null,
      actionLabel: null,
      trend: rejected > 0 ? "warning" : "good",
    },
    {
      label: "Pre-HITL Score",
      value: `${preHitlScore}%`,
      subtitle: "Automation accuracy",
      icon: <Gauge className="w-4 h-4" />,
      action: null,
      actionLabel: null,
      trend: preHitlScore >= 80 ? "up" : "warning",
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-2.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-lg px-2.5 py-2 flex flex-col justify-between min-h-[72px]"
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">
              {card.label}
            </span>
            <span className="text-muted-foreground opacity-60">{card.icon}</span>
          </div>
          {card.value && (
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[22px] font-normal text-foreground tracking-tight leading-none">
                {card.value}
              </span>
              {card.trend === "up" && (
                <span className="text-[11px] text-brand font-medium flex items-center gap-0.5">
                  <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                    <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              )}
              {card.trend === "warning" && (
                <span className="text-[11px] text-status-amber font-medium">⚠</span>
              )}
              {card.trend === "needs-attention" && (
                <span className="text-[11px] text-status-amber font-medium">●</span>
              )}
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">{card.subtitle}</span>
          {card.action && (
            <button
              onClick={card.action}
              className="mt-2 text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary-dark rounded px-2.5 py-1 transition-colors"
            >
              {card.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
