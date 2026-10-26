import { createClient } from 'next-sanity';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
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
// 10 BLOG CATEGORIES
// ----------------------------------------------------------------------------
const categoriesData = [
  {
    _id: 'category-crispy-fried-chicken',
    title: 'Crispy Fried Chicken',
    slug: 'crispy-fried-chicken',
    description: 'The science, craft, and culinary secrets behind achieving the ultimate golden crunch.',
  },
  {
    _id: 'category-secret-recipes-spices',
    title: 'Secret Recipes & Spices',
    slug: 'secret-recipes-spices',
    description: 'Discover the artisanal 14-spice blend, buttermilk brines, and herb marinades.',
  },
  {
    _id: 'category-signature-burgers',
    title: 'Signature Burgers',
    slug: 'signature-burgers',
    description: 'Stacked crispy fillets, toasted brioche buns, and gourmet melted French cheeses.',
  },
  {
    _id: 'category-craft-sauces-dips',
    title: 'Craft Sauces & Dips',
    slug: 'craft-sauces-dips',
    description: 'House-made sauces from Spicy Mayo to Truffle Garlic — the art of dip pairing.',
  },
  {
    _id: 'category-chefs-kitchen-stories',
    title: "Chef's Kitchen Stories",
    slug: 'chefs-kitchen-stories',
    description: 'Culinary craftsmanship, kitchen life, and techniques direct from our head chefs.',
  },
  {
    _id: 'category-french-street-food',
    title: 'French Street Food',
    slug: 'french-street-food',
    description: 'Reimagining classic American comfort food through refined Bordeaux gastronomy.',
  },
  {
    _id: 'category-farm-to-kitchen-quality',
    title: 'Farm-to-Kitchen Quality',
    slug: 'farm-to-kitchen-quality',
    description: '100% French free-range poultry, ethical farm sourcing, and quality standards.',
  },
  {
    _id: 'category-tenders-wings-mastery',
    title: 'Tenders & Wings Mastery',
    slug: 'tenders-wings-mastery',
    description: 'Hand-breaded tenders, fiery wings, and succulent cuts cooked to perfection.',
  },
  {
    _id: 'category-feasts-sharing-buckets',
    title: 'Feasts & Sharing Buckets',
    slug: 'feasts-sharing-buckets',
    description: 'Family sharing boxes, game-day buckets, and party platters made for gatherings.',
  },
  {
    _id: 'category-behind-the-crunch',
    title: 'Behind The Crunch',
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

  // 1. Upload Author Image & Create Author
  const authorAssetId = await uploadLocalImage('avatar.jpg');
  const authorDoc = {
    _id: 'author-antoine-laurent',
    _type: 'author',
    name: 'Antoine Laurent',
    slug: { _type: 'slug', current: 'antoine-laurent' },
    role: 'Executive Chef & Culinary Director',
    bio: 'Antoine brings 15 years of French culinary discipline to the art of crispy fried chicken. He spent years obsessing over flour hydration, temperature thresholds, and spice blends to create CFC’s unmistakable shatter-crunch.',
    ...(authorAssetId && {
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: authorAssetId,
        },
      },
    }),
  };

  await client.createOrReplace(authorDoc);
  console.log(`✅ Author created: "${authorDoc.name}"`);

  // 2. Seed 10 Categories
  console.log('\n--- Seeding 10 Blog Categories ---');
  for (const cat of categoriesData) {
    const catDoc = {
      _id: cat._id,
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
    };
    await client.createOrReplace(catDoc);
    console.log(`✅ Category created: "${cat.title}"`);
  }

  // 3. Upload Menu & Chicken Images from public folder
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

  // 4. Seed 8 Rich Blog Posts
  console.log('\n--- Seeding Chicken & Menu Blog Posts ---');
  const posts = [
    // Post 1
    {
      _id: 'post-science-of-the-14-spice-crunch',
      title: 'The Science of the 14-Spice Bordeaux Crunch',
      slug: 'the-science-of-the-14-spice-crunch',
      publishedAt: '2026-10-22T12:00:00.000Z',
      excerpt: 'How temperature curves, double-dredging, and a proprietary botanical spice blend create the most satisfying crunch in France.',
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
    },

    // Post 2
    {
      _id: 'post-anatomy-of-our-quad-stack-burger',
      title: 'Inside the Quad Stack: The Anatomy of Our Iconic Burger',
      slug: 'inside-the-quad-stack-the-anatomy-of-our-iconic-burger',
      publishedAt: '2026-10-18T10:30:00.000Z',
      excerpt: 'Four crispy buttermilk fillets, double melted pepper jack, and toasted brioche. Here is why the Quad Stack has achieved legendary status.',
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
    },

    // Post 3
    {
      _id: 'post-sauce-alchemy-mastering-the-art-of-the-dip',
      title: 'Sauce Alchemy: Mastering the Art of the Dip',
      slug: 'sauce-alchemy-mastering-the-art-of-the-dip',
      publishedAt: '2026-10-15T15:45:00.000Z',
      excerpt: 'A great tender is only as good as its companion dip. Explore the flavor science behind our artisanal house-whipped sauces.',
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
    },

    // Post 4
    {
      _id: 'post-farm-to-fryer-our-100-percent-french-poultry-pledge',
      title: 'Farm to Fryer: Our 100% French Poultry Pledge',
      slug: 'farm-to-fryer-our-100-percent-french-poultry-pledge',
      publishedAt: '2026-10-12T09:15:00.000Z',
      excerpt: 'Why we exclusively partner with regional French family farms to source certified free-range poultry with complete traceability.',
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
    },

    // Post 5
    {
      _id: 'post-the-ultimate-game-day-sharing-bucket-guide',
      title: 'The Ultimate Game Day Sharing Bucket Guide',
      slug: 'the-ultimate-game-day-sharing-bucket-guide',
      publishedAt: '2026-10-08T18:00:00.000Z',
      excerpt: 'Hosting a watch party or family feast? Here is the playbook for portioning, dipping combos, and keeping your chicken piping hot.',
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
    },

    // Post 6
    {
      _id: 'post-flambeed-wings-turning-heat-into-gastronomy',
      title: 'Flambéed Wings: Turning Heat into High Gastronomy',
      slug: 'flambeed-wings-turning-heat-into-gastronomy',
      publishedAt: '2026-10-04T14:20:00.000Z',
      excerpt: 'How our spicy wings flambe combines aged French spirits and fermented chili oil for an aromatic kick that lingers beautifully.',
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
    },

    // Post 7
    {
      _id: 'post-the-bordeaux-story-how-cfc-redefined-french-fast-food',
      title: 'The Bordeaux Story: How CFC Redefined French Fast Food',
      slug: 'the-bordeaux-story-how-cfc-redefined-french-fast-food',
      publishedAt: '2026-09-28T11:00:00.000Z',
      excerpt: 'From a modest kitchen on Rue Sainte-Catherine in 2011 to a regional crunch phenomenon. The story behind our crispy chicken revolution.',
      mainImageAssetId: ambienceAssetId || friedChickensAssetId,
      mainImageAlt: 'CFC Restaurant Ambience and Dining Space',
      categoryIds: ['category-behind-the-crunch', 'category-french-street-food'],
      body: [
        block('In 2011, Bordeaux was known for its wine, canelés, and Michelin-starred bistros. Fast casual dining was largely dominated by multinational chains serving industrial frozen patties. We believed French food lovers deserved better.'),
        block('Starting on Rue Sainte-Catherine', 'h2'),
        block('With just two commercial fryers and a handwritten chalkboard, we opened our doors with one simple thesis: what if fried chicken was treated with the same respect as French confit?'),
        bullet('Hand-cut every morning from regional poultry'),
        bullet('Bespoke spice blends ground weekly in small batches'),
        bullet('Digital kiosks paired with welcoming table hospitality'),
        blockquote('“We didn’t want to be the fastest; we wanted to be the crispiest, freshest, and most honest.”'),
        ...(ambienceAssetId ? [imageBlock(ambienceAssetId, 'Interior of Bordeaux Centre Flagship', 'Step inside our flagship kitchen where the crunch began in 2011')] : []),
        block('Looking Forward', 'h2'),
        block('With kitchens now thriving in Mérignac, Bastide, Talence, and Pessac, our commitment remains unchanged: the pursuit of the ultimate crunch for every guest.'),
      ],
    },

    // Post 8
    {
      _id: 'post-buttermilk-brine-the-unsung-hero-of-tender-chicken',
      title: 'Why Buttermilk Brining Is Non-Negotiable in Our Kitchens',
      slug: 'why-buttermilk-brining-is-non-negotiable',
      publishedAt: '2026-09-22T08:30:00.000Z',
      excerpt: 'Explore the biochemical miracle of lactic acid and enzyme tenderization that keeps our chicken incomparably juicy.',
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
    },
  ];

  for (const post of posts) {
    const postDoc = {
      _id: post._id,
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      author: {
        _type: 'reference',
        _ref: 'author-antoine-laurent',
      },
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
    };

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const res = await client.createOrReplace(postDoc);
        console.log(`✅ Uploaded / Replaced blog post: "${res.title}"`);
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

  console.log('\n🎉 Finished feeding blog posts & categories to Sanity!');
}

seedBlogs().catch(console.error);
