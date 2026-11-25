// DAPUR KILAT — titik masuk: pasang canvas, baca ?shot= & ?seed=,
// jalankan loop permainan, dan gambar tiap frame.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { createInput } from './input.js';
import { createKitchen, updateKitchen, SCREEN_PLAY } from './kitchen.js';
import { nearestStation } from './player.js';
import { drawKitchen } from './render.js';
import { stageShot } from './shots.js';
import { sounds } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const params = new URLSearchParams(window.location.search);
const seedText = params.get('seed');
const seed = seedText === null ? 20261125 : Number.parseInt(seedText, 10) || 20261125;
const shotName = params.get('shot');

const kitchen = createKitchen(seed);
const input = createInput(canvas);

// Diekspos supaya permainan bisa diuji otomatis dari luar;
// bukan bagian dari aturan main dan tidak memuat apa pun.
window.__kitchen = kitchen;

if (shotName !== null) {
  stageShot(shotName, kitchen);
}

// Suara hanya boleh mulai dari gestur pemain.
window.addEventListener('keydown', () => sounds.unlock(), { once: true });
canvas.addEventListener('mousedown', () => sounds.unlock(), { once: true });

let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateKitchen(kitchen, input, dt);
  const near = kitchen.screen === SCREEN_PLAY ? nearestStation(kitchen.player) : null;
  drawKitchen(ctx, kitchen, near);
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
