import { useMemo, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { PERFUMES, type BottleSize, type PerfumeProduct } from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

interface ScentFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: PerfumeProduct, size: BottleSize) => void;
  onAddToCart: (product: PerfumeProduct, size: BottleSize) => void;
}

type MoodOption = PerfumeProduct['moods'][number];

const MOOD_OPTIONS: { id: MoodOption; label: string; caption: string }[] = [
  { id: 'Humid Heat', label: 'Dhaka Daytime & Heat', caption: 'Crisp citrus, vetiver & clean musk that stay sharp in humidity.' },
  { id: 'Office', label: 'Executive & Studio', caption: 'Refined, approachable sillage tailored for air-conditioned spaces.' },
  { id: 'Evening', label: 'Evening & Date Night', caption: 'Warm cognac, smoked amber & sensual vanilla accords.' },
  { id: 'Festive', label: 'Weddings & Eid', caption: 'Commanding saffron, Taif rose & rich agarwood longevity.' },
  { id: 'Signature', label: 'All-Season Signature', caption: 'Versatile daily signatures with balanced projection.' },
];

export function ScentFinderModal({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}: ScentFinderModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption>('Humid Heat');
  const [preference, setPreference] = useState<'All' | 'Men' | 'Women' | 'Unisex' | 'Arabian'>('All');

  const matches = useMemo(() => {
    const filtered = PERFUMES.filter((p) => {
      const moodMatch = p.moods.includes(selectedMood);
      const catMatch = preference === 'All' || p.category === preference;
      return moodMatch && catMatch;
    });
    return filtered.length > 0 ? filtered.slice(0, 3) : PERFUMES.filter((p) => p.moods.includes(selectedMood)).slice(0, 3);
  }, [selectedMood, preference]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scent-finder-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#121212] text-[#FAF9F6] border border-[#C5A059]/35 p-6 sm:p-8 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Scent Finder"
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center border border-white/15 text-[#FAF9F6] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059]">
          Curated Fragrance Consultation
        </span>
        <h2 id="scent-finder-title" className="mt-2 font-serif text-3xl font-semibold text-[#FAF9F6]">
          Find Your Scent for Bangladesh’s Climate
        </h2>
        <p className="mt-1.5 text-sm text-[#FAF9F6]/70 max-w-xl">
          Select where you plan to wear your fragrance and your preferred profile to view tailored Extrait and EDP pairings.
        </p>

        {/* Step 1: Occasion / Weather */}
        <div className="mt-6">
          <span className="block text-xs uppercase tracking-[0.14em] text-[#FAF9F6]/60 mb-2.5">
            01. Occasion &amp; Climate
          </span>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const active = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`px-3.5 py-2 text-xs font-medium transition-colors border whitespace-nowrap ${
                    active
                      ? 'bg-[#C5A059] text-[#121212] border-[#C5A059]'
                      : 'bg-transparent text-[#FAF9F6]/80 border-white/15 hover:border-[#C5A059]/60'
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[#C5A059]/90">
            {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.caption}
          </p>
        </div>

        {/* Step 2: Profile */}
        <div className="mt-5">
          <span className="block text-xs uppercase tracking-[0.14em] text-[#FAF9F6]/60 mb-2.5">
            02. Scent Profile
          </span>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Men', 'Women', 'Unisex', 'Arabian'] as const).map((cat) => {
              const active = preference === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPreference(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium transition-colors border whitespace-nowrap ${
                    active
                      ? 'bg-[#FAF9F6] text-[#121212] border-[#FAF9F6]'
                      : 'bg-transparent text-[#FAF9F6]/75 border-white/15 hover:border-white/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <span className="block text-xs uppercase tracking-[0.14em] text-[#C5A059] mb-3">
            Recommended Pairings
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {matches.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-[#1A1A1A] border border-white/10 overflow-hidden"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#222]">
                  <ResilientImage
                    src={item.image}
                    alt={item.name}
                    title={item.name}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div className="p-3.5 flex flex-1 flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#C5A059]">
                      {item.category} · {item.longevity.label}
                    </span>
                    <h3 className="mt-1 font-serif text-lg font-medium text-[#FAF9F6]">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#FAF9F6]/65">{item.notesLine}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tabular-nums text-[#FAF9F6]">
                      From ৳{item.prices['10ml'].toLocaleString('en-US')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProduct(item, '30ml');
                        }}
                        className="text-[11px] uppercase tracking-wider text-[#FAF9F6]/80 hover:text-[#C5A059] flex items-center gap-1"
                      >
                        Notes <ArrowRight className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(item, '10ml');
                          onClose();
                        }}
                        className="bg-[#C5A059] text-[#121212] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider hover:bg-[#FAF9F6] transition-colors"
                      >
                        Try 10ml
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
