import type { ValidationAttribute } from "@/data/hitl-validation-data";

interface Props {
  attributes: ValidationAttribute[];
}

export default function ValidationMetrics({ attributes }: Props) {
  const total = attributes.length;
  const validated = attributes.filter(a => a.status === "validated").length;
  const pending = attributes.filter(a => a.status === "pending").length;
  const flagged = attributes.filter(a => a.qcFlag).length;
  const accuracy = total > 0 ? Math.round((validated / total) * 100) : 0;

  const metrics = [
    { label: "Accuracy", value: `${accuracy}%`, color: "text-brand" },
    { label: "Validated", value: `${validated}/${total}`, color: "text-brand" },
    { label: "Pending", value: `${pending}`, color: "text-status-amber" },
    { label: "Errors", value: `${flagged}`, color: "text-destructive" },
  ];

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 bg-muted/30 border-t border-border flex-shrink-0">
      {metrics.map(m => (
        <div key={m.label} className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">{m.label}:</span>
          <span className={`text-[11px] font-semibold tabular-nums ${m.color}`}>{m.value}</span>
        </div>
      ))}
    </div>
  );
}
