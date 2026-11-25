// DAPUR KILAT — konstanta, resep, dan pengacak berbenih.
// Semua angka penyeimbang dan isi dapur tinggal di sini supaya
// berkas logika lain tidak perlu tahu detail resep apa pun.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
export const DAY_SECONDS = 180;
export const PLAYER_SPEED = 340;
export const CARRY_LIMIT = 4;

// Satu bahan: nama yang tampil, warna gambarnya, dan apa yang
// harus dilakukan sebelum bahan itu boleh masuk ke piring.
export const INGREDIENTS = {
  nasi:    { name: 'Nasi',    color: '#f5f0dc', prep: 'ready' },
  mie:     { name: 'Mie',     color: '#f2c94c', prep: 'cook' },
  ayam:    { name: 'Ayam',    color: '#e8a87c', prep: 'chop-cook' },
  daging:  { name: 'Daging',  color: '#c96f4a', prep: 'chop-cook' },
  telur:   { name: 'Telur',   color: '#f7e8b0', prep: 'cook' },
  sayur:   { name: 'Sayur',   color: '#6fbf5a', prep: 'chop' },
  sambal:  { name: 'Sambal',  color: '#d43d2a', prep: 'ready' },
  kecap:   { name: 'Kecap',   color: '#4a2c1a', prep: 'ready' },
  teh:     { name: 'Teh',     color: '#a9713f', prep: 'ready' },
  gula:    { name: 'Gula',    color: '#ffffff', prep: 'ready' },
  es:      { name: 'Es Batu', color: '#bfe8f5', prep: 'ready' },
  bumbu:   { name: 'Bumbu',   color: '#e0a030', prep: 'ready' },
};

// Hasil tiap tahap olah: bahan mentah -> bahan setengah jadi -> bahan matang.
export const CHOPPED_FROM = {
  ayam: 'ayam-potong',
  daging: 'daging-potong',
  sayur: 'sayur-potong',
};
export const COOKED_FROM = {
  'ayam-potong': 'ayam-matang',
  'daging-potong': 'daging-matang',
  mie: 'mie-matang',
  telur: 'telur-matang',
};
export const STAGE_NAMES = {
  'ayam-potong': 'Ayam Potong',
  'daging-potong': 'Daging Potong',
  'sayur-potong': 'Sayur Potong',
  'ayam-matang': 'Ayam Matang',
  'daging-matang': 'Daging Matang',
  'mie-matang': 'Mie Matang',
  'telur-matang': 'Telur Matang',
  gosong: 'Gosong',
};
export const STAGE_COLORS = {
  'ayam-potong': '#f0c49a',
  'daging-potong': '#d98a63',
  'sayur-potong': '#8ed07a',
  'ayam-matang': '#d98e4a',
  'daging-matang': '#a8542f',
  'mie-matang': '#e8b93a',
  'telur-matang': '#f2d060',
  gosong: '#2b2b2b',
};

// Berapa lama (detik) tiap tahap olah kalau tombol ditahan.
export const CHOP_SECONDS = 1.6;
export const COOK_SECONDS = 6;
export const BURN_AFTER_SECONDS = 6;

// Resep: nama hidangan, bahan jadi yang harus ada di piring,
// harga dasar, dan warna aksen tiketnya.
export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur-matang', 'kecap'], price: 30, accent: '#e07840' },
  { id: 'mie-ayam', name: 'Mie Ayam', needs: ['mie-matang', 'ayam-matang', 'sayur-potong'], price: 35, accent: '#d9a441' },
  { id: 'sate-ayam', name: 'Sate Ayam', needs: ['daging-matang', 'bumbu', 'sambal'], price: 40, accent: '#c94f38' },
  { id: 'es-teh', name: 'Es Teh Manis', needs: ['teh', 'gula', 'es'], price: 20, accent: '#7fb069' },
  { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['nasi', 'ayam-matang', 'sambal'], price: 35, accent: '#d95f43' },
  { id: 'telur-dadar', name: 'Telur Dadar', needs: ['telur-matang', 'sayur-potong'], price: 25, accent: '#e8c33c' },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}

export function ingredientLabel(id) {
  if (INGREDIENTS[id]) return INGREDIENTS[id].name;
  return STAGE_NAMES[id] ?? id;
}

export function ingredientColor(id) {
  if (INGREDIENTS[id]) return INGREDIENTS[id].color;
  return STAGE_COLORS[id] ?? '#cccccc';
}

// Pengacak deterministik (mulberry32) supaya ?seed=1 selalu
// memberi urutan pesanan dan kejadian yang sama.
export function makeRng(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFrom(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
