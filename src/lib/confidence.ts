/**
 * Shared confidence-score logic used by both the HITL Record Review screen
 * (Record Details RHS) and the Job Status download.
 *
 * Mirrors the rules in src/components/hitl/RecordReviewView.tsx → getConfidenceScore:
 *   - validated → 96
 *   - edited    → 98
 *   - flagged   → 50
 *   - pending (default): meaningful value → 85, missing/N/A → 52
 *
 * For freshly extracted job rows we don't have a per-attribute status yet,
 * so we fall back to the "pending" branch — which is exactly what the HITL
 * RHS would show for the same value before any human action.
 */
export type AttrStatus = "validated" | "pending" | "flagged" | "edited";

export function getConfidenceScoreFromStatus(
  status: AttrStatus,
  value: string | null | undefined,
): number {
  switch (status) {
    case "validated": return 96;
    case "edited":    return 98;
    case "flagged":   return 50;
    default: {
      const v = (value ?? "").toString().trim();
      if (v && v.toUpperCase() !== "N/A" && v.length > 1) return 85;
      return 52;
    }
  }
}

/** Confidence score for a freshly-extracted value (no HITL status yet). */
export function getExtractedValueConfidence(value: string | null | undefined): number {
  return getConfidenceScoreFromStatus("pending", value);
}

/** Suffix used for confidence columns in downloaded job output. */
export const CONFIDENCE_COLUMN_SUFFIX = "Confidence Score Percentage";

export function confidenceColumnName(fieldName: string): string {
  return `${fieldName} ${CONFIDENCE_COLUMN_SUFFIX}`;
}
