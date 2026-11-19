import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const menuDataPath = resolve(__dirname, '../public/menu_data.json');
const rawData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
const items = rawData.items || [];

const menuDataFrPath = resolve(__dirname, '../public/menu_data_fr.json');
const rawDataFr = fs.existsSync(menuDataFrPath)
  ? JSON.parse(fs.readFileSync(menuDataFrPath, 'utf8'))
  : null;
const itemsFrMap = new Map();
if (rawDataFr?.items) {
  rawDataFr.items.forEach((it) => {
    itemsFrMap.set(it.id, it);
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const defaultCategories = [
  {
    id: 'poulet',
    name: 'Poulet',
    nameFr: 'Poulet',
    order: 1,
    iconUrl: '/cfc_bucket.png',
    description: 'Fresh and crispy chicken selection at CFOCO.',
    descriptionFr: 'Sélection de poulet frais et croustillant chez CFOCO.',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    nameFr: 'Burgers',
    order: 2,
    iconUrl: '/category/burger.png',
    description: 'Juicy, flame-grilled burgers stacked with premium toppings.',
    descriptionFr: 'Burgers juteux grillés à la flamme, garnis d\'ingrédients de premier choix.',
  },
  {
    id: 'riz-box',
    name: 'Riz Box',
    nameFr: 'Riz Box',
    order: 3,
    iconUrl: '/category/riz-box.png',
    description: 'Tender chicken over fragrant rice, bold sauces, full satisfaction.',
    descriptionFr: 'Morceaux de poulet tendres sur riz parfumé, sauces audacieuses, plaisir garanti.',
  },
  {
    id: 'sides',
    name: 'Sides',
    nameFr: 'Accompagnements',
    order: 4,
    iconUrl: '/category/sides.png',
    description: 'Golden, crispy sides to complete your CFOCO experience.',
    descriptionFr: 'Accompagnements dorés et croustillants pour parfaire votre expérience CFOCO.',
  },
  {
    id: 'tacos',
    name: 'Tacos',
    nameFr: 'Tacos',
    order: 5,
    iconUrl: '/category/tacos.png',
    description: 'Soft, melted French tacos loaded with your favourite fillings.',
    descriptionFr: 'Tacos français moelleux et fondants, garnis de vos ingrédients préférés.',
  },
  {
    id: 'wraps',
    name: 'Wraps',
    nameFr: 'Wraps',
    order: 6,
    iconUrl: '/category/wraps.png',
    description: 'Wrapped tight with fresh ingredients and signature sauces.',
    descriptionFr: 'Roulés serrés avec des ingrédients frais et nos sauces signatures.',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    nameFr: 'Desserts',
    order: 7,
    iconUrl: '/category/dessert.png',
    description: 'Sweet endings — shakes, sundaes & frozen treats.',
    descriptionFr: 'Douceurs sucrées — Milkshakes, sundaes et desserts glacés.',
  },
];

const ndjsonLines = [];

// 1. Export categories
for (const cat of defaultCategories) {
  const catDoc = {
    _id: `category-${cat.id}`,
    _type: 'menuCategory',
    name: cat.name,
    nameFr: cat.nameFr,
    slug: { _type: 'slug', current: cat.id },
    iconUrl: cat.iconUrl,
    order: cat.order,
    description: cat.description,
    descriptionFr: cat.descriptionFr,
  };
  ndjsonLines.push(JSON.stringify(catDoc));
}

// 2. Export menu items
let count = 0;
for (const item of items) {
  count++;
  const slug = slugify(item.title);
  const docId = `menu-item-${slug}-${item.id}`;
  const itemFr = itemsFrMap.get(item.id) || {};

  const doc = {
    _id: docId,
    _type: 'menuItem',
    title: item.title,
    titleFr: itemFr.title || item.title,
    slug: { _type: 'slug', current: slug },
    category: item.category,
    categoryName: item.categoryName,
    categoryRef: {
      _type: 'reference',
      _ref: `category-${item.category}`,
    },
    description: item.description,
    descriptionFr: itemFr.description || item.description,
    imageUrl: item.image,
    order: count,
    badge: item.badge || '',
    badgeFr: itemFr.badge || item.badge || '',
    isBestSeller: count <= 5,
  };

  ndjsonLines.push(JSON.stringify(doc));
}

const outputPath = resolve(__dirname, 'menu_import.ndjson');
fs.writeFileSync(outputPath, ndjsonLines.join('\n') + '\n', 'utf8');

console.log(`✅ Generated ${ndjsonLines.length} NDJSON records at: ${outputPath}`);
console.log(`\nTo import directly into Sanity via CLI:`);
console.log(`npx sanity dataset import sanity/menu_import.ndjson production --replace`);
