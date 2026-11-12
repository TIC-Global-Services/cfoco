import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
  });
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-16';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error('Missing projectId or token');
  process.exit(1);
}

const BASE_URL = `https://${projectId}.api.sanity.io/v${apiVersion}`;

// Helper: execute mutations
async function mutate(mutations) {
  const url = `${BASE_URL}/data/mutate/${dataset}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`Sanity Mutation Error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

// Helper: upload image asset
async function uploadImage(localRelativePath, filename) {
  const fullPath = resolve(__dirname, '../public', localRelativePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const buffer = fs.readFileSync(fullPath);
  const uploadUrl = `${BASE_URL}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`;

  console.log(`📤 Uploading image to Sanity: ${filename}...`);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
      Authorization: `Bearer ${token}`,
    },
    body: buffer,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Image Upload Error: ${JSON.stringify(data.error)}`);
  }
  console.log(`   ✅ Uploaded: ${filename} -> ${data.document._id}`);
  return data.document;
}

// Unique key generator for portable text
let keyIndex = 1;
function genKey() {
  return `k_${Date.now()}_${keyIndex++}`;
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

async function run() {
  console.log(`🚀 Adding CFOCO News & Blog content to Sanity (${dataset})...\n`);

  // 1. Category: Notre histoire
  console.log('\n--- Step 2: Category ---');
  const categoryDoc = {
    _id: 'category-notre-histoire',
    _type: 'category',
    title: 'Notre histoire',
    slug: { _type: 'slug', current: 'notre-histoire' },
    description: "De l'ouverture aux Capucins en 2011 à la franchise CFOCO.",
  };
  await mutate([{ createOrReplace: categoryDoc }]);
  console.log('✅ Category created/updated: "Notre histoire"');

  // 3. Upload extracted images from public/blogs/
  console.log('\n--- Step 3: Upload Images to Sanity Asset Store ---');
  const image1 = await uploadImage('blogs/cfc-capucins-rituel.png', 'cfc-capucins-rituel.png');
  const image2 = await uploadImage('blogs/cfc-growth-timeline-2011-2025.jpg', 'cfc-growth-timeline-2011-2025.jpg');
  const image3 = await uploadImage('blogs/cfoco-lormont-tech-robot.png', 'cfoco-lormont-tech-robot.png');
  const image4 = await uploadImage('blogs/cfoco-danax-supply-chain.jpg', 'cfoco-danax-supply-chain.jpg');
  const image5 = await uploadImage('blogs/cfoco-big-family-feast.png', 'cfoco-big-family-feast.png');
  const image6 = await uploadImage('blogs/cfoco-restaurant-exterior.jpg', 'cfoco-restaurant-exterior.jpg');
  const image7 = await uploadImage('blogs/cfoco-crispy-flambe-bucket.png', 'cfoco-crispy-flambe-bucket.png');

  // 4. Construct Portable Text Body
  console.log('\n--- Step 4: Constructing Rich Body ---');
  const body = [
    // Intro & Surtitre
    block('NOTRE HISTOIRE · DEPUIS 2011', 'h4'),
    block('Un restaurant. Une friteuse. Une obsession.', 'h2'),
    block(
      'Toute marque a un premier jour. Le nôtre sentait l’huile chaude, le poulet frais et beaucoup de trac. En 2011, Nazim Puthan ouvre un restaurant de poulet frit près du marché des Capucins, à Bordeaux (33000). Il l’appelle CFC.'
    ),
    block(
      'Pas de plan de franchise, pas de borne, pas de robot. Juste une promesse : un poulet croustillant dehors, fondant dedans, à chaque fois. Quinze ans, cinq restaurants et plus de deux millions de repas plus tard, cette promesse porte un nouveau nom : CFOCO.'
    ),
    blockquote('« Crispy since 2011 », ce n’est pas un slogan. C’est une date dont nous sommes fiers.'),

    // Chapitre 1
    block('Chapitre 1 — Capucins, 2011 : là où tout a commencé', 'h2'),
    block(
      'Le premier CFC ouvre en 2011 place des Capucins, au cœur du plus ancien quartier de marché de Bordeaux. Une adresse de quartier, pour tous ceux qui cherchaient quelque chose de chaud, de frais et de généreux.'
    ),
    imageBlock(
      image1._id,
      'De la friteuse au bucket : le rituel CFC depuis le premier jour',
      'De la friteuse au bucket : le rituel CFC depuis le premier jour.'
    ),
    block('Dès le départ, Nazim refuse les raccourcis :'),
    bullet('Uniquement du poulet frais, origine France et Belgique'),
    bullet('Des circuits courts et traçables : moins de kilomètres, une viande plus ferme et plus savoureuse'),
    bullet('Croustillant dehors, fondant dedans, à chaque morceau'),
    bullet('Halal, généreux et à prix juste, pour que chacun ait sa place à table'),
    block(
      'Le bouche-à-oreille a fait le reste. La file d’attente devant les Capucins est devenue la meilleure publicité de CFC.'
    ),

    // Chapitre 2
    block('Chapitre 2 — D’un restaurant à cinq', 'h2'),
    block('Pendant 12 ans, nous avons grandi un restaurant à la fois, en les gérant tous nous-mêmes.'),
    imageBlock(
      image2._id,
      'Frise de croissance CFC · 2011–2025',
      'Frise de croissance CFC · 2011–2025'
    ),
    bullet('2011 — Capucins, Bordeaux. Là où tout a commencé.'),
    bullet('2013 — Bordeaux. Un deuxième restaurant ouvre à Bordeaux, tout près des Capucins.'),
    bullet('2016 — Talence. CFC passe les limites de la ville.'),
    bullet('2019 — Le Bouscat. La famille s’agrandit.'),
    bullet('2023 — Lormont. Notre premier restaurant robotisé, futur modèle de la franchise.'),
    bullet('2025 — CFOCO. Un nouveau nom, pensé pour la franchise.'),
    block(
      'Chaque ouverture nous a appris quelque chose. Ces leçons sont devenues nos standards, puis la colonne vertébrale de la franchise.'
    ),

    // Chapitre 3
    block('Chapitre 3 — Lormont, 2023 : le restaurant du futur', 'h2'),
    block(
      'En 2023, nous savions faire un excellent poulet. La question suivante : comment rendre toute l’expérience aussi bonne que ce qu’il y a dans l’assiette ? La réponse a ouvert à Lormont : notre premier restaurant robotisé, et le modèle de tous les CFOCO à venir.'
    ),
    imageBlock(
      image3._id,
      'Commandez à la borne, payez en quelques secondes, et un robot vous apporte votre plateau à table',
      'Commandez à la borne, payez en quelques secondes, et un robot vous apporte votre plateau à table.'
    ),
    block('Ce qui change pour nos clients :'),
    bullet('Bornes de commande et commande mobile : tout le menu, personnalisable, sans file d’attente'),
    bullet('Paiement fluide : carte, téléphone ou espèces sur bornes automatiques'),
    bullet('Suivi de commande en temps réel à l’écran'),
    bullet('Service à table par robot : votre commande arrive directement à votre table'),
    block(
      'Ce qui change en coulisses : tout le restaurant est piloté en direct depuis un seul tableau de bord, sur téléphone. Qualité, stock, hygiène, rapidité et maintenance. Moins d’erreurs, un service plus rapide, et plus de temps pour l’équipe auprès des clients.'
    ),
    block(
      'Lormont a prouvé que la technologie et un accueil chaleureux vont de pair. C’est devenu le modèle de la franchise CFOCO.'
    ),

    // Chapitre 4
    block('Chapitre 4 — Le système derrière le croustillant', 'h2'),
    block(
      'Un grand restaurant commence bien avant la friteuse. En grandissant, nous avons créé Danax Group, notre propre centrale d’achat, pour maîtriser la qualité et la fraîcheur de la ferme à la cuisine.'
    ),
    imageBlock(
      image4._id,
      'Achat, transport, stockage, cuisine : une seule chaîne d’approvisionnement Danax Group',
      'Achat, transport, stockage, cuisine : une seule chaîne d’approvisionnement, gérée par le groupe, pour tous les restaurants.'
    ),
    block('Ce que ça change dans votre assiette :'),
    bullet('Des circuits courts et traçables : volaille fraîche de France et de Belgique'),
    bullet('La même qualité dans chaque restaurant, où que vous alliez'),
    bullet('Des prix justes, parce qu’un bon restaurant commence par de bons achats'),
    block(
      'Une base de produits commune, une infinité de combinaisons : les mêmes produits frais, associés à différentes sauces et recettes, donnent des centaines de combinaisons. Tenders, wings, nuggets, buckets, riz box, flambés, wraps, tacos, burgers, salades et shakes.'
    ),
    imageBlock(
      image5._id,
      'Le Big Family : fait pour être partagé',
      'Le Big Family : fait pour être partagé.'
    ),

    // Chapitre 5
    block('Chapitre 5 — 2025 : CFC devient CFOCO', 'h2'),
    block(
      'Après 14 ans à gérer nous-mêmes chaque restaurant, nous étions prêts à partager ce que nous avions construit. En 2025, CFC devient CFOCO : un nouveau nom pour un nouveau chapitre, celui du développement en franchise.'
    ),
    imageBlock(
      image6._id,
      'Le style CFOCO : la nouvelle génération de nos restaurants',
      'Le style CFOCO : la nouvelle génération de nos restaurants.'
    ),
    block(
      'Le nouveau nom garde nos racines et ouvre la porte à des partenaires qui partagent nos exigences. Chaque franchisé reçoit le système complet :'
    ),
    bullet('Des standards opérationnels issus de 15 ans d’exploitation de vrais restaurants'),
    bullet('Les achats groupés via Danax'),
    bullet('Le modèle digital de Lormont : bornes, robots serveurs et pilotage à distance'),
    bullet('Un accompagnement à chaque étape, de l’étude d’emplacement à l’ouverture, et au-delà'),
    block('Pas besoin d’être chef. Il suffit de partager l’obsession.'),
    block('Deux millions de repas plus tard', 'h3'),
    block(
      'Aujourd’hui, CFOCO a servi plus de deux millions de repas en Gironde, des Capucins à Talence, au Bouscat et à Lormont. Les bornes sont nouvelles, les robots aussi, le nom aussi. Le poulet, lui, est le même qu’au premier jour : frais, croustillant et préparé avec soin.'
    ),

    // Conclusion & Blocs d'appel à l'action
    block('Crispy since 2011. Avec vous.', 'h2'),
    imageBlock(
      image7._id,
      'Crispy since 2011. Avec vous.',
      'Crispy since 2011. Avec vous.'
    ),
    block('Blocs d’appel à l’action (pour la page) :'),
    bullet('Une petite faim ? → Découvrir notre menu'),
    bullet('Envie d’ouvrir un CFOCO ? → Devenir franchisé'),
    bullet('Partagez vos souvenirs CFC → Identifiez-nous sur Instagram avec votre plus ancienne photo CFC'),
  ];

  // 5. Build post document
  const postDoc = {
    _id: 'post-de-cfc-a-cfoco-notre-histoire',
    _type: 'post',
    title: 'De CFC à CFOCO : 15 ans de croustillant, nés à Bordeaux',
    slug: {
      _type: 'slug',
      current: 'de-cfc-a-cfoco-notre-histoire',
    },
    publishedAt: new Date().toISOString(),
    excerpt:
      'En 2011, Nazim Puthan ouvre un restaurant de poulet frit aux Capucins. 15 ans et 2 millions de repas plus tard, CFC devient CFOCO.',
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: image1._id,
      },
      alt: 'De la friteuse au bucket : rituel de préparation CFC aux Capucins depuis 2011',
    },
    categories: [
      {
        _key: genKey(),
        _type: 'reference',
        _ref: 'category-notre-histoire',
      },
    ],
    body,
  };

  console.log('\n--- Step 5: Publishing Post to Sanity ---');
  // Publish primary document
  await mutate([{ createOrReplace: postDoc }]);
  console.log(`✅ Published post created: "${postDoc._id}"`);

  // Also update/replace the previous draft that was started earlier (a84d15d9-1324-45fa-ad39-e48eba5cb782)
  // so that both studio and front-end have the clean content
  const draftUpdate = {
    ...postDoc,
    _id: 'drafts.a84d15d9-1324-45fa-ad39-e48eba5cb782',
  };
  await mutate([{ createOrReplace: draftUpdate }]);
  console.log('✅ Synchronized existing Studio draft document as well.');

  // Also publish a84d15d9-1324-45fa-ad39-e48eba5cb782 with the new content
  const publishedExisting = {
    ...postDoc,
    _id: 'a84d15d9-1324-45fa-ad39-e48eba5cb782',
  };
  await mutate([{ createOrReplace: publishedExisting }]);
  console.log('✅ Synchronized published version of the original ID.');

  console.log('\n🎉 ALL DONE! The blog post is completely added and live in Sanity!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

