import { useCallback, useMemo, useRef, useState } from "react";
import {
  Upload,
  ScanSearch,
  Trash2,
  Image as ImageIcon,
  Copy,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { computeHashes, HashResult, similarity as computeSimilarity, exactDuplicate } from "./lib/imageHash";
import HashVisualization from "./components/HashVisualization";
import ComparisonView, { Match } from "./components/ComparisonView";

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  hash: HashResult;
}

type Status = "idle" | "hashing" | "scanning" | "done";

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [threshold, setThreshold] = useState(85);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;

    setStatus("hashing");
    setProgress(0);
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      try {
        const hash = await computeHashes(file);
        newImages.push({
          id: `${file.name}-${Date.now()}-${i}`,
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          hash,
        });
      } catch {
        // skip unprocessable files
      }
      setProgress(Math.round(((i + 1) / arr.length) * 100));
    }

    setImages((prev) => [...prev, ...newImages]);
    setStatus("idle");
    setProgress(0);
    setMatches([]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const findNearDuplicates = useCallback(() => {
    if (images.length < 2) return;
    setStatus("scanning");
    const results: Match[] = [];
    for (let i = 0; i < images.length; i++) {
      for (let j = i + 1; j < images.length; j++) {
        const sim = computeSimilarity(images[i].hash, images[j].hash);
        if (sim >= threshold) {
          results.push({
            a: images[i],
            b: images[j],
            similarity: sim,
            exact: exactDuplicate(images[i].hash, images[j].hash),
          });
        }
      }
    }
    results.sort((a, b) => b.similarity - a.similarity);
    setMatches(results);
    setStatus("done");
  }, [images, threshold]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
    setMatches([]);
    setStatus("idle");
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
    setMatches([]);
    setStatus("idle");
    setSelectedImage(null);
  }, [images]);

  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    matches.forEach((m) => {
      ids.add(m.a.id);
      ids.add(m.b.id);
    });
    return ids;
  }, [matches]);

  const sliderFill = `${threshold}%`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 glass sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Hash<span className="text-cyan-400">Lens</span>
                </h1>
                <p className="text-[11px] text-slate-400 -mt-0.5">Visual Duplicate Detector</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {images.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Hero */}
          <section className="text-center pt-4 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-medium text-cyan-300 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Perceptual Hashing · aHash + dHash + pHash
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl mx-auto leading-tight">
              Find <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">duplicate</span> and visually similar images instantly
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto text-balance">
              Upload images and HashLens computes cryptographic-style fingerprints to detect near-duplicates — even after resizing, cropping, or compression.
            </p>
          </section>

          {/* Upload zone */}
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full px-6 py-12 sm:py-16 flex flex-col items-center justify-center gap-4"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center transition-transform duration-300 ${isDragging ? "scale-110" : ""}`}>
                <Upload className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-200">
                  Drop images here or <span className="text-cyan-400">browse</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">Supports multiple images · All processing happens in your browser</p>
              </div>
            </button>
            {status === "hashing" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden rounded-b-2xl">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </section>

          {/* Controls */}
          {images.length >= 2 && (
            <section className="rounded-2xl border border-white/10 glass p-5 sm:p-6 animate-slide-up">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Threshold slider */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Similarity Threshold
                    </label>
                    <span className="text-lg font-bold text-cyan-400 tabular-nums">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    style={{ ["--range-fill" as string]: sliderFill }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Loose match</span>
                    <span>Exact duplicate</span>
                  </div>
                </div>

                {/* Find button */}
                <button
                  onClick={findNearDuplicates}
                  disabled={status === "scanning" || images.length < 2}
                  className="group relative flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <ScanSearch className="w-5 h-5" />
                  Find Near Duplicates
                </button>
              </div>

              {/* Stats row */}
              {status === "done" && (
                <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-3 animate-fade-in">
                  <Stat label="Images Scanned" value={images.length} icon={<ImageIcon className="w-4 h-4" />} />
                  <Stat label="Matches Found" value={matches.length} icon={<Copy className="w-4 h-4" />} />
                  <Stat
                    label="Exact Duplicates"
                    value={matches.filter((m) => m.exact).length}
                    icon={<AlertTriangle className="w-4 h-4" />}
                  />
                </div>
              )}
            </section>
          )}

          {/* Matches list */}
          {matches.length > 0 && (
            <section className="space-y-3 animate-slide-up">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-400" />
                Detected Matches ({matches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMatch(m)}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all animate-scale-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex -space-x-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-slate-900 bg-slate-800 shrink-0">
                        <img src={m.a.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-slate-900 bg-slate-800 shrink-0">
                        <img src={m.b.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{m.a.name}</p>
                      <p className="text-xs text-slate-500 truncate">{m.b.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{
                            color:
                              m.similarity >= 99 ? "#f43f5e" : m.similarity >= 90 ? "#f59e0b" : "#10b981",
                          }}
                        >
                          {m.similarity.toFixed(1)}%
                        </span>
                        {m.exact && (
                          <span className="rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold px-2 py-0.5 border border-rose-500/20">
                            EXACT
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {status === "done" && matches.length === 0 && (
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-emerald-300">No duplicates found</p>
              <p className="text-sm text-slate-400 mt-1">
                No image pairs met the {threshold}% similarity threshold. Try lowering it to catch more matches.
              </p>
            </section>
          )}

          {/* Gallery */}
          {images.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Image Library ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((img) => {
                  const isDup = duplicateIds.has(img.id);
                  return (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer hover:border-cyan-500/40 transition-all"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs font-medium text-white truncate">{img.name}</p>
                      </div>
                      {isDup && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                            <Copy className="w-2.5 h-2.5" />
                            DUP
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-2 left-2 rounded-lg bg-slate-950/70 backdrop-blur p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {images.length === 0 && status !== "hashing" && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { icon: <Upload className="w-5 h-5" />, title: "1. Upload", desc: "Drag in any number of images" },
                { icon: <ScanSearch className="w-5 h-5" />, title: "2. Scan", desc: "Set threshold and find duplicates" },
                { icon: <Layers className="w-5 h-5" />, title: "3. Compare", desc: "View hashes & side-by-side matches" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    {s.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{s.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </section>
          )}
        </main>

        <footer className="border-t border-white/5 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center">
            <p className="text-xs text-slate-500">
              HashLens · Image hashing runs entirely in your browser — no uploads leave your device
            </p>
          </div>
        </footer>
      </div>

      {/* Comparison modal */}
      {selectedMatch && (
        <ComparisonView match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      {/* Hash detail drawer */}
      {selectedImage && (
        <HashDetailDrawer image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-slate-100 mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function HashDetailDrawer({ image, onClose }: { image: UploadedImage; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full overflow-y-auto scrollbar-thin bg-slate-900 border-l border-white/10 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: "0.3s" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur px-5 py-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            Hash Visualization
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-sm">Close</span>
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950">
            <img src={image.url} alt={image.name} className="w-full max-h-64 object-contain" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-200">{image.name}</p>
            <p className="text-xs text-slate-500">{(image.size / 1024).toFixed(1)} KB</p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <HashVisualization hash={image.hash} accent="#06b6d4" />
          </div>
        </div>
      </div>
    </div>
  );
}
