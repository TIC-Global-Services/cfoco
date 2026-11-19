import { createClient } from 'next-sanity';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-16';
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

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

async function seedCategories() {
  console.log(`🚀 Seeding menu categories into Sanity...`);

  // Verify write permission upfront
  try {
    await client.patch('category-poulet').set({ nameFr: 'Poulet' }).commit();
    console.log('✅ Write permission verified.');
  } catch (err) {
    if (err.message?.includes('Insufficient permissions') || err.message?.includes('update required')) {
      console.error('\n❌ SANITY WRITE PERMISSION ERROR:');
      console.error('The token in .env.local only has "Viewer" (Read-Only) access.');
      console.error('Sanity requires an "Editor" token to write or update documents.');
      console.error('\n👉 How to fix:');
      console.error('1. Open: https://sanity.io/manage');
      console.error('2. Select project "' + projectId + '" -> API tab -> Tokens -> "Add API token"');
      console.error('3. Name: "Seeder", Role: "Editor" (or "Administrator")');
      console.error('4. Copy the token and add to .env.local:');
      console.error('   SANITY_API_WRITE_TOKEN=sk...');
      console.error('5. Re-run: npm run seed:categories\n');
      process.exit(1);
    }
  }

  for (const cat of defaultCategories) {
    const doc = {
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

    try {
      await client.createOrReplace(doc);
      console.log(`✅ Seeded category: "${cat.name}" (FR: "${cat.nameFr}") (ID: ${doc._id})`);
    } catch (e) {
      console.error(`❌ Failed category "${cat.name}":`, e.message);
    }
  }

  console.log('🎉 Finished seeding categories!');
}

seedCategories().catch(console.error);
