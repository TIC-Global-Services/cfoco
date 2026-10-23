import { createClient } from 'next-sanity';
import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContent = fs.readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const token = envVars.SANITY_API_WRITE_TOKEN || envVars.SANITY_API_READ_TOKEN;

const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-16',
  useCdn: false,
  token,
});

async function migrate() {
  console.log('🔄 Checking menu items without categoryRef...');
  const items = await client.fetch('*[_type == "menuItem" && !defined(categoryRef)]{ _id, title, category }');
  console.log(`Found ${items.length} items without categoryRef.`);

  if (items.length === 0) {
    console.log('✅ All items already have categoryRef!');
    return;
  }

  let patched = 0;
  for (const item of items) {
    const catSlug = (item.category || '').toLowerCase().trim();
    if (!catSlug) continue;

    const targetCatId = `category-${catSlug}`;
    try {
      await client.patch(item._id).set({
        categoryRef: {
          _type: 'reference',
          _ref: targetCatId,
        },
      }).commit();
      patched++;
      console.log(`✅ [${patched}/${items.length}] Linked "${item.title}" -> ${targetCatId}`);
    } catch (err) {
      console.error(`❌ Failed to link "${item.title}":`, err.message);
    }
  }

  console.log(`\n🎉 Successfully patched ${patched} items with category references!`);
}

migrate().catch(console.error);
