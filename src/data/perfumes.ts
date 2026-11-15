import heroPerfumeImg from '../assets/images/hero_perfume_hub_1794745148328.jpg';
import nocturneOudImg from '../assets/images/perfume_nocturne_oud_1794745148461.jpg';
import bergamotNoirImg from '../assets/images/perfume_bergamot_noir_1794745148662.jpg';
import velvetRoseImg from '../assets/images/perfume_velvet_rose_1794745148820.jpg';
import saffronElixirImg from '../assets/images/perfume_saffron_elixir_1794745149182.jpg';
import coastalVetiverImg from '../assets/images/perfume_coastal_vetiver_1794745149402.jpg';
import vanillaAmberImg from '../assets/images/perfume_vanilla_amber_1794745149964.jpg';
import whiteMuskImg from '../assets/images/perfume_white_musk_1794745150289.jpg';
import discoveryDecantsImg from '../assets/images/perfume_discovery_decants_1794745150558.jpg';

export type BottleSize = '10ml' | '30ml' | '50ml' | '100ml';
export type FilterCategory = 'All' | 'Men' | 'Women' | 'Unisex' | 'Arabian';
export type CollectionType = 'Designer Decants' | 'Middle Eastern Lux' | 'Signature Blends' | 'Discovery Sets';

export interface PerfumeProduct {
  id: string;
  name: string;
  subtitle: string;
  category: Exclude<FilterCategory, 'All'>;
  collection: CollectionType;
  concentration: string;
  badge: 'Bestseller' | 'Long Lasting' | 'New' | 'Signature';
  image: string;
  notesLine: string;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
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
  prices: Record<BottleSize, number>;
}

export const HERO_IMAGE = heroPerfumeImg;

export const BOTTLE_SIZES: BottleSize[] = ['10ml', '30ml', '50ml', '100ml'];

