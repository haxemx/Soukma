/**
 * Seed script — soukMA
 * Insère les catégories et quelques produits d'exemple.
 * Les images sont volontairement laissées à null (voir REMPLACER ICI).
 */
import {
  db,
  categoriesTable,
  productsTable,
  productSpecsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const categories = [
  { slug: "vetements-femme", name: "Vêtements Femme", icon: "shirt", sortOrder: 1 },
  { slug: "vetements-homme", name: "Vêtements Homme", icon: "shirt", sortOrder: 2 },
  { slug: "chaussures", name: "Chaussures", icon: "footprints", sortOrder: 3 },
  { slug: "electromenager", name: "Électroménager", icon: "blender", sortOrder: 4 },
  { slug: "high-tech", name: "High-Tech", icon: "smartphone", sortOrder: 5 },
  { slug: "maison-deco", name: "Maison & Déco", icon: "lamp", sortOrder: 6 },
  { slug: "beaute-soin", name: "Beauté & Soin", icon: "sparkles", sortOrder: 7 },
  { slug: "artisanat", name: "Artisanat Marocain", icon: "palette", sortOrder: 8 },
];

type Seed = {
  slug: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  stock: number;
  categorySlug: string;
  isFeatured?: boolean;
  rating?: string;
  reviewCount?: number;
  salesCount?: number;
  specs?: { label: string; value: string }[];
};

const productsSeed: Seed[] = [
  {
    slug: "caftan-brode-fes",
    title: "Caftan brodé de Fès",
    description:
      "Caftan traditionnel marocain brodé à la main par des artisanes de Fès. Idéal pour cérémonies et grandes occasions.",
    price: "1890.00",
    compareAtPrice: "2400.00",
    stock: 12,
    categorySlug: "vetements-femme",
    isFeatured: true,
    rating: "4.80",
    reviewCount: 47,
    salesCount: 132,
    specs: [
      { label: "Tissu", value: "Soie & coton" },
      { label: "Couleur", value: "Bordeaux & or" },
      { label: "Origine", value: "Fès, Maroc" },
    ],
  },
  {
    slug: "djellaba-laine-homme",
    title: "Djellaba en laine — Homme",
    description:
      "Djellaba marocaine 100% laine, coupe moderne, parfaite pour l'hiver. Confort et authenticité réunis.",
    price: "650.00",
    stock: 30,
    categorySlug: "vetements-homme",
    isFeatured: true,
    rating: "4.60",
    reviewCount: 28,
    salesCount: 89,
    specs: [
      { label: "Matière", value: "Laine vierge" },
      { label: "Tailles", value: "S à XXL" },
    ],
  },
  {
    slug: "babouches-cuir-marrakech",
    title: "Babouches en cuir de Marrakech",
    description:
      "Babouches artisanales en cuir véritable, cousues main dans la médina de Marrakech. Légères et durables.",
    price: "320.00",
    stock: 60,
    categorySlug: "chaussures",
    rating: "4.70",
    reviewCount: 53,
    salesCount: 210,
    specs: [
      { label: "Matière", value: "Cuir véritable" },
      { label: "Pointures", value: "36 à 45" },
    ],
  },
  {
    slug: "machine-cafe-expresso-pro",
    title: "Machine à café expresso Pro",
    description:
      "Machine à café expresso 15 bars avec mousseur lait intégré. Garantie 2 ans, livraison partout au Maroc.",
    price: "2490.00",
    compareAtPrice: "2990.00",
    stock: 18,
    categorySlug: "electromenager",
    isFeatured: true,
    rating: "4.50",
    reviewCount: 76,
    salesCount: 64,
    specs: [
      { label: "Pression", value: "15 bars" },
      { label: "Réservoir", value: "1.5 L" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
  {
    slug: "robot-multifonction-1500w",
    title: "Robot multifonction 1500W",
    description:
      "Robot pâtissier puissant avec 10 vitesses, bol inox 5L et 3 accessoires fournis.",
    price: "1790.00",
    stock: 22,
    categorySlug: "electromenager",
    rating: "4.40",
    reviewCount: 41,
    salesCount: 38,
  },
  {
    slug: "smartphone-x-pro-256",
    title: "Smartphone X Pro 256 Go",
    description:
      "Écran AMOLED 6.7\", triple capteur photo 108MP, batterie 5000 mAh. Débloqué tout opérateur.",
    price: "4990.00",
    compareAtPrice: "5790.00",
    stock: 14,
    categorySlug: "high-tech",
    isFeatured: true,
    rating: "4.70",
    reviewCount: 162,
    salesCount: 245,
    specs: [
      { label: "Stockage", value: "256 Go" },
      { label: "RAM", value: "12 Go" },
      { label: "Batterie", value: "5000 mAh" },
    ],
  },
  {
    slug: "casque-audio-bluetooth-anc",
    title: "Casque audio Bluetooth ANC",
    description:
      "Réduction de bruit active, 40h d'autonomie, son Hi-Fi haute définition.",
    price: "890.00",
    stock: 50,
    categorySlug: "high-tech",
    rating: "4.50",
    reviewCount: 88,
    salesCount: 112,
  },
  {
    slug: "tapis-berbere-azilal",
    title: "Tapis berbère Azilal — 200x300",
    description:
      "Tapis 100% laine tissé main dans l'Atlas. Pièce unique, motifs berbères authentiques.",
    price: "3200.00",
    stock: 6,
    categorySlug: "artisanat",
    isFeatured: true,
    rating: "4.90",
    reviewCount: 34,
    salesCount: 22,
    specs: [
      { label: "Dimensions", value: "200 × 300 cm" },
      { label: "Matière", value: "Laine 100%" },
      { label: "Origine", value: "Azilal, Atlas" },
    ],
  },
  {
    slug: "lanterne-cuivre-ciselee",
    title: "Lanterne en cuivre ciselée",
    description:
      "Lanterne marocaine en cuivre ciselée à la main, idéale pour décoration intérieure ou jardin.",
    price: "480.00",
    stock: 25,
    categorySlug: "maison-deco",
    rating: "4.60",
    reviewCount: 29,
    salesCount: 47,
  },
  {
    slug: "huile-argan-bio-100ml",
    title: "Huile d'Argan bio — 100 ml",
    description:
      "Huile d'argan 100% pure et bio, pressée à froid par une coopérative féminine d'Essaouira.",
    price: "180.00",
    stock: 120,
    categorySlug: "beaute-soin",
    isFeatured: true,
    rating: "4.80",
    reviewCount: 211,
    salesCount: 540,
    specs: [
      { label: "Volume", value: "100 ml" },
      { label: "Certification", value: "Bio Ecocert" },
    ],
  },
  {
    slug: "savon-noir-beldi-200g",
    title: "Savon noir Beldi — 200 g",
    description:
      "Savon noir traditionnel à base d'olives, pour gommage hammam authentique.",
    price: "65.00",
    stock: 200,
    categorySlug: "beaute-soin",
    rating: "4.70",
    reviewCount: 156,
    salesCount: 320,
  },
  {
    slug: "abaya-moderne-noire",
    title: "Abaya moderne — Noir élégant",
    description:
      "Abaya coupe moderne, tissu fluide, broderies discrètes au col et aux manches.",
    price: "890.00",
    stock: 35,
    categorySlug: "vetements-femme",
    rating: "4.50",
    reviewCount: 62,
    salesCount: 84,
  },
];

async function main() {
  console.log("Seeding categories…");
  for (const c of categories) {
    const existing = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, c.slug))
      .limit(1);
    if (existing[0]) continue;
    await db.insert(categoriesTable).values(c);
  }

  const allCats = await db.select().from(categoriesTable);
  const catBySlug = new Map(allCats.map((c) => [c.slug, c.id]));

  console.log("Seeding products…");
  for (const p of productsSeed) {
    const existing = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, p.slug))
      .limit(1);
    if (existing[0]) continue;
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`Skip ${p.slug}: missing category`);
      continue;
    }
    const [created] = await db
      .insert(productsTable)
      .values({
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        categoryId,
        // REMPLACER ICI: ajoutez ici l'URL de l'image principale du produit.
        imageUrl: null,
        rating: p.rating ?? "0",
        reviewCount: p.reviewCount ?? 0,
        salesCount: p.salesCount ?? 0,
        isFeatured: p.isFeatured ?? false,
      })
      .returning();
    if (p.specs && created) {
      await db.insert(productSpecsTable).values(
        p.specs.map((s, i) => ({
          productId: created.id,
          label: s.label,
          value: s.value,
          sortOrder: i,
        })),
      );
    }
  }

  console.log("Done seeding.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
