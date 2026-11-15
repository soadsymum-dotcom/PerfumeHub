import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  Check,
  Copy,
  Download,
  Edit3,
  ImagePlus,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Unlock,
  Upload,
  X,
} from 'lucide-react';
import {
  BOTTLE_SIZES,
  PRODUCT_BADGES,
  PRODUCT_CATEGORIES,
  type CollectionType,
  type Product,
  type ProductBadge,
  type ProductCategory,
  type SizeOption,
} from '../data/perfumes';
import { ResilientImage } from './ResilientImage';

interface AdminPanelModalProps {
  isOpen: boolean;
  products: Product[];
  defaultImageFallback: string;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStock: (id: string) => void;
  onImportProducts: (products: Product[]) => void;
  onResetCatalog: () => void;
}

const ADMIN_PIN = '1234';

type AdminViewTab = 'table' | 'form' | 'sync';

interface ProductFormState {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  badge: ProductBadge;
  image: string;
  imageMode: 'upload' | 'url';
  availableSizes: SizeOption[];
  prices: Record<SizeOption, number>;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  summaryNotes: string;
  longevityScore: number;
  longevityLabel: string;
  projectionScore: number;
  projectionLabel: string;
  description: string;
  inStock: boolean;
}

function mapCategoryToCollection(category: ProductCategory): CollectionType {
  if (category === 'Arabian') return 'Middle Eastern Lux';
  if (category === 'Designer Decants') return 'Designer Decants';
  if (category === 'Combo Offers') return 'Discovery Sets';
  return 'Signature Blends';
}

function createEmptyFormState(defaultImage: string): ProductFormState {
  return {
    id: '',
    name: '',
    subtitle: 'Perfume Hub Signature',
    category: 'Unisex',
    badge: 'New',
    image: defaultImage,
    imageMode: 'url',
    availableSizes: ['10ml', '30ml', '50ml', '100ml'],
    prices: {
      '10ml': 550,
      '30ml': 1350,
      '50ml': 2100,
      '100ml': 3200,
    },
    topNotes: 'Bergamot, Pink Pepper',
    middleNotes: 'Turkish Rose, Cardamom',
    baseNotes: 'Golden Amber, Sandalwood',
    summaryNotes: 'Bergamot · Amber · Sandalwood',
    longevityScore: 88,
    longevityLabel: '8–12 Hours',
    projectionScore: 82,
    projectionLabel: 'Strong Aura',
    description: '',
    inStock: true,
  };
}

function productToFormState(product: Product): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    category: product.category,
    badge: product.badge,
    image: product.image,
    imageMode: product.image.startsWith('data:') ? 'upload' : 'url',
    availableSizes: [...product.availableSizes],
    prices: { ...product.prices },
    topNotes: product.scentNotes.top.join(', '),
    middleNotes: product.scentNotes.middle.join(', '),
    baseNotes: product.scentNotes.base.join(', '),
    summaryNotes: product.scentNotes.summary,
    longevityScore: product.longevity.score,
    longevityLabel: product.longevity.label,
    projectionScore: product.projection.score,
    projectionLabel: product.projection.label,
    description: product.description,
    inStock: product.inStock,
  };
}