export const PERFUMES: PerfumeProduct[] = [
  {
    id: 'nuit-de-lambre-oud',
    name: "Nuit de L'Ambre Oud",
    subtitle: 'Smoked Amber & Cambodian Oud',
    category: 'Men',
    collection: 'Signature Blends',
    concentration: 'Extrait de Parfum · 36% Oil',
    badge: 'Bestseller',
    image: nocturneOudImg,
    notesLine: 'Bergamot · Amber · Oud',
    notes: {
      top: ['Calabrian Bergamot', 'Black Pepper', 'Cardamom'],
      middle: ['Smoked Labdanum', 'Turkish Rose', 'Incense'],
      base: ['Cambodian Oud', 'Golden Amber', 'Atlas Cedar'],
    },
    longevity: {
      score: 94,
      label: '11–12 Hours',
    },
    projection: {
      score: 88,
      label: 'Strong Arm-Length',
    },
    weatherFit: 'Evening events, weddings & AC offices',
    moods: ['Evening', 'Festive', 'Signature'],
    description:
      'A commanding dark-amber composition balanced with crisp bergamot lift so it never turns cloying in Dhaka’s warm evenings.',
    prices: {
      '10ml': 650,
      '30ml': 1550,
      '50ml': 2350,
      '100ml': 3500,
    },
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
    notesLine: 'Grapefruit · Ambroxan · Vetiver',
    notes: {
      top: ['Blood Grapefruit', 'Sicilian Lemon', 'Pink Pepper'],
      middle: ['Haitian Vetiver', 'Geranium Leaf', 'Elemi'],
      base: ['Ambroxan', 'White Cedar', 'Mineral Musk'],
    },
    longevity: {
      score: 86,
      label: '8–10 Hours',
    },
    projection: {
      score: 84,
      label: 'Radiant Trail',
    },
    weatherFit: 'All-day Dhaka commute & humid afternoons',
    moods: ['Office', 'Humid Heat', 'Signature'],
    description:
      'Razor-sharp citrus and clean ambroxan engineered to cut cleanly through high heat and coastal humidity from morning to night.',
    prices: {
      '10ml': 520,
      '30ml': 1290,
      '50ml': 1950,
      '100ml': 2950,
    },
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
    notesLine: 'Lychee · Damask Rose · Cashmeran',
    notes: {
      top: ['Dewy Lychee', 'Pear Blossom', 'Bergamot'],
      middle: ['Damask Rose', 'Peony', 'Jasmine Sambac'],
      base: ['Cashmere Wood', 'Velvet Musk', 'Madagascar Vanilla'],
    },
    longevity: {
      score: 90,
      label: '9–11 Hours',
    },
    projection: {
      score: 80,
      label: 'Soft Aura',
    },
    weatherFit: 'Day-to-dinner elegance & brunch gatherings',
    moods: ['Signature', 'Office', 'Festive'],
    description:
      'Luminous petals steeped in airy cashmere musk—feminine, modern, and effortlessly lingering on silk and skin.',
    prices: {
      '10ml': 580,
      '30ml': 1390,
      '50ml': 2100,
      '100ml': 3150,
    },
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
    notesLine: 'Saffron · Taif Rose · Leather Oud',
    notes: {
      top: ['Kashmiri Saffron', 'Nutmeg', 'Cinnamon Bark'],
      middle: ['Taif Rose', 'Praline', 'Guaiac Wood'],
      base: ['Aged Agarwood', 'Suede Leather', 'Benzoin'],
    },
    longevity: {
      score: 97,
      label: '12+ Hours',
    },
    projection: {
      score: 94,
      label: 'Room-Filling',
    },
    weatherFit: 'Eid, formal receptions & cool nights',
    moods: ['Festive', 'Evening'],
    description:
      'Opulent Arabian perfumery crafted in small batches—spiced saffron ribbons folded into smoky aged agarwood and burnished leather.',
    prices: {
      '10ml': 690,
      '30ml': 1650,
      '50ml': 2490,
      '100ml': 3500,
    },
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
    notesLine: 'Fig Leaf · Vetiver · Oakmoss',
    notes: {
      top: ['Crushed Fig Leaf', 'Mandarin Zest', 'Petitgrain'],
      middle: ['Bay Laurel', 'Clary Sage', 'Green Tea'],
      base: ['Oakmoss', 'Java Vetiver', 'Dry Cedar'],
    },
    longevity: {
      score: 84,
      label: '8–9 Hours',
    },
    projection: {
      score: 76,
      label: 'Crisp Personal Bubble',
    },
    weatherFit: 'Peak summer heat, campus & studio wear',
    moods: ['Humid Heat', 'Office'],
    description:
      'Breezy green botanicals and earthy vetiver roots that feel like stepping into shaded monsoon rain.',
    prices: {
      '10ml': 480,
      '30ml': 1190,
      '50ml': 1850,
      '100ml': 2790,
    },
  },
  {
    id: 'ambre-cognac-reserve',
    name: 'Ambre Cognac Reserve',
    subtitle: 'Spiced Vanilla & Roasted Tonka',
    category: 'Unisex',
    collection: 'Middle Eastern Lux',
    concentration: 'Extrait de Parfum · 35% Oil',
    badge: 'Signature',
    image: vanillaAmberImg,
    notesLine: 'Cinnamon · Cognac · Bourbon Vanilla',
    notes: {
      top: ['Ceylon Cinnamon', 'Plum Nectar', 'Cardamom'],
      middle: ['Aged Cognac Accord', 'Roasted Tonka', 'Myrrh'],
      base: ['Bourbon Vanilla', 'Praline Amber', 'Sandalwood'],
    },
    longevity: {
      score: 92,
      label: '10–12 Hours',
    },
    projection: {
      score: 86,
      label: 'Warm Sillage',
    },
    weatherFit: 'Date nights, winter evenings & lounges',
    moods: ['Evening', 'Festive'],
    description:
      'Velvety cognac warmth draped over toasted tonka bean and dark vanilla—intoxicating without ever turning sugary.',
    prices: {
      '10ml': 620,
      '30ml': 1490,
      '50ml': 2250,
      '100ml': 3350,
    },
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
    notesLine: 'Pear · Orris Butter · White Musk',
    notes: {
      top: ['White Pear', 'Aldehydes', 'Neroli'],
      middle: ['Florentine Iris', 'Cotton Flower', 'White Tea'],
      base: ['Ambrette Seed', 'Creamy Sandalwood', 'Clean Musk'],
    },
    longevity: {
      score: 85,
      label: '8–10 Hours',
    },
    projection: {
      score: 74,
      label: 'Intimate & Airy',
    },
    weatherFit: 'Daily signature, humid mornings & gifting',
    moods: ['Office', 'Humid Heat', 'Signature'],
    description:
      'Press-laundered linen meets powdery iris and warm skin musk—an understated second-skin signature for any season.',
    prices: {
      '10ml': 490,
      '30ml': 1220,
      '50ml': 1890,
      '100ml': 2850,
    },
  },
  {
    id: 'atelier-discovery-quartet',
    name: 'Atelier Discovery Quartet',
    subtitle: '4-Piece Curated Decant Vault',
    category: 'Unisex',
    collection: 'Discovery Sets',
    concentration: 'Extrait & EDP Assortment',
    badge: 'Bestseller',
    image: discoveryDecantsImg,
    notesLine: 'Oud · Bergamot · Rose · Amber',
    notes: {
      top: ['Bergamot & Saffron', 'Lychee & Green Fig'],
      middle: ['Damask Rose', 'Vetiver & Cognac'],
      base: ['Cambodian Oud', 'White Musk & Vanilla'],
    },
    longevity: {
      score: 91,
      label: '9–12 Hours Avg',
    },
    projection: {
      score: 85,
      label: 'Balanced Wardrobe',
    },
    weatherFit: 'Day, night & gifting wardrobe in travel sleeves',
    moods: ['Signature', 'Office', 'Evening', 'Humid Heat', 'Festive'],
    description:
      'Experience four bestselling houses in precision-measured glass atomizers with brushed gold casings—ideal for sampling or travel.',
    prices: {
      '10ml': 450,
      '30ml': 1350,
      '50ml': 2150,
      '100ml': 3200,
    },
  },
];

