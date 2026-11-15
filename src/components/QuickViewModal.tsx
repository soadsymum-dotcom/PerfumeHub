import { useEffect, useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { BOTTLE_SIZES, type Product, type SizeOption } from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

interface QuickViewModalProps {
  product: Product | null;
  initialSize: SizeOption;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, size: SizeOption, quantity: number) => void;
}

export function QuickViewModal({
  product,
  initialSize,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>(initialSize);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    const validSize = product.availableSizes.includes(initialSize)
      ? initialSize
      : product.availableSizes[0] ?? '10ml';
    setSelectedSize(validSize);
    setQuantity(1);
  }, [product, initialSize]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const activePrice = product.prices[selectedSize] ?? 0;

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product, selectedSize, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/75 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF9F6] text-[#1A1A1A] border border-[#C5A059]/30 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product quick view"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center bg-[#FAF9F6]/90 border border-[#1A1A1A]/15 text-[#1A1A1A] hover:border-[#C5A059] hover:text-[#8C6D3B] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-5 bg-[#EFECE6] relative min-h-[280px]">
            <ResilientImage
              src={product.image}
              fallbackSrc={product.fallbackImage}
              alt={product.name}
              title={product.name}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full min-h-[280px]"
            />
            <span className="absolute bottom-4 left-4 bg-[#121212]/90 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#C5A059]">
              {product.concentration}
            </span>
          </div>

          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8C6D3B]">
                <span>{product.collection}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                {!product.inStock && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#1A1A1A] font-semibold">Out of Stock</span>
                  </>
                )}
              </div>

              <h2
                id="quick-view-title"
                className="mt-2 font-serif text-3xl font-semibold text-[#1A1A1A] leading-tight"
              >
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-[#666666]">{product.description}</p>

              {/* Scent Pyramid */}
              <div className="mt-6 pt-5 border-t border-[#1A1A1A]/10 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]">
                  Olfactory Scent Pyramid
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#EFECE6]/70 p-3 border border-[#1A1A1A]/8">
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                      Top Notes
                    </span>
                    <span className="mt-1 block text-[#1A1A1A] leading-relaxed">
                      {product.scentNotes.top.join(' · ')}
                    </span>
                  </div>
                  <div className="bg-[#EFECE6]/70 p-3 border border-[#1A1A1A]/8">
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                      Heart Notes
                    </span>
                    <span className="mt-1 block text-[#1A1A1A] leading-relaxed">
                      {product.scentNotes.middle.join(' · ')}
                    </span>
                  </div>
                  <div className="bg-[#EFECE6]/70 p-3 border border-[#1A1A1A]/8">
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                      Base Notes
                    </span>
                    <span className="mt-1 block text-[#1A1A1A] leading-relaxed">
                      {product.scentNotes.base.join(' · ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Progress Bars */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#1A1A1A]">Longevity</span>
                    <span className="text-[#666666] tabular-nums">{product.longevity.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A1A1A]/10 overflow-hidden">
                    <div
                      className="h-full bg-[#C5A059] transition-all duration-500"
                      style={{ width: `${product.longevity.score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#1A1A1A]">Projection</span>
                    <span className="text-[#666666] tabular-nums">{product.projection.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A1A1A]/10 overflow-hidden">
                    <div
                      className="h-full bg-[#121212] transition-all duration-500"
                      style={{ width: `${product.projection.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#666666]">
                Recommended climate wear:{' '}
                <span className="text-[#1A1A1A] font-medium">{product.weatherFit}</span>
              </p>
            </div>

            {/* Purchase Controls */}
            <div className="mt-6 pt-5 border-t border-[#1A1A1A]/10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.14em] text-[#666666]">
                  Select Bottle Size
                </span>
                <span className="text-2xl font-semibold text-[#1A1A1A] tabular-nums">
                  ৳{(activePrice * quantity).toLocaleString('en-US')}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {BOTTLE_SIZES.map((size) => {
                  const isAvailable = product.availableSizes.includes(size);
                  const active = selectedSize === size && isAvailable;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 text-xs font-medium tabular-nums border transition-colors ${
                        !isAvailable
                          ? 'bg-[#EFECE6]/50 text-[#666666]/45 border-[#1A1A1A]/8 line-through cursor-not-allowed'
                          : active
                          ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                          : 'bg-transparent text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#8C6D3B]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="flex items-center border border-[#1A1A1A]/20 h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="h-full px-3 text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="h-full px-3 text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAdd}
                  className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#121212] text-[#FAF9F6] hover:bg-[#C5A059] hover:text-[#121212] disabled:bg-[#EFECE6] disabled:text-[#666666] disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-[0.16em] transition-colors whitespace-nowrap px-5"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.7} />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="h-11 w-11 flex items-center justify-center border border-[#1A1A1A]/20 hover:border-[#C5A059] transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#1A1A1A]'
                    }`}
                    strokeWidth={1.7}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
