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

// Load existing menu data (English & French)
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

async function seed() {
  console.log(`🚀 Seeding ${items.length} menu items with French translations into Sanity (${projectId}/${dataset})...`);

  // 1. Verify write permission upfront
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
      console.error('5. Re-run: npm run seed:menu\n');
      console.error('💡 Alternative: You can also run "npm run export:menu" to create an NDJSON file,');
      console.error('   then import it with: npx sanity dataset import sanity/menu_import.ndjson production --replace\n');
      process.exit(1);
    }
  }

  // 2. Fetch existing items to preserve their exact IDs and prevent duplicates
  let existingItems = [];
  try {
    existingItems = await client.fetch('*[_type == "menuItem"]{ _id, title, "slug": slug.current }');
    console.log(`ℹ️  Found ${existingItems.length} existing menu items in Sanity.`);
  } catch (e) {
    console.warn(`Could not fetch existing items:`, e.message);
  }

  const existingByTitle = new Map();
  const existingBySlug = new Map();
  for (const ex of existingItems) {
    if (ex.title) existingByTitle.set(ex.title.trim().toLowerCase(), ex._id);
    if (ex.slug) existingBySlug.set(ex.slug.trim().toLowerCase(), ex._id);
  }

  let count = 0;
  for (const item of items) {
    count++;
    const slug = slugify(item.title);
    const itemFr = itemsFrMap.get(item.id) || {};

    // Match existing Sanity document ID to update in-place without creating duplicate records
    const matchedId =
      existingByTitle.get(item.title.trim().toLowerCase()) ||
      existingBySlug.get(slug) ||
      `menu-item-${slug}-${item.id}`;

    const docId = matchedId.replace(/^drafts\./, '');

    // Common rich modal defaults matching the screenshot design
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

    if (item.cardData || itemFr.cardData) {
      doc.cardData = {
        ...(item.cardData || {}),
        detailedDescription: item.cardData?.detailedDescription || item.description,
        detailedDescriptionFr: itemFr.cardData?.detailedDescription || itemFr.description || item.description,
        includesTitle: item.cardData?.includesTitle,
        includesTitleFr: itemFr.cardData?.includesTitle,
      };
    }

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        await client.createOrReplace(doc);
        process.stdout.write(`✅ [${count}/${items.length}] ${item.title} -> FR: "${itemFr.title || item.title}"\n`);
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
