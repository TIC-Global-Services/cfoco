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

if (!projectId || !token) {
  console.error('❌ Missing Sanity credentials in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Load existing menu data
const menuDataPath = resolve(__dirname, '../public/menu_data.json');
const rawData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
const items = rawData.items || [];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function seed() {
  console.log(`🚀 Seeding ${items.length} menu items into Sanity (${projectId}/${dataset})...`);

  let count = 0;
  for (const item of items) {
    count++;
    const slug = slugify(item.title);
    const docId = `menu-item-${slug}-${item.id}`;

    // Common rich modal defaults matching the screenshot design
    const doc = {
      _id: docId,
      _type: 'menuItem',
      title: item.title,
      slug: { _type: 'slug', current: slug },
      category: item.category,
      categoryName: item.categoryName,
      categoryRef: {
        _type: 'reference',
        _ref: `category-${item.category}`,
      },
      description: item.description,
      imageUrl: item.image,
      order: count,
      badge: count <= 5 ? '🔥 Best Selling' : 'Signature',
      isBestSeller: count <= 5,
    };

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        await client.createOrReplace(doc);
        process.stdout.write(`✅ [${count}/${items.length}] ${item.title}\n`);
        success = true;
      } catch (err) {
        if (attempt === 3) {
          console.error(`❌ Failed: ${item.title} (${err.message})`);
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  console.log('\n🎉 Finished seeding menu items to Sanity!');
}

seed().catch(console.error);
