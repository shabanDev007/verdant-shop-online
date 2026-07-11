import type { Language } from "@/i18n/translations";

const arabicLabels: Record<string, string> = {
  Plants: "النباتات",
  "Indoor Plants": "نباتات داخلية",
  "Outdoor Plants": "نباتات خارجية",
  "Flowering Plants": "نباتات مزهرة",
  "Air Purifying Plants": "نباتات منقية للهواء",
  "Pet Friendly Plants": "نباتات آمنة للحيوانات",
  "Rare & Premium Plants": "نباتات نادرة ومميزة",
  "Large Plants": "نباتات كبيرة",
  "Fruit Plants": "نباتات فاكهة",
  "Vegetable Plants": "نباتات خضروات",
  Herbs: "أعشاب",
  "Succulents & Cactus": "عصاريات وصبار",
  "Pots & Planters": "أصص وأحواض زراعة",
  "Indoor Pots": "أصص داخلية",
  "Outdoor Pots": "أصص خارجية",
  "Decorative Pots": "أصص ديكورية",
  "Plant Stands": "حوامل نباتات",
  "Watering Tools": "أدوات الري",
  "Soil & Mixes": "التربة والخلطات",
  Fertilizers: "الأسمدة",
  "Gardening Tools": "أدوات البستنة",
  "Pest Control": "مكافحة الآفات",
  Decoration: "الديكور",
  Seeds: "البذور",
  Propagation: "الإكثار",
  "Gift Collection": "مجموعة الهدايا",
  "Plant Kits": "مجموعات النباتات",
  "Snake Plant": "نبات جلد النمر",
  "ZZ Plant": "نبات الزاميا",
  Monstera: "مونستيرا",
  "Variegated Monstera": "مونستيرا مبرقشة",
  Pothos: "بوتس",
  Philodendron: "فيلوديندرون",
  "Peace Lily": "زنبق السلام",
  "Spider Plant": "نبات العنكبوت",
  "Rubber Plant": "نبات المطاط",
  Ficus: "فيكس",
  Dracaena: "دراسينا",
  Aglaonema: "أجلونيما",
  "Areca Palm": "نخيل أريكا",
  "Kentia Palm": "نخيل كنتيا",
  Calathea: "كالاتيا",
  "Boston Fern": "سرخس بوسطن",
  "Aloe Vera": "ألوفيرا",
  "Jade Plant": "نبات اليشم",
  Echeveria: "إشفيريا",
  Haworthia: "هاورثيا",
  "African Violet": "البنفسج الأفريقي",
  Anthurium: "أنثوريوم",
  Begonia: "بيجونيا",
  Hibiscus: "كركديه",
  Jasmine: "ياسمين",
  Lavender: "لافندر",
  Roses: "ورد",
  Rosemary: "روزماري",
  Basil: "ريحان",
  Mint: "نعناع",
  Thyme: "زعتر",
  Parsley: "بقدونس",
  Tomato: "طماطم",
  Cucumber: "خيار",
  Strawberry: "فراولة",
  "Lemon Tree": "شجرة ليمون",
  "Olive Trees": "أشجار زيتون",
  "Fig Tree": "شجرة تين",
  Bedroom: "غرفة النوم",
  "Living Room": "غرفة المعيشة",
  Office: "المكتب",
  Bathroom: "الحمام",
  Balcony: "الشرفة",
  Kitchen: "المطبخ",
  "Low Light": "إضاءة منخفضة",
  "Medium Light": "إضاءة متوسطة",
  "Bright Light": "إضاءة ساطعة",
  "Direct Sun": "شمس مباشرة",
  Daily: "يوميًا",
  Weekly: "أسبوعيًا",
  "Low Water": "ري قليل",
  Beginner: "مبتدئ",
  "Easy Care": "عناية سهلة",
  Intermediate: "متوسط",
  Expert: "خبير",
  "Air Purifying": "منقٍ للهواء",
  "Pet Friendly": "آمن للحيوانات",
  "Fast Growing": "سريع النمو",
  "Low Maintenance": "قليل العناية",
  Flowering: "مزهر",
  Fragrant: "عطري",
  Birthday: "عيد ميلاد",
  Wedding: "زفاف",
  "New Home": "منزل جديد",
  "Mother's Day": "عيد الأم",
  "Valentine's Day": "عيد الحب",
  Ramadan: "رمضان",
  Eid: "العيد",
};

const variantLabels: Record<string, string> = {
  Small: "صغير",
  Medium: "متوسط",
  Large: "كبير",
  Standard: "قياسي",
  Deluxe: "فاخر",
  Pro: "احترافي",
  "Small Bag": "عبوة صغيرة",
  "Large Bag": "عبوة كبيرة",
  "Single Pack": "عبوة واحدة",
  "Value Pack": "عبوة موفرة",
};

export function localizeLabel(value: string, language: Language): string {
  if (language !== "ar") return value;
  if (arabicLabels[value]) return arabicLabels[value];

  for (const [suffix, translatedSuffix] of Object.entries(variantLabels)) {
    if (value.endsWith(` ${suffix}`)) {
      const base = value.slice(0, -(suffix.length + 1));
      return `${arabicLabels[base] ?? base} — ${translatedSuffix}`;
    }
  }
  return value;
}

export function localizeDescription(
  description: string,
  language: Language,
  localizedName: string,
): string {
  if (language !== "ar") return description;
  return `${localizedName} مختار بعناية وخاضع لفحص الجودة قبل الشحن.`;
}
