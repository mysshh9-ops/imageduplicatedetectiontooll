import { X } from "lucide-react";
import { UploadedImage } from "../App";
import HashVisualization from "./HashVisualization";
import { MatchType } from "../lib/imageHash";

export interface Match {
  a: UploadedImage;
  b: UploadedImage;
  similarity: number;
  ahash: number;
  dhash: number;
  phash: number;
  matchType: MatchType;
  exact: boolean;
}

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  exact: "Exact Duplicate",
  highly_similar: "Highly Similar",
  similar: "Similar",
  none: "Weak Match",
};

const MATCH_TYPE_COLORS: Record<MatchType, string> = {
  exact: "#f43f5e",
  highly_similar: "#f59e0b",
  similar: "#10b981",
  none: "#64748b",
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ComparisonView({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) {
  const { a, b, similarity, ahash, dhash, phash, matchType, exact } = match;
  const badgeColor = MATCH_TYPE_COLORS[matchType];
  const badgeLabel = MATCH_TYPE_LABELS[matchType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Side-by-Side Comparison</h3>
            <p className="text-xs text-slate-400">
              {exact ? "Exact duplicate detected" : "Near-duplicate match"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Similarity banner + match type badge */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 rounded-xl px-4 py-3"
            style={{
              backgroundColor: `${badgeColor}15`,
              border: `1px solid ${badgeColor}40`,
            }}
          >
            <span className="text-sm font-medium text-slate-200">Final Similarity</span>
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: badgeColor }}
            >
              {similarity.toFixed(1)}%
            </span>
            <span
              className="ml-2 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badgeLabel}
            </span>
          </div>

          {/* Per-hash score breakdown */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Per-Hash Similarity Breakdown</h4>
            <ScoreBar label="aHash (Average Hash)" score={ahash} color="#06b6d4" />
            <ScoreBar label="dHash (Difference Hash)" score={dhash} color="#8b5cf6" />
            <ScoreBar label="pHash (Perceptual Hash)" score={phash} color="#f59e0b" />
            <div className="pt-2 border-t border-white/5">
              <ScoreBar label="Final Score (weighted)" score={similarity} color={badgeColor} />
            </div>
          </div>

          {/* Images side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[a, b].map((img, idx) => (
              <div key={idx} className="space-y-3">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-3 py-2">
                    <p className="text-xs font-medium text-white truncate">
                      {img.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(img.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hash visualizations side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {[a, b].map((img, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: idx === 0 ? "#06b6d4" : "#f59e0b" }}
                  />
                  {idx === 0 ? "Image A" : "Image B"}
                </h4>
                <HashVisualization
                  hash={img.hash}
                  accent={idx === 0 ? "#06b6d4" : "#f59e0b"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
