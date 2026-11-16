import { useEffect } from 'react';
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, DeliveryArea } from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  deliveryArea: DeliveryArea;
  onChangeDeliveryArea: (area: DeliveryArea) => void;
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onProceedToCheckout: () => void;
}

const FREE_DELIVERY_THRESHOLD = 2500;

export function CartDrawer({
  isOpen,
  items,
  deliveryArea,
  onChangeDeliveryArea,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeDeliveryUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee =
    items.length === 0
      ? 0
      : freeDeliveryUnlocked
      ? 0
      : deliveryArea === 'inside-dhaka'
      ? 70
      : 130;
  const total = subtotal + deliveryFee;
  const progressPct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const buildWhatsAppHref = () => {
    const lines = items.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} (${item.size}) x${item.quantity} — ৳${(
          item.unitPrice * item.quantity
        ).toLocaleString('en-US')}`
    );
    const zoneLabel = deliveryArea === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
    const message = [
      'Hello Perfume Hub BD, I would like to place an order:',
      '',
      ...lines,
      '',
      `Subtotal: ৳${subtotal.toLocaleString('en-US')}`,
      `Delivery (${zoneLabel}): ${deliveryFee === 0 ? 'FREE' : `৳${deliveryFee}`}`,
      `Total Payable: ৳${total.toLocaleString('en-US')}`,
    ].join('\n');

    return `https://wa.me/8801700000000?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#121212]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-[#FAF9F6] text-[#1A1A1A] shadow-2xl border-l border-[#1A1A1A]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]/10 bg-[#121212] text-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-[#C5A059]" strokeWidth={1.7} />
            <h2 className="font-serif text-xl font-medium tracking-wide">
              Your Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#FAF9F6] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-3.5 bg-[#EFECE6] border-b border-[#1A1A1A]/10">
          <p className="text-xs text-[#1A1A1A] mb-2">
            {freeDeliveryUnlocked ? (
              <span className="font-medium text-[#8C6D3B]">
                Complimentary nationwide delivery unlocked
              </span>
            ) : (
              <span>
                Add <strong className="tabular-nums">৳{remainingForFree.toLocaleString('en-US')}</strong> more for free nationwide delivery
              </span>
            )}
          </p>
          <div className="h-1 w-full bg-[#1A1A1A]/10 overflow-hidden">
            <div
              className="h-full bg-[#C5A059] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-10 w-10 text-[#8C6D3B]/60 mb-3" strokeWidth={1.25} />
              <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">Your bag is empty</h3>
              <p className="mt-1.5 text-sm text-[#666666] max-w-xs">
                Select a 10ml travel decant or full flacon from our collection to begin.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                Browse Scents
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#1A1A1A]/10">
              {items.map((item) => (
                <li key={item.key} className="py-4 flex gap-4">
                  <div className="h-20 w-20 shrink-0 bg-[#EFECE6] overflow-hidden border border-[#1A1A1A]/10">
                    <ResilientImage
                      src={item.product.image}
                      fallbackSrc={item.product.fallbackImage}
                      alt={item.product.name}
                      title={item.product.name}
                      className="h-full w-full object-cover"
                      containerClassName="h-full w-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg font-medium text-[#1A1A1A] leading-tight truncate">
                          {item.product.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#666666]">
                          Size: <span className="text-[#1A1A1A] font-medium">{item.size}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.key)}
                        aria-label={`Remove ${item.product.name} ${item.size}`}
                        className="text-[#666666] hover:text-[#1A1A1A] p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#1A1A1A]/15">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, -1)}
                          aria-label="Decrease quantity"
                          className="h-7 w-7 flex items-center justify-center hover:bg-[#EFECE6]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, 1)}
                          aria-label="Increase quantity"
                          className="h-7 w-7 flex items-center justify-center hover:bg-[#EFECE6]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold tabular-nums text-[#1A1A1A]">
                        ৳{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#1A1A1A]/10 bg-[#FAF9F6] px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeDeliveryArea('inside-dhaka')}
                className={`py-2 px-3 text-xs border text-left transition-colors ${
                  deliveryArea === 'inside-dhaka'
                    ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                    : 'border-[#1A1A1A]/15 text-[#1A1A1A]'
                }`}
              >
                <span className="block font-medium">Inside Dhaka</span>
                <span className="text-[11px] opacity-75 tabular-nums">
                  {freeDeliveryUnlocked ? 'Free Delivery' : '৳70 · 24–48h'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChangeDeliveryArea('outside-dhaka')}
                className={`py-2 px-3 text-xs border text-left transition-colors ${
                  deliveryArea === 'outside-dhaka'
                    ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                    : 'border-[#1A1A1A]/15 text-[#1A1A1A]'
                }`}
              >
                <span className="block font-medium">Outside Dhaka</span>
                <span className="text-[11px] opacity-75 tabular-nums">
                  {freeDeliveryUnlocked ? 'Free Delivery' : '৳130 · 48–72h'}
                </span>
              </button>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#1A1A1A]">
                  ৳{subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Delivery</span>
                <span className="tabular-nums text-[#1A1A1A]">
                  {deliveryFee === 0 ? 'Free' : `৳${deliveryFee.toLocaleString('en-US')}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1A1A1A]/10 font-semibold text-base text-[#1A1A1A]">
                <span>Total (BDT)</span>
                <span className="tabular-nums">৳{total.toLocaleString('en-US')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                Proceed to Checkout
              </button>

              <a
                href={buildWhatsAppHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 border border-[#121212]/25 text-[#1A1A1A] hover:border-[#C5A059] hover:text-[#8C6D3B] text-xs font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.7} />
                Order via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
