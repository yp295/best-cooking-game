// DAPUR KILAT — penyerahan entry (Node 22, stdlib saja).
// Menyalin game/ dan screenshots/ dari samping berkas ini ke
// /output (atau MAKEFUN_OUTPUT_DIR di luar grader), lalu menulis
// /output/dossier.json lewat pustaka make.fun yang divendor.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(repoRoot, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Batas yang dipakai penilai (lihat RULES.txt bagian The gate):
// teks dossier dibatasi 160 KiB, maksimal 4 screenshot @ 256 KiB,
// game/ maksimal 993 berkas dan 48 MiB, dan tiap path di bawah
// game/ maksimal 1000 byte. Melebihi batas di sini berarti
// entry ditolak penilai, jadi tolak lebih awal di sini.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

console.log(`Dapur Kilat diserahkan ke ${outputDir} (dossier ${dossierText.length} byte).`);
