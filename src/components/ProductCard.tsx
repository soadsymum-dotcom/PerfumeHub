import { useEffect, useState } from 'react';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { BOTTLE_SIZES, type Product, type SizeOption } from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product, selectedSize: SizeOption) => void;
  onAddToCart: (product: Product, size: SizeOption) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}: ProductCardProps) {
  const defaultSize: SizeOption = product.availableSizes.includes('30ml')
    ? '30ml'
    : product.availableSizes[0] ?? '10ml';

  const [selectedSize, setSelectedSize] = useState<SizeOption>(defaultSize);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product.availableSizes.includes(selectedSize)) {
      setSelectedSize(product.availableSizes[0] ?? '10ml');
    }
  }, [product.availableSizes, selectedSize]);

  const activePrice = product.prices[selectedSize] ?? 0;

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product, selectedSize);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  };

  return (
    <article className="group flex flex-col bg-[#FAF9F6] border border-[#1A1A1A]/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C5A059]/60 hover:shadow-[0_14px_34px_-16px_rgba(18,18,18,0.18)]">
      {/* Product Visual Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]">
        <button
          type="button"
          onClick={() => onQuickView(product, selectedSize)}
          className="block w-full h-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
          aria-label={`Quick view ${product.name}`}
        >
          <ResilientImage
            src={product.image}
            fallbackSrc={product.fallbackImage}
            alt={`${product.name} — ${product.subtitle}`}
            title={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              !product.inStock ? 'opacity-65 grayscale-[30%]' : ''
            }`}
            containerClassName="w-full h-full"
          />
        </button>

        {/* Single Editorial Tag */}
        {(!product.inStock || product.badge !== 'None') && (
          <span className="pointer-events-none absolute top-3 left-3 bg-[#121212]/90 px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase text-[#C5A059]">
            {!product.inStock ? 'Out of Stock' : product.badge}
          </span>
        )}

        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-[#FAF9F6]/92 text-[#1A1A1A] border border-[#1A1A1A]/10 transition-colors hover:border-[#C5A059] hover:text-[#8C6D3B] focus-visible:outline-2 focus-visible:outline-[#C5A059]"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-[#C5A059] text-[#C5A059]' : ''
            }`}
            strokeWidth={1.6}
          />
        </button>

        {/* Hover Action Bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-px bg-[#121212]/90 backdrop-blur-xs opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
          <button
            type="button"
            onClick={() => onQuickView(product, selectedSize)}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium tracking-wider uppercase text-[#FAF9F6] hover:text-[#C5A059] transition-colors whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.7} />
            Quick View
          </button>
          <span className="h-4 w-px bg-white/15" aria-hidden="true" />
          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium tracking-wider uppercase text-[#C5A059] hover:bg-[#C5A059] hover:text-[#121212] disabled:opacity-50 disabled:pointer-events-none transition-colors whitespace-nowrap"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.7} />
            {!product.inStock ? 'Sold Out' : justAdded ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-[#666666]">
            <span>{product.category}</span>
            <span className="text-[#8C6D3B]">{product.longevity.label}</span>
          </div>

          <h3 className="mt-1.5 font-serif text-xl font-semibold tracking-tight text-[#1A1A1A] leading-snug">
            <button
              type="button"
              onClick={() => onQuickView(product, selectedSize)}
              className="text-left hover:text-[#8C6D3B] transition-colors focus-visible:outline-2 focus-visible:outline-[#C5A059]"
            >
              {product.name}
            </button>
          </h3>

          <p className="mt-1 text-xs text-[#666666] leading-relaxed">
            {product.scentNotes.summary}
          </p>
        </div>

        {/* Interactive Size Selector & Dynamic BDT Price */}
        <div className="mt-5 pt-4 border-t border-[#1A1A1A]/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#666666]">
              Volume
            </span>
            <span className="text-base font-semibold text-[#1A1A1A] tabular-nums">
              ৳{activePrice.toLocaleString('en-US')}
            </span>
          </div>

          <div
            className="grid grid-cols-4 gap-1.5"
            role="group"
            aria-label={`Select bottle size for ${product.name}`}
          >
            {BOTTLE_SIZES.map((size) => {
              const isAvailable = product.availableSizes.includes(size);
              const active = selectedSize === size && isAvailable;
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={active}
                  className={`py-2 text-xs font-medium tabular-nums transition-colors whitespace-nowrap border focus-visible:outline-2 focus-visible:outline-[#C5A059] ${
                    !isAvailable
                      ? 'bg-[#EFECE6]/50 text-[#666666]/45 border-[#1A1A1A]/8 line-through cursor-not-allowed'
                      : active
                      ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                      : 'bg-transparent text-[#1A1A1A]/80 border-[#1A1A1A]/15 hover:border-[#8C6D3B] hover:text-[#1A1A1A]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleAdd}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#C5A059] ${
                !product.inStock
                  ? 'bg-[#EFECE6] text-[#666666] border border-[#1A1A1A]/15 cursor-not-allowed'
                  : justAdded
                  ? 'bg-[#8C6D3B] text-[#FAF9F6]'
                  : 'bg-[#121212] text-[#FAF9F6] hover:bg-[#C5A059] hover:text-[#121212]'
              }`}
            >
              {!product.inStock
                ? 'Out of Stock'
                : justAdded
                ? 'Added to Bag'
                : `Add ${selectedSize} · ৳${activePrice.toLocaleString('en-US')}`}
            </button>
            <button
              type="button"
              onClick={() => onQuickView(product, selectedSize)}
              aria-label={`Inspect scent pyramid for ${product.name}`}
              className="lg:hidden flex h-10 w-10 items-center justify-center border border-[#1A1A1A]/15 text-[#1A1A1A] hover:border-[#C5A059]"
            >
              <Eye className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
