import type {
  Benefit,
  Category,
  CategoryType,
  Difficulty,
  LightTag,
  Product,
  Room,
  SmartCollection,
  WaterTag,
} from "@/types";

/**
 * MOCK DATA
 * Structured to mirror what a Spring Boot backend would return.
 * Categories are hierarchical (parentId). Products are generated
 * from a declarative taxonomy plus a small SKU factory so we can
 * seed hundreds of items without hand-writing each one.
 *
 * Swap all reads to `fetch(API_BASE_URL + ...)` in src/services/api.ts.
 */

// ---------- Image pools (Unsplash, keyed by category flavor) ----------

const IMG = {
  indoor: [
    "photo-1614594975525-e45190c55d0b",
    "photo-1632207691143-643e2a9a9361",
    "photo-1509937528035-ad76254b0356",
    "photo-1485955900006-10f4d324d411",
    "photo-1597055181300-e3633a917a35",
  ],
  outdoor: [
    "photo-1466692476868-aef1dfb1e735",
    "photo-1468327768560-75b778cbb551",
    "photo-1602491453631-e2a5ad90a131",
    "photo-1416879595882-3373a0480b5b",
  ],
  succulent: [
    "photo-1509423350716-97f9360b4e09",
    "photo-1459411552884-841db9b3cc2a",
    "photo-1462530468904-575d4a5cb1cf",
  ],
  flowering: [
    "photo-1524598171353-ce84a157f1c7",
    "photo-1593482892290-f54927ae2b7a",
    "photo-1490750967868-88aa4486c946",
  ],
  office: [
    "photo-1502672260266-1c1ef2d93688",
    "photo-1572688484438-313a6e50c333",
    "photo-1632321977025-c44e76d3ab9a",
  ],
  pots: [
    "photo-1485955900006-10f4d324d411",
    "photo-1509423350716-97f9360b4e09",
    "photo-1595429035839-c99c298ffdde",
  ],
  tools: [
    "photo-1416879595882-3373a0480b5b",
    "photo-1466692476868-aef1dfb1e735",
    "photo-1520052205864-92d242b3a76b",
  ],
  soil: ["photo-1416879595882-3373a0480b5b", "photo-1466692476868-aef1dfb1e735"],
  seeds: ["photo-1416879595882-3373a0480b5b", "photo-1508615070457-7baeba4003e4"],
  decor: ["photo-1485955900006-10f4d324d411", "photo-1459411552884-841db9b3cc2a"],
  gift: ["photo-1509423350716-97f9360b4e09", "photo-1524598171353-ce84a157f1c7"],
};

const img = (pool: keyof typeof IMG, i = 0) =>
  `https://images.unsplash.com/${IMG[pool][i % IMG[pool].length]}?auto=format&fit=crop&w=900&q=80`;

// ---------- Taxonomy definition ----------

type LeafSpec = {
  name: string;
  productCount?: number;
  price?: [number, number]; // [min, max]
  tags?: {
    petSafe?: boolean;
    airPurifying?: boolean;
    difficulty?: Difficulty;
    lightTag?: LightTag;
    waterTag?: WaterTag;
    indoorOutdoor?: "indoor" | "outdoor" | "both";
    rooms?: Room[];
    benefits?: Benefit[];
  };
};

type BranchSpec = {
  name: string;
  description?: string;
  type: CategoryType;
  pool: keyof typeof IMG;
  children: LeafSpec[];
  featured?: boolean;
};

type RootSpec = {
  name: string;
  description: string;
  type: CategoryType;
  pool: keyof typeof IMG;
  branches: BranchSpec[];
  featured?: boolean;
};