export interface CategoryShowcaseItem {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  targetFilter: FilterCategory;
  targetCollection?: CollectionType;
}

export const CATEGORY_SHOWCASE: CategoryShowcaseItem[] = [
  {
    id: 'designer-decants',
    title: 'Designer Decants',
    kicker: 'Authentic Vials',
    description: 'Precision-measured 10ml–100ml draws from iconic luxury houses.',
    image: bergamotNoirImg,
    targetFilter: 'Men',
    targetCollection: 'Designer Decants',
  },
  {
    id: 'middle-eastern-lux',
    title: 'Middle Eastern Lux',
    kicker: 'Arabian Extrait',
    description: 'Resinous oud, royal saffron, and Taif rose with commanding sillage.',
    image: saffronElixirImg,
    targetFilter: 'Arabian',
    targetCollection: 'Middle Eastern Lux',
  },
  {
    id: 'signature-blends',
    title: 'Signature Blends',
    kicker: 'House Formulations',
    description: 'High-oil custom impressions calibrated for tropical humidity.',
    image: velvetRoseImg,
    targetFilter: 'Women',
    targetCollection: 'Signature Blends',
  },
  {
    id: 'discovery-sets',
    title: 'Discovery Sets & Combos',
    kicker: 'Curated Wardrobes',
    description: 'Multi-scent travel atomizers crafted for gifting and exploration.',
    image: discoveryDecantsImg,
    targetFilter: 'Unisex',
    targetCollection: 'Discovery Sets',
  },
];

export const USP_PILLARS = [
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
      '24–48 hour express dispatch inside Dhaka (৳60) and 48–72 hour nationwide Cash on Delivery across all 64 districts.',
  },
];
