// DAPUR KILAT — gambar: semua yang tampil di layar digambar
// dengan kode (vector canvas), tanpa gambar atau font dari luar.

import { CANVAS_WIDTH, CANVAS_HEIGHT, DAY_SECONDS, CHOP_SECONDS, COOK_SECONDS, BURN_AFTER_SECONDS, ingredientLabel, ingredientColor, recipeById } from './config.js';
import { STATIONS, FLOOR } from './player.js';
import { SCREEN_TITLE, SCREEN_PAUSE, SCREEN_OVER } from './kitchen.js';
import { formatClock } from './orders.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold' : 'normal'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Ikon vektor tiap bahan, digambar di tengah (x, y) dengan radius r.
export function drawIngredientIcon(ctx, id, x, y, r) {
  const color = ingredientColor(id);
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#f5f0dc';
    ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dfe8f0';
    ctx.beginPath(); ctx.arc(0, r * 0.35, r * 0.8, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#b8c4d0';
    ctx.fillRect(-r * 0.8, r * 0.3, r * 1.6, r * 0.18);
  } else if (id === 'mie' || id === 'mie-matang') {
    ctx.strokeStyle = color; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(0, i * r * 0.45, r * 0.55, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  } else if (id === 'ayam' || id === 'ayam-potong' || id === 'ayam-matang') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.7, r * 0.55, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5ead6'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.55, -r * 0.35); ctx.lineTo(r * 0.95, -r * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.55, -r * 0.35); ctx.lineTo(r * 0.7, -r * 0.95); ctx.stroke();
  } else if (id === 'daging' || id === 'daging-potong' || id === 'daging-matang') {
    ctx.fillStyle = color;
    roundRect(ctx, -r * 0.85, -r * 0.5, r * 1.7, r, r * 0.4); ctx.fill();
    ctx.fillStyle = '#f2d7c4';
    ctx.beginPath(); ctx.ellipse(r * 0.3, -r * 0.15, r * 0.4, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'telur' || id === 'telur-matang') {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'sayur' || id === 'sayur-potong') {
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35, r * 0.5, r * 0.28, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2f7d32';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#f5f0dc';
    ctx.beginPath(); ctx.arc(0, r * 0.3, r * 0.8, 0, Math.PI); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.65, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8a65';
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.1, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.25, r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'kecap') {
    ctx.fillStyle = color;
    roundRect(ctx, -r * 0.35, -r * 0.7, r * 0.7, r * 1.4, r * 0.2); ctx.fill();
    ctx.fillStyle = '#e8b93a';
    ctx.fillRect(-r * 0.35, -r * 0.1, r * 0.7, r * 0.4);
  } else if (id === 'teh') {
    ctx.fillStyle = '#f5f0dc';
    roundRect(ctx, -r * 0.7, -r * 0.6, r * 1.4, r * 1.2, r * 0.25); ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, -r * 0.55, -r * 0.45, r * 1.1, r * 0.7, r * 0.2); ctx.fill();
    ctx.strokeStyle = '#f5f0dc'; ctx.lineWidth = r * 0.15;
    ctx.beginPath(); ctx.arc(r * 0.75, 0, r * 0.3, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  } else if (id === 'gula') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 2;
    ctx.fillRect(-r * 0.7, -r * 0.2, r * 0.6, r * 0.6); ctx.strokeRect(-r * 0.7, -r * 0.2, r * 0.6, r * 0.6);
    ctx.fillRect(r * 0.1, -r * 0.6, r * 0.6, r * 0.6); ctx.strokeRect(r * 0.1, -r * 0.6, r * 0.6, r * 0.6);
  } else if (id === 'es') {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#7fb8d9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(r * 0.6, 0); ctx.lineTo(0, r * 0.8); ctx.lineTo(-r * 0.6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (id === 'bumbu') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.6); ctx.quadraticCurveTo(0, -r * 0.9, r * 0.8, r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8d5a00';
    for (let i = -1; i <= 1; i += 1) { ctx.beginPath(); ctx.arc(i * r * 0.35, -r * 0.1, r * 0.08, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'gosong') {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#666'; ctx.lineWidth = r * 0.12;
    ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.4); ctx.lineTo(r * 0.4, r * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.4); ctx.lineTo(-r * 0.4, r * 0.4); ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawTicket(ctx, order, x, y, w, h) {
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.timeLeft / order.totalTime);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = order.accent;
  roundRect(ctx, x, y, w, 10, 5);
  ctx.fill();
  ctx.fillRect(x, y + 5, w, 5);

  text(ctx, order.name, x + w / 2, y + 30, 19, '#33302a');
  // Titik-titik bahan resep supaya pemain tahu yang dibutuhkan.
  const needs = recipe.needs;
  const dotGap = 26;
  const startX = x + w / 2 - ((needs.length - 1) * dotGap) / 2;
  needs.forEach((need, i) => {
    ctx.fillStyle = ingredientColor(need);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(startX + i * dotGap, y + 56, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  // Bar timer tiket.
  ctx.fillStyle = '#e8e2d4';
  roundRect(ctx, x + 12, y + h - 26, w - 24, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#6fbf5a' : frac > 0.25 ? '#e8a33c' : '#d43d2a';
  roundRect(ctx, x + 12, y + h - 26, (w - 24) * frac, 12, 6);
  ctx.fill();
  text(ctx, `${Math.ceil(order.timeLeft)} dtk`, x + w / 2, y + h - 8, 11, '#5a5346');
}

function drawOrderBoard(ctx, kitchen) {
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, 12, 8, CANVAS_WIDTH - 24, 128, 14);
  ctx.fill();
  ctx.fillStyle = '#6e451f';
  roundRect(ctx, 12, 8, CANVAS_WIDTH - 24, 128, 14);
  ctx.fill();
  ctx.fillStyle = '#a06a35';
  roundRect(ctx, 16, 12, CANVAS_WIDTH - 32, 120, 10);
  ctx.fill();
  text(ctx, 'PAPAN PESANAN', 640, 30, 16, '#ffe9b0');
  if (kitchen.orders.length === 0) {
    text(ctx, 'Belum ada pesanan — bersiaplah!', 640, 84, 18, '#ffe9b0');
    return;
  }
  const w = 190;
  const gap = 14;
  const total = kitchen.orders.length * w + (kitchen.orders.length - 1) * gap;
  let x = (CANVAS_WIDTH - total) / 2;
  for (const order of kitchen.orders) {
    drawTicket(ctx, order, x, 44, w, 82);
    x += w + gap;
  }
}

function drawBins(ctx) {
  for (const station of STATIONS) {
    if (station.kind !== 'bin') continue;
    ctx.fillStyle = '#c98f4e';
    roundRect(ctx, station.x, station.y, station.w, station.h, 8);
    ctx.fill();
    ctx.fillStyle = '#a06a35';
    ctx.fillRect(station.x, station.y, station.w, 8);
    drawIngredientIcon(ctx, station.item, station.x + station.w / 2, station.y + 30, 20);
    text(ctx, station.label, station.x + station.w / 2, station.y + station.h - 12, 13, '#fff6e0');
  }
}

function drawPlateIcon(ctx, plate, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f8f8f8';
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 52, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -2, 40, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  const items = plate.items;
  items.forEach((item, i) => {
    const angle = (i / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2;
    drawIngredientIcon(ctx, item, Math.cos(angle) * 22, -2 + Math.sin(angle) * 7, 12);
  });
  if (plate.dish !== null) {
    ctx.fillStyle = '#2f7d32';
    ctx.beginPath();
    ctx.arc(44, -16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(39, -16); ctx.lineTo(43, -12); ctx.lineTo(49, -20);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStations(ctx, kitchen, near) {
  for (const station of STATIONS) {
    if (station.kind === 'bin') continue;
    const isNear = near !== null && near.id === station.id;
    ctx.save();
    if (isNear) {
      ctx.shadowColor = '#ffd54a';
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = station.kind === 'serve' ? '#7fb069' : station.kind === 'trash' ? '#8d8d8d' : '#b5793a';
    roundRect(ctx, station.x, station.y, station.w, station.h, 10);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = station.kind === 'serve' ? '#5d8f4a' : station.kind === 'trash' ? '#6e6e6e' : '#96682f';
    ctx.fillRect(station.x, station.y, station.w, 10);
    text(ctx, station.label, station.x + station.w / 2, station.y + 22, 14, '#fff6e0');

    if (station.kind === 'chop') {
      ctx.fillStyle = '#e8d9b0';
      roundRect(ctx, station.x + 20, station.y + 38, station.w - 40, 56, 6);
      ctx.fill();
      ctx.strokeStyle = '#b09a6a';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (kitchen.chop !== null) {
        drawIngredientIcon(ctx, kitchen.chop.item, station.x + station.w / 2, station.y + 58, 16);
        const frac = kitchen.chop.progress / CHOP_SECONDS;
        ctx.fillStyle = '#e8e2d4';
        roundRect(ctx, station.x + 30, station.y + 82, station.w - 60, 8, 4);
        ctx.fill();
        ctx.fillStyle = '#e07840';
        roundRect(ctx, station.x + 30, station.y + 82, (station.w - 60) * Math.min(1, frac), 8, 4);
        ctx.fill();
      } else {
        text(ctx, 'Tahan E untuk potong', station.x + station.w / 2, station.y + 66, 12, '#7a6a4a');
      }
    }

    if (station.kind === 'stove') {
      for (let i = 0; i < 2; i += 1) {
        const bx = station.x + 40 + i * 120;
        const by = station.y + 62;
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.ellipse(bx, by, 48, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        const burner = kitchen.burners[i];
        if (burner !== null) {
          ctx.fillStyle = '#5a5a5a';
          ctx.beginPath();
          ctx.ellipse(bx, by - 6, 44, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          drawIngredientIcon(ctx, burner.state === 'burnt' ? 'gosong' : burner.item, bx, by - 8, 15);
          const total = COOK_SECONDS + (burner.state === 'burnt' ? BURN_AFTER_SECONDS : 0);
          const frac = Math.min(1, burner.progress / COOK_SECONDS);
          ctx.fillStyle = '#e8e2d4';
          roundRect(ctx, bx - 40, by + 16, 80, 8, 4);
          ctx.fill();
          ctx.fillStyle = burner.state === 'burnt' ? '#2b2b2b' : burner.state === 'done' ? '#6fbf5a' : '#e8a33c';
          roundRect(ctx, bx - 40, by + 16, 80 * frac, 8, 4);
          ctx.fill();
          if (burner.state === 'done') text(ctx, 'MATANG! Ambil!', bx, by + 36, 12, '#ffe9b0');
          if (burner.state === 'burnt') text(ctx, 'GOSONG!', bx, by + 36, 12, '#ffb0a0');
          void total;
        } else {
          text(ctx, 'Tungku kosong', bx, by + 6, 11, '#cfc4ae');
        }
      }
    }

    if (station.kind === 'plate') {
      kitchen.plates.forEach((plate, i) => {
        if (plate === null) return;
        const px = station.x + 70 + i * 140;
        drawPlateIcon(ctx, plate, px, station.y + 66, 0.9);
        if (plate.dish !== null) {
          const recipe = recipeById(plate.dish);
          text(ctx, recipe.name, px, station.y + 96, 12, '#ffe9b0');
        } else if (plate.items.length > 0) {
          text(ctx, `${plate.items.length} bahan`, px, station.y + 96, 12, '#ffe9b0');
        }
      });
    }

    if (station.kind === 'serve') {
      ctx.fillStyle = '#fffdf5';
      roundRect(ctx, station.x + 30, station.y + 40, station.w - 60, 46, 6);
      ctx.fill();
      text(ctx, 'ANTAR DI SINI', station.x + station.w / 2, station.y + 56, 14, '#5d8f4a');
      text(ctx, 'Tekan E bawa piring jadi', station.x + station.w / 2, station.y + 74, 11, '#7a7a6a');
    }

    if (station.kind === 'trash') {
      ctx.fillStyle = '#5a5a5a';
      roundRect(ctx, station.x + 22, station.y + 40, station.w - 44, 56, 6);
      ctx.fill();
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(station.x + 16, station.y + 34, station.w - 32, 10);
    }
  }
}

function drawPlayer(ctx, player) {
  const bob = player.moving ? Math.sin(player.walkPhase) * 3 : 0;
  const x = player.x;
  const y = player.y + bob * 0.3;
  ctx.save();
  // Bayangan.
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x, player.y + 34, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Badan + celemek.
  ctx.fillStyle = '#f2f2f2';
  roundRect(ctx, x - 22, y - 6, 44, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#e07840';
  roundRect(ctx, x - 22, y + 8, 44, 26, 8);
  ctx.fill();
  // Kepala.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(x, y - 22, 17, 0, Math.PI * 2);
  ctx.fill();
  // Topi koki.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 10, y - 34, 9, 0, Math.PI * 2);
  ctx.arc(x, y - 38, 11, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 34, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 17, y - 36, 34, 8);
  // Mata.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x - 6 + player.facing * 2, y - 22, 2, 0, Math.PI * 2);
  ctx.arc(x + 6 + player.facing * 2, y - 22, 2, 0, Math.PI * 2);
  ctx.fill();
  // Bahan yang dibawa di atas kepala.
  if (player.plate !== null) {
    drawPlateIcon(ctx, player.plate, x, y - 62, 0.75);
  } else if (player.carry.length > 0) {
    const startX = x - ((player.carry.length - 1) * 26) / 2;
    player.carry.forEach((item, i) => {
      drawIngredientIcon(ctx, item, startX + i * 26, y - 58, 13);
    });
  }
  ctx.restore();
}

function drawHud(ctx, kitchen) {
  ctx.fillStyle = '#33302a';
  roundRect(ctx, 12, CANVAS_HEIGHT - 44, CANVAS_WIDTH - 24, 32, 8);
  ctx.fill();
  text(ctx, `Koin: ${kitchen.coins}`, 90, CANVAS_HEIGHT - 28, 18, '#ffd54a', 'left');
  text(ctx, `Tersaji: ${kitchen.served}`, 260, CANVAS_HEIGHT - 28, 16, '#ffffff', 'left');
  text(ctx, `Gagal: ${kitchen.failed}`, 400, CANVAS_HEIGHT - 28, 16, '#ffb0a0', 'left');
  if (kitchen.streak >= 2) {
    text(ctx, `Combo x${kitchen.streak}!`, 560, CANVAS_HEIGHT - 28, 18, '#ff8a65', 'left');
  }
  text(ctx, `Sisa hari: ${formatClock(kitchen.timeLeft)}`, CANVAS_WIDTH - 90, CANVAS_HEIGHT - 28, 18, '#ffffff', 'right');
}

function drawToast(ctx, kitchen) {
  if (kitchen.toast === null) return;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  const w = ctx.measureText(kitchen.toast.text).width + 40;
  roundRect(ctx, CANVAS_WIDTH / 2 - w / 2, 240, w, 36, 18);
  ctx.fill();
  text(ctx, kitchen.toast.text, CANVAS_WIDTH / 2, 259, 16, '#ffffff');
}

function drawTitle(ctx, kitchen) {
  ctx.fillStyle = 'rgba(40,26,12,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'DAPUR KILAT', 640, 220, 84, '#ffd54a');
  text(ctx, 'Masak cepat, sajikan tepat waktu!', 640, 300, 26, '#ffffff');
  const lines = [
    'WASD / Panah — jalan   •   E / Spasi — ambil, potong (tahan), masak, sajikan',
    'Klik mouse — jalan ke stasiun   •   P — jeda   •   R — mulai lagi',
    'Ambil bahan, potong di talenan, masak di kompor, rakit di piring,',
    'antar ke Jendela Saji sebelum timer pesanan habis!',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 380 + i * 34, 19, '#ffe9b0', 'center', false));
  text(ctx, 'Tekan tombol apa saja untuk mulai', 640, 560, 22, '#ffd54a');
  void kitchen;
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'JEDA', 640, 360, 64, '#ffffff');
  text(ctx, 'Tekan P atau E untuk lanjut', 640, 440, 22, '#ffe9b0');
}

function drawOver(ctx, kitchen) {
  ctx.fillStyle = 'rgba(40,26,12,0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'HARI SELESAI!', 640, 240, 64, '#ffd54a');
  text(ctx, `Koin terkumpul: ${kitchen.coins}`, 640, 340, 30, '#ffffff');
  text(ctx, `Hidangan tersaji: ${kitchen.served}   •   Pesanan gagal: ${kitchen.failed}`, 640, 390, 24, '#ffe9b0', 'center', false);
  text(ctx, `Combo terbaik: x${kitchen.bestStreak}`, 640, 430, 24, '#ffe9b0', 'center', false);
  const verdict = kitchen.served >= 8 ? 'Koki bintang lima! Dapur ini milikmu.'
    : kitchen.served >= 4 ? 'Lumayan! Besok pasti lebih cepat.'
    : 'Dapur masih berantakan — coba lagi besok!';
  text(ctx, verdict, 640, 490, 22, '#ffffff', 'center', false);
  text(ctx, 'Tekan R untuk main lagi', 640, 570, 22, '#ffd54a');
}

export function drawKitchen(ctx, kitchen, near) {
  // Dinding dan lantai dapur.
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#efe0bd';
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    ctx.fillRect(x, 136, 2, 300);
  }
  ctx.fillStyle = '#d9b98a';
  ctx.fillRect(0, 240, CANVAS_WIDTH, 8);
  ctx.fillStyle = '#c9a06a';
  ctx.fillRect(0, 248, CANVAS_WIDTH, 182);
  // Ubin lantai.
  ctx.fillStyle = '#b98d5f';
  for (let y = FLOOR.top; y < CANVAS_HEIGHT; y += 64) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
  }
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    ctx.fillRect(x, FLOOR.top, 2, CANVAS_HEIGHT - FLOOR.top);
  }
  void DAY_SECONDS;

  drawOrderBoard(ctx, kitchen);
  drawBins(ctx);
  drawStations(ctx, kitchen, near);
  drawPlayer(ctx, kitchen.player);
  drawHud(ctx, kitchen);
  drawToast(ctx, kitchen);

  if (kitchen.screen === SCREEN_TITLE) drawTitle(ctx, kitchen);
  if (kitchen.screen === SCREEN_PAUSE) drawPause(ctx);
  if (kitchen.screen === SCREEN_OVER) drawOver(ctx, kitchen);
}