const TAXONOMY: RootSpec[] = [
  {
    name: "Plants",
    description: "Living greenery for every home, office, garden, or gift.",
    type: "plants",
    pool: "indoor",
    featured: true,
    branches: [
      {
        name: "Indoor Plants",
        type: "plants",
        pool: "indoor",
        featured: true,
        description: "Bring nature inside with our curated indoor collection.",
        children: [
          {
            name: "Snake Plant",
            tags: {
              airPurifying: true,
              difficulty: "Beginner",
              lightTag: "low-light",
              waterTag: "low-water",
              indoorOutdoor: "indoor",
              rooms: ["bedroom", "office"],
              benefits: ["air-purifying", "low-maintenance"],
            },
          },
          {
            name: "ZZ Plant",
            tags: {
              airPurifying: true,
              difficulty: "Beginner",
              lightTag: "low-light",
              waterTag: "low-water",
              indoorOutdoor: "indoor",
              rooms: ["office", "living-room"],
              benefits: ["air-purifying", "low-maintenance"],
            },
          },
          {
            name: "Monstera",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              rooms: ["living-room"],
              benefits: ["fast-growing"],
            },
          },
          {
            name: "Pothos",
            tags: {
              airPurifying: true,
              difficulty: "Beginner",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              rooms: ["living-room", "bedroom"],
              benefits: ["air-purifying", "fast-growing"],
            },
          },
          {
            name: "Philodendron",
            tags: {
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Peace Lily",
            tags: {
              airPurifying: true,
              difficulty: "Easy",
              lightTag: "low-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              rooms: ["bedroom", "bathroom"],
              benefits: ["air-purifying", "flowering"],
            },
          },
          {
            name: "Spider Plant",
            tags: {
              petSafe: true,
              airPurifying: true,
              difficulty: "Beginner",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["air-purifying", "pet-friendly"],
            },
          },
          {
            name: "Rubber Plant",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Ficus",
            tags: {
              difficulty: "Moderate",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Dracaena",
            tags: {
              airPurifying: true,
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["air-purifying"],
            },
          },
          {
            name: "Aglaonema",
            tags: {
              difficulty: "Easy",
              lightTag: "low-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Areca Palm",
            tags: {
              petSafe: true,
              airPurifying: true,
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["air-purifying", "pet-friendly"],
            },
          },
          {
            name: "Kentia Palm",
            tags: {
              petSafe: true,
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["pet-friendly"],
            },
          },
          {
            name: "Calathea",
            tags: {
              petSafe: true,
              difficulty: "Moderate",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["pet-friendly"],
            },
          },
          {
            name: "Dieffenbachia",
            tags: {
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
          },
        ],
      },
      {
        name: "Outdoor Plants",
        type: "plants",
        pool: "outdoor",
        featured: true,
        description: "Hardy plants for gardens, balconies, and terraces.",
        children: [
          {
            name: "Bougainvillea",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "Jasmine",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
              benefits: ["flowering", "fragrant"],
            },
          },
          {
            name: "Hibiscus",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "Roses",
            tags: {
              difficulty: "Moderate",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
              benefits: ["flowering", "fragrant"],
            },
          },
          {
            name: "Lavender",
            tags: {
              petSafe: true,
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "outdoor",
              benefits: ["flowering", "fragrant", "pet-friendly"],
            },
          },
          {
            name: "Oleander",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "outdoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "Citrus Trees",
            tags: {
              difficulty: "Moderate",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
              benefits: ["flowering", "fragrant"],
            },
            price: [3500, 8000],
          },
          {
            name: "Olive Trees",
            tags: {
              difficulty: "Moderate",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "outdoor",
            },
            price: [4500, 12000],
          },
          {
            name: "Palm Trees",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
            },
            price: [3500, 15000],
          },
          {
            name: "Bamboo",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
            },
          },
        ],
      },
      {
        name: "Succulents & Cactus",
        type: "plants",
        pool: "succulent",
        featured: true,
        description: "Low-maintenance beauties for sunny spots.",
        children: [
          {
            name: "Aloe Vera",
            tags: {
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "low-water",
              indoorOutdoor: "both",
              benefits: ["low-maintenance"],
            },
          },
          {
            name: "Jade Plant",
            tags: {
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "low-water",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Haworthia",
            tags: {
              difficulty: "Beginner",
              lightTag: "medium-light",
              waterTag: "low-water",
              indoorOutdoor: "indoor",
            },
          },
          {
            name: "Echeveria",
            tags: {
              difficulty: "Beginner",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "both",
            },
          },
          {
            name: "Barrel Cactus",
            tags: {
              difficulty: "Beginner",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "both",
            },
          },
          {
            name: "Bunny Ear Cactus",
            tags: {
              difficulty: "Beginner",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "both",
            },
          },
        ],
      },
      {
        name: "Flowering Plants",
        type: "plants",
        pool: "flowering",
        description: "Vibrant blooms to brighten every room.",
        children: [
          {
            name: "Orchid Phalaenopsis",
            tags: {
              difficulty: "Moderate",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "Anthurium",
            tags: {
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "African Violet",
            tags: {
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["flowering"],
            },
          },
          {
            name: "Begonia",
            tags: {
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
              benefits: ["flowering"],
            },
          },
        ],
      },
      {
        name: "Herbs",
        type: "plants",
        pool: "outdoor",
        description: "Fresh culinary herbs for kitchen and balcony.",
        children: [
          {
            name: "Basil",
            tags: {
              petSafe: true,
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
              rooms: ["kitchen"],
              benefits: ["fragrant", "pet-friendly"],
            },
          },
          {
            name: "Mint",
            tags: {
              petSafe: true,
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
              rooms: ["kitchen"],
              benefits: ["fragrant"],
            },
          },
          {
            name: "Rosemary",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "both",
              rooms: ["kitchen"],
              benefits: ["fragrant"],
            },
          },
          {
            name: "Thyme",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "low-water",
              indoorOutdoor: "both",
              rooms: ["kitchen"],
            },
          },
          {
            name: "Parsley",
            tags: {
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
              rooms: ["kitchen"],
            },
          },
        ],
      },
      {
        name: "Vegetable Plants",
        type: "plants",
        pool: "outdoor",
        description: "Grow your own vegetables at home.",
        children: [
          {
            name: "Tomato",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "daily",
              indoorOutdoor: "outdoor",
            },
          },
          {
            name: "Chili Pepper",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
            },
          },
          {
            name: "Cucumber",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "daily",
              indoorOutdoor: "outdoor",
            },
          },
          {
            name: "Lettuce",
            tags: {
              difficulty: "Beginner",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
            },
          },
        ],
      },
      {
        name: "Fruit Plants",
        type: "plants",
        pool: "outdoor",
        description: "Home-grown fruit trees and berries.",
        children: [
          {
            name: "Strawberry",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "both",
            },
          },
          {
            name: "Lemon Tree",
            tags: {
              difficulty: "Moderate",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
            },
            price: [3500, 7000],
          },
          {
            name: "Fig Tree",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "weekly",
              indoorOutdoor: "outdoor",
            },
            price: [3500, 7000],
          },
          {
            name: "Pomegranate",
            tags: {
              difficulty: "Easy",
              lightTag: "direct-sun",
              waterTag: "low-water",
              indoorOutdoor: "outdoor",
            },
            price: [3500, 7000],
          },
        ],
      },
      {
        name: "Large Plants",
        type: "plants",
        pool: "indoor",
        description: "Statement floor plants for large spaces.",
        children: [
          {
            name: "Fiddle Leaf Fig",
            tags: {
              difficulty: "Moderate",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
            price: [3500, 6500],
          },
          {
            name: "Bird of Paradise",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
            price: [3500, 8500],
          },
          {
            name: "Yucca",
            tags: {
              difficulty: "Easy",
              lightTag: "bright-light",
              waterTag: "low-water",
              indoorOutdoor: "both",
            },
            price: [2500, 6000],
          },
        ],
      },
      {
        name: "Air Purifying Plants",
        type: "plants",
        pool: "indoor",
        description: "Plants proven to freshen your indoor air.",
        children: [
          {
            name: "Boston Fern",
            tags: {
              petSafe: true,
              airPurifying: true,
              difficulty: "Moderate",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["air-purifying", "pet-friendly"],
            },
          },
          {
            name: "English Ivy",
            tags: {
              airPurifying: true,
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "both",
              benefits: ["air-purifying"],
            },
          },
          {
            name: "Bamboo Palm",
            tags: {
              petSafe: true,
              airPurifying: true,
              difficulty: "Easy",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
              benefits: ["air-purifying", "pet-friendly"],
            },
          },
        ],
      },
      {
        name: "Rare & Premium Plants",
        type: "plants",
        pool: "indoor",
        description: "Collector-worthy rarities in limited supply.",
        children: [
          {
            name: "Variegated Monstera",
            tags: {
              difficulty: "Moderate",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
            price: [8000, 15000],
          },
          {
            name: "Philodendron Pink Princess",
            tags: {
              difficulty: "Moderate",
              lightTag: "bright-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
            price: [6000, 12000],
          },
          {
            name: "Alocasia Black Velvet",
            tags: {
              difficulty: "Expert",
              lightTag: "medium-light",
              waterTag: "weekly",
              indoorOutdoor: "indoor",
            },
            price: [4000, 8000],
          },
        ],
      },
    ],
  },
  {
    name: "Pots & Planters",
    description: "Beautiful pots to complement every plant and space.",
    type: "pots",
    pool: "pots",
    featured: true,
    branches: [
      {
        name: "By Material",
        type: "pots",
        pool: "pots",
        children: [
          { name: "Ceramic Pots", price: [400, 2500] },
          { name: "Plastic Pots", price: [100, 800] },
          { name: "Fiber Pots", price: [500, 3000] },
          { name: "Terracotta Pots", price: [200, 1500] },
          { name: "Concrete Pots", price: [700, 3500] },
        ],
      },
      {
        name: "By Style",
        type: "pots",
        pool: "pots",
        children: [
          { name: "Decorative Pots", price: [500, 3000] },
          { name: "Hanging Pots", price: [300, 1500] },
          { name: "Self Watering Pots", price: [600, 2500] },
          { name: "Indoor Pots", price: [300, 2000] },
          { name: "Outdoor Pots", price: [500, 3500] },
        ],
      },
    ],
  },
  {
    name: "Plant Stands",
    description: "Elevate your plants with beautiful stands.",
    type: "stands",
    pool: "pots",
    branches: [
      {
        name: "Plant Stands",
        type: "stands",
        pool: "pots",
        children: [
          { name: "Wooden Stands", price: [800, 3000] },
          { name: "Metal Stands", price: [600, 2500] },
          { name: "Corner Stands", price: [900, 3500] },
          { name: "Multi-Level Stands", price: [1200, 4500] },
          { name: "Hanging Stands", price: [500, 2000] },
        ],
      },
    ],
  },
  {
    name: "Watering",
    description: "Everything you need to water your plants right.",
    type: "watering",
    pool: "tools",
    branches: [
      {
        name: "Watering Tools",
        type: "watering",
        pool: "tools",
        children: [
          { name: "Watering Cans", price: [300, 1500] },
          { name: "Spray Bottles", price: [80, 400] },
          { name: "Automatic Watering", price: [800, 3500] },
          { name: "Drip Irrigation", price: [500, 3000] },
          { name: "Moisture Meters", price: [250, 900] },
        ],
      },
    ],
  },
  {
    name: "Soil & Mixes",
    description: "Premium substrates for healthy roots.",
    type: "soil",
    pool: "soil",
    branches: [
      {
        name: "Soil & Mixes",
        type: "soil",
        pool: "soil",
        children: [
          { name: "Potting Mix", price: [80, 400] },
          { name: "Coco Peat", price: [70, 300] },
          { name: "Peat Moss", price: [90, 400] },
          { name: "Perlite", price: [60, 250] },
          { name: "Vermiculite", price: [70, 300] },
          { name: "Orchid Mix", price: [100, 350] },
          { name: "Cactus Mix", price: [80, 300] },
        ],
      },
    ],
  },
  {
    name: "Fertilizers",
    description: "Feed your plants for lush, healthy growth.",
    type: "fertilizers",
    pool: "soil",
    branches: [
      {
        name: "Fertilizers",
        type: "fertilizers",
        pool: "soil",
        children: [
          { name: "Organic Fertilizer", price: [100, 500] },
          { name: "Liquid Fertilizer", price: [120, 500] },
          { name: "Compost", price: [80, 400] },
          { name: "Slow Release Fertilizer", price: [150, 600] },
          { name: "NPK Fertilizer", price: [100, 500] },
        ],
      },
    ],
  },
  {
    name: "Gardening Tools",
    description: "Quality tools that last a lifetime.",
    type: "tools",
    pool: "tools",
    branches: [
      {
        name: "Gardening Tools",
        type: "tools",
        pool: "tools",
        children: [
          { name: "Pruners", price: [200, 1200] },
          { name: "Garden Gloves", price: [80, 400] },
          { name: "Shovels", price: [250, 1500] },
          { name: "Rakes", price: [200, 1000] },
          { name: "Garden Forks", price: [200, 1000] },
          { name: "Soil Scoop", price: [80, 300] },
        ],
      },
    ],
  },
  {
    name: "Pest Control",
    description: "Safe, effective plant protection.",
    type: "pest-control",
    pool: "tools",
    branches: [
      {
        name: "Pest Control",
        type: "pest-control",
        pool: "tools",
        children: [
          { name: "Neem Oil", price: [120, 400] },
          { name: "Fungicide", price: [150, 500] },
          { name: "Insecticide", price: [120, 500] },
          { name: "Sticky Traps", price: [50, 200] },
          { name: "Plant Spray", price: [100, 400] },
        ],
      },
    ],
  },
  {
    name: "Decoration",
    description: "Finishing touches for your plant styling.",
    type: "decoration",
    pool: "decor",
    branches: [
      {
        name: "Decoration",
        type: "decoration",
        pool: "decor",
        children: [
          { name: "Decorative Stones", price: [80, 350] },
          { name: "Pebbles", price: [60, 300] },
          { name: "Preserved Moss", price: [100, 400] },
          { name: "Wood Chips", price: [70, 300] },
          { name: "Fairy Lights", price: [150, 700] },
          { name: "Mini Decorations", price: [80, 400] },
        ],
      },
    ],
  },
  {
    name: "Seeds",
    description: "Start something new from seed.",
    type: "seeds",
    pool: "seeds",
    branches: [
      {
        name: "Seeds",
        type: "seeds",
        pool: "seeds",
        children: [
          { name: "Flower Seeds", price: [40, 200] },
          { name: "Vegetable Seeds", price: [40, 200] },
          { name: "Herb Seeds", price: [40, 200] },
          { name: "Fruit Seeds", price: [50, 250] },
        ],
      },
    ],
  },
  {
    name: "Propagation",
    description: "Grow more plants from what you already own.",
    type: "propagation",
    pool: "tools",
    branches: [
      {
        name: "Propagation",
        type: "propagation",
        pool: "tools",
        children: [
          { name: "Rooting Hormone", price: [80, 300] },
          { name: "Seed Trays", price: [100, 500] },
          { name: "Nursery Pots", price: [50, 300] },
          { name: "Propagation Tubes", price: [200, 900] },
        ],
      },
    ],
  },
  {
    name: "Gift Collection",
    description: "Thoughtful gifts for every plant lover.",
    type: "gift",
    pool: "gift",
    featured: true,
    branches: [
      {
        name: "Gift Collection",
        type: "gift",
        pool: "gift",
        children: [
          { name: "Gift Plants", price: [800, 3500] },
          { name: "Gift Boxes", price: [1200, 4500] },
          { name: "Gift Wrapping", price: [80, 300] },
          { name: "Greeting Cards", price: [40, 150] },
        ],
      },
    ],
  },
  {
    name: "Plant Kits",
    description: "Curated bundles to get started fast.",
    type: "kits",
    pool: "gift",
    featured: true,
    branches: [
      {
        name: "Plant Kits",
        type: "kits",
        pool: "gift",
        children: [
          { name: "Beginner Kit", price: [1500, 3500] },
          { name: "Office Kit", price: [2000, 5000] },
          { name: "Balcony Kit", price: [2500, 6000] },
          { name: "Indoor Kit", price: [2000, 5000] },
          { name: "Succulent Kit", price: [1500, 3500] },
        ],
      },
    ],
  },
  {
    name: "Pet Friendly Plants",
    description: "Plants that are safe for cats and dogs.",
    type: "pet-friendly",
    pool: "indoor",
    featured: true,
    branches: [
      {
        name: "Pet Friendly Plants",
        type: "pet-friendly",
        pool: "indoor",
        children: [
          { name: "Cat Grass", tags: { petSafe: true, benefits: ["pet-friendly"] } },
          {
            name: "Boston Fern (Pet Safe)",
            tags: {
              petSafe: true,
              airPurifying: true,
              benefits: ["pet-friendly", "air-purifying"],
            },
          },
          { name: "Prayer Plant", tags: { petSafe: true, benefits: ["pet-friendly"] } },
        ],
      },
    ],
  },
];

