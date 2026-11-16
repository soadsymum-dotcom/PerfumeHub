export type SizeOption = '10ml' | '30ml' | '50ml' | '100ml';

export type ProductCategory =
  | 'Men'
  | 'Women'
  | 'Unisex'
  | 'Arabian'
  | 'Designer Decants'
  | 'Combo Offers';

export type FilterCategory = 'All' | 'Men' | 'Women' | 'Unisex' | 'Arabian';

export type CollectionType =
  | 'Designer Decants'
  | 'Middle Eastern Lux'
  | 'Signature Blends'
  | 'Discovery Sets';

export type ProductBadge =
  | 'None'
  | 'Bestseller'
  | 'New'
  | 'Long Lasting'
  | 'Limited Edition';

export interface ScentNotes {
  top: string[];
  middle: string[];
  base: string[];
  summary: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  collection: CollectionType;
  concentration: string;
  badge: ProductBadge;
  image: string;
  fallbackImage?: string;
  scentNotes: ScentNotes;
  longevity: {
    score: number;
    label: string;
  };
  projection: {
    score: number;
    label: string;
  };
  weatherFit: string;
  moods: ('Evening' | 'Office' | 'Signature' | 'Humid Heat' | 'Festive')[];
  description: string;
  availableSizes: SizeOption[];
  prices: Record<SizeOption, number>;
  inStock: boolean;
}

export interface CartItem {
  key: string;
  product: Product;
  size: SizeOption;
  unitPrice: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered';
export type DeliveryArea = 'inside-dhaka' | 'outside-dhaka';
export type PaymentMethod = 'Cash on Delivery' | 'bKash' | 'Nagad';

export interface OrderItemSummary {
  productId: string;
  name: string;
  size: SizeOption;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  deliveryArea: DeliveryArea;
  deliveryFee: number;
  address: string;
  paymentMethod: PaymentMethod;
  items: OrderItemSummary[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  isRead: boolean;
}

export interface PhoneAlertConfig {
  tgBotToken: string;
  tgChatId: string;
  ntfyTopic: string;
}

export interface CategoryShowcaseItem {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  targetFilter: FilterCategory;
  targetCollection?: CollectionType;
}

export const BOTTLE_SIZES: SizeOption[] = ['10ml', '30ml', '50ml', '100ml'];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Men',
  'Women',
  'Unisex',
  'Arabian',
  'Designer Decants',
  'Combo Offers',
];

export const PRODUCT_BADGES: ProductBadge[] = [
  'None',
  'Bestseller',
  'New',
  'Long Lasting',
  'Limited Edition',
];

export const USP_PILLARS: { index: string; title: string; detail: string }[] = [
  {
    index: '01',
    title: 'High Oil Concentration (Extrait de Parfum)',
    detail:
      'Formulated at 28%–40% pure aromatic oil concentration for deep, rounded dry-downs without harsh alcohol sting.',
  },
  {
    index: '02',
    title: '8–12 Hours Projection in Humid Weather',
    detail:
      'Each blend is tested across Dhaka’s warmth and monsoon humidity so heart and base notes stay anchored all day.',
  },
  {
    index: '03',
    title: 'Precision Decanting & Premium Glass Atomizers',
    detail:
      'Drawn hygienically via sterile graduated syringes from sealed original bottles into thick UV-shielded glass atomizers.',
  },
  {
    index: '04',
    title: 'Fast Delivery Inside & Outside Dhaka',
    detail:
      '24–48 hour express dispatch inside Dhaka (৳70) and 48–72 hour nationwide Cash on Delivery across all 64 districts.',
  },
];
