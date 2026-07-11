import { X } from "lucide-react";
import { UploadedImage } from "../App";
import HashVisualization from "./HashVisualization";

export interface Match {
  a: UploadedImage;
  b: UploadedImage;
  similarity: number;
  exact: boolean;
}

export default function ComparisonView({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) {
  const { a, b, similarity, exact } = match;
  const simColor =
    similarity >= 99
      ? "#f43f5e"
      : similarity >= 90
      ? "#f59e0b"
      : "#10b981";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl"
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
          {/* Similarity banner */}
          <div
            className="flex items-center justify-center gap-3 rounded-xl px-4 py-3"
            style={{
              backgroundColor: `${simColor}15`,
              border: `1px solid ${simColor}40`,
            }}
          >
            <span className="text-sm font-medium text-slate-200">Similarity</span>
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: simColor }}
            >
              {similarity.toFixed(1)}%
            </span>
            {exact && (
              <span
                className="ml-2 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: simColor }}
              >
                EXACT DUPLICATE
              </span>
            )}
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
