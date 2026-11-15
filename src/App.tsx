import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Heart,
  Lock,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import heroPerfumeImg from './assets/images/hero_perfume_hub_1794745148328.jpg';
import nocturneOudImg from './assets/images/perfume_nocturne_oud_1794745148461.jpg';
import bergamotNoirImg from './assets/images/perfume_bergamot_noir_1794745148662.jpg';
import velvetRoseImg from './assets/images/perfume_velvet_rose_1794745148820.jpg';
import saffronElixirImg from './assets/images/perfume_saffron_elixir_1794745149182.jpg';
import coastalVetiverImg from './assets/images/perfume_coastal_vetiver_1794745149402.jpg';
import vanillaAmberImg from './assets/images/perfume_vanilla_amber_1794745149964.jpg';
import whiteMuskImg from './assets/images/perfume_white_musk_1794745150289.jpg';
import discoveryDecantsImg from './assets/images/perfume_discovery_decants_1794745150558.jpg';
import {
  USP_PILLARS,
  type CartItem,
  type CategoryShowcaseItem,
  type CollectionType,
  type FilterCategory,
  type Product,
  type SizeOption,
} from './data/perfumes';
import { ResilientImage } from './components/ResilientImage';
import { ProductCard } from './components/ProductCard';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { ScentFinderModal } from './components/ScentFinderModal';
import { PolicyModal, type PolicyType } from './components/PolicyModal';
import { AdminPanelModal } from './components/AdminPanelModal';

const STORAGE_KEY = 'perfume_hub_bd_catalog_v1';
const FILTER_TABS: FilterCategory[] = ['All', 'Men', 'Women', 'Unisex', 'Arabian'];

