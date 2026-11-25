// DAPUR KILAT — inti permainan: keadaan dapur dan semua aturannya.
// Modul ini memegang pesanan, kompor, talenan, piring, koin, dan
// combo; render.js hanya menggambar apa yang ada di sini.

import {
  DAY_SECONDS, CHOP_SECONDS, COOK_SECONDS, BURN_AFTER_SECONDS,
  CHOPPED_FROM, COOKED_FROM, RECIPES, recipeById, makeRng,
} from './config.js';
import {
  createPlayer, movePlayer, nearestStation, stationAt, playerCanCarry,
} from './player.js';
import {
  createOrder, resetOrderIds, tickOrders, findOrderFor,
  maxOpenOrders, spawnGap,
} from './orders.js';
import { sounds } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_OVER = 'over';

const PLATE_SLOTS = 2;
const BURNERS = 2;
const PLATE_RESPAWN_SECONDS = 2.5;

// Apakah bahan ini bisa dipotong di talenan.
function canChop(item) {
  return Object.prototype.hasOwnProperty.call(CHOPPED_FROM, item);
}

// Apakah bahan ini bisa dimasak di kompor.
function canCook(item) {
  return Object.prototype.hasOwnProperty.call(COOKED_FROM, item);
}

// Hidangan yang persis sama dengan isi piring, atau null kalau
// isinya belum (atau tidak lagi) cocok dengan resep mana pun.
export function dishForPlate(items) {
  const sorted = [...items].sort();
  for (const recipe of RECIPES) {
    const needs = [...recipe.needs].sort();
    if (needs.length === sorted.length && needs.every((need, i) => need === sorted[i])) {
      return recipe;
    }
  }
  return null;
}

function freshPlate() {
  return { items: [], dish: null };
}

export function createKitchen(seed) {
  const kitchen = {
    screen: SCREEN_TITLE,
    seed,
    rng: makeRng(seed),
    elapsed: 0,
    timeLeft: DAY_SECONDS,
    coins: 0,
    served: 0,
    failed: 0,
    streak: 0,
    bestStreak: 0,
    orders: [],
    spawnTimer: 4,
    burners: [null, null],
    plates: [freshPlate(), freshPlate()],
    plateRespawn: [0, 0],
    // Bahan yang sedang dipotong di talenan + progresnya.
    chop: null,
    player: createPlayer(),
    toast: null,
    frozen: false,
    lastTickSecond: -1,
  };
  return kitchen;
}

export function startDay(kitchen) {
  kitchen.screen = SCREEN_PLAY;
  kitchen.elapsed = 0;
  kitchen.timeLeft = DAY_SECONDS;
  kitchen.coins = 0;
  kitchen.served = 0;
  kitchen.failed = 0;
  kitchen.streak = 0;
  kitchen.bestStreak = 0;
  kitchen.orders = [];
  kitchen.spawnTimer = 5;
  kitchen.burners = [null, null];
  kitchen.plates = [freshPlate(), freshPlate()];
  kitchen.plateRespawn = [0, 0];
  kitchen.chop = null;
  kitchen.player = createPlayer();
  kitchen.toast = null;
  kitchen.rng = makeRng(kitchen.seed);
  resetOrderIds();
  kitchen.orders.push(createOrder(kitchen.rng, 0));
  kitchen.orders.push(createOrder(kitchen.rng, 0));
}

function showToast(kitchen, text) {
  kitchen.toast = { text, until: kitchen.elapsed + 2.2 };
}

function addCoins(kitchen, amount) {
  kitchen.coins = Math.max(0, kitchen.coins + amount);
}