// ---------- Flatten taxonomy into categories ----------

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function buildCategories(): Category[] {
  const out: Category[] = [];
  for (const root of TAXONOMY) {
    const rootId = `cat-${slugify(root.name)}`;
    out.push({
      id: rootId,
      name: root.name,
      slug: slugify(root.name),
      description: root.description,
      image: img(root.pool, 0),
      type: root.type,
      featured: root.featured,
    });
    for (const branch of root.branches) {
      const branchId = `${rootId}--${slugify(branch.name)}`;
      out.push({
        id: branchId,
        name: branch.name,
        slug: `${slugify(root.name)}/${slugify(branch.name)}`,
        description: branch.description ?? `${branch.name} collection.`,
        image: img(branch.pool, 1),
        parentId: rootId,
        type: branch.type,
        featured: branch.featured,
      });
      for (const leaf of branch.children) {
        const leafId = `${branchId}--${slugify(leaf.name)}`;
        out.push({
          id: leafId,
          name: leaf.name,
          slug: `${slugify(root.name)}/${slugify(branch.name)}/${slugify(leaf.name)}`,
          description: `Shop ${leaf.name}.`,
          image: img(branch.pool, 2),
          parentId: branchId,
          type: branch.type,
        });
      }
    }
  }
  return out;
}

