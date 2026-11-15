import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  CATEGORY_SHOWCASE,
  HERO_IMAGE,
  PERFUMES,
  USP_PILLARS,
  type BottleSize,
  type CollectionType,
  type FilterCategory,
  type PerfumeProduct,
} from './data/perfumes';
import { ResilientImage } from './components/ResilientImage';
import { ProductCard } from './components/ProductCard';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer, type CartItem } from './components/CartDrawer';
import { ScentFinderModal } from './components/ScentFinderModal';
import { PolicyModal, type PolicyType } from './components/PolicyModal';

const FILTER_TABS: FilterCategory[] = ['All', 'Men', 'Women', 'Unisex', 'Arabian'];

export default function App() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [activeCollection, setActiveCollection] = useState<CollectionType | null>(null);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(['nuit-de-lambre-oud', 'oud-al-sultan']);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [quickViewState, setQuickViewState] = useState<{
    product: PerfumeProduct | null;
    size: BottleSize;
  }>({ product: null, size: '30ml' });

  const [scentFinderOpen, setScentFinderOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PERFUMES.filter((p) => {
      if (wishlistOnly && !wishlist.includes(p.id)) return false;
      if (activeCollection && p.collection !== activeCollection) return false;
      if (activeFilter !== 'All' && p.category !== activeFilter) return false;
      if (query) {
        const haystack = `${p.name} ${p.subtitle} ${p.category} ${p.collection} ${p.notesLine}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [activeFilter, activeCollection, wishlistOnly, wishlist, searchQuery]);

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavCollection = (filter: FilterCategory, collection: CollectionType | null = null) => {
    setWishlistOnly(false);
    setActiveFilter(filter);
    setActiveCollection(collection);
    setMobileMenuOpen(false);
    scrollToCollection();
  };

  const handleToggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: PerfumeProduct, size: BottleSize, quantity = 1) => {
    const key = `${product.id}__${size}`;
    const unitPrice = product.prices[size];
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { key, product, size, unitPrice, quantity }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const resetAllFilters = () => {
    setActiveFilter('All');
    setActiveCollection(null);
    setWishlistOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1A1A]">
      {/* Sticky Top Wrapper (Announcement Bar + Navigation Header) */}
      <div className="sticky top-0 z-40">
        {bannerVisible && (
          <div className="bg-[#121212] text-[#C5A059] border-b border-[#C5A059]/20 px-4 py-1.5 text-[11px] sm:text-xs">
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
              <p className="mx-auto text-center tracking-wide truncate">
                Nationwide Cash on Delivery Available{' '}
                <span className="hidden sm:inline">
                  · 100% Authentic Designer, Middle Eastern &amp; Custom Perfumes · Free Delivery on Orders Over ৳2,500
                </span>
              </p>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                aria-label="Dismiss announcement"
                className="shrink-0 text-[#C5A059]/75 hover:text-[#C5A059] p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Sticky Navigation Header */}
        <header className="bg-[#121212]/96 backdrop-blur-md text-[#FAF9F6] border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
            {/* Left Zone: Minimalist Menu Links (Desktop) / Menu Button (Mobile) */}
            <div className="flex items-center lg:flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className="lg:hidden flex h-10 w-10 items-center justify-center text-[#FAF9F6] hover:text-[#C5A059]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <nav
                aria-label="Primary collection navigation"
                className="hidden lg:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.14em] text-[#FAF9F6]/85"
              >
                <button
                  type="button"
                  onClick={() => handleNavCollection('All', null)}
                  className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
                >
                  Shop All
                </button>
                <button
                  type="button"
                  onClick={() => handleNavCollection('All', 'Designer Decants')}
                  className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
                >
                  Designer
                </button>
                <button
                  type="button"
                  onClick={() => handleNavCollection('Arabian', 'Middle Eastern Lux')}
                  className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
                >
                  Middle Eastern
                </button>
                <button
                  type="button"
                  onClick={() => handleNavCollection('All', 'Signature Blends')}
                  className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
                >
                  Decants
                </button>
                <button
                  type="button"
                  onClick={() => handleNavCollection('All', 'Discovery Sets')}
                  className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
                >
                  Combo Offers
                </button>
              </nav>
            </div>

            {/* Center Zone: Brand Logo Wordmark */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.22em] text-[#FAF9F6] whitespace-nowrap shrink-0 text-center"
            >
              PERFUME HUB <span className="text-[#C5A059]">BD</span>
            </a>

            {/* Right Zone: Search, Wishlist & Cart */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 lg:flex-1 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Toggle fragrance search"
                aria-expanded={searchOpen}
                className="flex h-10 w-10 items-center justify-center text-[#FAF9F6]/85 hover:text-[#C5A059] transition-colors"
              >
                <Search className="h-4 w-4" strokeWidth={1.7} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setWishlistOnly((v) => !v);
                  scrollToCollection();
                }}
                aria-label="View saved wishlist scents"
                aria-pressed={wishlistOnly}
                className={`relative flex h-10 w-10 items-center justify-center transition-colors ${
                  wishlistOnly ? 'text-[#C5A059]' : 'text-[#FAF9F6]/85 hover:text-[#C5A059]'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${wishlistOnly ? 'fill-[#C5A059]' : ''}`}
                  strokeWidth={1.7}
                />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1 text-[10px] font-semibold tabular-nums text-[#C5A059]">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Open shopping bag with ${totalCartCount} items`}
                className="relative flex h-10 items-center gap-2 px-3 bg-[#C5A059] text-[#121212] hover:bg-[#FAF9F6] transition-colors text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                <span className="hidden sm:inline">Bag</span>
                <span className="tabular-nums font-bold">({totalCartCount})</span>
              </button>
            </div>
          </div>

          {/* Expandable Search Bar */}
          {searchOpen && (
            <div className="border-t border-white/10 bg-[#171717] px-4 sm:px-6 lg:px-8 py-3">
              <div className="mx-auto max-w-2xl flex items-center gap-3">
                <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    scrollToCollection();
                  }}
                  placeholder="Search by scent name or note (e.g., Oud, Bergamot, Rose, Vanilla)..."
                  autoFocus
                  className="w-full bg-transparent text-sm text-[#FAF9F6] placeholder:text-[#FAF9F6]/45 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#C5A059] hover:underline whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="lg:hidden border-t border-white/10 bg-[#121212] px-6 py-5 space-y-3"
            >
              {[
                { label: 'Shop All', filter: 'All' as FilterCategory, collection: null },
                { label: 'Designer', filter: 'All' as FilterCategory, collection: 'Designer Decants' as CollectionType },
                { label: 'Middle Eastern', filter: 'Arabian' as FilterCategory, collection: 'Middle Eastern Lux' as CollectionType },
                { label: 'Decants & Signatures', filter: 'All' as FilterCategory, collection: 'Signature Blends' as CollectionType },
                { label: 'Combo Offers', filter: 'All' as FilterCategory, collection: 'Discovery Sets' as CollectionType },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavCollection(item.filter, item.collection)}
                  className="flex w-full items-center justify-between py-2 text-sm uppercase tracking-[0.16em] text-[#FAF9F6]/90 hover:text-[#C5A059] border-b border-white/10"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#C5A059]" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setScentFinderOpen(true);
                }}
                className="mt-2 w-full py-3 bg-[#C5A059] text-[#121212] text-xs font-semibold uppercase tracking-[0.16em]"
              >
                Find Your Scent
              </button>
            </nav>
          )}
        </header>
      </div>

      <main id="top" className="flex-1">
        {/* Hero Editorial Section */}
        <section className="relative bg-[#121212] text-[#FAF9F6] overflow-hidden">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[540px] lg:min-h-[620px]">
            {/* Hero Copy Column */}
            <div className="lg:col-span-6 relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-14 lg:py-20">
              <span className="text-xs uppercase tracking-[0.22em] text-[#C5A059] font-medium">
                Dhaka · Curated Extrait &amp; Decants
              </span>

              <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold leading-[1.08] tracking-tight text-[#FAF9F6] [text-wrap:balance]">
                Signature Scents, Crafted for Distinction.
              </h1>

              <p className="mt-5 text-base sm:text-[17px] text-[#FAF9F6]/78 leading-relaxed max-w-xl">
                Explore premium designer decants, exotic Middle Eastern blends, and long-lasting custom impressions tailored for Bangladesh&apos;s weather.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNavCollection('All', null)}
                  className="px-7 py-3.5 bg-[#C5A059] text-[#121212] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#FAF9F6] transition-colors whitespace-nowrap"
                >
                  Explore Collection
                </button>
                <button
                  type="button"
                  onClick={() => setScentFinderOpen(true)}
                  className="px-7 py-3.5 border border-[#C5A059]/65 text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#C5A059]/15 hover:border-[#C5A059] transition-colors whitespace-nowrap"
                >
                  Find Your Scent
                </button>
              </div>

              {/* Grounded Proof Metrics Row */}
              <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#C5A059] tabular-nums">
                    30–40%
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-[#FAF9F6]/65">
                    Extrait Oil
                  </span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#C5A059] tabular-nums">
                    8–12h
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-[#FAF9F6]/65">
                    Humid Wear
                  </span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#C5A059] tabular-nums">
                    64
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-[#FAF9F6]/65">
                    Districts COD
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Photography Column */}
            <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full">
              <ResilientImage
                src={HERO_IMAGE}
                alt="Perfume Hub BD dark obsidian and gold crystal fragrance bottles"
                title="Perfume Hub BD Atelier"
                className="w-full h-full object-cover object-center"
                containerClassName="w-full h-full min-h-[300px]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#121212] lg:via-[#121212]/25 lg:to-transparent"
              />
            </div>
          </div>
        </section>

        {/* Category Showcase (4 Interactive Editorial Cards) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8C6D3B] font-medium">
                Curated Houses
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
                Explore by Fragrance Craft
              </h2>
            </div>
            <p className="text-sm text-[#666666] max-w-md">
              Select a house below to filter authentic designer vials, Arabian extraits, and climate-tuned signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORY_SHOWCASE.map((cat) => {
              const isSelected = activeCollection === cat.targetCollection;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleNavCollection('All', cat.targetCollection ?? null)}
                  className={`group text-left flex flex-col bg-[#FAF9F6] border transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-[#C5A059] shadow-[0_12px_28px_-14px_rgba(18,18,18,0.2)]'
                      : 'border-[#1A1A1A]/10 hover:border-[#C5A059]/70'
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]">
                    <ResilientImage
                      src={cat.image}
                      alt={cat.title}
                      title={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      containerClassName="w-full h-full"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B]">
                        {cat.kicker}
                      </span>
                      <h3 className="mt-1 font-serif text-xl font-semibold text-[#1A1A1A] group-hover:text-[#8C6D3B] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A] group-hover:text-[#8C6D3B]">
                      Browse House <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Interactive Product Grid ("Bestsellers & Trending") */}
        <section
          id="collection"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-24"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#1A1A1A]/10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8C6D3B] font-medium">
                {wishlistOnly
                  ? 'Saved Wishlist'
                  : activeCollection
                  ? activeCollection
                  : 'Signature Catalog'}
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
                Bestsellers &amp; Trending
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Filter perfumes by category"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFECE6] border border-[#1A1A1A]/10"
              >
                {FILTER_TABS.map((tab) => {
                  const active = activeFilter === tab && !wishlistOnly;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setWishlistOnly(false);
                        setActiveFilter(tab);
                      }}
                      className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#121212] text-[#C5A059]'
                          : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {(activeCollection || wishlistOnly || searchQuery || activeFilter !== 'All') && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-2 text-xs uppercase tracking-wider text-[#8C6D3B] hover:text-[#121212] underline underline-offset-4 whitespace-nowrap"
                >
                  Reset View
                </button>
              )}
            </div>
          </div>

          {/* Active Context Line */}
          {(activeCollection || searchQuery || wishlistOnly) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
              <span>
                Showing <strong className="text-[#1A1A1A] tabular-nums">{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'fragrance' : 'fragrances'}
              </span>
              {activeCollection && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Collection: {activeCollection}</span>
                </>
              )}
              {searchQuery && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                </>
              )}
              {wishlistOnly && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Saved Wishlist</span>
                </>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={(p, size) => setQuickViewState({ product: p, size })}
                  onAddToCart={(p, size) => handleAddToCart(p, size, 1)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-[#1A1A1A]/10 bg-[#EFECE6]/50 p-12 text-center">
              <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                No matching scents found
              </h3>
              <p className="mt-2 text-sm text-[#666666]">
                Try clearing your active search query or switching back to all collections.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 px-6 py-2.5 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                View All Fragrances
              </button>
            </div>
          )}
        </section>

        {/* "The Scent Pyramid" / Brand USP Dark Section */}
        <section className="bg-[#121212] text-[#FAF9F6] border-t border-b border-[#C5A059]/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-medium">
                  The Scent Pyramid
                </span>
                <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-[#FAF9F6] leading-tight [text-wrap:balance]">
                  Built for Longevity in Tropical Humidity.
                </h2>
                <p className="mt-4 text-sm text-[#FAF9F6]/70 leading-relaxed">
                  Mass-market fragrances evaporate within two hours in Dhaka&apos;s climate. Perfume Hub BD curates dense extraits and sterile glass decants engineered for all-day presence.
                </p>
                <button
                  type="button"
                  onClick={() => setScentFinderOpen(true)}
                  className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C5A059] hover:text-[#FAF9F6] transition-colors"
                >
                  Take the Scent Consultation <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {USP_PILLARS.map((pillar) => (
                  <div
                    key={pillar.index}
                    className="border border-white/10 bg-[#181818] p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-serif text-2xl font-medium text-[#C5A059] tabular-nums">
                        {pillar.index}.
                      </span>
                      <h3 className="mt-3 font-serif text-xl font-semibold text-[#FAF9F6] leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-[#FAF9F6]/68 leading-relaxed">
                        {pillar.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Luxury Dark Footer */}
      <footer className="bg-[#0D0D0D] text-[#FAF9F6] pt-16 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Brand Bio */}
            <div className="md:col-span-5">
              <span className="font-serif text-2xl font-bold tracking-[0.22em] text-[#FAF9F6]">
                PERFUME HUB <span className="text-[#C5A059]">BD</span>
              </span>
              <p className="mt-4 text-sm text-[#FAF9F6]/65 leading-relaxed max-w-sm">
                Bangladesh&apos;s destination for 100% authentic designer decants, opulent Middle Eastern extraits, and bespoke long-lasting impressions delivered to your doorstep.
              </p>
              <div className="mt-6 flex items-center gap-5 text-xs uppercase tracking-[0.16em] text-[#C5A059]">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAF9F6] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAF9F6] transition-colors"
                >
                  Instagram
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059]">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#FAF9F6]/70">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavCollection('All', null)}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Shop All Perfumes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavCollection('All', 'Designer Decants')}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Designer Decants
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavCollection('Arabian', 'Middle Eastern Lux')}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Middle Eastern Lux
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavCollection('All', 'Discovery Sets')}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Discovery Sets &amp; Combos
                  </button>
                </li>
              </ul>
            </div>

            {/* Customer Care & Payment Badges */}
            <div className="md:col-span-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059]">
                Customer Care
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#FAF9F6]/70">
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicy('delivery')}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Delivery Policy (Inside &amp; Outside Dhaka)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicy('authenticity')}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    100% Authenticity Guarantee
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setScentFinderOpen(true)}
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Scent Consultation Guide
                  </button>
                </li>
              </ul>

              <div className="mt-6">
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[#FAF9F6]/50 mb-2.5">
                  Accepted Payment Methods
                </span>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium tracking-wide text-[#FAF9F6]/85">
                  {['bKash', 'Nagad', 'Cash on Delivery', 'Visa / Mastercard'].map((method) => (
                    <span
                      key={method}
                      className="border border-white/15 px-2.5 py-1 bg-white/[0.03]"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF9F6]/50">
            <p>© {new Date().getFullYear()} Perfume Hub BD. All rights reserved.</p>
            <p>Banani, Dhaka · Nationwide Courier Dispatch</p>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <QuickViewModal
        product={quickViewState.product}
        initialSize={quickViewState.size}
        isWishlisted={
          quickViewState.product ? wishlist.includes(quickViewState.product.id) : false
        }
        onClose={() => setQuickViewState({ product: null, size: '30ml' })}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(product, size, qty) => handleAddToCart(product, size, qty)}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
      />

      <ScentFinderModal
        isOpen={scentFinderOpen}
        onClose={() => setScentFinderOpen(false)}
        onSelectProduct={(product, size) => setQuickViewState({ product, size })}
        onAddToCart={(product, size) => handleAddToCart(product, size, 1)}
      />

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
    </div>
  );
}
