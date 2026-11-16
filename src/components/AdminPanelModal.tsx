import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  Phone,
  Plus,
  RotateCcw,
  Send,
  Smartphone,
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
  type OrderRecord,
  type OrderStatus,
  type PhoneAlertConfig,
  type Product,
  type ProductBadge,
  type ProductCategory,
  type SizeOption,
} from '../data/perfumes';
import {
  dispatchPhoneNotification,
  playNotificationChime,
} from '../utils/notifications';
import { ResilientImage } from './ResilientImage';

interface AdminPanelModalProps {
  isOpen: boolean;
  products: Product[];
  orders: OrderRecord[];
  alertConfig: PhoneAlertConfig;
  defaultImageFallback: string;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStock: (id: string) => void;
  onImportProducts: (products: Product[]) => void;
  onResetCatalog: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onMarkAllOrdersRead: () => void;
  onSaveAlertConfig: (config: PhoneAlertConfig) => void;
}

const ADMIN_PASSWORD = 'Soadhero6969';

type AdminMainTab = 'perfumes' | 'orders' | 'phone';
type PerfumeSubTab = 'table' | 'form' | 'sync';

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
  orders,
  alertConfig,
  defaultImageFallback,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onToggleStock,
  onImportProducts,
  onResetCatalog,
  onUpdateOrderStatus,
  onDeleteOrder,
  onMarkAllOrdersRead,
  onSaveAlertConfig,
}: AdminPanelModalProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [mainTab, setMainTab] = useState<AdminMainTab>('perfumes');
  const [perfumeSubTab, setPerfumeSubTab] = useState<PerfumeSubTab>('table');
  const [formState, setFormState] = useState<ProductFormState>(() =>
    createEmptyFormState(defaultImageFallback)
  );
  const [formError, setFormError] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [importText, setImportText] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copiedMode, setCopiedMode] = useState<'json' | 'ts' | 'config' | null>(null);

  const [draftAlertConfig, setDraftAlertConfig] = useState<PhoneAlertConfig>(alertConfig);
  const [alertStatusMsg, setAlertStatusMsg] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const prevOrderCountRef = useRef(orders.length);

  useEffect(() => {
    setDraftAlertConfig(alertConfig);
  }, [alertConfig]);

  // Play subtle chime if Admin Panel is open & unlocked when a new order arrives
  useEffect(() => {
    if (isOpen && unlocked && orders.length > prevOrderCountRef.current) {
      playNotificationChime();
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length, isOpen, unlocked]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const unreadOrdersCount = useMemo(
    () => orders.filter((o) => !o.isRead).length,
    [orders]
  );

  const jsonExportString = useMemo(() => JSON.stringify(products, null, 2), [products]);

  const tsExportString = useMemo(
    () =>
      `// Paste into src/App.tsx DEFAULT_PRODUCTS\nexport const EXPORTED_PRODUCTS = ${jsonExportString};`,
    [jsonExportString]
  );

  const configCodeSnippet = useMemo(() => {
    const safeToken = draftAlertConfig.tgBotToken.replace(/'/g, "\\'");
    const safeChatId = draftAlertConfig.tgChatId.replace(/'/g, "\\'");
    const safeTopic = draftAlertConfig.ntfyTopic.replace(/'/g, "\\'");
    return [
      `const DEFAULT_TG_BOT_TOKEN = '${safeToken}';`,
      `const DEFAULT_TG_CHAT_ID = '${safeChatId}';`,
      `const DEFAULT_NTFY_TOPIC = '${safeTopic}';`,
    ].join('\n');
  }, [draftAlertConfig]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
      setShowPassword(false);
    } else {
      setPasswordError('Invalid Admin Password. Please verify case-sensitive credentials.');
    }
  };

  const startNewProduct = () => {
    setFormState(createEmptyFormState(defaultImageFallback));
    setFormError('');
    setUploadInfo('');
    setMainTab('perfumes');
    setPerfumeSubTab('form');
  };

  const startEditProduct = (product: Product) => {
    setFormState(productToFormState(product));
    setFormError('');
    setUploadInfo('');
    setMainTab('perfumes');
    setPerfumeSubTab('form');
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
    setPerfumeSubTab('table');
    setFormState(createEmptyFormState(defaultImageFallback));
    setUploadInfo('');
    setFormError('');
  };

  const handleCopyText = async (text: string, mode: 'json' | 'ts' | 'config') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMode(mode);
      window.setTimeout(() => setCopiedMode(null), 1800);
    } catch {
      if (mode === 'config') {
        setAlertStatusMsg({
          type: 'err',
          text: 'Clipboard blocked — select and copy the config snippet below manually.',
        });
      } else {
        setSyncMessage({ type: 'err', text: 'Clipboard blocked — use Download JSON instead.' });
      }
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

  const handleSaveAlertSettings = (e: FormEvent) => {
    e.preventDefault();
    onSaveAlertConfig({
      tgBotToken: draftAlertConfig.tgBotToken.trim(),
      tgChatId: draftAlertConfig.tgChatId.trim(),
      ntfyTopic: draftAlertConfig.ntfyTopic.trim(),
    });
    setAlertStatusMsg({
      type: 'ok',
      text: 'Phone alert settings saved to browser storage.',
    });
  };

  const handleSendTestNotification = async () => {
    const hasTelegram =
      Boolean(draftAlertConfig.tgBotToken.trim()) && Boolean(draftAlertConfig.tgChatId.trim());
    const hasNtfy = Boolean(draftAlertConfig.ntfyTopic.trim());

    if (!hasTelegram && !hasNtfy) {
      setAlertStatusMsg({
        type: 'err',
        text: 'Enter either Telegram Bot Token + Chat ID or an ntfy Topic Name first.',
      });
      return;
    }

    onSaveAlertConfig({
      tgBotToken: draftAlertConfig.tgBotToken.trim(),
      tgChatId: draftAlertConfig.tgChatId.trim(),
      ntfyTopic: draftAlertConfig.ntfyTopic.trim(),
    });

    setSendingTest(true);
    setAlertStatusMsg(null);

    const sampleOrder: OrderRecord = {
      id: `test-${Date.now()}`,
      orderNumber: '#PHB-TEST',
      createdAt: new Date().toISOString(),
      customerName: 'Test Customer (Dhaka)',
      phone: '01700000000',
      deliveryArea: 'inside-dhaka',
      deliveryFee: 70,
      address: 'House 14, Road 11, Banani, Dhaka',
      paymentMethod: 'Cash on Delivery',
      items: [
        {
          productId: 'test',
          name: "Nuit de L'Ambre Oud",
          size: '30ml',
          quantity: 1,
          unitPrice: 1550,
        },
      ],
      subtotal: 1550,
      total: 1620,
      status: 'Pending',
      isRead: true,
    };

    const res = await dispatchPhoneNotification(sampleOrder, draftAlertConfig);
    setSendingTest(false);
    playNotificationChime();

    const channels: string[] = [];
    if (res.telegramSent) channels.push('Telegram');
    if (res.ntfySent) channels.push('ntfy.sh');

    if (channels.length > 0 && res.errors.length === 0) {
      setAlertStatusMsg({
        type: 'ok',
        text: `Test notification delivered via ${channels.join(' & ')}! Check your phone.`,
      });
    } else if (channels.length > 0) {
      setAlertStatusMsg({
        type: 'ok',
        text: `Delivered via ${channels.join(' & ')}. Partial warnings: ${res.errors.join(', ')}`,
      });
    } else {
      setAlertStatusMsg({
        type: 'err',
        text: `Delivery failed: ${res.errors.join(' · ') || 'Verify token/chat ID or topic name.'}`,
      });
    }
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
                  ? `${products.length} perfumes · ${orders.length} total orders (${unreadOrdersCount} unread)`
                  : 'Authorized Catalog & Order Console'}
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
              Admin Studio Login
            </h2>
            <p className="mt-1.5 text-sm text-[#666666] max-w-sm">
              Enter your Admin Password to manage fragrances, review incoming customer orders, and configure instant phone alerts.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-6 w-full max-w-xs space-y-3 text-left">
              <div>
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                >
                  Enter Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter Admin Password"
                    autoFocus
                    className="w-full border border-[#1A1A1A]/20 bg-white pl-3.5 pr-11 py-3 text-sm focus:border-[#C5A059] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#666666] hover:text-[#121212]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="text-xs text-red-700 font-medium">{passwordError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
              >
                Unlock Admin Studio
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Primary Admin Navigation Tab Bar */}
            <div className="px-6 py-3 bg-[#191919] text-[#FAF9F6] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMainTab('perfumes')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    mainTab === 'perfumes'
                      ? 'bg-[#C5A059] text-[#121212]'
                      : 'bg-white/5 text-[#FAF9F6]/80 hover:bg-white/10'
                  }`}
                >
                  Manage Perfumes
                </button>

                <button
                  type="button"
                  onClick={() => setMainTab('orders')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                    mainTab === 'orders'
                      ? 'bg-[#C5A059] text-[#121212]'
                      : 'bg-white/5 text-[#FAF9F6]/80 hover:bg-white/10'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Notifications &amp; Orders</span>
                  {unreadOrdersCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold tabular-nums">
                      {unreadOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAlertStatusMsg(null);
                    setMainTab('phone');
                  }}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    mainTab === 'phone'
                      ? 'bg-[#C5A059] text-[#121212]'
                      : 'bg-white/5 text-[#FAF9F6]/80 hover:bg-white/10'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Phone Alert Setup</span>
                </button>
              </div>
            </div>

            {/* Sub-bar when Manage Perfumes is active */}
            {mainTab === 'perfumes' && (
              <div className="px-6 py-2.5 bg-[#EFECE6] border-b border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPerfumeSubTab('table')}
                    className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      perfumeSubTab === 'table'
                        ? 'bg-[#121212] text-[#C5A059]'
                        : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Catalog ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={startNewProduct}
                    className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                      perfumeSubTab === 'form'
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
                      setPerfumeSubTab('sync');
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      perfumeSubTab === 'sync'
                        ? 'bg-[#121212] text-[#C5A059]'
                        : 'text-[#1A1A1A]/75 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Export / Import JSON
                  </button>
                </div>

                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#1A1A1A] font-medium">Restore defaults?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetCatalog();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-wider"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2.5 py-1 border border-[#1A1A1A]/20 text-xs"
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
            )}

            {/* Main Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: MANAGE PERFUMES */}
              {mainTab === 'perfumes' && perfumeSubTab === 'table' && (
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

              {mainTab === 'perfumes' && perfumeSubTab === 'form' && (
                <form onSubmit={handleSaveForm} className="space-y-6">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                    <div className="lg:col-span-7 space-y-5">
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
                          onClick={() => setPerfumeSubTab('table')}
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

              {mainTab === 'perfumes' && perfumeSubTab === 'sync' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                        Vercel Static Sync
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-semibold">
                        Export Products JSON / Code
                      </h3>
                      <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                        Changes made here persist immediately in localStorage. Export JSON or copy the TypeScript array to update your permanent Vercel repository default catalog.
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

              {/* TAB 2: NOTIFICATIONS & ORDERS */}
              {mainTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                        Incoming Orders &amp; Alerts
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Live customer orders placed via Checkout, ordered newest first.
                      </p>
                    </div>

                    {orders.length > 0 && unreadOrdersCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllOrdersRead}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#121212] text-[#C5A059] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark All as Read
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="border border-[#1A1A1A]/10 bg-white p-12 text-center">
                      <Bell className="h-9 w-9 text-[#8C6D3B]/60 mx-auto mb-3" strokeWidth={1.3} />
                      <h4 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                        No customer orders yet
                      </h4>
                      <p className="mt-1 text-sm text-[#666666]">
                        When a customer confirms an order in the Checkout Modal, it will appear here with instant alert details.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const formattedTime = new Date(order.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        });
                        const isConfirmingDelete = confirmDeleteOrderId === order.id;

                        return (
                          <div
                            key={order.id}
                            className={`border bg-white p-5 transition-colors ${
                              !order.isRead
                                ? 'border-[#C5A059] shadow-[0_6px_20px_-12px_rgba(197,160,89,0.45)]'
                                : 'border-[#1A1A1A]/12'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[#1A1A1A]/10">
                              <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="font-serif text-xl font-semibold text-[#1A1A1A] tabular-nums">
                                    {order.orderNumber}
                                  </span>
                                  {!order.isRead && (
                                    <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                      New
                                    </span>
                                  )}
                                  <span className="text-xs text-[#666666] tabular-nums">
                                    {formattedTime}
                                  </span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#1A1A1A]">
                                  <span className="font-semibold">{order.customerName}</span>
                                  <a
                                    href={`tel:${order.phone}`}
                                    className="inline-flex items-center gap-1 text-[#8C6D3B] hover:underline font-medium tabular-nums"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {order.phone}
                                  </a>
                                  <span className="text-[#666666]">
                                    {order.paymentMethod}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="block text-lg font-semibold text-[#1A1A1A] tabular-nums">
                                  ৳{order.total.toLocaleString('en-US')}
                                </span>
                                <span className="text-[11px] text-[#666666]">
                                  {order.deliveryArea === 'inside-dhaka'
                                    ? 'Inside Dhaka'
                                    : 'Outside Dhaka'}{' '}
                                  ({order.deliveryFee === 0 ? 'Free' : `৳${order.deliveryFee}`})
                                </span>
                              </div>
                            </div>

                            <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                              <div className="md:col-span-5">
                                <span className="block text-[10px] uppercase tracking-[0.14em] text-[#8C6D3B] font-semibold mb-1">
                                  Delivery Address
                                </span>
                                <p className="text-[#1A1A1A] leading-relaxed">{order.address}</p>
                              </div>

                              <div className="md:col-span-7">
                                <span className="block text-[10px] uppercase tracking-[0.14em] text-[#8C6D3B] font-semibold mb-1">
                                  Ordered Perfumes
                                </span>
                                <ul className="space-y-1">
                                  {order.items.map((item) => (
                                    <li
                                      key={`${item.productId}-${item.size}`}
                                      className="flex justify-between text-[#1A1A1A]"
                                    >
                                      <span>
                                        {item.name} ({item.size}) × {item.quantity}
                                      </span>
                                      <span className="tabular-nums font-medium">
                                        ৳{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="pt-3 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] uppercase tracking-wider text-[#666666] mr-1">
                                  Status:
                                </span>
                                {(['Pending', 'Confirmed', 'Delivered'] as OrderStatus[]).map(
                                  (statusOption) => {
                                    const active = order.status === statusOption;
                                    return (
                                      <button
                                        key={statusOption}
                                        type="button"
                                        onClick={() => onUpdateOrderStatus(order.id, statusOption)}
                                        className={`px-3 py-1 text-xs font-medium border transition-colors ${
                                          active
                                            ? 'bg-[#121212] text-[#C5A059] border-[#121212]'
                                            : 'bg-[#FAF9F6] text-[#1A1A1A]/75 border-[#1A1A1A]/15 hover:border-[#8C6D3B]'
                                        }`}
                                      >
                                        {statusOption}
                                      </button>
                                    );
                                  }
                                )}
                              </div>

                              {isConfirmingDelete ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteOrder(order.id);
                                      setConfirmDeleteOrderId(null);
                                    }}
                                    className="px-3 py-1 bg-red-700 text-white text-xs font-medium"
                                  >
                                    Confirm Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOrderId(null)}
                                    className="px-2.5 py-1 border border-[#1A1A1A]/20 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteOrderId(order.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#1A1A1A]/15 text-xs text-[#666666] hover:border-red-700 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PHONE ALERT SETUP */}
              {mainTab === 'phone' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                      Instant Phone Push Notifications
                    </h3>
                    <p className="mt-1 text-xs text-[#666666] max-w-2xl leading-relaxed">
                      Receive instant mobile push alerts on iPhone or Android whenever a customer places an order on your live Vercel storefront. Use Telegram, ntfy.sh, or both simultaneously.
                    </p>
                  </div>

                  {alertStatusMsg && (
                    <div
                      className={`p-3.5 text-xs font-medium border ${
                        alertStatusMsg.type === 'ok'
                          ? 'bg-[#EFECE6] border-[#C5A059] text-[#1A1A1A]'
                          : 'bg-red-50 border-red-300 text-red-800'
                      }`}
                    >
                      {alertStatusMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveAlertSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Telegram Integration */}
                    <div className="border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                          Option 1 · Telegram Bot API
                        </span>
                        <h4 className="mt-1 font-serif text-xl font-semibold">
                          Telegram Instant Alert
                        </h4>
                        <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                          Create a bot with <strong>@BotFather</strong> for your Bot Token, message your bot once, and get your Chat ID from <strong>@userinfobot</strong>.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="tg-token"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          Telegram Bot Token
                        </label>
                        <input
                          id="tg-token"
                          type="text"
                          value={draftAlertConfig.tgBotToken}
                          onChange={(e) =>
                            setDraftAlertConfig((p) => ({ ...p, tgBotToken: e.target.value }))
                          }
                          placeholder="e.g., 7123456789:AAH..."
                          className="w-full border border-[#1A1A1A]/20 px-3.5 py-2.5 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tg-chat-id"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          Telegram Chat ID
                        </label>
                        <input
                          id="tg-chat-id"
                          type="text"
                          value={draftAlertConfig.tgChatId}
                          onChange={(e) =>
                            setDraftAlertConfig((p) => ({ ...p, tgChatId: e.target.value }))
                          }
                          placeholder="e.g., 123456789"
                          className="w-full border border-[#1A1A1A]/20 px-3.5 py-2.5 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* ntfy.sh Integration */}
                    <div className="border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C6D3B] font-semibold">
                          Option 2 · Zero-Setup Push
                        </span>
                        <h4 className="mt-1 font-serif text-xl font-semibold">
                          ntfy.sh Webhook Alert
                        </h4>
                        <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                          Install the free <strong>ntfy</strong> app on iOS/Android and subscribe to your private topic name below. Every order fires a high-priority POST to{' '}
                          <code className="text-[#1A1A1A]">https://ntfy.sh/&lt;topic&gt;</code>.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="ntfy-topic"
                          className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
                        >
                          ntfy Topic Name
                        </label>
                        <input
                          id="ntfy-topic"
                          type="text"
                          value={draftAlertConfig.ntfyTopic}
                          onChange={(e) =>
                            setDraftAlertConfig((p) => ({ ...p, ntfyTopic: e.target.value }))
                          }
                          placeholder="e.g., perfumehub-soad-orders"
                          className="w-full border border-[#1A1A1A]/20 px-3.5 py-2.5 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-3 text-[11px] text-[#666666]">
                        Webhook endpoint:{' '}
                        <span className="font-mono text-[#1A1A1A] break-all">
                          https://ntfy.sh/{draftAlertConfig.ntfyTopic.trim() || 'your-topic'}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls + Hardcode Snippet */}
                    <div className="lg:col-span-2 border border-[#1A1A1A]/15 bg-white p-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#121212] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                        >
                          Save Phone Settings
                        </button>

                        <button
                          type="button"
                          disabled={sendingTest}
                          onClick={handleSendTestNotification}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-[#121212] text-xs font-semibold uppercase tracking-wider hover:bg-[#121212] hover:text-[#FAF9F6] disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {sendingTest
                            ? 'Sending Test Alert...'
                            : 'Send Test Notification to My Phone'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(configCodeSnippet, 'config')}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#121212] text-xs font-semibold uppercase tracking-wider hover:bg-[#121212] hover:text-[#FAF9F6] transition-colors"
                        >
                          {copiedMode === 'config' ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedMode === 'config' ? 'Copied Config Code' : 'Copy Config Code'}
                        </button>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-[#666666] mb-1.5">
                          Vercel Production Constants (paste into top of src/App.tsx for all public visitors)
                        </span>
                        <pre className="bg-[#121212] text-[#C5A059] p-3.5 text-xs font-mono overflow-x-auto leading-relaxed">
                          {configCodeSnippet}
                        </pre>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
