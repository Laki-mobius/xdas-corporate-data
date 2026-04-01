import { useState } from "react";
import { Globe, FileText, Database, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceData } from "@/data/hitl-validation-data";

interface Props {
  sources: SourceData[];
  highlightText?: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  Website: <Globe className="w-3 h-3" />,
  PDF: <FileText className="w-3 h-3" />,
  API: <Zap className="w-3 h-3" />,
  Database: <Database className="w-3 h-3" />,
};

const typeBadge: Record<string, string> = {
  Website: "bg-blue-light text-status-blue",
  PDF: "bg-red-light text-destructive",
  API: "bg-brand-light text-brand",
  Database: "bg-purple-light text-status-purple",
};

export default function SourceViewer({ sources, highlightText }: Props) {
  const [activeSource, setActiveSource] = useState(0);

  const renderHighlightedSnippet = (snippet: string, highlighted: string) => {
    const idx = snippet.toLowerCase().indexOf(highlighted.toLowerCase());
    if (idx === -1) return <span>{snippet}</span>;
    return (
      <>
        <span>{snippet.slice(0, idx)}</span>
        <mark className="bg-amber-light text-foreground px-0.5 rounded font-medium">{snippet.slice(idx, idx + highlighted.length)}</mark>
        <span>{snippet.slice(idx + highlighted.length)}</span>
      </>
    );
  };

  return (
    <div className="w-[280px] flex-shrink-0 bg-card border-l border-border flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Source Verification</span>
      </div>

      {/* Source Tabs */}
      {sources.length > 1 && (
        <div className="flex border-b border-border px-2 gap-0.5 pt-1.5">
          {sources.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSource(i)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-t text-[10px] transition-colors",
                i === activeSource ? "bg-muted text-foreground font-medium border border-border border-b-card -mb-px" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {typeIcon[s.type]}
              <span className="truncate max-w-[60px]">{s.type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Source */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sources[activeSource] && (() => {
          const s = sources[activeSource];
          return (
            <>
              {/* Source Type Badge */}
              <div className="flex items-center gap-2">
                <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1", typeBadge[s.type])}>
                  {typeIcon[s.type]} {s.type}
                </span>
              </div>

              {/* URL */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Source URL</span>
                <div className="flex items-start gap-1 bg-muted/50 rounded p-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0 text-status-blue mt-0.5" />
                  <span className="text-[10px] text-status-blue break-all leading-snug">{s.url}</span>
                </div>
              </div>

              {/* Snippet */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Extracted Snippet</span>
                <div className="bg-muted/50 rounded p-2.5 text-[11px] text-foreground leading-relaxed">
                  {renderHighlightedSnippet(s.snippet, highlightText || s.highlightedText)}
                </div>
              </div>

              {/* Highlighted Text */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Key Match</span>
                <div className="bg-amber-light border border-border rounded p-2 text-[11px] font-medium text-foreground">
                  "{s.highlightedText}"
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