function compressImageToDataUrl(file: File, maxDimension = 760, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image file.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function AdminPanelModal({
  isOpen,
  products,
  defaultImageFallback,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onToggleStock,
  onImportProducts,
  onResetCatalog,
}: AdminPanelModalProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminViewTab>('table');
  const [formState, setFormState] = useState<ProductFormState>(() =>
    createEmptyFormState(defaultImageFallback)
  );
  const [formError, setFormError] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [importText, setImportText] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copiedMode, setCopiedMode] = useState<'json' | 'ts' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const jsonExportString = useMemo(() => JSON.stringify(products, null, 2), [products]);

  const tsExportString = useMemo(
    () =>
      `// Paste into src/App.tsx DEFAULT_PRODUCTS\nexport const EXPORTED_PRODUCTS = ${jsonExportString};`,
    [jsonExportString]
  );

  if (!isOpen) return null;

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Default studio PIN is 1234.');
    }
  };

  const startNewProduct = () => {
    setFormState(createEmptyFormState(defaultImageFallback));
    setFormError('');
    setUploadInfo('');
    setActiveTab('form');
  };

  const startEditProduct = (product: Product) => {
    setFormState(productToFormState(product));
    setFormError('');
    setUploadInfo('');
    setActiveTab('form');
  };

  const toggleSizeAvailability = (size: SizeOption) => {
    setFormState((prev) => {
      const exists = prev.availableSizes.includes(size);
      if (exists && prev.availableSizes.length === 1) {
        setFormError('At least one bottle size must remain enabled.');
        return prev;
      }
      setFormError('');
      const nextSizes = exists
        ? prev.availableSizes.filter((s) => s !== size)
        : BOTTLE_SIZES.filter((s) => s === size || prev.availableSizes.includes(s));
      return { ...prev, availableSizes: nextSizes };
    });
  };

  const handleDeviceImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      const approxKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setFormState((prev) => ({
        ...prev,
        image: compressedDataUrl,
        imageMode: 'upload',
      }));
      setUploadInfo(`Compressed cleanly (${approxKb} KB) for localStorage`);
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to process image.');
    }
  };

  const handleSaveForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      setFormError('Perfume name is required.');
      return;
    }
    if (formState.availableSizes.length === 0) {
      setFormError('Enable at least one ml size option.');
      return;
    }

    const parseNoteList = (raw: string, fallback: string[]) => {
      const list = raw
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
      return list.length > 0 ? list : fallback;
    };

    const top = parseNoteList(formState.topNotes, ['Bergamot']);
    const middle = parseNoteList(formState.middleNotes, ['Rose']);
    const base = parseNoteList(formState.baseNotes, ['Amber']);
    const summary =
      formState.summaryNotes.trim() || [top[0], middle[0], base[0]].filter(Boolean).join(' · ');

    const id =
      formState.id ||
      `${formState.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;

    const product: Product = {
      id,
      name: formState.name.trim(),
      subtitle: formState.subtitle.trim() || 'Perfume Hub Signature',
      category: formState.category,
      collection: mapCategoryToCollection(formState.category),
      concentration: 'Extrait de Parfum · 34% Oil',
      badge: formState.badge,
      image: formState.image.trim() || defaultImageFallback,
      fallbackImage: defaultImageFallback,
      scentNotes: {
        top,
        middle,
        base,
        summary,
      },
      longevity: {
        score: formState.longevityScore,
        label: formState.longevityLabel.trim() || '8–12 Hours',
      },
      projection: {
        score: formState.projectionScore,
        label: formState.projectionLabel.trim() || 'Strong Aura',
      },
      weatherFit: 'Tailored for Bangladesh weather & all-day wear',
      moods: ['Signature', 'Evening', 'Humid Heat'],
      description:
        formState.description.trim() ||
        'Crafted with high-concentration aromatic oils for enduring sillage in warm, humid climates.',
      availableSizes: formState.availableSizes,
      prices: formState.prices,
      inStock: formState.inStock,
    };

    onSaveProduct(product);
    setActiveTab('table');
    setFormState(createEmptyFormState(defaultImageFallback));
    setUploadInfo('');
    setFormError('');
  };

  const handleCopyText = async (text: string, mode: 'json' | 'ts') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMode(mode);
      window.setTimeout(() => setCopiedMode(null), 1800);
    } catch {
      setSyncMessage({ type: 'err', text: 'Clipboard blocked — use Download JSON instead.' });
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonExportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'perfume-hub-bd-catalog.json';
    link.click();
    URL.revokeObjectURL(url);
    setSyncMessage({ type: 'ok', text: 'Downloaded perfume-hub-bd-catalog.json.' });
  };

  const processImportedJson = (raw: string) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setSyncMessage({ type: 'err', text: 'JSON must be a non-empty array of products.' });
        return;
      }
      const validProducts = parsed.filter(
        (item): item is Product =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Product).id === 'string' &&
          typeof (item as Product).name === 'string' &&
          typeof (item as Product).prices === 'object'
      );
      if (validProducts.length === 0) {
        setSyncMessage({ type: 'err', text: 'No valid Perfume Hub BD product records found.' });
        return;
      }
      onImportProducts(validProducts);
      setSyncMessage({
        type: 'ok',
        text: `Imported ${validProducts.length} fragrance records and saved to localStorage.`,
      });
      setImportText('');
    } catch {
      setSyncMessage({ type: 'err', text: 'Invalid JSON syntax. Please check your formatting.' });
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processImportedJson(String(reader.result));
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Perfume Hub BD Admin Panel"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FAF9F6] text-[#1A1A1A] border border-[#C5A059]/40 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Admin Header */}
        <div className="bg-[#121212] text-[#FAF9F6] px-6 py-4 flex items-center justify-between gap-4 border-b border-[#C5A059]/25 shrink-0">
          <div className="flex items-center gap-3">
            {unlocked ? (
              <Unlock className="h-4 w-4 text-[#C5A059]" />
            ) : (
              <Lock className="h-4 w-4 text-[#C5A059]" />
            )}
            <div>
              <span className="block font-serif text-xl font-semibold tracking-wide">
                Perfume Hub BD · Admin Studio
              </span>
              <span className="block text-[11px] text-[#FAF9F6]/60">
                {unlocked
                  ? `${products.length} total fragrances · ${products.filter((p) => p.inStock).length} in stock`
                  : 'Authorized Catalog Access'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unlocked && (
              <button
                type="button"
                onClick={() => {
                  setUnlocked(false);
                  onClose();
                }}
                className="px-3 py-1.5 border border-white/15 text-[11px] uppercase tracking-wider text-[#FAF9F6]/80 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors whitespace-nowrap"
              >
                Lock &amp; Exit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Panel"
              className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#FAF9F6] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!unlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 flex items-center justify-center border border-[#C5A059]/40 bg-[#121212] text-[#C5A059] mb-4">
              <Lock className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
              Atelier Admin Verification
            </h2>
            <p className="mt-1.5 text-sm text-[#666666] max-w-sm">
              Enter your 4-digit studio PIN to manage products, update BDT pricing, upload bottle photography, and export Vercel catalog JSON.
            </p>

            <form onSubmit={handlePinSubmit} className="mt-6 w-full max-w-xs space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter PIN (default: 1234)"
                autoFocus
                className="w-full border border-[#1A1A1A]/20 bg-white px-4 py-3 text-center text-base tracking-[0.35em] tabular-nums focus:border-[#C5A059] focus:outline-none"
              />
              {pinError && <p className="text-xs text-red-700 font-medium">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                Unlock Admin Studio
              </button>
              <p className="text-[11px] text-[#666666]">Default demo PIN: 1234</p>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-6 py-3 bg-[#EFECE6] border-b border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    activeTab === 'table'
                      ? 'bg-[#121212] text-[#C5A059]'
                      : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                  }`}
                >
                  Catalog ({products.length})
                </button>
                <button
                  type="button"
                  onClick={startNewProduct}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    activeTab === 'form'
                      ? 'bg-[#121212] text-[#C5A059]'
                      : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {formState.id ? 'Edit Perfume' : 'Add Perfume'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSyncMessage(null);
                    setActiveTab('sync');
                  }}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    activeTab === 'sync'
                      ? 'bg-[#121212] text-[#C5A059]'
                      : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                  }`}
                >
                  Export / Import JSON
                </button>
              </div>

              {/* Reset to Default Catalog */}
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#1A1A1A] font-medium">Restore defaults?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetCatalog();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-wider"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1.5 border border-[#1A1A1A]/20 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666666] hover:text-[#121212] transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to Default Catalog
                </button>
              )}
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'table' && (
                <div className="overflow-x-auto border border-[#1A1A1A]/10 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF9F6] text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                        <th className="py-3 px-4 font-semibold">Perfume</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold">Base Price</th>
                        <th className="py-3 px-4 font-semibold">Stock</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A]/10 text-sm">
                      {products.map((product) => {
                        const firstSize = product.availableSizes[0] ?? '10ml';
                        const basePrice = product.prices[firstSize] ?? 0;
                        const isDeleting = confirmDeleteId === product.id;

                        return (
                          <tr key={product.id} className="hover:bg-[#FAF9F6]/80">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 bg-[#EFECE6] overflow-hidden border border-[#1A1A1A]/10">
                                  <ResilientImage
                                    src={product.image}
                                    fallbackSrc={product.fallbackImage}
                                    alt={product.name}
                                    title={product.name}
                                    className="h-full w-full object-cover"
                                    containerClassName="h-full w-full"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-serif text-base font-semibold text-[#1A1A1A] truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-[#666666] truncate">
                                    {product.subtitle} · {product.availableSizes.join('/')}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#1A1A1A] whitespace-nowrap">
                              {product.category}
                              {product.badge !== 'None' && (
                                <span className="block text-[11px] text-[#8C6D3B]">
                                  {product.badge}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 tabular-nums font-medium text-[#1A1A1A] whitespace-nowrap">
                              ৳{basePrice.toLocaleString('en-US')}{' '}
                              <span className="text-xs text-[#666666]">({firstSize})</span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onToggleStock(product.id)}
                                className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                                  product.inStock
                                    ? 'border-[#8C6D3B]/40 bg-[#EFECE6] text-[#1A1A1A]'
                                    : 'border-[#1A1A1A]/20 bg-white text-[#666666]'
                                }`}
                              >
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              {isDeleting ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteProduct(product.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2.5 py-1 bg-red-700 text-white text-xs font-medium"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 border border-[#1A1A1A]/20 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditProduct(product)}
                                    aria-label={`Edit ${product.name}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#1A1A1A]/15 text-xs hover:border-[#C5A059] hover:text-[#8C6D3B]"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(product.id)}
                                    aria-label={`Delete ${product.name}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#1A1A1A]/15 text-xs text-[#666666] hover:border-red-700 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'form' && (
                <form onSubmit={handleSaveForm} className="space-y-6">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Core Identity & Image */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <label
                          htmlFor="admin-name"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          Perfume Name *
                        </label>
                        <input
                          id="admin-name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) =>
                            setFormState((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="e.g., Imperial Oud Reserve"
                          className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="admin-subtitle"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          Brand / Subtitle
                        </label>
                        <input
                          id="admin-subtitle"
                          type="text"
                          value={formState.subtitle}
                          onChange={(e) =>
                            setFormState((p) => ({ ...p, subtitle: e.target.value }))
                          }
                          placeholder="Perfume Hub Signature or Designer Decant"
                          className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="admin-category"
                            className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                          >
                            Category
                          </label>
                          <select
                            id="admin-category"
                            value={formState.category}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                category: e.target.value as ProductCategory,
                              }))
                            }
                            className="w-full border border-[#1A1A1A]/20 bg-white px-3 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                          >
                            {PRODUCT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="admin-badge"
                            className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                          >
                            Badge
                          </label>
                          <select
                            id="admin-badge"
                            value={formState.badge}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                badge: e.target.value as ProductBadge,
                              }))
                            }
                            className="w-full border border-[#1A1A1A]/20 bg-white px-3 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                          >
                            {PRODUCT_BADGES.map((badge) => (
                              <option key={badge} value={badge}>
                                {badge}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dual Image Upload System */}
                      <div className="border border-[#1A1A1A]/15 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                            Bottle Image
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((p) => ({ ...p, imageMode: 'upload' }))
                              }
                              className={`px-2.5 py-1 text-[11px] font-medium border ${
                                formState.imageMode === 'upload'
                                  ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                                  : 'border-[#1A1A1A]/15 text-[#666666]'
                              }`}
                            >
                              Upload Device
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormState((p) => ({ ...p, imageMode: 'url' }))}
                              className={`px-2.5 py-1 text-[11px] font-medium border ${
                                formState.imageMode === 'url'
                                  ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                                  : 'border-[#1A1A1A]/15 text-[#666666]'
                              }`}
                            >
                              Image URL
                            </button>
                          </div>
                        </div>

                        {formState.imageMode === 'upload' ? (
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleDeviceImageUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-3 border border-dashed border-[#8C6D3B]/60 bg-[#FAF9F6] text-xs font-medium text-[#1A1A1A] hover:border-[#C5A059] flex items-center justify-center gap-2"
                            >
                              <ImagePlus className="h-4 w-4 text-[#8C6D3B]" />
                              Choose Image (Auto-Compressed via Canvas)
                            </button>
                            {uploadInfo && (
                              <p className="mt-1.5 text-[11px] text-[#8C6D3B]">{uploadInfo}</p>
                            )}
                          </div>
                        ) : (
                          <input
                            type="url"
                            value={formState.image.startsWith('data:') ? '' : formState.image}
                            onChange={(e) =>
                              setFormState((p) => ({ ...p, image: e.target.value }))
                            }
                            placeholder="https://... (paste direct image URL)"
                            className="w-full border border-[#1A1A1A]/20 px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                          />
                        )}

                        <div className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden border border-[#1A1A1A]/10">
                          <ResilientImage
                            src={formState.image}
                            fallbackSrc={defaultImageFallback}
                            alt="Perfume bottle preview"
                            title={formState.name || 'Preview'}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        </div>
                      </div>

                      {/* Stock Toggle */}
                      <div className="flex items-center justify-between border border-[#1A1A1A]/15 bg-white px-4 py-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                          Inventory Status
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((p) => ({ ...p, inStock: !p.inStock }))
                          }
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            formState.inStock
                              ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                              : 'bg-[#EFECE6] text-[#666666] border-[#1A1A1A]/20'
                          }`}
                        >
                          {formState.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Pricing, Scent Notes & Sliders */}
                    <div className="lg:col-span-7 space-y-5">
                      {/* Multi-Size Pricing Matrix */}
                      <div className="border border-[#1A1A1A]/15 bg-white p-4">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                          Available Bottle Sizes &amp; BDT Pricing (৳)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {BOTTLE_SIZES.map((size) => {
                            const enabled = formState.availableSizes.includes(size);
                            return (
                              <div
                                key={size}
                                className={`p-3 border transition-colors ${
                                  enabled
                                    ? 'border-[#C5A059] bg-[#FAF9F6]'
                                    : 'border-[#1A1A1A]/10 bg-[#EFECE6]/50 opacity-65'
                                }`}
                              >
                                <label className="flex items-center justify-between text-xs font-semibold cursor-pointer mb-2">
                                  <span>{size}</span>
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={() => toggleSizeAvailability(size)}
                                    className="accent-[#121212]"
                                  />
                                </label>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#666666]">
                                    ৳
                                  </span>
                                  <input
                                    type="number"
                                    min={50}
                                    disabled={!enabled}
                                    value={formState.prices[size]}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value) || 0);
                                      setFormState((p) => ({
                                        ...p,
                                        prices: { ...p.prices, [size]: val },
                                      }));
                                    }}
                                    className="w-full border border-[#1A1A1A]/20 bg-white pl-6 pr-2 py-1.5 text-xs tabular-nums focus:border-[#C5A059] focus:outline-none disabled:bg-[#EFECE6]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scent Notes */}
                      <div className="border border-[#1A1A1A]/15 bg-white p-4 space-y-3">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                          Scent Notes &amp; Card Summary
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#666666] mb-1">
                              Top Notes
                            </label>
                            <input
                              type="text"
                              value={formState.topNotes}
                              onChange={(e) =>
                                setFormState((p) => ({ ...p, topNotes: e.target.value }))
                              }
                              placeholder="Bergamot, Cardamom"
                              className="w-full border border-[#1A1A1A]/20 px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#666666] mb-1">
                              Middle Notes
                            </label>
                            <input
                              type="text"
                              value={formState.middleNotes}
                              onChange={(e) =>
                                setFormState((p) => ({ ...p, middleNotes: e.target.value }))
                              }
                              placeholder="Damask Rose, Saffron"
                              className="w-full border border-[#1A1A1A]/20 px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#666666] mb-1">
                              Base Notes
                            </label>
                            <input
                              type="text"
                              value={formState.baseNotes}
                              onChange={(e) =>
                                setFormState((p) => ({ ...p, baseNotes: e.target.value }))
                              }
                              placeholder="Oud, Amber, Musk"
                              className="w-full border border-[#1A1A1A]/20 px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#666666] mb-1">
                            Card Summary Tags
                          </label>
                          <input
                            type="text"
                            value={formState.summaryNotes}
                            onChange={(e) =>
                              setFormState((p) => ({ ...p, summaryNotes: e.target.value }))
                            }
                            placeholder="Bergamot · Amber · Oud"
                            className="w-full border border-[#1A1A1A]/20 px-3 py-2 text-xs focus:border-[#C5A059] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Performance Sliders */}
                      <div className="border border-[#1A1A1A]/15 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-[#1A1A1A]">Longevity</span>
                            <span className="tabular-nums text-[#8C6D3B] font-medium">
                              {formState.longevityScore}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={100}
                            value={formState.longevityScore}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                longevityScore: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-[#C5A059]"
                          />
                          <input
                            type="text"
                            value={formState.longevityLabel}
                            onChange={(e) =>
                              setFormState((p) => ({ ...p, longevityLabel: e.target.value }))
                            }
                            placeholder="e.g., 8–12 Hours"
                            className="mt-2 w-full border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:border-[#C5A059] focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-[#1A1A1A]">Projection</span>
                            <span className="tabular-nums text-[#8C6D3B] font-medium">
                              {formState.projectionScore}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={100}
                            value={formState.projectionScore}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                projectionScore: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-[#121212]"
                          />
                          <input
                            type="text"
                            value={formState.projectionLabel}
                            onChange={(e) =>
                              setFormState((p) => ({ ...p, projectionLabel: e.target.value }))
                            }
                            placeholder="e.g., Strong Arm-Length"
                            className="mt-2 w-full border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:border-[#C5A059] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="admin-desc"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          Product Description
                        </label>
                        <textarea
                          id="admin-desc"
                          rows={3}
                          value={formState.description}
                          onChange={(e) =>
                            setFormState((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Describe the scent character, dry-down, and ideal wear in Dhaka's climate..."
                          className="w-full border border-[#1A1A1A]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('table')}
                          className="px-5 py-2.5 border border-[#1A1A1A]/20 text-xs font-semibold uppercase tracking-wider hover:border-[#121212]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                        >
                          {formState.id ? 'Save Perfume Changes' : 'Publish Perfume to Store'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'sync' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Export Panel */}
                  <div className="border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                        Vercel Static Sync
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-semibold">
                        Export Products JSON / Code
                      </h3>
                      <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                        Changes made here persist immediately in your browser&apos;s localStorage. Export JSON or copy the TypeScript array to update your permanent Vercel repository default catalog.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(jsonExportString, 'json')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                      >
                        {copiedMode === 'json' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedMode === 'json' ? 'Copied JSON' : 'Copy JSON'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(tsExportString, 'ts')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#121212] text-xs font-semibold uppercase tracking-wider hover:bg-[#121212] hover:text-[#FAF9F6] transition-colors"
                      >
                        {copiedMode === 'ts' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedMode === 'ts' ? 'Copied TS Code' : 'Copy Code'}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#1A1A1A]/20 text-xs font-semibold uppercase tracking-wider hover:border-[#C5A059]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download .json
                      </button>
                    </div>

                    <pre className="max-h-64 overflow-auto bg-[#121212] text-[#FAF9F6]/85 p-3.5 text-[11px] font-mono leading-relaxed">
                      {jsonExportString}
                    </pre>
                  </div>

                  {/* Import Panel */}
                  <div className="border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                        Restore or Migrate
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-semibold">Import JSON</h3>
                      <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                        Paste a previously exported Perfume Hub BD JSON catalog array or upload a `.json` file to replace the active catalog.
                      </p>
                    </div>

                    {syncMessage && (
                      <div
                        className={`p-3 text-xs font-medium border ${
                          syncMessage.type === 'ok'
                            ? 'bg-[#EFECE6] border-[#C5A059] text-[#1A1A1A]'
                            : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        {syncMessage.text}
                      </div>
                    )}

                    <textarea
                      rows={8}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder='Paste exported JSON array here: [ { "id": "...", "name": "...", ... } ]'
                      className="w-full border border-[#1A1A1A]/20 p-3 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={!importText.trim()}
                        onClick={() => processImportedJson(importText)}
                        className="px-5 py-2.5 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#121212] disabled:opacity-45 transition-colors"
                      >
                        Import Pasted JSON
                      </button>

                      <input
                        ref={jsonFileInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => jsonFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#1A1A1A]/20 text-xs font-semibold uppercase tracking-wider hover:border-[#C5A059]"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload .json File
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
