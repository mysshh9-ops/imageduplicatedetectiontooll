import { HashResult } from "../lib/imageHash";

const DESCRIPTIONS: Record<string, string> = {
  ahash: "Compares each pixel to the mean luminance",
  dhash: "Captures horizontal gradient structure",
  phash: "DCT-based, robust to scaling & compression",
};

function BitGrid({ bits, color }: { bits: number[]; color: string }) {
  return (
    <div className="inline-grid grid-cols-8 gap-px rounded-md overflow-hidden border border-white/10 shadow-sm">
      {bits.map((bit, i) => (
        <div
          key={i}
          className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300"
          style={{
            backgroundColor: bit ? color : "rgba(255,255,255,0.06)",
            boxShadow: bit ? `0 0 6px ${color}55` : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function HashVisualization({
  hash,
  accent,
}: {
  hash: HashResult;
  accent: string;
}) {
  const entries: { key: keyof HashResult; label: string; bits: number[]; hex: string }[] = [
    { key: "ahashBits", label: "Average Hash", bits: hash.ahashBits, hex: hash.ahash },
    { key: "dhashBits", label: "Difference Hash", bits: hash.dhashBits, hex: hash.dhash },
    { key: "phashBits", label: "Perceptual Hash", bits: hash.phashBits, hex: hash.phash },
  ];

  return (
    <div className="space-y-5">
      {entries.map((e) => (
        <div key={e.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{e.label}</h4>
              <p className="text-xs text-slate-400">{DESCRIPTIONS[e.label.toLowerCase().split(" ")[0]]}</p>
            </div>
            <code className="text-[11px] font-mono text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-white/5 tracking-tight">
              {e.hex}
            </code>
          </div>
          <div className="flex justify-center py-1">
            <BitGrid bits={e.bits} color={accent} />
          </div>
        </div>
      ))}
    </div>
  );
}
