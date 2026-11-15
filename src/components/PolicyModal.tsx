import { useEffect } from 'react';
import { ShieldCheck, Truck, X } from 'lucide-react';

export type PolicyType = 'delivery' | 'authenticity' | null;

interface PolicyModalProps {
  policy: PolicyType;
  onClose: () => void;
}

export function PolicyModal({ policy, onClose }: PolicyModalProps) {
  useEffect(() => {
    if (!policy) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [policy, onClose]);

  if (!policy) return null;

  const isDelivery = policy === 'delivery';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/75 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#FAF9F6] text-[#1A1A1A] border border-[#C5A059]/40 p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close information dialog"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center border border-[#1A1A1A]/15 text-[#1A1A1A] hover:border-[#C5A059]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 text-[#8C6D3B] mb-2">
          {isDelivery ? <Truck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold">
            {isDelivery ? 'Nationwide Dispatch' : 'Batch & Source Guarantee'}
          </span>
        </div>

        <h2 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
          {isDelivery ? 'Delivery & Cash on Delivery Policy' : '100% Authenticity Guarantee'}
        </h2>

        {isDelivery ? (
          <div className="mt-4 space-y-3 text-sm text-[#666666] leading-relaxed">
            <p>
              <strong className="text-[#1A1A1A]">Inside Dhaka Metro:</strong> ৳60 standard courier charge with 24–48 hour doorstep Cash on Delivery.
            </p>
            <p>
              <strong className="text-[#1A1A1A]">Outside Dhaka (All 64 Districts):</strong> ৳120 nationwide courier via Steadfast &amp; Pathao within 48–72 hours.
            </p>
            <p>
              <strong className="text-[#1A1A1A]">Complimentary Shipping:</strong> Orders over <span className="tabular-nums font-medium text-[#1A1A1A]">৳2,500</span> qualify automatically for free nationwide delivery.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-[#666666] leading-relaxed">
            <p>
              Every designer decant is drawn directly via sterile graduated syringes from verified, batch-coded original retail bottles—never diluted with carrier oils or alcohol.
            </p>
            <p>
              Our Middle Eastern &amp; Signature Extrait formulations use IFRA-compliant aromatic oils compounded specifically to endure Bangladesh’s heat and humidity.
            </p>
            <p>
              Inspect your parcel upon delivery; sealed bottle batch verification photos are available upon request via WhatsApp concierge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