const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=80';
const FALLBACK_BOTTLE_URL =
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'nuit-de-lambre-oud',
    name: "Nuit de L'Ambre Oud",
    subtitle: 'Smoked Amber & Cambodian Oud',
    category: 'Men',
    collection: 'Signature Blends',
    concentration: 'Extrait de Parfum · 36% Oil',
    badge: 'Bestseller',
    image: nocturneOudImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Calabrian Bergamot', 'Black Pepper', 'Cardamom'],
      middle: ['Smoked Labdanum', 'Turkish Rose', 'Incense'],
      base: ['Cambodian Oud', 'Golden Amber', 'Atlas Cedar'],
      summary: 'Bergamot · Amber · Oud',
    },
    longevity: { score: 94, label: '11–12 Hours' },
    projection: { score: 88, label: 'Strong Arm-Length' },
    weatherFit: 'Evening events, weddings & AC offices',
    moods: ['Evening', 'Festive', 'Signature'],
    description:
      'A commanding dark-amber composition balanced with crisp bergamot lift so it never turns cloying in Dhaka’s warm evenings.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 650, '30ml': 1550, '50ml': 2350, '100ml': 3500 },
    inStock: true,
  },
  {
    id: 'aura-noir-edp',
    name: 'Aura Noir',
    subtitle: 'Designer Inspired Charcoal Citrus',
    category: 'Men',
    collection: 'Designer Decants',
    concentration: 'Eau de Parfum · 28% Oil',
    badge: 'Long Lasting',
    image: bergamotNoirImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Blood Grapefruit', 'Sicilian Lemon', 'Pink Pepper'],
      middle: ['Haitian Vetiver', 'Geranium Leaf', 'Elemi'],
      base: ['Ambroxan', 'White Cedar', 'Mineral Musk'],
      summary: 'Grapefruit · Ambroxan · Vetiver',
    },
    longevity: { score: 86, label: '8–10 Hours' },
    projection: { score: 84, label: 'Radiant Trail' },
    weatherFit: 'All-day Dhaka commute & humid afternoons',
    moods: ['Office', 'Humid Heat', 'Signature'],
    description:
      'Razor-sharp citrus and clean ambroxan engineered to cut cleanly through high heat and coastal humidity from morning to night.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 520, '30ml': 1290, '50ml': 1950, '100ml': 2950 },
    inStock: true,
  },
  {
    id: 'rose-gold-elixir',
    name: 'Rose-Gold Elixir',
    subtitle: 'Damask Rose & Cashmere Musk',
    category: 'Women',
    collection: 'Signature Blends',
    concentration: 'Extrait de Parfum · 34% Oil',
    badge: 'Bestseller',
    image: velvetRoseImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Dewy Lychee', 'Pear Blossom', 'Bergamot'],
      middle: ['Damask Rose', 'Peony', 'Jasmine Sambac'],
      base: ['Cashmere Wood', 'Velvet Musk', 'Madagascar Vanilla'],
      summary: 'Lychee · Damask Rose · Cashmeran',
    },
    longevity: { score: 90, label: '9–11 Hours' },
    projection: { score: 80, label: 'Soft Aura' },
    weatherFit: 'Day-to-dinner elegance & brunch gatherings',
    moods: ['Signature', 'Office', 'Festive'],
    description:
      'Luminous petals steeped in airy cashmere musk—feminine, modern, and effortlessly lingering on silk and skin.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 580, '30ml': 1390, '50ml': 2100, '100ml': 3150 },
    inStock: true,
  },
  {
    id: 'oud-al-sultan',
    name: 'Oud Al-Sultan',
    subtitle: 'Royal Saffron & Taif Rose Attar',
    category: 'Arabian',
    collection: 'Middle Eastern Lux',
    concentration: 'Pure Extrait · 40% Oil',
    badge: 'Long Lasting',
    image: saffronElixirImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Kashmiri Saffron', 'Nutmeg', 'Cinnamon Bark'],
      middle: ['Taif Rose', 'Praline', 'Guaiac Wood'],
      base: ['Aged Agarwood', 'Suede Leather', 'Benzoin'],
      summary: 'Saffron · Taif Rose · Leather Oud',
    },
    longevity: { score: 97, label: '12+ Hours' },
    projection: { score: 94, label: 'Room-Filling' },
    weatherFit: 'Eid, formal receptions & cool nights',
    moods: ['Festive', 'Evening'],
    description:
      'Opulent Arabian perfumery crafted in small batches—spiced saffron ribbons folded into smoky aged agarwood and burnished leather.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 690, '30ml': 1650, '50ml': 2490, '100ml': 3500 },
    inStock: true,
  },
  {
    id: 'laurel-and-oak',
    name: 'Laurel & Oak',
    subtitle: 'Botanical Vetiver & Fig Leaf',
    category: 'Unisex',
    collection: 'Designer Decants',
    concentration: 'Eau de Parfum · 26% Oil',
    badge: 'New',
    image: coastalVetiverImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Crushed Fig Leaf', 'Mandarin Zest', 'Petitgrain'],
      middle: ['Bay Laurel', 'Clary Sage', 'Green Tea'],
      base: ['Oakmoss', 'Java Vetiver', 'Dry Cedar'],
      summary: 'Fig Leaf · Vetiver · Oakmoss',
    },
    longevity: { score: 84, label: '8–9 Hours' },
    projection: { score: 76, label: 'Crisp Personal Bubble' },
    weatherFit: 'Peak summer heat, campus & studio wear',
    moods: ['Humid Heat', 'Office'],
    description:
      'Breezy green botanicals and earthy vetiver roots that feel like stepping into shaded monsoon rain.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 480, '30ml': 1190, '50ml': 1850, '100ml': 2790 },
    inStock: true,
  },
  {
    id: 'ambre-cognac-reserve',
    name: 'Ambre Cognac Reserve',
    subtitle: 'Spiced Vanilla & Roasted Tonka',
    category: 'Unisex',
    collection: 'Middle Eastern Lux',
    concentration: 'Extrait de Parfum · 35% Oil',
    badge: 'Limited Edition',
    image: vanillaAmberImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Ceylon Cinnamon', 'Plum Nectar', 'Cardamom'],
      middle: ['Aged Cognac Accord', 'Roasted Tonka', 'Myrrh'],
      base: ['Bourbon Vanilla', 'Praline Amber', 'Sandalwood'],
      summary: 'Cinnamon · Cognac · Bourbon Vanilla',
    },
    longevity: { score: 92, label: '10–12 Hours' },
    projection: { score: 86, label: 'Warm Sillage' },
    weatherFit: 'Date nights, winter evenings & lounges',
    moods: ['Evening', 'Festive'],
    description:
      'Velvety cognac warmth draped over toasted tonka bean and dark vanilla—intoxicating without ever turning sugary.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 620, '30ml': 1490, '50ml': 2250, '100ml': 3350 },
    inStock: true,
  },
  {
    id: 'aurelia-white-musk',
    name: 'Aurélia White Musk',
    subtitle: 'Alabaster Iris & Clean Skin Musk',
    category: 'Women',
    collection: 'Designer Decants',
    concentration: 'Eau de Parfum · 30% Oil',
    badge: 'New',
    image: whiteMuskImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['White Pear', 'Aldehydes', 'Neroli'],
      middle: ['Florentine Iris', 'Cotton Flower', 'White Tea'],
      base: ['Ambrette Seed', 'Creamy Sandalwood', 'Clean Musk'],
      summary: 'Pear · Orris Butter · White Musk',
    },
    longevity: { score: 85, label: '8–10 Hours' },
    projection: { score: 74, label: 'Intimate & Airy' },
    weatherFit: 'Daily signature, humid mornings & gifting',
    moods: ['Office', 'Humid Heat', 'Signature'],
    description:
      'Press-laundered linen meets powdery iris and warm skin musk—an understated second-skin signature for any season.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 490, '30ml': 1220, '50ml': 1890, '100ml': 2850 },
    inStock: true,
  },
  {
    id: 'atelier-discovery-quartet',
    name: 'Atelier Discovery Quartet',
    subtitle: '4-Piece Curated Decant Vault',
    category: 'Combo Offers',
    collection: 'Discovery Sets',
    concentration: 'Extrait & EDP Assortment',
    badge: 'Bestseller',
    image: discoveryDecantsImg,
    fallbackImage: FALLBACK_BOTTLE_URL,
    scentNotes: {
      top: ['Bergamot & Saffron', 'Lychee & Green Fig'],
      middle: ['Damask Rose', 'Vetiver & Cognac'],
      base: ['Cambodian Oud', 'White Musk & Vanilla'],
      summary: 'Oud · Bergamot · Rose · Amber',
    },
    longevity: { score: 91, label: '9–12 Hours Avg' },
    projection: { score: 85, label: 'Balanced Wardrobe' },
    weatherFit: 'Day, night & gifting wardrobe in travel sleeves',
    moods: ['Signature', 'Office', 'Evening', 'Humid Heat', 'Festive'],
    description:
      'Experience four bestselling houses in precision-measured glass atomizers with brushed gold casings—ideal for sampling or travel.',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: { '10ml': 450, '30ml': 1350, '50ml': 2150, '100ml': 3200 },
    inStock: true,
  },
];

