import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { BottleSize, PerfumeProduct } from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

export interface CartItem {
  key: string;
  product: PerfumeProduct;
  size: BottleSize;
  unitPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

const FREE_DELIVERY_THRESHOLD = 2500;

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [zone, setZone] = useState<'inside-dhaka' | 'outside-dhaka'>('inside-dhaka');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    total: number;
    customerName: string;
    paymentMethod: string;
    zoneLabel: string;
  } | null>(null);

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
  const deliveryFee = items.length === 0 ? 0 : freeDeliveryUnlocked ? 0 : zone === 'inside-dhaka' ? 60 : 120;
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
    const zoneLabel = zone === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
    const message = [
      'Hello Perfume Hub BD, I would like to place an order:',
      '',
      ...lines,
      '',
      `Subtotal: ৳${subtotal.toLocaleString('en-US')}`,
      `Delivery (${zoneLabel}): ${deliveryFee === 0 ? 'FREE' : `৳${deliveryFee}`}`,
      `Total Payable: ৳${total.toLocaleString('en-US')}`,
      customerName ? `Name: ${customerName}` : '',
      phone ? `Phone: ${phone}` : '',
      address ? `Address: ${address}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/8801700000000?text=${encodeURIComponent(message)}`;
  };

  const handleConfirmCod = (e: FormEvent) => {
    e.preventDefault();
    const orderNumber = `PHB-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrder({
      orderId: orderNumber,
      total,
      customerName: customerName.trim(),
      paymentMethod,
      zoneLabel: zone === 'inside-dhaka' ? 'Inside Dhaka (24–48h)' : 'Outside Dhaka (48–72h)',
    });
    onClearCart();
    setCheckoutOpen(false);
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
        {/* Header */}
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

        {/* Free Delivery Progress Bar */}
        {!confirmedOrder && (
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
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {confirmedOrder ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-11 w-11 text-[#8C6D3B] mx-auto mb-4" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#8C6D3B]">
                Order Confirmed
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#1A1A1A]">
                Order #{confirmedOrder.orderId} Confirmed
              </h3>
              <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                Thank you, {confirmedOrder.customerName}. Your flacons are queued for precision decanting and dispatch ({confirmedOrder.zoneLabel}).
              </p>

              <div className="mt-6 border border-[#1A1A1A]/10 bg-[#EFECE6]/60 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Payment Method</span>
                  <span className="font-medium text-[#1A1A1A]">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Total Payable</span>
                  <span className="font-semibold text-[#1A1A1A] tabular-nums">
                    ৳{confirmedOrder.total.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Status</span>
                  <span className="font-medium text-[#8C6D3B]">Preparing Shipment</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="mt-6 w-full py-3 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                Continue Exploring
              </button>
            </div>
          ) : items.length === 0 ? (
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
          ) : checkoutOpen ? (
            <form id="cod-checkout-form" onSubmit={handleConfirmCod} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                <h3 className="font-serif text-xl font-semibold">Express Delivery Details</h3>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="text-xs text-[#8C6D3B] hover:underline"
                >
                  Back to Bag
                </button>
              </div>

              <div>
                <label htmlFor="cod-name" className="block text-xs font-medium text-[#1A1A1A] mb-1">
                  Full Name
                </label>
                <input
                  id="cod-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Tanvir Rahman"
                  className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cod-phone" className="block text-xs font-medium text-[#1A1A1A] mb-1">
                  Mobile Number (Bangladesh)
                </label>
                <input
                  id="cod-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XX-XXXXXX"
                  className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm tabular-nums focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cod-address" className="block text-xs font-medium text-[#1A1A1A] mb-1">
                  Delivery Address
                </label>
                <textarea
                  id="cod-address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Area (e.g., Banani Road 11, Dhaka)"
                  className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                  Payment Preference
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['COD', 'bKash', 'Nagad'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 text-xs font-medium border transition-colors ${
                        paymentMethod === method
                          ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                          : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/15'
                      }`}
                    >
                      {method === 'COD' ? 'Cash on Delivery' : method}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <ul className="divide-y divide-[#1A1A1A]/10">
              {items.map((item) => (
                <li key={item.key} className="py-4 flex gap-4">
                  <div className="h-20 w-20 shrink-0 bg-[#EFECE6] overflow-hidden border border-[#1A1A1A]/10">
                    <ResilientImage
                      src={item.product.image}
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

        {/* Footer Totals & Actions */}
        {items.length > 0 && !confirmedOrder && (
          <div className="border-t border-[#1A1A1A]/10 bg-[#FAF9F6] px-6 py-5 space-y-4">
            {/* Delivery Zone Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setZone('inside-dhaka')}
                className={`py-2 px-3 text-xs border text-left transition-colors ${
                  zone === 'inside-dhaka'
                    ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                    : 'border-[#1A1A1A]/15 text-[#1A1A1A]'
                }`}
              >
                <span className="block font-medium">Inside Dhaka</span>
                <span className="text-[11px] opacity-75 tabular-nums">
                  {freeDeliveryUnlocked ? 'Free Delivery' : '৳60 · 24–48h'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setZone('outside-dhaka')}
                className={`py-2 px-3 text-xs border text-left transition-colors ${
                  zone === 'outside-dhaka'
                    ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                    : 'border-[#1A1A1A]/15 text-[#1A1A1A]'
                }`}
              >
                <span className="block font-medium">Outside Dhaka</span>
                <span className="text-[11px] opacity-75 tabular-nums">
                  {freeDeliveryUnlocked ? 'Free Delivery' : '৳120 · 48–72h'}
                </span>
              </button>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#1A1A1A]">৳{subtotal.toLocaleString('en-US')}</span>
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
              {checkoutOpen ? (
                <button
                  type="submit"
                  form="cod-checkout-form"
                  className="w-full py-3.5 bg-[#C5A059] text-[#121212] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#121212] hover:text-[#FAF9F6] transition-colors"
                >
                  Confirm Cash on Delivery Order
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-3.5 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                >
                  Proceed to Checkout
                </button>
              )}

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
