import bcrypt from 'bcryptjs';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { config } from '../src/config.js';

export async function runSeed(connectionString?: string) {
  const connStr = connectionString || config.DATABASE_URL;
  const pool = new pg.Pool({ connectionString: connStr });
  const client = await pool.connect();

  try {
    console.log('Seeding database...');
    await client.query('BEGIN');

    // 1. Seed Demo User
    const passwordHash = await bcrypt.hash('demo12345', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, ['Demo User', 'demo@bookworm.local', passwordHash]);

    // 2. Seed Categories
    const categories = [
      { name: 'Self-help', sortOrder: 1 },
      { name: 'Science Fiction', sortOrder: 2 },
      { name: 'Mystery', sortOrder: 3 },
      { name: 'Romance', sortOrder: 4 },
      { name: 'Fantasy', sortOrder: 5 },
      { name: 'Biography', sortOrder: 6 },
      { name: 'Cooking', sortOrder: 7 },
      { name: 'Children\'s', sortOrder: 8 },
      { name: 'Poetry', sortOrder: 9 },
      { name: 'Science', sortOrder: 10 },
    ];

    const categoryMap = new Map<string, number>();
    for (const cat of categories) {
      const res = await client.query(`
        INSERT INTO categories (name, sort_order)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order
        RETURNING id, name
      `, [cat.name, cat.sortOrder]);
      categoryMap.set(res.rows[0].name, res.rows[0].id);
    }

    // 3. Seed Authors
    const authors = [
      {
        name: 'Daniel Reed',
        bio: 'Daniel Reed is an acclaimed author specializing in minimalism, productivity, and modern lifestyle philosophy.',
        photoUrl: '/covers/authors/daniel-reed.png',
      },
      {
        name: 'James Wright',
        bio: 'James Wright is an award-winning science fiction writer fascinated by deep space exploration and quantum physics.',
        photoUrl: '/covers/authors/james-wright.png',
      },
      {
        name: 'Arjun Patel',
        bio: 'Arjun Patel writes gripping mystery novels set in vibrant metropolitan backdrops.',
        photoUrl: '/covers/authors/arjun-patel.png',
      },
      {
        name: 'Raj Patel',
        bio: 'Raj Patel is a chef and culinary historian celebrating traditional regional recipes and street food culture.',
        photoUrl: '/covers/authors/raj-patel.png',
      },
      {
        name: 'James Adams',
        bio: 'James Adams is a theoretical physicist and science communicator dedicated to making astrophysics accessible.',
        photoUrl: '/covers/authors/james-adams.png',
      },
      {
        name: 'Jessica Martin',
        bio: 'Jessica Martin crafts heartwarming contemporary romance novels with rich character relationships.',
        photoUrl: '/covers/authors/jessica-martin.png',
      },
      {
        name: 'Laura Mitchell',
        bio: 'Laura Mitchell is a fantasy author renowned for immersive world-building and epic mythologies.',
        photoUrl: '/covers/authors/laura-mitchell.png',
      },
      {
        name: 'Clara Nelson',
        bio: 'Clara Nelson is a biographer and historian who brings the personal lives of pivotal figures to light.',
        photoUrl: '/covers/authors/clara-nelson.png',
      },
      {
        name: 'Emily Parker',
        bio: 'Emily Parker is a poet and essayist exploring human resilience, nature, and the quiet moments of life.',
        photoUrl: '/covers/authors/emily-parker.png',
      },
      {
        name: 'Sophie Dubois',
        bio: 'Sophie Dubois creates whimsical, beautifully illustrated children stories loved by families worldwide.',
        photoUrl: '/covers/authors/sophie-dubois.png',
      },
    ];

    const authorMap = new Map<string, number>();
    for (const auth of authors) {
      const res = await client.query(`
        INSERT INTO authors (name, bio, photo_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET bio = EXCLUDED.bio, photo_url = EXCLUDED.photo_url
        RETURNING id, name
      `, [auth.name, auth.bio, auth.photoUrl]);
      authorMap.set(res.rows[0].name, res.rows[0].id);
    }

    // 4. Seed Books (30+ books)
    const books = [
      {
        title: 'The Joy of Minimalism',
        author: 'Daniel Reed',
        category: 'Self-help',
        publisher: 'Vintage Books',
        format: 'Paperback',
        description: 'A transformative guide to decluttering your physical space, clearing mental noise, and focusing on what truly matters.',
        priceCents: 1899,
        coverUrl: '/covers/joy-of-minimalism.png',
        sortOrder: 1,
      },
      {
        title: 'Digital Serenity',
        author: 'Daniel Reed',
        category: 'Self-help',
        publisher: 'Vintage Books',
        format: 'Hardcover',
        description: 'Practical strategies to reclaim your attention and build a healthy relationship with technology.',
        priceCents: 2499,
        coverUrl: '/covers/digital-serenity.png',
        sortOrder: 2,
      },
      {
        title: 'The Habit Loop Blueprint',
        author: 'Daniel Reed',
        category: 'Self-help',
        publisher: 'Penguin Life',
        format: 'Paperback',
        description: 'Master the subtle triggers and routines that shape everyday decisions and sustainable personal growth.',
        priceCents: 1650,
        coverUrl: '/covers/habit-loop-blueprint.png',
        sortOrder: 3,
      },
      {
        title: 'Mindful Morning Rituals',
        author: 'Daniel Reed',
        category: 'Self-help',
        publisher: 'Harmony Press',
        format: 'Paperback',
        description: 'Start every day with intention, energy, and peace through simple ten-minute mindfulness practices.',
        priceCents: 1499,
        coverUrl: '/covers/mindful-morning-rituals.png',
        sortOrder: 4,
      },
      {
        title: 'Echoes of Andromeda',
        author: 'James Wright',
        category: 'Science Fiction',
        publisher: 'Orbit Books',
        format: 'Hardcover',
        description: 'When a deep-space research vessel encounters an ancient alien transmitter, humanity is forced to confront its true cosmic origin.',
        priceCents: 2799,
        coverUrl: '/covers/echoes-of-andromeda.png',
        sortOrder: 5,
      },
      {
        title: 'The Quantum Paradox',
        author: 'James Wright',
        category: 'Science Fiction',
        publisher: 'Orbit Books',
        format: 'Paperback',
        description: 'A rogue physicist discovers a tear in spacetime and must prevent parallel realities from colliding.',
        priceCents: 1950,
        coverUrl: '/covers/quantum-paradox.png',
        sortOrder: 6,
      },
      {
        title: 'Station Horizon 9',
        author: 'James Wright',
        category: 'Science Fiction',
        publisher: 'Tor Books',
        format: 'Paperback',
        description: 'Isolation and mystery unfold on an orbital outpost mining rare dark matter isotopes at the edge of the solar system.',
        priceCents: 1799,
        coverUrl: '/covers/station-horizon-9.png',
        sortOrder: 7,
      },
      {
        title: 'Sublight Odyssey',
        author: 'James Wright',
        category: 'Science Fiction',
        publisher: 'Tor Books',
        format: 'Hardcover',
        description: 'A multi-generational interstellar expedition battles mutiny and resource scarcity on a centuries-long voyage.',
        priceCents: 2999,
        coverUrl: '/covers/sublight-odyssey.png',
        sortOrder: 8,
      },
      {
        title: 'Midnight in Whitechapel',
        author: 'Arjun Patel',
        category: 'Mystery',
        publisher: 'HarperCollins',
        format: 'Paperback',
        description: 'Detective Inspector Kabir investigates a series of cryptic midnight thefts targeting antique timepieces with dark secrets.',
        priceCents: 1599,
        coverUrl: '/covers/midnight-in-whitechapel.png',
        sortOrder: 9,
      },
      {
        title: 'The Silent Witness of Prague',
        author: 'Arjun Patel',
        category: 'Mystery',
        publisher: 'HarperCollins',
        format: 'Hardcover',
        description: 'An atmospheric noir thriller trailing an art conservator caught in a web of historical espionage and murder.',
        priceCents: 2350,
        coverUrl: '/covers/silent-witness-prague.png',
        sortOrder: 10,
      },
      {
        title: 'Shadows over the Bosphorus',
        author: 'Arjun Patel',
        category: 'Mystery',
        publisher: 'Bantam Crime',
        format: 'Paperback',
        description: 'A retired intelligence officer is drawn into a lethal game of chess across the backstreets of Istanbul.',
        priceCents: 1699,
        coverUrl: '/covers/shadows-bosphorus.png',
        sortOrder: 11,
      },
      {
        title: 'The Stolen Sonata',
        author: 'Arjun Patel',
        category: 'Mystery',
        publisher: 'Bantam Crime',
        format: 'Paperback',
        description: 'A vanished concert pianist and an encrypted musical score leave a trail of baffling clues across Vienna.',
        priceCents: 1499,
        coverUrl: '/covers/stolen-sonata.png',
        sortOrder: 12,
      },
      {
        title: 'Spices of the Silk Road',
        author: 'Raj Patel',
        category: 'Cooking',
        publisher: 'Bloomsbury Cookery',
        format: 'Hardcover',
        description: 'An aromatic journey through over 100 authentic heritage recipes spanning Persia, India, and Central Asia.',
        priceCents: 3499,
        coverUrl: '/covers/spices-silk-road.png',
        sortOrder: 13,
      },
      {
        title: 'The Modern Tandoor',
        author: 'Raj Patel',
        category: 'Cooking',
        publisher: 'Bloomsbury Cookery',
        format: 'Hardcover',
        description: 'Innovative contemporary techniques for creating smoky, tender, and vibrant street foods in your home kitchen.',
        priceCents: 2850,
        coverUrl: '/covers/modern-tandoor.png',
        sortOrder: 14,
      },
      {
        title: 'Artisan Breads & Chutneys',
        author: 'Raj Patel',
        category: 'Cooking',
        publisher: 'Ten Speed Press',
        format: 'Paperback',
        description: 'A celebration of leavened flatbreads, crispy naans, and tangy seasonal relishes.',
        priceCents: 2199,
        coverUrl: '/covers/artisan-breads-chutneys.png',
        sortOrder: 15,
      },
      {
        title: 'The Cosmos Explained',
        author: 'James Adams',
        category: 'Science',
        publisher: 'Oxford University Press',
        format: 'Hardcover',
        description: 'An elegant, exhilarating tour of black holes, dark energy, gravitational waves, and the fate of the universe.',
        priceCents: 2699,
        coverUrl: '/covers/cosmos-explained.png',
        sortOrder: 16,
      },
      {
        title: 'Principles of Modern Physics',
        author: 'James Adams',
        category: 'Science',
        publisher: 'Oxford University Press',
        format: 'Paperback',
        description: 'A clear conceptual breakdown of relativity, thermodynamics, and quantum mechanics for inquisitive minds.',
        priceCents: 1999,
        coverUrl: '/covers/principles-modern-physics.png',
        sortOrder: 17,
      },
      {
        title: 'Origins of Starlight',
        author: 'James Adams',
        category: 'Science',
        publisher: 'Cambridge Science',
        format: 'Hardcover',
        description: 'How cosmic dust and early nucleosynthesis forged every element essential for conscious life.',
        priceCents: 3100,
        coverUrl: '/covers/origins-of-starlight.png',
        sortOrder: 18,
      },
      {
        title: 'Letters from Provence',
        author: 'Jessica Martin',
        category: 'Romance',
        publisher: 'St. Martin\'s Press',
        format: 'Paperback',
        description: 'A heartwarming story of second chances amidst sun-drenched vineyards and fragrant lavender fields.',
        priceCents: 1450,
        coverUrl: '/covers/letters-from-provence.png',
        sortOrder: 19,
      },
      {
        title: 'Autumn in Manhattan',
        author: 'Jessica Martin',
        category: 'Romance',
        publisher: 'St. Martin\'s Press',
        format: 'Paperback',
        description: 'Two rival bookshop owners find unexpected companionship during a rain-swept November in Greenwich Village.',
        priceCents: 1599,
        coverUrl: '/covers/autumn-in-manhattan.png',
        sortOrder: 20,
      },
      {
        title: 'Sunset over Amalfi',
        author: 'Jessica Martin',
        category: 'Romance',
        publisher: 'Ballantine Books',
        format: 'Hardcover',
        description: 'An unforgettable summer romance sparked along the rugged cliffs of the southern Italian coastline.',
        priceCents: 2299,
        coverUrl: '/covers/sunset-over-amalfi.png',
        sortOrder: 21,
      },
      {
        title: 'The Crown of Starlight',
        author: 'Laura Mitchell',
        category: 'Fantasy',
        publisher: 'Gollancz',
        format: 'Hardcover',
        description: 'An exiled sorceress and a disgraced knight must unite disparate kingdoms to seal an ancient rift.',
        priceCents: 2899,
        coverUrl: '/covers/crown-of-starlight.png',
        sortOrder: 22,
      },
      {
        title: 'Whispers of the Silver Wood',
        author: 'Laura Mitchell',
        category: 'Fantasy',
        publisher: 'Gollancz',
        format: 'Paperback',
        description: 'Ancient forest spirits awaken when the sacred runes of the elder trees begin to fade.',
        priceCents: 1850,
        coverUrl: '/covers/whispers-silver-wood.png',
        sortOrder: 23,
      },
      {
        title: 'The Obsidian Citadel',
        author: 'Laura Mitchell',
        category: 'Fantasy',
        publisher: 'Del Rey',
        format: 'Paperback',
        description: 'A perilous quest into an enchanted fortress where dark alchemy threatens to consume the realm.',
        priceCents: 1799,
        coverUrl: '/covers/obsidian-citadel.png',
        sortOrder: 24,
      },
      {
        title: 'Leonardo: The Restless Mind',
        author: 'Clara Nelson',
        category: 'Biography',
        publisher: 'Farrar, Straus and Giroux',
        format: 'Hardcover',
        description: 'A masterfully researched portrait of Leonardo da Vinci, charting his artistic triumphs and scientific notebooks.',
        priceCents: 3200,
        coverUrl: '/covers/leonardo-restless-mind.png',
        sortOrder: 25,
      },
      {
        title: 'The Iron Chancellor',
        author: 'Clara Nelson',
        category: 'Biography',
        publisher: 'Farrar, Straus and Giroux',
        format: 'Paperback',
        description: 'A profound examination of 19th-century diplomacy, realpolitik, and the reshaping of Europe.',
        priceCents: 2150,
        coverUrl: '/covers/iron-chancellor.png',
        sortOrder: 26,
      },
      {
        title: 'Marie Curie: Radiant Courage',
        author: 'Clara Nelson',
        category: 'Biography',
        publisher: 'Knopf',
        format: 'Hardcover',
        description: 'The inspiring true story of the pioneering Nobel laureate who reshaped our understanding of radioactivity.',
        priceCents: 2750,
        coverUrl: '/covers/marie-curie-radiant.png',
        sortOrder: 27,
      },
      {
        title: 'Whispers of Solitude',
        author: 'Emily Parker',
        category: 'Poetry',
        publisher: 'Faber & Faber',
        format: 'Paperback',
        description: 'A moving anthology of contemporary verse exploring love, quiet reflection, and the turning of seasons.',
        priceCents: 1299,
        coverUrl: '/covers/whispers-of-solitude.png',
        sortOrder: 28,
      },
      {
        title: 'Rivers of Light',
        author: 'Emily Parker',
        category: 'Poetry',
        publisher: 'Faber & Faber',
        format: 'Hardcover',
        description: 'Lyrical reflections on landscapes, memory, and the unseen threads connecting generations.',
        priceCents: 1899,
        coverUrl: '/covers/rivers-of-light.png',
        sortOrder: 29,
      },
      {
        title: 'The Little Fox Who Loved Stars',
        author: 'Sophie Dubois',
        category: 'Children\'s',
        publisher: 'Candlewick Press',
        format: 'Hardcover',
        description: 'A charming bedtime adventure about curiosity, friendship, and reaching for your dreams.',
        priceCents: 1699,
        coverUrl: '/covers/little-fox-stars.png',
        sortOrder: 30,
      },
      {
        title: 'Adventures of Barnaby Bear',
        author: 'Sophie Dubois',
        category: 'Children\'s',
        publisher: 'Candlewick Press',
        format: 'Paperback',
        description: 'Join Barnaby on a delightful forest treasure hunt filled with surprises and kindhearted woodland creatures.',
        priceCents: 1150,
        coverUrl: '/covers/barnaby-bear.png',
        sortOrder: 31,
      },
      {
        title: 'The Secret Treehouse',
        author: 'Sophie Dubois',
        category: 'Children\'s',
        publisher: 'Candlewick Press',
        format: 'Hardcover',
        description: 'An imaginative tale celebrating teamwork, childhood wonder, and finding magic in everyday moments.',
        priceCents: 1550,
        coverUrl: '/covers/secret-treehouse.png',
        sortOrder: 32,
      },
    ];

    for (const b of books) {
      const authorId = authorMap.get(b.author);
      const categoryId = categoryMap.get(b.category);

      if (!authorId || !categoryId) {
        throw new Error(`Missing authorId or categoryId for book ${b.title}`);
      }

      await client.query(`
        INSERT INTO books (
          title, author_id, category_id, publisher, format,
          description, price_cents, cover_url, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (sort_order) DO UPDATE SET
          title = EXCLUDED.title,
          author_id = EXCLUDED.author_id,
          category_id = EXCLUDED.category_id,
          publisher = EXCLUDED.publisher,
          format = EXCLUDED.format,
          description = EXCLUDED.description,
          price_cents = EXCLUDED.price_cents,
          cover_url = EXCLUDED.cover_url
      `, [
        b.title,
        authorId,
        categoryId,
        b.publisher,
        b.format,
        b.description,
        b.priceCents,
        b.coverUrl,
        b.sortOrder,
      ]);
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