const CATEGORY_SHOWCASE: CategoryShowcaseItem[] = [
  {
    id: 'designer-decants',
    title: 'Designer Decants',
    kicker: 'Authentic Vials',
    description: 'Precision-measured 10ml–100ml draws from iconic luxury houses.',
    image: bergamotNoirImg,
    targetFilter: 'All',
    targetCollection: 'Designer Decants',
  },
  {
    id: 'middle-eastern-lux',
    title: 'Middle Eastern Lux',
    kicker: 'Arabian Extrait',
    description: 'Resinous oud, royal saffron, and Taif rose with commanding sillage.',
    image: saffronElixirImg,
    targetFilter: 'All',
    targetCollection: 'Middle Eastern Lux',
  },
  {
    id: 'signature-blends',
    title: 'Signature Blends',
    kicker: 'House Formulations',
    description: 'High-oil custom impressions calibrated for tropical humidity.',
    image: velvetRoseImg,
    targetFilter: 'All',
    targetCollection: 'Signature Blends',
  },
  {
    id: 'discovery-sets',
    title: 'Discovery Sets & Combos',
    kicker: 'Curated Wardrobes',
    description: 'Multi-scent travel atomizers crafted for gifting and exploration.',
    image: discoveryDecantsImg,
    targetFilter: 'All',
    targetCollection: 'Discovery Sets',
  },
];

