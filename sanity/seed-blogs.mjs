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
      const val = trimmed
        .substring(idx + 1)
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2');
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
  console.error('❌ Error: Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Helper: Cache uploaded images to avoid re-uploading duplicate assets
const uploadedAssetCache = new Map();

async function uploadLocalImage(relativePath) {
  const fullPath = resolve(__dirname, '../public', relativePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Warning: Local image not found: ${fullPath}`);
    return null;
  }

  if (uploadedAssetCache.has(fullPath)) {
    return uploadedAssetCache.get(fullPath);
  }

  try {
    const fileName = fullPath.split(/[\/\\]/).pop();
    console.log(`📤 Uploading image to Sanity asset store: ${fileName}...`);
    const stream = fs.createReadStream(fullPath);
    const asset = await client.assets.upload('image', stream, {
      filename: fileName,
    });
    console.log(`   ✅ Uploaded: ${fileName} -> ${asset._id}`);
    uploadedAssetCache.set(fullPath, asset._id);
    return asset._id;
  } catch (err) {
    console.error(`❌ Failed to upload image "${fullPath}":`, err.message);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 11 BLOG CATEGORIES (Bilingual EN / FR)
// ----------------------------------------------------------------------------
const categoriesData = [
  {
    _id: 'category-our-story',
    title: 'Our Story',
    titleFr: 'Notre Histoire',
    slug: 'our-story',
    description: 'The journey of CFC and CFOCO from Capucins in 2011 to the robotic restaurants of tomorrow.',
  },
  {
    _id: 'category-crispy-fried-chicken',
    title: 'Crispy Fried Chicken',
    titleFr: 'Poulet Frit Croustillant',
    slug: 'crispy-fried-chicken',
    description: 'The science, craft, and culinary secrets behind achieving the ultimate golden crunch.',
  },
  {
    _id: 'category-secret-recipes-spices',
    title: 'Secret Recipes & Spices',
    titleFr: 'Recettes Secrètes & Épices',
    slug: 'secret-recipes-spices',
    description: 'Discover the artisanal 14-spice blend, buttermilk brines, and herb marinades.',
  },
  {
    _id: 'category-signature-burgers',
    title: 'Signature Burgers',
    titleFr: 'Burgers Signature',
    slug: 'signature-burgers',
    description: 'Stacked crispy fillets, toasted brioche buns, and gourmet melted French cheeses.',
  },
  {
    _id: 'category-craft-sauces-dips',
    title: 'Craft Sauces & Dips',
    titleFr: 'Sauces Artisanales & Dips',
    slug: 'craft-sauces-dips',
    description: 'House-made sauces from Spicy Mayo to Truffle Garlic — the art of dip pairing.',
  },
  {
    _id: 'category-chefs-kitchen-stories',
    title: "Chef's Kitchen Stories",
    titleFr: 'Secrets de Cuisine du Chef',
    slug: 'chefs-kitchen-stories',
    description: 'Culinary craftsmanship, kitchen life, and techniques direct from our head chefs.',
  },
  {
    _id: 'category-french-street-food',
    title: 'French Street Food',
    titleFr: 'Street Food à la Française',
    slug: 'french-street-food',
    description: 'Reimagining classic American comfort food through refined Bordeaux gastronomy.',
  },
  {
    _id: 'category-farm-to-kitchen-quality',
    title: 'Farm-to-Kitchen Quality',
    titleFr: "Qualité de la Ferme à l'Assiette",
    slug: 'farm-to-kitchen-quality',
    description: '100% French free-range poultry, ethical farm sourcing, and quality standards.',
  },
  {
    _id: 'category-tenders-wings-mastery',
    title: 'Tenders & Wings Mastery',
    titleFr: "L'Art des Tenders & Wings",
    slug: 'tenders-wings-mastery',
    description: 'Hand-breaded tenders, fiery wings, and succulent cuts cooked to perfection.',
  },
  {
    _id: 'category-feasts-sharing-buckets',
    title: 'Feasts & Sharing Buckets',
    titleFr: 'Buckets & Festins à Partager',
    slug: 'feasts-sharing-buckets',
    description: 'Family sharing boxes, game-day buckets, and party platters made for gatherings.',
  },
  {
    _id: 'category-behind-the-crunch',
    title: 'Behind The Crunch',
    titleFr: 'Les Coulisses du Croustillant',
    slug: 'behind-the-crunch',
    description: 'Community stories, kitchen culture, and our expanding culinary journey across France.',
  },
];

// Helper to generate unique block keys
let keyCounter = 1;
function genKey() {
  return `key_${Date.now()}_${keyCounter++}`;
}

function block(text, style = 'normal', marks = []) {
  return {
    _type: 'block',
    _key: genKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: genKey(),
        text,
        marks,
      },
    ],
    markDefs: [],
  };
}

function bullet(text) {
  return {
    _type: 'block',
    _key: genKey(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    children: [
      {
        _type: 'span',
        _key: genKey(),
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };
}

function blockquote(text) {
  return block(text, 'blockquote');
}

function imageBlock(assetId, alt = '', caption = '') {
  return {
    _type: 'image',
    _key: genKey(),
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt,
    caption,
  };
}

// ----------------------------------------------------------------------------
// MAIN SEED LOGIC
// ----------------------------------------------------------------------------
async function seedBlogs() {
  console.log(`\n🚀 Starting Blog Seeding for project "${projectId}" (${dataset})...\n`);

  // 1. Seed 11 Categories
  console.log('\n--- Seeding 11 Bilingual Blog Categories ---');
  for (const cat of categoriesData) {
    const catDoc = {
      _id: cat._id,
      _type: 'category',
      title: cat.title,
      titleFr: cat.titleFr || cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
    };
    await client.createOrReplace(catDoc);
    console.log(`✅ Category created: "${cat.title}" / "${cat.titleFr}"`);
  }

  // 2. Upload Chicken & Menu Images from public folder
  console.log('\n--- Uploading Chicken & Menu Images to Sanity ---');
  const friedChickensAssetId = await uploadLocalImage('fried-chickens.png');
  const friedChickenAssetId = await uploadLocalImage('fried-chicken.png');
  const cfcBucketAssetId = await uploadLocalImage('cfc_bucket.png');
  const ambienceAssetId = await uploadLocalImage('cfc_ambience.jpg');
  const wingsAssetId = await uploadLocalImage('POULET/3-dynamic-iwngs.png');
  const stripsAssetId = await uploadLocalImage('POULET/3-dynamic-strips.png');
  const tendersAssetId = await uploadLocalImage('POULET/crousty-tenders.png');
  const spicyWingsAssetId = await uploadLocalImage('POULET/spicy-wings.png');
  const familyFeastAssetId = await uploadLocalImage('POULET/big-family.png');
  const chickenMealAssetId = await uploadLocalImage('POULET/chicken-meal.png');
  const wingsFlambeAssetId = await uploadLocalImage('POULET/wings-flambe-epice.png');

  // Images extracted directly from the PDF document
  console.log('\n--- Uploading Extracted PDF Images & Diagrams to Sanity ---');
  const capucinsPhoneAssetId = await uploadLocalImage('blog-assets/cfoco-capucins-phone.png');
  const timelineAssetId = await uploadLocalImage('blog-assets/cfoco-growth-timeline.jpg');
  const lormontTechAssetId = await uploadLocalImage('blog-assets/cfoco-lormont-tech.png');
  const danaxAssetId = await uploadLocalImage('blog-assets/cfoco-danax-supply-chain.jpg');
  const bigFamilyAssetId = await uploadLocalImage('blog-assets/cfoco-big-family-feast.png');
  const modernRestaurantAssetId = await uploadLocalImage('blog-assets/cfoco-modern-restaurant.jpg');
  const fireBucketAssetId = await uploadLocalImage('blog-assets/cfoco-crispy-fire-bucket.png');

  // 3. 9 Rich Bilingual Blog Posts (Including the extracted PDF article)
  console.log('\n--- Seeding Bilingual Blog Posts (English & French) ---');
  const posts = [
    // =========================================================================
    // POST 1: From the PDF - "De CFC à CFOCO : 15 ans de croustillant"
    // =========================================================================
    {
      _id: 'post-de-cfc-a-cfoco-notre-histoire',
      title: 'From CFC to CFOCO: 15 Years of Crunch, Born in Bordeaux',
      titleFr: 'De CFC à CFOCO : 15 ans de croustillant, nés à Bordeaux',
      slug: 'de-cfc-a-cfoco-notre-histoire',
      publishedAt: '2026-11-20T10:00:00.000Z',
      excerpt: 'In 2011, Nazim Puthan opened a fried chicken restaurant near the Capucins market in Bordeaux. 15 years and 2 million meals later, CFC becomes CFOCO.',
      excerptFr: 'En 2011, Nazim Puthan ouvre un restaurant de poulet frit aux Capucins à Bordeaux. 15 ans et 2 millions de repas plus tard, CFC devient CFOCO.',
      mainImageAssetId: modernRestaurantAssetId || ambienceAssetId,
      mainImageAlt: 'De CFC à CFOCO: 15 ans de croustillant nés à Bordeaux',
      categoryIds: ['category-our-story', 'category-behind-the-crunch', 'category-french-street-food'],
      body: [
        // Article Parameters Table (from Page 1)
        block('Article Overview & Publication Metadata', 'h3'),
        bullet('SEO Title: De CFC à CFOCO : 15 ans de poulet frit à Bordeaux'),
        bullet('Meta Description: In 2011, Nazim Puthan opened a fried chicken restaurant at Capucins. 15 years and 2 million meals later, CFC becomes CFOCO.'),
        bullet('Slug URL: /news-blogs/de-cfc-a-cfoco-notre-histoire'),
        bullet('Category: Our Story (Notre histoire)'),
        bullet('Tags: CFOCO, CFC, Bordeaux, poulet frit, Capucins, franchise, histoire'),
        bullet('Author: L\'équipe CFOCO'),
        bullet('Reading Time: 5 min'),
        bullet('Primary Call to Action: Discover our menu'),
        bullet('Secondary Call to Action: Become a franchisee'),

        // Introduction
        block('Surtitre : NOTRE HISTOIRE · DEPUIS 2011', 'h4'),
        block('One restaurant. One fryer. One obsession.'),
        block('Every brand has a Day One. Ours smelled of sizzling hot oil, fresh chicken, and a whole lot of stage fright. In 2011, Nazim Puthan opened a fried chicken restaurant near the Marché des Capucins in Bordeaux (33000). He named it CFC.'),
        block('No franchise plan, no self-order kiosks, no serving robots. Just a single promise: chicken that is crispy on the outside, meltingly tender on the inside, every single time. Fifteen years, five restaurants, and over two million meals later, this founding promise carries a new name: CFOCO.'),
        blockquote('“Crispy since 2011 is not a slogan. It is a milestone date we are profoundly proud of.”'),

        // Chapter 1 with Page 2 image
        block('Chapter 1 — Capucins, 2011: Where Everything Began', 'h2'),
        block('The very first CFC opened in 2011 at Place des Capucins, right in the heart of Bordeaux’s oldest market district. A true neighborhood staple for anyone seeking something warm, freshly prepared, and deeply generous.'),
        ...(capucinsPhoneAssetId ? [imageBlock(capucinsPhoneAssetId, 'From fryer to bucket: the CFC ritual since day one', 'From the fryer to the bucket: the CFC ritual since day one.')] : []),
        block('From day one, Nazim rejected every shortcut:'),
        bullet('Exclusively fresh poultry, sourced directly from France and Belgium'),
        bullet('Short and traceable circuits: fewer food miles, delivering firmer and far more flavorful meat'),
        bullet('Crispy on the outside, tender and juicy on the inside, in every single piece'),
        bullet('Certified Halal, generous portions, and fair pricing so everyone finds a seat at the table'),
        block('Word of mouth did the rest. The queue stretching in front of Capucins quickly became CFC’s best advertisement.'),

        // Chapter 2 with Page 3 timeline diagram
        block('Chapter 2 — From One Restaurant to Five', 'h2'),
        block('For 12 years, we grew one restaurant at a time, managing every single location ourselves.'),
        ...(timelineAssetId ? [imageBlock(timelineAssetId, 'CFC Growth Timeline 2011–2025: From one restaurant to five, then a new global identity', 'Frise de croissance CFC · 2011–2025 : Un restaurant est devenu cinq, puis un nouveau nom.')] : []),
        bullet('2011 — Capucins, Bordeaux: Where the entire story began.'),
        bullet('2013 — Bordeaux Centre: A second restaurant opened in Bordeaux, right next to Capucins.'),
        bullet('2016 — Talence: CFC expanded beyond the city borders to the student district.'),
        bullet('2019 — Le Bouscat: The family expanded across northern Bordeaux.'),
        bullet('2023 — Lormont: Our first automated restaurant, the living model for our future franchise.'),
        bullet('2025 — CFOCO: A bold new identity, specifically engineered for international franchise expansion.'),
        block('Every single opening taught us valuable lessons. Those lessons became our operational standards, and now form the solid backbone of our franchise network.'),

        // Chapter 3 with Page 4 robotic restaurant collage
        block('Chapter 3 — Lormont, 2023: The Restaurant of the Future', 'h2'),
        block('By 2023, we knew how to craft exceptional chicken. The next challenge was: how do we make the entire dining experience as outstanding as what is on the plate? The answer opened in Lormont: our first robotic restaurant, and the blueprint for every future CFOCO.'),
        ...(lormontTechAssetId ? [imageBlock(lormontTechAssetId, 'Order at kiosk, pay in seconds, robot server brings your food', 'Order at the kiosk, pay in seconds, and an automated server robot brings your tray directly to your table.')] : []),
        block('What changes for our guests:'),
        bullet('Self-ordering kiosks & mobile ordering: Full menu customization with zero waiting lines'),
        bullet('Frictionless payments: Card, mobile phone, or cash on automated kiosks'),
        bullet('Real-time order tracking visible across dining room screens'),
        bullet('Robot table service: Your hot order arrives right at your table'),
        block('What changes behind the scenes: The entire restaurant is monitored live from a single digital dashboard on a smartphone: quality control, inventory, hygiene audits, speed of service, and maintenance. Fewer errors, faster service, and more genuine time for our team to connect with our guests.'),
        block('Lormont proved that cutting-edge technology and heartfelt hospitality go hand in hand. It has become the official franchise model of CFOCO.'),

        // Chapter 4 with Page 5 supply chain infographic & Page 6 Big Family feast
        block('Chapter 4 — The System Behind the Crunch', 'h2'),
        block('A truly great restaurant starts long before the fryer heats up. As our footprint expanded, we created Danax Group, our proprietary central purchasing hub, to command quality and freshness from farm gate to kitchen.'),
        ...(danaxAssetId ? [imageBlock(danaxAssetId, 'Danax Group Supply Chain: Sourcing, Transport, Storage, Kitchen', 'Purchasing, transport, storage, kitchen: one single supply chain, managed by Danax Group, for all restaurants.')] : []),
        block('What changes on your plate:'),
        bullet('Short, traceable supply chains: Fresh poultry from trusted farms in France and Belgium'),
        bullet('Consistent excellence in every location, wherever our guests dine'),
        bullet('Fair and honest prices, because a good restaurant begins with smart, responsible procurement'),
        block('One shared foundation of premium products unlocks infinite delicious combinations: tenders, wings, nuggets, buckets, rice boxes, flambéed wings, wraps, tacos, signature burgers, fresh salads, and milkshakes.'),
        ...(bigFamilyAssetId ? [imageBlock(bigFamilyAssetId, 'The Big Family Feast: Made to be shared', 'The Big Family Feast: Made to be shared.')] : []),

        // Chapter 5 with Page 7 modern restaurant facade
        block('Chapter 5 — 2025: CFC Becomes CFOCO', 'h2'),
        block('After 14 years of independently operating each restaurant, we were ready to share what we had built. In 2025, CFC evolves into CFOCO: a fresh, ambitious name for a brand-new chapter — national and European franchise development.'),
        ...(modernRestaurantAssetId ? [imageBlock(modernRestaurantAssetId, 'The CFOCO style: The next generation of our restaurants', 'The CFOCO style: The next generation of our restaurants.')] : []),
        block('The new brand preserves our roots while opening the door to dedicated franchise partners who share our relentless obsession with quality. Every franchisee receives the complete turnkey system:'),
        bullet('Proven operational standards distilled from 15 years of operating real, high-volume restaurants'),
        bullet('Group purchasing power and direct supply lines through Danax Group'),
        bullet('The turnkey digital model of Lormont: self-order kiosks, autonomous server robots, and cloud management'),
        bullet('Comprehensive end-to-end guidance: from location feasibility and architectural buildout to opening day and beyond'),
        blockquote('“You do not need to be a Michelin chef. You simply need to share the obsession.”'),

        // Conclusion with Page 8 fire bucket image & Call to actions
        block('Two Million Meals Later', 'h2'),
        block('Today, CFOCO has served over two million meals across the Gironde — from Capucins to Talence, Le Bouscat, and Lormont. The kiosks are modern, the robots are innovative, and our name is renewed. But our chicken is the exact same as on day one: fresh, shatteringly crisp, and prepared with uncompromising care.'),
        ...(fireBucketAssetId ? [imageBlock(fireBucketAssetId, 'Crispy since 2011. With you.', 'Crispy since 2011. With you, every single crunch along the way.')] : []),
        block('Calls to Action:'),
        bullet('Feeling hungry? → Discover our menu'),
        bullet('Looking to open a CFOCO? → Become a franchisee'),
        bullet('Share your CFC memories → Tag us on Instagram with your oldest CFC photo'),
      ],
      bodyFr: [
        // Table des paramètres de l'article (depuis Page 1)
        block('Paramètres de l\'article', 'h3'),
        bullet('Titre SEO (≤ 60 car.) : De CFC à CFOCO : 15 ans de poulet frit à Bordeaux'),
        bullet('Méta-description (≤ 155 car.) : En 2011, Nazim Puthan ouvre un restaurant de poulet frit aux Capucins. 15 ans et 2 millions de repas plus tard, CFC devient CFOCO.'),
        bullet('Slug URL : /news-blogs/de-cfc-a-cfoco-notre-histoire'),
        bullet('Catégorie : Notre histoire'),
        bullet('Tags : CFOCO, CFC, Bordeaux, poulet frit, Capucins, franchise, histoire'),
        bullet('Auteur : L\'équipe CFOCO'),
        bullet('Temps de lecture : 5 min'),
        bullet('Image principale : Façade nouvelle génération CFOCO'),
        bullet('CTA principal : Découvrir notre menu'),
        bullet('CTA secondaire : Devenir franchisé'),

        // Introduction
        block('Surtitre : NOTRE HISTOIRE · DEPUIS 2011', 'h4'),
        block('Un restaurant. Une friteuse. Une obsession.'),
        block('Toute marque a un premier jour. Le nôtre sentait l\'huile chaude, le poulet frais et beaucoup de trac. En 2011, Nazim Puthan ouvre un restaurant de poulet frit près du marché des Capucins, à Bordeaux (33000). Il l\'appelle CFC.'),
        block('Pas de plan de franchise, pas de borne, pas de robot. Juste une promesse : un poulet croustillant dehors, fondant dedans, à chaque fois. Quinze ans, cinq restaurants et plus de deux millions de repas plus tard, cette promesse porte un nouveau nom : CFOCO.'),
        blockquote('« Crispy since 2011 », ce n\'est pas un slogan. C\'est une date dont nous sommes fiers.'),

        // Chapitre 1 avec image Page 2
        block('Chapitre 1 — Capucins, 2011 : là où tout a commencé', 'h2'),
        block('Le premier CFC ouvre en 2011 place des Capucins, au cœur du plus ancien quartier de marché de Bordeaux. Une adresse de quartier, pour tous ceux qui cherchaient quelque chose de chaud, de frais et de généreux.'),
        ...(capucinsPhoneAssetId ? [imageBlock(capucinsPhoneAssetId, 'De la friteuse au bucket : le rituel CFC depuis le premier jour.', 'De la friteuse au bucket : le rituel CFC depuis le premier jour.')] : []),
        block('Dès le départ, Nazim refuse les raccourcis :'),
        bullet('Uniquement du poulet frais, origine France et Belgique'),
        bullet('Des circuits courts et traçables : moins de kilomètres, une viande plus ferme et plus savoureuse'),
        bullet('Croustillant dehors, fondant dedans, à chaque morceau'),
        bullet('Halal, généreux et à prix juste, pour que chacun ait sa place à table'),
        block('Le bouche-à-oreille a fait le reste. La file d\'attente devant les Capucins est devenue la meilleure publicité de CFC.'),

        // Chapitre 2 avec frise de croissance Page 3
        block('Chapitre 2 — D\'un restaurant à cinq', 'h2'),
        block('Pendant 12 ans, nous avons grandi un restaurant à la fois, en les gérant tous nous-mêmes.'),
        ...(timelineAssetId ? [imageBlock(timelineAssetId, 'Frise de croissance CFC · 2011–2025 : Un restaurant est devenu cinq, puis un nouveau nom', 'Frise de croissance CFC · 2011–2025 : Un restaurant est devenu cinq, puis un nouveau nom.')] : []),
        bullet('2011 — Capucins, Bordeaux : Là où tout a commencé.'),
        bullet('2013 — Bordeaux Centre : Un deuxième restaurant ouvre à Bordeaux, tout près des Capucins.'),
        bullet('2016 — Talence : CFC passe les limites de la ville vers le pôle étudiant.'),
        bullet('2019 — Le Bouscat : La famille s\'agrandit au nord de la métropole.'),
        bullet('2023 — Lormont : Notre premier restaurant robotisé, futur modèle de la franchise.'),
        bullet('2025 — CFOCO : Un nouveau nom international, pensé pour le développement en franchise.'),
        block('Chaque ouverture nous a appris quelque chose. Ces leçons sont devenues nos standards, puis la colonne vertébrale de la franchise.'),

        // Chapitre 3 avec collage Lormont Page 4
        block('Chapitre 3 — Lormont, 2023 : le restaurant du futur', 'h2'),
        block('En 2023, nous savions faire un excellent poulet. La question suivante : comment rendre toute l\'expérience aussi bonne que ce qu\'il y a dans l\'assiette ? La réponse a ouvert à Lormont : notre premier restaurant robotisé, et le modèle de tous les CFOCO à venir.'),
        ...(lormontTechAssetId ? [imageBlock(lormontTechAssetId, 'Commandez à la borne, payez en quelques secondes, et un robot vous apporte votre plateau à table.', 'Commandez à la borne, payez en quelques secondes, et un robot vous apporte votre plateau à table.')] : []),
        block('Ce qui change pour nos clients :'),
        bullet('Bornes de commande et commande mobile : tout le menu, personnalisable, sans file d\'attente'),
        bullet('Paiement fluide : carte, téléphone ou espèces sur bornes automatiques'),
        bullet('Suivi de commande en temps réel à l\'écran'),
        bullet('Service à table par robot : votre commande arrive directement à votre table'),
        block('Ce qui change en coulisses : tout le restaurant est piloté en direct depuis un seul tableau de bord, sur téléphone. Qualité, stock, hygiène, rapidité et maintenance. Moins d\'erreurs, un service plus rapide, et plus de temps pour l\'équipe auprès des clients.'),
        block('Lormont a prouvé que la technologie et un accueil chaleureux vont de pair. C\'est devenu le modèle de la franchise CFOCO.'),

        // Chapitre 4 avec infographie Danax Page 5 et Big Family Page 6
        block('Chapitre 4 — Le système derrière le croustillant', 'h2'),
        block('Un grand restaurant commence bien avant la friteuse. En grandissant, nous avons créé Danax Group, notre propre centrale d\'achat, pour maîtriser la qualité et la fraîcheur de la ferme à la cuisine.'),
        ...(danaxAssetId ? [imageBlock(danaxAssetId, 'Chaîne d\'approvisionnement Danax Group : Achat, transport, stockage, cuisine', 'Achat, transport, stockage, cuisine : une seule chaîne d\'approvisionnement, gérée par le groupe Danax, pour tous les restaurants.')] : []),
        block('Ce que ça change dans votre assiette :'),
        bullet('Des circuits courts et traçables : volaille fraîche de France et de Belgique'),
        bullet('La même qualité dans chaque restaurant, où que vous alliez'),
        bullet('Des prix justes, parce qu\'un bon restaurant commence par de bons achats'),
        block('Une base de produits commune, une infinité de combinaisons : les mêmes produits frais, associés à différentes sauces et recettes, donnent des centaines de combinaisons. Tenders, wings, nuggets, buckets, riz box, flambés, wraps, tacos, burgers, salades et shakes.'),
        ...(bigFamilyAssetId ? [imageBlock(bigFamilyAssetId, 'Le Big Family : fait pour être partagé.', 'Le Big Family : fait pour être partagé.')] : []),

        // Chapitre 5 avec façade CFOCO Page 7
        block('Chapitre 5 — 2025 : CFC devient CFOCO', 'h2'),
        block('Après 14 ans à gérer nous-mêmes chaque restaurant, nous étions prêts à partager ce que nous avions construit. En 2025, CFC devient CFOCO : un nouveau nom pour un nouveau chapitre, celui du développement en franchise.'),
        ...(modernRestaurantAssetId ? [imageBlock(modernRestaurantAssetId, 'Le style CFOCO : la nouvelle génération de nos restaurants.', 'Le style CFOCO : la nouvelle génération de nos restaurants.')] : []),
        block('Le nouveau nom garde nos racines et ouvre la porte à des partenaires qui partagent nos exigences. Chaque franchisé reçoit le système complet :'),
        bullet('Des standards opérationnels issus de 15 ans d\'exploitation de vrais restaurants'),
        bullet('Les achats groupés via la centrale Danax'),
        bullet('Le modèle digital de Lormont : bornes, robots serveurs et pilotage à distance'),
        bullet('Un accompagnement à chaque étape, de l\'étude d\'emplacement à l\'ouverture, et au-delà'),
        blockquote('« Pas besoin d\'être chef. Il suffit de partager l\'obsession. »'),

        // Conclusion avec image seau en feu Page 8 et CTA
        block('Deux millions de repas plus tard', 'h2'),
        block('Aujourd\'hui, CFOCO a servi plus de deux millions de repas en Gironde, des Capucins à Talence, au Bouscat et à Lormont. Les bornes sont nouvelles, les robots aussi, le nom aussi. Le poulet, lui, est le même qu\'au premier jour : frais, croustillant et préparé avec soin.'),
        ...(fireBucketAssetId ? [imageBlock(fireBucketAssetId, 'Crispy since 2011. Avec vous.', 'Crispy since 2011. Avec vous.')] : []),
        block('Blocs d\'appel à l\'action (pour la page) :'),
        bullet('Une petite faim ? → Découvrir notre menu'),
        bullet('Envie d\'ouvrir un CFOCO ? → Devenir franchisé'),
        bullet('Partagez vos souvenirs CFC → Identifiez-nous sur Instagram avec votre plus ancienne photo CFC'),
      ],
    },

    // =========================================================================
    // POST 2: The Science of the 14-Spice Crunch
    // =========================================================================
    {
      _id: 'post-science-of-the-14-spice-crunch',
      title: 'The Science of the 14-Spice Bordeaux Crunch',
      titleFr: 'La Science du Croustillant aux 14 Épices de Bordeaux',
      slug: 'the-science-of-the-14-spice-crunch',
      publishedAt: '2026-10-22T12:00:00.000Z',
      excerpt: 'How temperature curves, double-dredging, and a proprietary botanical spice blend create the most satisfying crunch in France.',
      excerptFr: 'Comment les courbes de température, le double panage et notre mélange secret de 14 épices créent le croustillant le plus savoureux de France.',
      mainImageAssetId: friedChickensAssetId || tendersAssetId,
      mainImageAlt: 'Golden crispy fried chicken fillets seasoned with herbs',
      categoryIds: ['category-crispy-fried-chicken', 'category-secret-recipes-spices'],
      body: [
        block('At CFC, achieving the perfect golden crunch isn’t just cooking — it’s precise culinary physics. Every drumstick and tender that leaves our kitchen has undergone a 24-hour transformation designed to preserve internal moisture while creating a micro-aerated crust.'),
        block('The 14-Spice Botanical Blueprint', 'h2'),
        block('Unlike traditional fast food that relies heavily on monosodium glutamate and excessive salt, our proprietary rub is inspired by the culinary terroir of southwest France:'),
        bullet('Bordeaux wild thyme and French rosemary for aromatic top notes'),
        bullet('Smoked pimentón and crushed Tellicherry black pepper for sustained warmth'),
        bullet('Roasted garlic, white pepper, and toasted onion for savory depth'),
        bullet('A whisper of ground coriander and dried mustard seed for brightness'),
        blockquote('“Crunch is auditory flavor. When you take that first bite, your brain registers texture before taste — which is why the crust must shatter effortlessly.” — Chef Antoine Laurent'),
        ...(wingsAssetId ? [imageBlock(wingsAssetId, 'Crispy Dynamic Wings on serving slate', 'Our Dynamic Wings: Double-dredged for maximum surface crispiness')] : []),
        block('The Double-Dredge Revelation', 'h2'),
        block('Most fried chicken turns heavy and greasy because single-dredging allows oil to penetrate the batter. Our cooks use a rapid buttermilk plunge followed by a second coat of custom-milled flour with zero compression. This leaves microscopic ridges that cook instantly into feather-light crispy flakes.'),
      ],
      bodyFr: [
        block('Chez CFC, obtenir le croustillant doré parfait ne relève pas du simple hasard : c\'est une véritable science culinaire. Chaque pilon et tender qui sort de notre cuisine bénéficie d\'une préparation de 24 heures pensée pour sceller le jus intérieur tout en développant une croûte aérienne inimitable.'),
        block('L\'Architecture Botanique des 14 Épices', 'h2'),
        block('Loin des standards de la restauration rapide industrielle reposant sur les exhausteurs de goût et le sel excessif, notre panure exclusive s\'inspire du terroir du Sud-Ouest :'),
        bullet('Thym sauvage de Bordeaux et romarin de Provence pour des notes aromatiques subtiles'),
        bullet('Pimentón fumé et poivre noir de Tellicherry concassé pour une chaleur enveloppante'),
        bullet('Ail rôti, poivre blanc et oignon grillé pour une rondeur et une profondeur gourmandes'),
        bullet('Une pointe de coriandre moulue et de graines de moutarde pour vivifier le palais'),
        blockquote('« Le croustillant est une saveur auditive. Dès la première bouchée, le cerveau capte la texture avant le goût. C\'est pour cela que la croûte doit éclater sans effort sous la dent. » — Chef Antoine Laurent'),
        ...(wingsAssetId ? [imageBlock(wingsAssetId, 'Dynamic Wings croustillants', 'Nos Dynamic Wings : Double panage pour une surface ultra-croustillante')] : []),
        block('Le Secret du Double Panage', 'h2'),
        block('Le poulet frit devient souvent lourd et gras quand un panage unique laisse l\'huile pénétrer la chair. Nos cuisiniers plongent chaque pièce dans un bain de babeurre frais avant d\'appliquer un second voile de farine sans tasser. Cela crée des micro-reliefs qui se figent instantanément en pétales ultra-croustillants.'),
      ],
    },

    // =========================================================================
    // POST 3: Inside the Quad Stack Burger
    // =========================================================================
    {
      _id: 'post-anatomy-of-our-quad-stack-burger',
      title: 'Inside the Quad Stack: The Anatomy of Our Iconic Burger',
      titleFr: 'Les Secrets du Quad Stack : L\'Anatomie de Notre Burger Iconique',
      slug: 'inside-the-quad-stack-the-anatomy-of-our-iconic-burger',
      publishedAt: '2026-10-18T10:30:00.000Z',
      excerpt: 'Four crispy buttermilk fillets, double melted pepper jack, and toasted brioche. Here is why the Quad Stack has achieved legendary status.',
      excerptFr: 'Quatre filets marinés au babeurre, double pepper jack fondu et brioche toastée. Découvrez pourquoi le Quad Stack est devenu une légende.',
      mainImageAssetId: familyFeastAssetId || friedChickenAssetId,
      mainImageAlt: 'The Quad Stack Crispy Chicken Burger',
      categoryIds: ['category-signature-burgers', 'category-french-street-food'],
      body: [
        block('When we first introduced the Quad Stack on our Bordeaux menu in 2021, skeptics thought it was too bold for a French palate. Within two weeks, university students and street food purists were queuing around Cours Gambetta to get their hands on one.'),
        block('Engineered Layer by Layer', 'h2'),
        block('Building a monster burger requires precision engineering so that every mouthful hits the exact balance of crunch, acidity, heat, and richness:'),
        bullet('Toasted French Brioche: Lightly buttered and griddled to seal against steam'),
        bullet('Four Crispy Fillets: Cooked at 175°C to achieve a mahogany crunch'),
        bullet('Double Pepper Jack Cheese: Melted under steam for luscious creaminess'),
        bullet('House Dill Pickles: Brined in white wine vinegar to cut through the richness'),
        bullet('Signature Spicy Glaze: Brushed hot for that sweet-savory punch'),
        blockquote('“A great burger shouldn’t collapse under its own weight. It must hold together from the first bite to the last crumb.”'),
        ...(stripsAssetId ? [imageBlock(stripsAssetId, 'Dynamic Strips used in our burgers', 'Hand-breaded fillets prepared fresh every morning')] : []),
        block('The Crunch That Conquered Talence', 'h2'),
        block('Today, the Quad Stack remains our highest-rated specialty burger across every kitchen, proving that real ingredients and daring proportions are a winning recipe.'),
      ],
      bodyFr: [
        block('Lorsque nous avons lancé le Quad Stack sur notre carte bordelaise en 2021, certains doutaient qu\'un tel colosse convienne aux gourmets français. En deux semaines, les files d\'étudiants et de passionnés de street food s\'étiraient le long du cours Gambetta pour savourer cette création hors normes.'),
        block('Une Architecture Pensée Couche par Couche', 'h2'),
        block('Monter un burger d\'une telle envergure exige une vraie rigueur pour que chaque bouchée trouve l\'équilibre parfait entre croustillant, acidité, fondant et gourmandise :'),
        bullet('Pain Brioché Français Toasté : Légèrement beurré et doré sur plaque pour isoler de la vapeur'),
        bullet('Quatre Filets Croustillants : Dorés à 175°C pour une texture acajou ultra-croustillante'),
        bullet('Double Pepper Jack Fondu : Fondu sous cloche pour une onctuosité crémeuse'),
        bullet('Pickles Maison à l\'Aneth : Marinés au vinaigre de vin blanc pour équilibrer la richesse'),
        bullet('Glaçage Piquant Signature : Badigeonné à chaud pour une attaque sucrée-salée irrésistible'),
        blockquote('« Un grand burger ne doit jamais s\'effondrer. Il doit conserver sa tenue impeccable de la première à la toute dernière miette. »'),
        ...(stripsAssetId ? [imageBlock(stripsAssetId, 'Dynamic Strips pour burgers', 'Filets panés à la main chaque matin en cuisine')] : []),
        block('Le Burger Qui a Conquis la Métropole', 'h2'),
        block('Aujourd\'hui, le Quad Stack demeure le burger signature le plus plébiscité de nos restaurants, prouvant qu\'une générosité sans compromis alliée à des ingrédients d\'exception fait toujours l\'unanimité.'),
      ],
    },

    // =========================================================================
    // POST 4: Sauce Alchemy - Mastering the Art of the Dip
    // =========================================================================
    {
      _id: 'post-sauce-alchemy-mastering-the-art-of-the-dip',
      title: 'Sauce Alchemy: Mastering the Art of the Dip',
      titleFr: 'L\'Alchimie des Sauces : Maîtriser l\'Art du Dip',
      slug: 'sauce-alchemy-mastering-the-art-of-the-dip',
      publishedAt: '2026-10-15T15:45:00.000Z',
      excerpt: 'A great tender is only as good as its companion dip. Explore the flavor science behind our artisanal house-whipped sauces.',
      excerptFr: 'Un tender d\'exception n\'est rien sans sa sauce. Plongez dans la science gustative de nos sauces artisanales maison.',
      mainImageAssetId: spicyWingsAssetId || wingsAssetId,
      mainImageAlt: 'CFC Crispy Wings with craft dipping sauces',
      categoryIds: ['category-craft-sauces-dips', 'category-tenders-wings-mastery'],
      body: [
        block('In French cuisine, the sauce is the soul of the plate. We brought that exact mindset to fried chicken sauces, developing house-crafted condiments that elevate crispy poultry into an unforgettable experience.'),
        block('The Four Pillars of the CFC Dip Bar', 'h2'),
        bullet('Garlic Truffle Mayo: Velvety emulsified egg yolk infused with black truffle oil and roasted garlic cloves'),
        bullet('Hot Honey Glaze: Local wildflower honey simmered with habanero chili and apple cider vinegar'),
        bullet('Smoked BBQ Bourbon: Slow-reduced tomato paste, smoked paprika, and barrel-aged notes'),
        bullet('Classic Herb Ranch: Crème fraîche, fresh chives, dill, and cracked black pepper'),
        blockquote('“The key to dipping is contrast. If the chicken is rich and savory, the dip must provide acidity or sharp herbal brightness.”'),
        ...(tendersAssetId ? [imageBlock(tendersAssetId, 'Crousty Tenders ready for dipping', 'Our Crousty Tenders with house-whipped herb ranch')] : []),
        block('How to Taste Like a Pro', 'h2'),
        block('Next time you order our 8-piece Tender Box, try starting with Herb Ranch to awaken the palate, transitioning to Hot Honey Butter for warmth, and finishing with Garlic Truffle for decadence.'),
      ],
      bodyFr: [
        block('Dans la gastronomie française, la sauce est l\'âme de l\'assiette. Nous avons appliqué cette exigence culinaire à l\'univers du poulet frit en élaborant des sauces artisanales qui subliment chaque bouchée de croustillant.'),
        block('Les Quatre Piliers du Bar à Dips CFC', 'h2'),
        bullet('Mayo Truffée à l\'Ail Rôti : Émulsion veloutée parfumée à l\'huile de truffe noire et aux gousses d\'ail confites'),
        bullet('Glaze Hot Honey : Miel toutes fleurs mijoté au piment habanero et relevé d\'un trait de vinaigre de cidre'),
        bullet('BBQ Fumé au Bourbon : Réduction lente de tomates, paprika doux fumé et notes boisées chaleureuses'),
        bullet('Ranch Traditionnel aux Herbes : Crème fraîche d\'Isigny, ciboulette fraîche ciselée, aneth et poivre concassé'),
        blockquote('« La clé d\'un dip réussi repose sur le contraste. Face à la générosité du poulet frit, la sauce doit apporter vivacité, acidité et fraîcheur aromatique. »'),
        ...(tendersAssetId ? [imageBlock(tendersAssetId, 'Crousty Tenders prêts à dipper', 'Nos Crousty Tenders accompagnés de la sauce ranch aux herbes')] : []),
        block('Le Rituel de Dégustation Idéal', 'h2'),
        block('Lors de votre prochaine dégustation d\'une box de 8 tenders, commencez par le Ranch aux herbes pour réveiller le palais, enchaînez avec le Hot Honey pour une chaleur enivrante, et terminez en apothéose avec la Mayo Truffe.'),
      ],
    },

    // =========================================================================
    // POST 5: Farm to Fryer - 100% French Poultry Pledge
    // =========================================================================
    {
      _id: 'post-farm-to-fryer-our-100-percent-french-poultry-pledge',
      title: 'Farm to Fryer: Our 100% French Poultry Pledge',
      titleFr: 'De la Ferme à la Friteuse : Notre Engagement Volaille 100% Française',
      slug: 'farm-to-fryer-our-100-percent-french-poultry-pledge',
      publishedAt: '2026-10-12T09:15:00.000Z',
      excerpt: 'Why we exclusively partner with regional French family farms to source certified free-range poultry with complete traceability.',
      excerptFr: 'Pourquoi nous travaillons exclusivement avec des élevages familiaux français pour garantir une volaille fermière traçable.',
      mainImageAssetId: chickenMealAssetId || friedChickensAssetId,
      mainImageAlt: 'Freshly prepared chicken meal with wholesome ingredients',
      categoryIds: ['category-farm-to-kitchen-quality', 'category-chefs-kitchen-stories'],
      body: [
        block('At a time when mass-market chains rely on imported frozen poultry, CFC made a founding promise in 2011: 100% of our chicken would be raised on French farms with access to open pastures and vegetarian feed.'),
        block('Why Sourcing Dictates Crunch', 'h2'),
        block('High-water-content industrial poultry releases steam when dropped into hot oil, which turns the batter soggy. Our free-range French chicken is denser, naturally tender, and retains its natural juices while frying without boiling the batter from the inside out.'),
        bullet('100% Born, Raised, and Processed in France'),
        bullet('Fed on non-GMO grains and French cereals'),
        bullet('Daily refrigerated deliveries — zero freezing, zero compromises'),
        blockquote('“You cannot mask inferior chicken with spices. Great fried chicken starts on the farm.”'),
        ...(chickenMealAssetId ? [imageBlock(chickenMealAssetId, 'Complete Chicken Meal presentation', 'Pure ingredients: Whole-muscle chicken fillets and fresh sides')] : []),
        block('Sustainable Kitchens for the Future', 'h2'),
        block('Every CFC location recycles 100% of our frying oil into certified eco-biofuel, and our packaging is entirely biodegradable and FSC-certified.'),
      ],
      bodyFr: [
        block('À une époque où la restauration rapide standardisée dépend de viandes surgelées importées, CFC a posé un engagement non négociable dès 2011 : 100% de notre volaille provient d\'élevages français privilégiant le plein air et une alimentation saine.'),
        block('Pourquoi le Terroir Détermine le Croustillant', 'h2'),
        block('Les volailles industrielles gorgées d\'eau libèrent de la vapeur dans l\'huile chaude, ce qui détrempe la panure de l\'intérieur. Notre poulet fermier français, plus dense et naturellement tendre, conserve son jus sans détruire la texture aérienne de la croûte.'),
        bullet('100% Né, Élevé et Préparé en France'),
        bullet('Alimentation garantie sans OGM, à base de céréales françaises'),
        bullet('Livraisons fraîches quotidiennes : zéro congélation, zéro compromis'),
        blockquote('« Aucune épice ne peut masquer un poulet de seconde zone. Le grand poulet frit commence toujours dans les élevages. »'),
        ...(chickenMealAssetId ? [imageBlock(chickenMealAssetId, 'Présentation du Repas Poulet', 'Des ingrédients nobles : vrais filets de poulet et accompagnements frais')] : []),
        block('Des Cuisines Engagées pour l\'Avenir', 'h2'),
        block('Chaque restaurant recycle l\'intégralité de ses huiles de friture en biocarburant certifié, et nos emballages sont entièrement biodégradables et labellisés FSC.'),
      ],
    },

    // =========================================================================
    // POST 6: Ultimate Game Day Sharing Bucket Guide
    // =========================================================================
    {
      _id: 'post-the-ultimate-game-day-sharing-bucket-guide',
      title: 'The Ultimate Game Day Sharing Bucket Guide',
      titleFr: 'Le Guide Ultime du Bucket à Partager pour les Soirs de Match',
      slug: 'the-ultimate-game-day-sharing-bucket-guide',
      publishedAt: '2026-10-08T18:00:00.000Z',
      excerpt: 'Hosting a watch party or family feast? Here is the playbook for portioning, dipping combos, and keeping your chicken piping hot.',
      excerptFr: 'Soirée match ou fête de famille ? Voici le guide idéal pour bien doser les portions, associer les sauces et garder votre poulet brûlant.',
      mainImageAssetId: cfcBucketAssetId || friedChickensAssetId,
      mainImageAlt: 'CFC Signature Chicken Bucket filled with tenders and drumsticks',
      categoryIds: ['category-feasts-sharing-buckets', 'category-crispy-fried-chicken'],
      body: [
        block('Nothing brings friends together like a loaded CFC bucket in the center of the table. Whether you are watching a rugby final or celebrating a birthday, a proper feast requires strategy.'),
        block('The Golden Ratio of Wings, Tenders & Drumsticks', 'h2'),
        block('Our 30-piece Family Feast Bucket is curated to please every preference in your crew:'),
        bullet('12 Crousty Tenders: Pure whole-muscle white meat for easy dipping'),
        bullet('10 Dynamic Wings: Crispy skin and succulent bone-in flavor'),
        bullet('8 Golden Drumsticks: Rich dark meat seasoned with Bordeaux herbs'),
        bullet('4 Large Dipping Pots: A variety of sweet, spicy, and creamy flavors'),
        blockquote('“The secret to party chicken is ventilation. Never snap the lid tight on hot chicken — let the steam escape so the crust stays shatteringly crisp.”'),
        ...(cfcBucketAssetId ? [imageBlock(cfcBucketAssetId, 'Signature CFC Bucket', 'The original CFC party bucket loaded for game day')] : []),
        block('Side Pairings That Elevate the Feast', 'h2'),
        block('Pair your bucket with our hand-cut cajun fries, crunchy pickled slaw, and chilled craft cider for the quintessential CFC banquet.'),
      ],
      bodyFr: [
        block('Rien ne rassemble plus que le grand bucket CFC posé au milieu de la table. Que ce soit pour une finale de rugby à Chaban-Delmas ou un anniversaire entre amis, un festin digne de ce nom demande un minimum de stratégie culinaire.'),
        block('Le Ratio d\'Or entre Wings, Tenders et Pilons', 'h2'),
        block('Notre Bucket Famille 30 pièces a été pensé pour combler toutes les envies de votre tablée :'),
        bullet('12 Crousty Tenders : Filets entiers tendres et parfaits pour tremper dans les sauces'),
        bullet('10 Dynamic Wings : Peau craquante et chair juteuse avec toute la saveur de l\'os'),
        bullet('8 Pilons Dorés : Morceaux généreux assaisonnés de nos herbes aromatiques de Gironde'),
        bullet('4 Grands Pots de Sauces : Un assortiment équilibré entre douceur, piquant et onctuosité'),
        blockquote('« Le secret d\'un poulet qui garde son croustillant en soirée : l\'aération. Ne fermez jamais hermétiquement le couvercle d\'un bucket fumant pour laisser s\'échapper la buée. »'),
        ...(cfcBucketAssetId ? [imageBlock(cfcBucketAssetId, 'Bucket Signature CFC', 'Le bucket culte des soirs de match à Bordeaux')] : []),
        block('Les Accompagnements Qui Subliment le Festin', 'h2'),
        block('Accompagnez votre bucket de nos frites au sel cajun, de notre coleslaw mariné croquant et d\'un thé glacé maison pour une expérience conviviale mémorable.'),
      ],
    },

    // =========================================================================
    // POST 7: Flambéed Wings - Turning Heat into Gastronomy
    // =========================================================================
    {
      _id: 'post-flambeed-wings-turning-heat-into-gastronomy',
      title: 'Flambéed Wings: Turning Heat into High Gastronomy',
      titleFr: 'Wings Flambés : Quand le Piment Devient Haute Gastronomie',
      slug: 'flambeed-wings-turning-heat-into-gastronomy',
      publishedAt: '2026-10-04T14:20:00.000Z',
      excerpt: 'How our spicy wings flambe combines aged French spirits and fermented chili oil for an aromatic kick that lingers beautifully.',
      excerptFr: 'Comment nos wings flambés épicés marient spiritueux français et huile de piment fermenté pour une explosion aromatique unique.',
      mainImageAssetId: wingsFlambeAssetId || spicyWingsAssetId,
      mainImageAlt: 'Wings Flambe Epice seasoned with fresh chili and herbs',
      categoryIds: ['category-tenders-wings-mastery', 'category-secret-recipes-spices'],
      body: [
        block('Spice should never be a stunt. When we formulated the recipe for Wings Flambé Épicé, our goal was complex layered heat that enhances the poultry rather than overpowering your tastebuds.'),
        block('The Fermentation Secret', 'h2'),
        block('We start with locally grown red cayenne and habanero chilies fermented for 60 days in oak barrels with garlic and sea salt. This natural lacto-fermentation develops complex fruity notes with a pleasant, tingling acidity.'),
        bullet('Flash-seared at 180°C for blistering crisp skin'),
        bullet('Tossed in house-rendered chili butter reduction'),
        bullet('Finished with fresh scallions and toasted sesame'),
        blockquote('“Heat without depth is just pain. When done right, chili unlocks aromatic terpenes that make chicken taste twice as savory.”'),
        ...(wingsFlambeAssetId ? [imageBlock(wingsFlambeAssetId, 'Wings Flambe Epice', 'Wings Flambé Épicé: Heat, butter, and oak-barrel aged chili')] : []),
        block('The Perfect Cool-Down', 'h2'),
        block('We recommend following up with our house Lemon-Mint Slush or vanilla brioche dessert to soothe your palate after a fiery basket.'),
      ],
      bodyFr: [
        block('Le piquant ne doit jamais être un défi stérile. Lorsque nous avons créé la recette des Wings Flambés Épicés, notre ambition était de développer une chaleur aromatique complexe qui prolonge les saveurs du poulet au lieu d\'anesthésier le palais.'),
        block('La Magie de la Fermentation en Fût', 'h2'),
        block('Tout commence par des piments habanero et de Cayenne fermentés pendant 60 jours en fûts de chêne avec de l\'ail frais et du sel de mer. Cette lacto-fermentation naturelle révèle des notes fruitées envoûtantes et une acidité vibrante.'),
        bullet('Saisis à 180°C pour une peau croustillante et caramélisée'),
        bullet('Nappés d\'une réduction chaude de beurre pimenté maison'),
        bullet('Parsemés de ciboulette fraîche ciselée et de graines de sésame grillées'),
        blockquote('« Un piquant sans nuance n\'est qu\'une brûlure. Maîtrisé avec justesse, le piment libère des terpènes qui décuplent la gourmandise de la viande. »'),
        ...(wingsFlambeAssetId ? [imageBlock(wingsFlambeAssetId, 'Wings Flambés Épicés', 'Wings Flambés Épicés : Beurre clarifié, piment vieilli en fût et herbes fraîches')] : []),
        block('La Touche de Fraîcheur Idéale', 'h2'),
        block('Pour clore cette dégustation enflammée, rien ne vaut notre limonade maison menthe-citron givrée ou une bouchée de brioche perdue vanillée.'),
      ],
    },

    // =========================================================================
    // POST 8: The Bordeaux Story - How CFC Redefined Fast Food
    // =========================================================================
    {
      _id: 'post-the-bordeaux-story-how-cfc-redefined-french-fast-food',
      title: 'The Bordeaux Story: How CFC Redefined French Fast Food',
      titleFr: 'L\'Histoire Bordelaise : Comment CFC a Révolutionné la Street Food',
      slug: 'the-bordeaux-story-how-cfc-redefined-french-fast-food',
      publishedAt: '2026-09-28T11:00:00.000Z',
      excerpt: 'From a modest kitchen on Rue Sainte-Catherine in 2011 to a regional crunch phenomenon. The story behind our crispy chicken revolution.',
      excerptFr: 'D\'une modeste cuisine en 2011 à un phénomène régional du croustillant. Découvrez les coulisses de notre révolution du poulet frit.',
      mainImageAssetId: ambienceAssetId || friedChickensAssetId,
      mainImageAlt: 'CFC Restaurant Ambience and Dining Space',
      categoryIds: ['category-behind-the-crunch', 'category-french-street-food', 'category-our-story'],
      body: [
        block('In 2011, Bordeaux was famous for its grand cru wines, canelés, and Michelin-starred bistros. Fast casual dining was largely dominated by multinational chains serving industrial frozen patties. We believed French food lovers deserved better.'),
        block('Starting at the Capucins', 'h2'),
        block('With two commercial fryers and a handwritten chalkboard, we opened our doors with one simple thesis: what if fried chicken was treated with the same respect as French confit?'),
        bullet('Hand-cut every morning from regional fresh poultry'),
        bullet('Bespoke spice blends ground weekly in small batches'),
        bullet('Warm, welcoming hospitality that makes every guest feel at home'),
        blockquote('“We didn’t want to be the fastest; we wanted to be the crispiest, freshest, and most honest.”'),
        ...(ambienceAssetId ? [imageBlock(ambienceAssetId, 'Interior of Bordeaux Centre Flagship', 'Step inside our flagship kitchen where the crunch began in 2011')] : []),
        block('Looking Forward', 'h2'),
        block('With locations thriving across Gironde, our commitment remains intact: the pursuit of the ultimate crunch for every guest.'),
      ],
      bodyFr: [
        block('En 2011, Bordeaux était réputée pour ses grands crus, ses canelés et ses tables étoilées. La restauration rapide était alors dominée par des enseignes standardisées servant des viandes congelées d\'importation. Nous avions la conviction intime que les amateurs de bonne chère méritaient mieux.'),
        block('L\'Aventure des Capucins', 'h2'),
        block('Avec deux friteuses professionnelles et une ardoise écrite à la craie, nous avons ouvert nos portes avec une conviction forte : et si le poulet frit était préparé avec les mêmes égards qu\'un confit traditionnel ?'),
        bullet('Découpe à la main chaque matin de volailles fraîches de la région'),
        bullet('Assemblage hebdomadaire de nos 14 épices broyées en petits lots'),
        bullet('Un accueil chaleureux qui fait de chaque repas une vraie pause gourmande'),
        blockquote('« Nous ne cherchions pas à être les plus rapides ; nous voulions être les plus croustillants, les plus frais et les plus sincères. »'),
        ...(ambienceAssetId ? [imageBlock(ambienceAssetId, 'Intérieur de notre restaurant bordelais', 'Dans les coulisses où l\'histoire du croustillant a commencé en 2011')] : []),
        block('Tournés Vers l\'Avenir', 'h2'),
        block('Des Capucins à Talence, du Bouscat à Lormont, notre promesse n\'a pas changé : offrir à chaque invité le croustillant le plus mémorable.'),
      ],
    },

    // =========================================================================
    // POST 9: Buttermilk Brine - The Unsung Hero
    // =========================================================================
    {
      _id: 'post-buttermilk-brine-the-unsung-hero-of-tender-chicken',
      title: 'Why Buttermilk Brining Is Non-Negotiable in Our Kitchens',
      titleFr: 'Pourquoi le Saumurage au Babeurre est Incontournable dans Nos Cuisines',
      slug: 'why-buttermilk-brining-is-non-negotiable',
      publishedAt: '2026-09-22T08:30:00.000Z',
      excerpt: 'Explore the biochemical miracle of lactic acid and enzyme tenderization that keeps our chicken incomparably juicy.',
      excerptFr: 'Découvrez le secret biochimique de l\'acide lactique et des enzymes qui rendent notre poulet incomparablement juteux.',
      mainImageAssetId: tendersAssetId || stripsAssetId,
      mainImageAlt: 'Crousty Tenders glistening with golden crust',
      categoryIds: ['category-chefs-kitchen-stories', 'category-crispy-fried-chicken'],
      body: [
        block('Every home cook has experienced it: fried chicken that looks golden on the outside but turns dry and stringy inside. At CFC, that never happens — and the secret is our 24-hour buttermilk brine.'),
        block('The Chemistry of Tenderness', 'h2'),
        block('Unlike harsh vinegar or citrus marinades that can turn meat mushy, buttermilk contains gentle lactic acid that tenderizes muscle fibers without compromising their cellular structure:'),
        bullet('Lactic acid gradually softens exterior protein strands'),
        bullet('Natural calcium activates endogenous enzymes within the poultry'),
        bullet('The slightly acidic medium holds moisture inside during high-temperature frying'),
        blockquote('“Buttermilk is nature’s best seasoning conduit. It carries garlic, rosemary, and sea salt deep into the core of the chicken.”'),
        ...(stripsAssetId ? [imageBlock(stripsAssetId, 'Tender strips in buttermilk dredge', 'Every tender spends 24 hours absorbing savory buttermilk aromatics')] : []),
        block('Taste the Difference', 'h2'),
        block('Bite into any of our Crousty Tenders and you will see the glistening juice that only a true buttermilk bath can deliver.'),
      ],
      bodyFr: [
        block('Tout amateur de cuisine l\'a déjà vécu : un poulet qui semble bien doré à l\'extérieur mais s\'avère sec et filandreux sous la dent. Chez CFC, cela n\'arrive jamais, et le secret tient en deux mots : le saumurage au babeurre pendant 24 heures.'),
        block('La Chimie de la Tendreté', 'h2'),
        block('Contrairement aux marinades agressives au vinaigre ou au citron qui détruisent la chair, le babeurre renferme un acide lactique délicat qui assouplit les fibres musculaires sans altérer leur texture :'),
        bullet('L\'acide lactique détend progressivement les protéines extérieures'),
        bullet('Le calcium naturel stimule les enzymes tendres au cœur du filet'),
        bullet('Le milieu lacté retient l\'humidité naturelle lors de la friture à haute température'),
        blockquote('« Le babeurre est le meilleur vecteur d\'arômes naturel qui soit. Il diffuse l\'ail, le romarin et le sel marin jusqu\'au cœur même de la viande. »'),
        ...(stripsAssetId ? [imageBlock(stripsAssetId, 'Filets de poulet en marinade de babeurre', 'Chaque tender s\'imprègne pendant 24h des arômes du babeurre et des herbes')] : []),
        block('Savourer la Différence', 'h2'),
        block('Dès la première bouchée dans nos Crousty Tenders, le jus perle instantanément sous la croûte dorée. Une jutosité que seul un véritable bain de babeurre peut garantir.'),
      ],
    },
  ];

  for (const post of posts) {
    const postDoc = {
      _id: post._id,
      _type: 'post',
      title: post.title,
      titleFr: post.titleFr || post.title,
      slug: { _type: 'slug', current: post.slug },
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      excerptFr: post.excerptFr || post.excerpt,
      categories: post.categoryIds.map((catId) => ({
        _type: 'reference',
        _ref: catId,
        _key: genKey(),
      })),
      ...(post.mainImageAssetId && {
        mainImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: post.mainImageAssetId,
          },
          alt: post.mainImageAlt,
        },
      }),
      body: post.body,
      bodyFr: post.bodyFr || post.body,
    };

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const res = await client.createOrReplace(postDoc);
        console.log(`✅ Uploaded / Replaced blog post: "${res.title}" | "${res.titleFr}"`);
        success = true;
      } catch (err) {
        if (attempt === 3) {
          console.error(`❌ Failed to upload post "${post.title}":`, err.message);
        } else {
          console.warn(`⚠️ Attempt ${attempt} failed for "${post.title}", retrying...`);
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }
  }

  console.log('\n🎉 Finished feeding all bilingual blog posts & categories to Sanity!');
}

seedBlogs().catch(console.error);