export const categories: Category[] = buildCategories();

// Quick lookup by id
const catById = new Map(categories.map((c) => [c.id, c]));

// ---------- Product factory ----------

const VARIANTS: Record<CategoryType, string[]> = {
  plants: ["Small", "Medium", "Large"],
  pots: ['6"', '8"', '10"'],
  stands: ["Small", "Tall"],
  watering: ["Standard", "Deluxe"],
  soil: ["2L", "5L"],
  fertilizers: ["250ml", "1L"],
  tools: ["Standard", "Pro"],
  "pest-control": ["100ml", "500ml"],
  decoration: ["Small Bag", "Large Bag"],
  seeds: ["Single Pack", "Value Pack"],
  propagation: ["Set of 4", "Set of 8"],
  gift: ["Standard", "Deluxe"],
  kits: ["Standard", "Deluxe"],
  "pet-friendly": ["Small", "Medium"],
  other: ["Standard"],
};

function priceRange(type: CategoryType, override?: [number, number]): [number, number] {
  if (override) return override;
  switch (type) {
    case "plants":
      return [400, 3500];
    case "pots":
      return [200, 2500];
    case "stands":
      return [600, 3000];
    case "watering":
      return [200, 2500];
    case "soil":
      return [70, 400];
    case "fertilizers":
      return [100, 500];
    case "tools":
      return [100, 1200];
    case "pest-control":
      return [100, 500];
    case "decoration":
      return [80, 400];
    case "seeds":
      return [40, 250];
    case "propagation":
      return [80, 700];
    case "gift":
      return [800, 4500];
    case "kits":
      return [1500, 5000];
    case "pet-friendly":
      return [500, 2500];
    default:
      return [200, 1500];
  }
}

