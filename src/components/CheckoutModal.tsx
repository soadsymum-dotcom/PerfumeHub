import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, ShoppingBag, X } from 'lucide-react';
import type {
  CartItem,
  DeliveryArea,
  OrderRecord,
  PaymentMethod,
} from '../data/perfumes';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  initialDeliveryArea: DeliveryArea;
  onClose: () => void;
  onConfirmOrder: (payload: {
    customerName: string;
    phone: string;
    deliveryArea: DeliveryArea;
    address: string;
    paymentMethod: PaymentMethod;
  }) => Promise<OrderRecord>;
}

const FREE_DELIVERY_THRESHOLD = 2500;

export function CheckoutModal({
  isOpen,
  items,
  initialDeliveryArea,
  onClose,
  onConfirmOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>(initialDeliveryArea);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    setDeliveryArea(initialDeliveryArea);
  }, [initialDeliveryArea]);

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
  const freeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee =
    items.length === 0 ? 0 : freeDelivery ? 0 : deliveryArea === 'inside-dhaka' ? 70 : 130;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please complete your name, phone number, and full delivery address.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const created = await onConfirmOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryArea,
        address: address.trim(),
        paymentMethod,
      });
      setConfirmedOrder(created);
      setCustomerName('');
      setPhone('');
      setAddress('');
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppReceiptHref = (order: OrderRecord) => {
    const lines = order.items.map(
      (item, idx) =>
        `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} — ৳${(
          item.unitPrice * item.quantity
        ).toLocaleString('en-US')}`
    );
    const areaText =
      order.deliveryArea === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
    const text = [
      `Order Receipt ${order.orderNumber} — Perfume Hub BD`,
      '',
      ...lines,
      '',
      `Subtotal: ৳${order.subtotal.toLocaleString('en-US')}`,
      `Delivery (${areaText}): ${order.deliveryFee === 0 ? 'FREE' : `৳${order.deliveryFee}`}`,
      `Total: ৳${order.total.toLocaleString('en-US')}`,
      `Payment: ${order.paymentMethod}`,
      `Name: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Address: ${order.address}`,
    ].join('\n');

    return `https://wa.me/8801700000000?text=${encodeURIComponent(text)}`;
  };

  const handleCloseModal = () => {
    setConfirmedOrder(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/78 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={handleCloseModal}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF9F6] text-[#1A1A1A] border border-[#C5A059]/40 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#121212] text-[#FAF9F6] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/25">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-[#C5A059]" />
            <h2 id="checkout-modal-title" className="font-serif text-xl font-semibold tracking-wide">
              {confirmedOrder ? 'Order Confirmed' : 'Express Checkout · Perfume Hub BD'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Close checkout modal"
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#FAF9F6] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#8C6D3B] mx-auto mb-3" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D3B] font-semibold">
              Dispatch Queued
            </span>
            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#1A1A1A]">
              Order {confirmedOrder.orderNumber} Confirmed
            </h3>
            <p className="mt-2 text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-[#1A1A1A]">{confirmedOrder.customerName}</strong>. Our Dhaka atelier has received your order and will confirm courier dispatch shortly.
            </p>

            <div className="mt-6 border border-[#1A1A1A]/10 bg-[#EFECE6]/60 p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#666666]">Order Reference</span>
                <span className="font-semibold text-[#1A1A1A] tabular-nums">
                  {confirmedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Delivery Area</span>
                <span className="font-medium text-[#1A1A1A]">
                  {confirmedOrder.deliveryArea === 'inside-dhaka'
                    ? 'Inside Dhaka (24–48h)'
                    : 'Outside Dhaka (48–72h)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Payment Method</span>
                <span className="font-medium text-[#1A1A1A]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-[#1A1A1A]/10 space-y-1">
                {confirmedOrder.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between">
                    <span className="text-[#1A1A1A]">
                      {item.name} ({item.size}) × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      ৳{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#1A1A1A]/10 flex justify-between text-sm font-semibold text-[#1A1A1A]">
                <span>Total Payable</span>
                <span className="tabular-nums">৳{confirmedOrder.total.toLocaleString('en-US')}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={buildWhatsAppReceiptHref(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 border border-[#121212] text-[#1A1A1A] hover:bg-[#121212] hover:text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Send Receipt on WhatsApp
              </a>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-3 px-4 bg-[#C5A059] text-[#121212] hover:bg-[#121212] hover:text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                >
                  Customer Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Tanvir Rahman"
                  className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                >
                  Phone Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm tabular-nums focus:border-[#C5A059] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2">
                Delivery Area
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryArea('inside-dhaka')}
                  className={`p-3 border text-left transition-colors ${
                    deliveryArea === 'inside-dhaka'
                      ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                      : 'border-[#1A1A1A]/20 bg-white text-[#1A1A1A]'
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wider">
                    Inside Dhaka
                  </span>
                  <span className="mt-0.5 block text-xs opacity-80 tabular-nums">
                    {freeDelivery ? 'Free Delivery (Order ৳2,500+)' : '৳70 · 24–48h Courier'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryArea('outside-dhaka')}
                  className={`p-3 border text-left transition-colors ${
                    deliveryArea === 'outside-dhaka'
                      ? 'border-[#121212] bg-[#121212] text-[#FAF9F6]'
                      : 'border-[#1A1A1A]/20 bg-white text-[#1A1A1A]'
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wider">
                    Outside Dhaka
                  </span>
                  <span className="mt-0.5 block text-xs opacity-80 tabular-nums">
                    {freeDelivery ? 'Free Delivery (Order ৳2,500+)' : '৳130 · 48–72h Nationwide'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-address"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
              >
                Full Delivery Address *
              </label>
              <textarea
                id="checkout-address"
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, Road, Sector / Area, District (e.g., House 14, Road 11, Banani, Dhaka)"
                className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2">
                Payment Method
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Cash on Delivery', 'bKash', 'Nagad'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 px-2 text-xs font-semibold border transition-colors ${
                      paymentMethod === method
                        ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                        : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#8C6D3B]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary Strip */}
            <div className="border border-[#1A1A1A]/10 bg-[#EFECE6]/70 p-4 text-xs space-y-1.5">
              <div className="flex justify-between text-[#666666]">
                <span>
                  Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                </span>
                <span className="tabular-nums text-[#1A1A1A] font-medium">
                  ৳{subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Delivery Charge</span>
                <span className="tabular-nums text-[#1A1A1A] font-medium">
                  {deliveryFee === 0 ? 'Free' : `৳${deliveryFee.toLocaleString('en-US')}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#1A1A1A]/10 flex justify-between text-sm font-semibold text-[#1A1A1A]">
                <span>Total Payable (BDT)</span>
                <span className="tabular-nums">৳{total.toLocaleString('en-US')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full py-3.5 bg-[#C5A059] text-[#121212] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#121212] hover:text-[#FAF9F6] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Confirming Order...' : `Confirm Order · ৳${total.toLocaleString('en-US')}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