function loadStoredProducts(): Product[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PRODUCTS;
    return parsed as Product[];
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(loadStoredProducts);
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
    product: Product | null;
    size: SizeOption;
  }>({ product: null, size: '30ml' });

  const [scentFinderOpen, setScentFinderOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Ignore quota errors if storage is full
    }
  }, [products]);

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (wishlistOnly && !wishlist.includes(p.id)) return false;

      if (activeCollection) {
        const matchesCollection =
          p.collection === activeCollection ||
          (activeCollection === 'Designer Decants' && p.category === 'Designer Decants') ||
          (activeCollection === 'Discovery Sets' && p.category === 'Combo Offers') ||
          (activeCollection === 'Middle Eastern Lux' && p.category === 'Arabian');
        if (!matchesCollection) return false;
      }

      if (activeFilter !== 'All' && p.category !== activeFilter) return false;

      if (query) {
        const haystack =
          `${p.name} ${p.subtitle} ${p.category} ${p.collection} ${p.scentNotes.summary}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [products, activeFilter, activeCollection, wishlistOnly, wishlist, searchQuery]);

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

  const handleAddToCart = (product: Product, size: SizeOption, quantity = 1) => {
    if (!product.inStock) return;
    const key = `${product.id}__${size}`;
    const unitPrice = product.prices[size] ?? 0;
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

  const handleSaveProduct = (savedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWishlist((prev) => prev.filter((w) => w !== id));
  };

  const handleToggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const handleResetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const resetAllFilters = () => {
    setActiveFilter('All');
    setActiveCollection(null);
    setWishlistOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1A1A]">
      {/* Sticky Top Wrapper */}
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
            {/* Left: Menu Links / Mobile Button */}
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
                  onClick={() => handleNavCollection('All', 'Middle Eastern Lux')}
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

            {/* Center: Brand Logo */}
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

            {/* Right: Search, Wishlist, Cart */}
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

          {mobileMenuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="lg:hidden border-t border-white/10 bg-[#121212] px-6 py-5 space-y-3"
            >
              {[
                { label: 'Shop All', filter: 'All' as FilterCategory, collection: null },
                {
                  label: 'Designer',
                  filter: 'All' as FilterCategory,
                  collection: 'Designer Decants' as CollectionType,
                },
                {
                  label: 'Middle Eastern',
                  filter: 'All' as FilterCategory,
                  collection: 'Middle Eastern Lux' as CollectionType,
                },
                {
                  label: 'Decants & Signatures',
                  filter: 'All' as FilterCategory,
                  collection: 'Signature Blends' as CollectionType,
                },
                {
                  label: 'Combo Offers',
                  filter: 'All' as FilterCategory,
                  collection: 'Discovery Sets' as CollectionType,
                },
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
        {/* Hero Section */}
        <section className="relative bg-[#121212] text-[#FAF9F6] overflow-hidden">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[540px] lg:min-h-[620px]">
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

            <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full">
              <ResilientImage
                src={heroPerfumeImg}
                fallbackSrc={FALLBACK_HERO_URL}
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

        {/* Category Showcase */}
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
                  onClick={() => handleNavCollection(cat.targetFilter, cat.targetCollection ?? null)}
                  className={`group text-left flex flex-col bg-[#FAF9F6] border transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-[#C5A059] shadow-[0_12px_28px_-14px_rgba(18,18,18,0.2)]'
                      : 'border-[#1A1A1A]/10 hover:border-[#C5A059]/70'
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]">
                    <ResilientImage
                      src={cat.image}
                      fallbackSrc={FALLBACK_BOTTLE_URL}
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
                      Browse House{' '}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Interactive Product Grid */}
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

          {(activeCollection || searchQuery || wishlistOnly) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
              <span>
                Showing{' '}
                <strong className="text-[#1A1A1A] tabular-nums">{filteredProducts.length}</strong>{' '}
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
                    onClick={() => handleNavCollection('All', 'Middle Eastern Lux')}
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
            <div className="flex items-center gap-5">
              <span>Banani, Dhaka · Nationwide Courier Dispatch</span>
              <button
                type="button"
                onClick={() => setAdminOpen(true)}
                aria-label="Open Admin Studio"
                className="inline-flex items-center gap-1.5 text-[#FAF9F6]/55 hover:text-[#C5A059] transition-colors"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
            </div>
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
        products={products}
        onClose={() => setScentFinderOpen(false)}
        onSelectProduct={(product, size) => setQuickViewState({ product, size })}
        onAddToCart={(product, size) => handleAddToCart(product, size, 1)}
      />

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />

      <AdminPanelModal
        isOpen={adminOpen}
        products={products}
        defaultImageFallback={nocturneOudImg}
        onClose={() => setAdminOpen(false)}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleStock={handleToggleStock}
        onImportProducts={(imported) => setProducts(imported)}
        onResetCatalog={handleResetCatalog}
      />
    </div>
  );
}