// Deterministic pseudo-random from a string (so seeds don't shift on reload)
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildProducts(): Product[] {
  const out: Product[] = [];
  let seq = 0;
  for (const root of TAXONOMY) {
    const rootId = `cat-${slugify(root.name)}`;
    for (const branch of root.branches) {
      const branchId = `${rootId}--${slugify(branch.name)}`;
      for (const leaf of branch.children) {
        const leafId = `${branchId}--${slugify(leaf.name)}`;
        const parentCat = catById.get(leafId)!;
        const variants = VARIANTS[branch.type] ?? VARIANTS.other;
        const [minP, maxP] = priceRange(branch.type, leaf.price);
        const count = leaf.productCount ?? Math.min(2, variants.length);
        for (let v = 0; v < count; v++) {
          const seed = hash(leafId + v);
          const variant = variants[v % variants.length];
          const price = Math.round(minP + ((seed % 100) / 100) * (maxP - minP));
          const hasDiscount = seed % 7 === 0;
          const oldPrice = hasDiscount ? Math.round(price * 1.25) : undefined;
          const featured = seed % 11 === 0 || branch.featured === true;
          const stock = 3 + (seed % 40);
          const rating = 4 + ((seed % 10) / 10) * 0.9;
          const reviewsCount = 5 + (seed % 200);

          const badges: Product["badges"] = [];
          if (hasDiscount) badges.push("sale");
          if (seed % 13 === 0) badges.push("new");
          if (seed % 17 === 0) badges.push("best-seller");
          if (stock <= 6) badges.push("low-stock");
          if (seed % 23 === 0) badges.push("staff-pick");
          if (branch.type === "plants" && leaf.tags?.difficulty === "Expert")
            badges.push("limited");

          const collections: SmartCollection[] = [];
          if (seed % 5 === 0) collections.push("new-arrivals");
          if (seed % 4 === 0) collections.push("best-sellers");
          if (seed % 6 === 0) collections.push("trending");
          if (featured) collections.push("featured");
          if (hasDiscount) collections.push("sale");
          if (seed % 9 === 0) collections.push("staff-picks");
          if (badges.includes("limited")) collections.push("limited-edition");

          const tags = leaf.tags ?? {};
          const suffix = variants.length > 1 ? ` — ${variant}` : "";
          const name = `${leaf.name}${suffix}`;
          const idNum = String(++seq).padStart(4, "0");
          const productId = `p-${idNum}`;
          const slug = slugify(`${leaf.name}-${variant}`);
          const sku = `VRD-${branch.type.slice(0, 3).toUpperCase()}-${idNum}`;

          const primary = img(branch.pool, seed);
          const gallery = [primary, img(branch.pool, seed + 1), img(branch.pool, seed + 2)];

          const legacyWater =
            tags.waterTag === "daily"
              ? "Daily"
              : tags.waterTag === "low-water"
                ? "Every 2–3 weeks"
                : "Weekly";
          const legacySun =
            tags.lightTag === "low-light"
              ? "Low"
              : tags.lightTag === "medium-light"
                ? "Medium"
                : tags.lightTag === "direct-sun"
                  ? "Full Sun"
                  : "Bright Indirect";

          const benefits: Benefit[] = [...(tags.benefits ?? [])];
          if (tags.petSafe && !benefits.includes("pet-friendly")) benefits.push("pet-friendly");
          if (tags.airPurifying && !benefits.includes("air-purifying"))
            benefits.push("air-purifying");

          out.push({
            id: productId,
            name,
            slug,
            sku,
            categoryId: leafId,
            categoryName: parentCat?.name ?? leaf.name,
            price,
            oldPrice,
            discountPrice: oldPrice ? price : undefined,
            description: `${leaf.name} — ${variant.toLowerCase()} size. Carefully sourced and quality-checked before shipping.`,
            image: primary,
            gallery,
            images: gallery,
            stock,
            featured,
            badges,
            rating: Math.round(rating * 10) / 10,
            reviewsCount,
            care: {
              water: legacyWater,
              sunlight: legacySun as never,
              temperature: "18–26°C",
              difficulty: (tags.difficulty ?? "Easy") as never,
            },
            specs: {
              plantHeight:
                branch.type === "plants" ? `${20 + (seed % 60)}–${40 + (seed % 80)}cm` : undefined,
              potSize: branch.type === "plants" ? `${10 + (seed % 8)}cm` : undefined,
              humidity: branch.type === "plants" ? "40–60%" : undefined,
              temperature: branch.type === "plants" ? "18–26°C" : undefined,
              growthRate: branch.type === "plants" ? "Moderate" : undefined,
              flowering: !!tags.benefits?.includes("flowering"),
            },
            deliveryInfo: "Free shipping on orders over 2,000 EGP. Delivery in 2–5 business days.",
            returnPolicy:
              "14-day return policy on non-plant items. Live plants covered by our 30-day plant guarantee.",
            careInstructions:
              branch.type === "plants"
                ? `Water when top 2–3cm of soil feel dry. Provide ${legacySun.toLowerCase()} light. Rotate weekly for even growth.`
                : undefined,
            faq: [
              {
                q: "Is this suitable for beginners?",
                a:
                  tags.difficulty === "Expert"
                    ? "This is a collector-grade item and best for experienced plant parents."
                    : "Yes — this is beginner-friendly with basic care.",
              },
              {
                q: "Do you ship nationwide?",
                a: "Yes, we deliver across Egypt within 2–5 business days.",
              },
            ],
            rooms: tags.rooms,
            lightTag: tags.lightTag,
            waterTag: tags.waterTag as WaterTag | undefined,
            difficultyLevel: tags.difficulty,
            indoorOutdoor: tags.indoorOutdoor,
            petSafe: tags.petSafe,
            airPurifying: tags.airPurifying,
            benefits: benefits.length ? benefits : undefined,
            occasions: seed % 3 === 0 ? ["birthday", "new-home"] : undefined,
            collections: collections.length ? collections : undefined,
          });
        }
      }
    }
  }
  return out;
}

