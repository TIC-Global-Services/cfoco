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

if (!projectId) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is missing in .env.local');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: SANITY_API_WRITE_TOKEN or SANITY_API_READ_TOKEN is missing in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const defaultJobs = [
  {
    id: 'job-delivery-coordinator',
    role: 'Delivery Coordinator',
    roleFr: 'Coordinateur Livraison',
    location: 'Bordeaux Centre',
    type: 'Full & Part-Time',
    typeFr: 'Temps plein & partiel',
    youare: 'A Natural Leader, Organized, Not The Office.',
    youareFr: 'Un leader naturel, organisé, sur le terrain.',
    nicetohave: 'Team-Lead Or Supervisory Experience In Food/Retail.',
    nicetohaveFr: "Expérience en gestion d'équipe en restauration ou commerce.",
    hours: 'Full-Time, Rotating Shifts.',
    hoursFr: 'Temps plein, horaires tournants.',
    pay: 'Competitive Salary + Progression Path To Restaurant Manager.',
    payFr: 'Salaire attractif + évolution vers Manager de restaurant.',
    applyMethod: 'email',
    applyEmail: 'careers@cfoco.fr',
    applySubject: 'Application for {role} at {location}',
  },
  {
    id: 'job-store-supervisor',
    role: 'Store Supervisor',
    roleFr: 'Superviseur de Restaurant',
    location: 'Mérignac',
    type: 'Full-Time',
    typeFr: 'Temps plein',
    youare: 'A Natural Leader, Organized, Not The Office.',
    youareFr: 'Un leader naturel, organisé, sur le terrain.',
    nicetohave: 'Team-Lead Or Supervisory Experience In Food/Retail.',
    nicetohaveFr: "Expérience en gestion d'équipe en restauration ou commerce.",
    hours: 'Full-Time, Rotating Shifts.',
    hoursFr: 'Temps plein, horaires tournants.',
    pay: 'Competitive Salary + Progression Path To Restaurant Manager.',
    payFr: 'Salaire attractif + évolution vers Manager de restaurant.',
    applyMethod: 'email',
    applyEmail: 'careers@cfoco.fr',
    applySubject: 'Application for {role} at {location}',
  },  
];

async function seedJobs() {
  console.log('🚀 Starting Job Posts seeding for Sanity...\n');
  console.log(`📡 Target Project: ${projectId}`);
  console.log(`📦 Target Dataset: ${dataset}\n`);

  for (const job of defaultJobs) {
    const doc = {
      _id: job.id,
      _type: 'jobPost',
      role: job.role,
      roleFr: job.roleFr,
      location: job.location,
      type: job.type,
      typeFr: job.typeFr,
      youare: job.youare,
      youareFr: job.youareFr,
      nicetohave: job.nicetohave,
      nicetohaveFr: job.nicetohaveFr,
      hours: job.hours,
      hoursFr: job.hoursFr,
      pay: job.pay,
      payFr: job.payFr,
      applyMethod: job.applyMethod,
      applyEmail: job.applyEmail,
      applySubject: job.applySubject,
    };

    try {
      await client.createOrReplace(doc);
      console.log(`✅ Seeded job: "${job.role}" (${job.location}) [ID: ${doc._id}]`);
    } catch (err) {
      if (err.message?.includes('Insufficient permissions') || err.message?.includes('update required')) {
        console.error('\n❌ SANITY WRITE PERMISSION ERROR:');
        console.error('The token in .env.local only has "Viewer" (Read-Only) access.');
        console.error('Sanity requires an "Editor" or "Administrator" token to write or update documents.');
        console.error('\n👉 How to fix:');
        console.error('1. Open: https://sanity.io/manage');
        console.error(`2. Select project "${projectId}" -> API tab -> Tokens -> "Add API token"`);
        console.error('3. Name: "Seeder", Role: "Editor"');
        console.error('4. Copy the token and add to .env.local:');
        console.error('   SANITY_API_WRITE_TOKEN=sk...');
        console.error('5. Re-run: npm run seed:jobs\n');
        process.exit(1);
      }
      console.error(`❌ Failed job "${job.role}":`, err.message);
    }
  }

  console.log('\n🎉 Finished seeding Job Posts successfully!');
}

seedJobs().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
