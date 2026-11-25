// DAPUR KILAT — koki pemain dan denah stasiun dapur.
// Denah ditulis sekali di sini: posisi tiap meja, kompor, talenan,
// dan jendela saji, plus cara pemain berjalan menuju ke sana.

import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, CARRY_LIMIT } from './config.js';

// Lantai tempat koki boleh berjalan (di bawah barisan stasiun).
export const FLOOR = { top: 430, bottom: 748, left: 30, right: CANVAS_WIDTH - 30 };

// Tiap stasiun: id, label, kotak di canvas, dan jenisnya.
// Baris bahan di dinding atas; talenan, kompor, plating, jendela
// saji, dan tempat sampah di barisan tengah.
export const STATIONS = [
  { id: 'bin-nasi', label: 'Nasi', item: 'nasi', kind: 'bin', x: 24, y: 150, w: 92, h: 76 },
  { id: 'bin-mie', label: 'Mie', item: 'mie', kind: 'bin', x: 124, y: 150, w: 92, h: 76 },
  { id: 'bin-ayam', label: 'Ayam', item: 'ayam', kind: 'bin', x: 224, y: 150, w: 92, h: 76 },
  { id: 'bin-daging', label: 'Daging', item: 'daging', kind: 'bin', x: 324, y: 150, w: 92, h: 76 },
  { id: 'bin-telur', label: 'Telur', item: 'telur', kind: 'bin', x: 424, y: 150, w: 92, h: 76 },
  { id: 'bin-sayur', label: 'Sayur', item: 'sayur', kind: 'bin', x: 524, y: 150, w: 92, h: 76 },
  { id: 'bin-sambal', label: 'Sambal', item: 'sambal', kind: 'bin', x: 624, y: 150, w: 92, h: 76 },
  { id: 'bin-kecap', label: 'Kecap', item: 'kecap', kind: 'bin', x: 724, y: 150, w: 92, h: 76 },
  { id: 'bin-teh', label: 'Teh', item: 'teh', kind: 'bin', x: 824, y: 150, w: 92, h: 76 },
  { id: 'bin-gula', label: 'Gula', item: 'gula', kind: 'bin', x: 924, y: 150, w: 92, h: 76 },
  { id: 'bin-es', label: 'Es', item: 'es', kind: 'bin', x: 1024, y: 150, w: 92, h: 76 },
  { id: 'bin-bumbu', label: 'Bumbu', item: 'bumbu', kind: 'bin', x: 1124, y: 150, w: 92, h: 76 },
  { id: 'talenan', label: 'Talenan', kind: 'chop', x: 40, y: 268, w: 220, h: 110 },
  { id: 'kompor', label: 'Kompor', kind: 'stove', x: 300, y: 268, w: 260, h: 110 },
  { id: 'plating', label: 'Meja Plating', kind: 'plate', x: 600, y: 268, w: 280, h: 110 },
  { id: 'jendela', label: 'Jendela Saji', kind: 'serve', x: 920, y: 268, w: 220, h: 110 },
  { id: 'sampah', label: 'Sampah', kind: 'trash', x: 1160, y: 268, w: 92, h: 110 },
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id) ?? null;
}

export function stationAt(point) {
  for (const station of STATIONS) {
    if (point.x >= station.x && point.x <= station.x + station.w
      && point.y >= station.y && point.y <= station.y + station.h) {
      return station;
    }
  }
  return null;
}

export function createPlayer() {
  return {
    x: CANVAS_WIDTH / 2,
    y: 640,
    // Tujuan jalan dari klik mouse; null kalau tidak ada.
    target: null,
    facing: 1,
    moving: false,
    // Bahan yang dibawa di tangan (maksimal CARRY_LIMIT).
    carry: [],
    // Piring yang dibawa (null kalau tidak membawa piring).
    plate: null,
    walkPhase: 0,
  };
}

export function playerCanCarry(player) {
  return player.plate === null && player.carry.length < CARRY_LIMIT;
}

function clampToFloor(player) {
  player.x = Math.min(FLOOR.right, Math.max(FLOOR.left, player.x));
  player.y = Math.min(FLOOR.bottom, Math.max(FLOOR.top, player.y));
}

// Gerakkan koki satu langkah: keyboard mengalahkan tujuan klik,
// klik mengarahkan koki sampai tiba di titik yang diklik.
export function movePlayer(player, input, dt) {
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    player.target = null;
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * PLAYER_SPEED * dt;
    player.y += (dy / len) * PLAYER_SPEED * dt;
    if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
    player.moving = true;
  } else if (player.target !== null) {
    const tx = player.target.x;
    const ty = Math.min(Math.max(player.target.y, FLOOR.top), FLOOR.bottom);
    const distX = tx - player.x;
    const distY = ty - player.y;
    const dist = Math.hypot(distX, distY);
    if (dist < 8) {
      player.target = null;
      player.moving = false;
    } else {
      const step = Math.min(dist, PLAYER_SPEED * dt);
      player.x += (distX / dist) * step;
      player.y += (distY / dist) * step;
      if (distX !== 0) player.facing = distX > 0 ? 1 : -1;
      player.moving = true;
    }
  } else {
    player.moving = false;
  }

  if (player.moving) player.walkPhase += dt * 10;
  clampToFloor(player);
}

// Stasiun terdekat dari koki, kalau cukup dekat untuk interaksi.
// Rak bahan ada di dinding atas: koki yang berdiri di ujung atas
// lantai (tepat di bawah rak) meraih rak di atasnya; kalau sudah
// turun sedikit, ia memakai stasiun di barisan tengah.
export function nearestStation(player) {
  if (player.y <= 452) {
    let best = null;
    let bestDx = 55;
    for (const station of STATIONS) {
      if (station.kind !== 'bin') continue;
      const dx = Math.abs(player.x - (station.x + station.w / 2));
      if (dx < bestDx) {
        bestDx = dx;
        best = station;
      }
    }
    if (best !== null) return best;
  }
  let best = null;
  let bestDist = 175;
  for (const station of STATIONS) {
    if (station.kind === 'bin') continue;
    const cx = station.x + station.w / 2;
    const cy = station.y + station.h / 2;
    const dist = Math.hypot(player.x - cx, player.y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = station;
    }
  }
  return best;
}

export { CANVAS_HEIGHT };