// Satu tekan tombol aksi di dekat stasiun terdekat.
function useStation(kitchen, station) {
  const player = kitchen.player;

  if (station.kind === 'bin') {
    if (player.plate !== null) {
      showToast(kitchen, 'Tangan penuh piring!');
      return;
    }
    if (!playerCanCarry(player)) {
      showToast(kitchen, 'Tangan sudah penuh!');
      return;
    }
    player.carry.push(station.item);
    sounds.pickup();
    return;
  }

  if (station.kind === 'trash') {
    if (player.carry.length === 0 && player.plate === null) return;
    player.carry = [];
    player.plate = null;
    sounds.place();
    showToast(kitchen, 'Dibuang ke tempat sampah.');
    return;
  }

  if (station.kind === 'chop') {
    // Ambil kembali bahan yang sedang dipotong, kalau ada.
    if (kitchen.chop !== null && player.carry.length === 0 && player.plate === null) {
      player.carry.push(kitchen.chop.item);
      kitchen.chop = null;
      sounds.pickup();
    }
    return;
  }

  if (station.kind === 'stove') {
    // Ambil masakan yang sudah matang (atau gosong) dari kompor.
    for (let i = 0; i < BURNERS; i += 1) {
      const burner = kitchen.burners[i];
      if (burner !== null && burner.state !== 'cooking' && playerCanCarry(player)) {
        player.carry.push(burner.state === 'burnt' ? 'gosong' : burner.result);
        kitchen.burners[i] = null;
        sounds.pickup();
        return;
      }
    }
    // Taruh bahan mentah ke tungku yang kosong.
    const carried = player.carry[player.carry.length - 1];
    if (carried !== undefined && canCook(carried)) {
      const free = kitchen.burners.findIndex((b) => b === null);
      if (free >= 0) {
        kitchen.burners[free] = { item: carried, result: COOKED_FROM[carried], progress: 0, state: 'cooking' };
        player.carry.pop();
        sounds.sizzle();
      }
    }
    return;
  }

  if (station.kind === 'plate') {
    // Taruh piring yang dibawa ke slot kosong.
    if (player.plate !== null) {
      const free = kitchen.plates.findIndex((p) => p === null);
      if (free >= 0) {
        kitchen.plates[free] = player.plate;
        player.plate = null;
        sounds.place();
      }
      return;
    }
    // Tambah bahan yang dibawa ke piring yang ada di meja.
    if (player.carry.length > 0) {
      const target = kitchen.plates.find((p) => p !== null && p.items.length < 4);
      if (target !== undefined && target !== null) {
        const item = player.carry.pop();
        target.items.push(item);
        const dish = dishForPlate(target.items);
        target.dish = dish === null ? null : dish.id;
        sounds.place();
        if (dish !== null) showToast(kitchen, `${dish.name} siap disajikan!`);
      }
      return;
    }
    // Ambil piring dari meja (utamakan yang sudah jadi hidangan).
    let slot = kitchen.plates.findIndex((p) => p !== null && p.dish !== null);
    if (slot < 0) slot = kitchen.plates.findIndex((p) => p !== null);
    if (slot >= 0) {
      player.plate = kitchen.plates[slot];
      kitchen.plates[slot] = null;
      kitchen.plateRespawn[slot] = PLATE_RESPAWN_SECONDS;
      sounds.pickup();
    }
    return;
  }

  if (station.kind === 'serve') {
    if (player.plate === null || player.plate.dish === null) {
      if (player.plate !== null) showToast(kitchen, 'Piring ini belum jadi hidangan.');
      return;
    }
    const recipe = recipeById(player.plate.dish);
    const order = findOrderFor(kitchen.orders, recipe.id);
    if (order === null) {
      sounds.wrong();
      showToast(kitchen, `Tidak ada yang memesan ${recipe.name}.`);
      return;
    }
    kitchen.orders = kitchen.orders.filter((o) => o.id !== order.id);
    const timeBonus = Math.round((order.timeLeft / order.totalTime) * 15);
    const comboBonus = 1 + Math.min(kitchen.streak, 10) * 0.1;
    const earned = Math.round((recipe.price + timeBonus) * comboBonus);
    addCoins(kitchen, earned);
    kitchen.served += 1;
    kitchen.streak += 1;
    kitchen.bestStreak = Math.max(kitchen.bestStreak, kitchen.streak);
    player.plate = null;
    sounds.serve();
    showToast(kitchen, `${recipe.name} tersaji! +${earned} koin`);
  }
}

// Tahan tombol aksi: memotong di talenan kalau ada bahan yang
// bisa dipotong, di tangan atau di atas talenan.
function holdAction(kitchen, station, dt) {
  if (station === null || station.kind !== 'chop') return;
  const player = kitchen.player;

  if (kitchen.chop === null) {
    const index = player.carry.findIndex((item) => canChop(item));
    if (index < 0 || player.plate !== null) return;
    kitchen.chop = { item: player.carry[index], progress: 0 };
    player.carry.splice(index, 1);
  }

  kitchen.chop.progress += dt;
  if (Math.floor(kitchen.chop.progress * 4) !== Math.floor((kitchen.chop.progress - dt) * 4)) {
    sounds.chop();
  }
  if (kitchen.chop.progress >= CHOP_SECONDS) {
    const done = CHOPPED_FROM[kitchen.chop.item];
    kitchen.chop = null;
    if (playerCanCarry(player)) {
      player.carry.push(done);
      sounds.chopDone();
    }
  }
}

