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
  { id: 'poulet', name: 'Poulet', order: 1, iconUrl: '/cfc_bucket.png' },
  { id: 'burgers', name: 'Burgers', order: 2, iconUrl: '/category/burger.png' },
  { id: 'riz-box', name: 'Riz Box', order: 3, iconUrl: '/category/riz-box.png' },
  { id: 'sides', name: 'Sides', order: 4, iconUrl: '/category/sides.png' },
  { id: 'tacos', name: 'Tacos', order: 5, iconUrl: '/category/tacos.png' },
  { id: 'wraps', name: 'Wraps', order: 6, iconUrl: '/category/wraps.png' },
  { id: 'desserts', name: 'Desserts', order: 7, iconUrl: '/category/dessert.png' },
];

async function seedCategories() {
  console.log(`🚀 Seeding menu categories into Sanity...`);

  for (const cat of defaultCategories) {
    const doc = {
      _id: `category-${cat.id}`,
      _type: 'menuCategory',
      name: cat.name,
      slug: { _type: 'slug', current: cat.id },
      iconUrl: cat.iconUrl,
      order: cat.order,
      description: `Delicious ${cat.name} selection at CFOCO.`,
    };

    try {
      await client.createOrReplace(doc);
      console.log(`✅ Seeded category: "${cat.name}" (ID: ${doc._id})`);
    } catch (e) {
      console.error(`❌ Failed category "${cat.name}":`, e.message);
    }
  }

  console.log('🎉 Finished seeding categories!');
}

seedCategories().catch(console.error);
