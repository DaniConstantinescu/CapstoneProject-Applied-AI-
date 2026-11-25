import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coversDir = path.resolve(__dirname, '../public/covers');
const authorsDir = path.resolve(coversDir, 'authors');

fs.mkdirSync(authorsDir, { recursive: true });

const bookCovers = [
  { name: 'joy-of-minimalism.png', title: 'The Joy of Minimalism', author: 'Daniel Reed', color: '#1d3557' },
  { name: 'digital-serenity.png', title: 'Digital Serenity', author: 'Daniel Reed', color: '#2b2d42' },
  { name: 'habit-loop-blueprint.png', title: 'Habit Loop Blueprint', author: 'Daniel Reed', color: '#457b9d' },
  { name: 'mindful-morning-rituals.png', title: 'Mindful Morning Rituals', author: 'Daniel Reed', color: '#2a9d8f' },
  { name: 'echoes-of-andromeda.png', title: 'Echoes of Andromeda', author: 'James Wright', color: '#03045e' },
  { name: 'quantum-paradox.png', title: 'The Quantum Paradox', author: 'James Wright', color: '#3c096c' },
  { name: 'station-horizon-9.png', title: 'Station Horizon 9', author: 'James Wright', color: '#10002b' },
  { name: 'sublight-odyssey.png', title: 'Sublight Odyssey', author: 'James Wright', color: '#240046' },
  { name: 'midnight-in-whitechapel.png', title: 'Midnight in Whitechapel', author: 'Arjun Patel', color: '#3d0c02' },
  { name: 'silent-witness-prague.png', title: 'Silent Witness of Prague', author: 'Arjun Patel', color: '#4a4e69' },
  { name: 'shadows-bosphorus.png', title: 'Shadows over Bosphorus', author: 'Arjun Patel', color: '#22223b' },
  { name: 'stolen-sonata.png', title: 'The Stolen Sonata', author: 'Arjun Patel', color: '#6b2d5c' },
  { name: 'spices-silk-road.png', title: 'Spices of the Silk Road', author: 'Raj Patel', color: '#e76f51' },
  { name: 'modern-tandoor.png', title: 'The Modern Tandoor', author: 'Raj Patel', color: '#f4a261' },
  { name: 'artisan-breads-chutneys.png', title: 'Artisan Breads & Chutneys', author: 'Raj Patel', color: '#bc6c25' },
  { name: 'cosmos-explained.png', title: 'The Cosmos Explained', author: 'James Adams', color: '#001219' },
  { name: 'principles-modern-physics.png', title: 'Principles of Modern Physics', author: 'James Adams', color: '#005f73' },
  { name: 'origins-of-starlight.png', title: 'Origins of Starlight', author: 'James Adams', color: '#0a9396' },
  { name: 'letters-from-provence.png', title: 'Letters from Provence', author: 'Jessica Martin', color: '#d90429' },
  { name: 'autumn-in-manhattan.png', title: 'Autumn in Manhattan', author: 'Jessica Martin', color: '#9b2226' },
  { name: 'sunset-over-amalfi.png', title: 'Sunset over Amalfi', author: 'Jessica Martin', color: '#ae2012' },
  { name: 'crown-of-starlight.png', title: 'The Crown of Starlight', author: 'Laura Mitchell', color: '#5a189a' },
  { name: 'whispers-silver-wood.png', title: 'Whispers of Silver Wood', author: 'Laura Mitchell', color: '#2d6a4f' },
  { name: 'obsidian-citadel.png', title: 'The Obsidian Citadel', author: 'Laura Mitchell', color: '#1b4332' },
  { name: 'leonardo-restless-mind.png', title: 'Leonardo: Restless Mind', author: 'Clara Nelson', color: '#582f0e' },
  { name: 'iron-chancellor.png', title: 'The Iron Chancellor', author: 'Clara Nelson', color: '#7f4f24' },
  { name: 'marie-curie-radiant.png', title: 'Marie Curie: Radiant Courage', author: 'Clara Nelson', color: '#936639' },
  { name: 'whispers-of-solitude.png', title: 'Whispers of Solitude', author: 'Emily Parker', color: '#52796f' },
  { name: 'rivers-of-light.png', title: 'Rivers of Light', author: 'Emily Parker', color: '#354f52' },
  { name: 'little-fox-stars.png', title: 'Little Fox Who Loved Stars', author: 'Sophie Dubois', color: '#f77f00' },
  { name: 'barnaby-bear.png', title: 'Adventures of Barnaby Bear', author: 'Sophie Dubois', color: '#d62828' },
  { name: 'secret-treehouse.png', title: 'The Secret Treehouse', author: 'Sophie Dubois', color: '#38b000' },
];

const authors = [
  'daniel-reed.png',
  'james-wright.png',
  'arjun-patel.png',
  'raj-patel.png',
  'james-adams.png',
  'jessica-martin.png',
  'laura-mitchell.png',
  'clara-nelson.png',
  'emily-parker.png',
  'sophie-dubois.png',
];

function generateBookSvg(title, author, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.4"/>
      <stop offset="5%" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="10%" stop-color="#000" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="${color}" rx="4"/>
  <rect width="300" height="450" fill="url(#spine)" rx="4"/>
  <rect x="20" y="20" width="260" height="410" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2"/>
  <text x="150" y="160" font-family="'IBM Plex Sans', sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle" width="240">
    <tspan x="150" dy="0">${escapeXml(title)}</tspan>
  </text>
  <line x1="100" y1="230" x2="200" y2="230" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2"/>
  <text x="150" y="280" font-family="'IBM Plex Sans', sans-serif" font-size="16" fill="#e0e0e0" text-anchor="middle">
    ${escapeXml(author)}
  </text>
  <text x="150" y="400" font-family="'IBM Plex Sans', sans-serif" font-size="12" fill="#a0a0a0" text-anchor="middle" letter-spacing="2">
    BOOK WORM
  </text>
</svg>`;
}

function generateAuthorSvg(name) {
  const initials = name.replace('.png', '').split('-').map(s => s[0].toUpperCase()).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="#262626" stroke="#393939" stroke-width="4"/>
  <text x="100" y="115" font-family="'IBM Plex Sans', sans-serif" font-size="48" font-weight="bold" fill="#0f62fe" text-anchor="middle">
    ${initials}
  </text>
</svg>`;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Write book covers as SVG files (and SVG-compatible PNG filenames for simple local display)
for (const b of bookCovers) {
  const svg = generateBookSvg(b.title, b.author, b.color);
  fs.writeFileSync(path.join(coversDir, b.name), svg);
}

for (const a of authors) {
  const svg = generateAuthorSvg(a);
  fs.writeFileSync(path.join(authorsDir, a), svg);
}

console.log('Cover and author placeholders generated successfully!');