export const products: Product[] = buildProducts();

// ---------- Facet metadata for "Browse By" pages ----------

export const facets = {
  room: [
    { value: "bedroom", label: "Bedroom" },
    { value: "living-room", label: "Living Room" },
    { value: "office", label: "Office" },
    { value: "bathroom", label: "Bathroom" },
    { value: "balcony", label: "Balcony" },
    { value: "kitchen", label: "Kitchen" },
  ],
  light: [
    { value: "low-light", label: "Low Light" },
    { value: "medium-light", label: "Medium Light" },
    { value: "bright-light", label: "Bright Light" },
    { value: "direct-sun", label: "Direct Sun" },
  ],
  water: [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "low-water", label: "Low Water" },
  ],
  difficulty: [
    { value: "Beginner", label: "Beginner" },
    { value: "Easy", label: "Easy Care" },
    { value: "Moderate", label: "Intermediate" },
    { value: "Expert", label: "Expert" },
  ],
  benefit: [
    { value: "air-purifying", label: "Air Purifying" },
    { value: "pet-friendly", label: "Pet Friendly" },
    { value: "fast-growing", label: "Fast Growing" },
    { value: "low-maintenance", label: "Low Maintenance" },
    { value: "flowering", label: "Flowering" },
    { value: "fragrant", label: "Fragrant" },
  ],
  occasion: [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "new-home", label: "New Home" },
    { value: "mothers-day", label: "Mother's Day" },
    { value: "valentines-day", label: "Valentine's Day" },
    { value: "ramadan", label: "Ramadan" },
    { value: "eid", label: "Eid" },
  ],
} as const;

export type FacetKey = keyof typeof facets;