// Majukan kompor: masakan matang, lalu gosong kalau dibiarkan.
function tickBurners(kitchen, dt) {
  for (let i = 0; i < BURNERS; i += 1) {
    const burner = kitchen.burners[i];
    if (burner === null) continue;
    burner.progress += dt;
    if (burner.state === 'cooking' && burner.progress >= COOK_SECONDS) {
      burner.state = 'done';
      sounds.cooked();
    } else if (burner.state === 'done' && burner.progress >= COOK_SECONDS + BURN_AFTER_SECONDS) {
      burner.state = 'burnt';
      sounds.burnt();
    }
  }
}

function tickPlateRespawn(kitchen, dt) {
  for (let i = 0; i < PLATE_SLOTS; i += 1) {
    if (kitchen.plates[i] === null) {
      kitchen.plateRespawn[i] -= dt;
      if (kitchen.plateRespawn[i] <= 0) kitchen.plates[i] = freshPlate();
    }
  }
}

export function updateKitchen(kitchen, input, dt) {
  if (kitchen.frozen) return;

  if (kitchen.screen === SCREEN_TITLE) {
    if (input.actionPressed || input.anyKey) {
      sounds.unlock();
      startDay(kitchen);
    }
    return;
  }

  if (kitchen.screen === SCREEN_OVER) {
    if (input.restartPressed || input.actionPressed) startDay(kitchen);
    return;
  }

  if (kitchen.screen === SCREEN_PAUSE) {
    if (input.pausePressed || input.actionPressed) kitchen.screen = SCREEN_PLAY;
    return;
  }

  // Layar main.
  if (input.pausePressed) {
    kitchen.screen = SCREEN_PAUSE;
    return;
  }

  kitchen.elapsed += dt;
  kitchen.timeLeft = DAY_SECONDS - kitchen.elapsed;
  if (kitchen.timeLeft <= 0) {
    kitchen.timeLeft = 0;
    kitchen.screen = SCREEN_OVER;
    sounds.dayEnd();
    return;
  }

  // Pesanan baru.
  if (kitchen.orders.length < maxOpenOrders(kitchen.elapsed)) {
    kitchen.spawnTimer -= dt;
    if (kitchen.spawnTimer <= 0) {
      kitchen.orders.push(createOrder(kitchen.rng, kitchen.elapsed));
      kitchen.spawnTimer = spawnGap(kitchen.elapsed);
    }
  }

  // Tiket kedaluwarsa: combo putus, koin berkurang.
  const expired = tickOrders(kitchen.orders, dt);
  for (const id of expired) {
    void id;
    kitchen.failed += 1;
    kitchen.streak = 0;
    addCoins(kitchen, -10);
    sounds.expired();
    showToast(kitchen, 'Pesanan kedaluwarsa! -10 koin');
  }

  // Detak peringatan saat ada tiket di bawah 6 detik.
  const urgent = kitchen.orders.some((o) => o.timeLeft < 6);
  if (urgent) {
    const second = Math.floor(kitchen.timeLeft);
    if (second !== kitchen.lastTickSecond) {
      kitchen.lastTickSecond = second;
      sounds.tick();
    }
  }

  // Klik mouse: jalan ke stasiun yang diklik. Rak bahan diraih
  // dari ujung atas lantai; stasiun tengah dari depannya.
  if (input.clickStation !== null) {
    const station = stationAt(input.clickStation);
    if (station !== null) {
      kitchen.player.target = {
        x: station.x + station.w / 2,
        y: station.kind === 'bin' ? 440 : station.y + station.h + 100,
      };
    } else {
      kitchen.player.target = { x: input.clickStation.x, y: input.clickStation.y };
    }
  }

  movePlayer(kitchen.player, input, dt);

  const near = nearestStation(kitchen.player);
  if (input.actionPressed && near !== null) useStation(kitchen, near);
  if (input.actionHeld) holdAction(kitchen, near, dt);

  tickBurners(kitchen, dt);
  tickPlateRespawn(kitchen, dt);

  if (kitchen.toast !== null && kitchen.elapsed > kitchen.toast.until) {
    kitchen.toast = null;
  }
}
