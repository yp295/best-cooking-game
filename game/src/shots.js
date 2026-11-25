// DAPUR KILAT — adegan screenshot: ?shot=cover|chop|serve|title.
// Tiap adegan menyusun keadaan dapur yang sama persis setiap kali
// dipanggil (benih tetap), supaya screenshot selalu bisa diulang
// dan menunjukkan permainan yang sesungguhnya, bukan mockup.

import { SCREEN_TITLE, SCREEN_PLAY, startDay } from './kitchen.js';

function makeTicket(id, recipeId, name, accent, timeLeft, totalTime) {
  return { id, recipeId, name, timeLeft, totalTime, accent };
}

function baseScene(kitchen, elapsed, coins, served, streak) {
  startDay(kitchen);
  kitchen.elapsed = elapsed;
  kitchen.timeLeft = 180 - elapsed;
  kitchen.coins = coins;
  kitchen.served = served;
  kitchen.streak = streak;
  kitchen.bestStreak = streak;
  kitchen.spawnTimer = 9;
  kitchen.frozen = true;
}

// Adegan utama: dapur penuh — tiga tiket, satu piring sedang
// dirakit di tangan koki, satu piring jadi di meja, kompor
// memasak, talenan memotong.
function stageCover(kitchen) {
  baseScene(kitchen, 65, 120, 4, 3);
  kitchen.orders = [
    makeTicket(11, 'nasi-goreng', 'Nasi Goreng', '#e07840', 32, 52),
    makeTicket(12, 'mie-ayam', 'Mie Ayam', '#d9a441', 24, 45),
    makeTicket(13, 'es-teh', 'Es Teh Manis', '#7fb069', 40, 52),
  ];
  kitchen.player.x = 740;
  kitchen.player.y = 520;
  kitchen.player.plate = { items: ['nasi', 'telur-matang'], dish: null };
  kitchen.plates = [
    { items: ['nasi', 'telur-matang', 'kecap'], dish: 'nasi-goreng' },
    { items: ['mie-matang'], dish: null },
  ];
  kitchen.burners = [
    { item: 'ayam-potong', result: 'ayam-matang', progress: 3.5, state: 'cooking' },
    null,
  ];
  kitchen.chop = { item: 'ayam', progress: 0.9 };
  kitchen.toast = { text: 'Nasi Goreng siap disajikan!', until: kitchen.elapsed + 2.2 };
}

// Adegan memotong: koki di talenan, ayam setengah terpotong.
function stageChop(kitchen) {
  baseScene(kitchen, 40, 60, 2, 2);
  kitchen.orders = [
    makeTicket(21, 'sate-ayam', 'Sate Ayam', '#c94f38', 30, 45),
    makeTicket(22, 'telur-dadar', 'Telur Dadar', '#e8c33c', 20, 40),
  ];
  kitchen.player.x = 150;
  kitchen.player.y = 500;
  kitchen.player.carry = ['sayur'];
  kitchen.chop = { item: 'ayam', progress: 1.0 };
  kitchen.burners = [
    { item: 'mie', result: 'mie-matang', progress: 5.2, state: 'cooking' },
    null,
  ];
  kitchen.plates = [
    { items: ['nasi'], dish: null },
    { items: [], dish: null },
  ];
}

// Adegan menyajikan: koki membawa piring Nasi Goreng yang sudah
// jadi ke Jendela Saji, tiketnya masih menunggu di papan.
function stageServe(kitchen) {
  baseScene(kitchen, 95, 150, 5, 4);
  kitchen.orders = [
    makeTicket(31, 'nasi-goreng', 'Nasi Goreng', '#e07840', 28, 52),
    makeTicket(32, 'ayam-geprek', 'Ayam Geprek', '#d95f43', 18, 45),
  ];
  kitchen.player.x = 1030;
  kitchen.player.y = 500;
  kitchen.player.plate = { items: ['nasi', 'telur-matang', 'kecap'], dish: 'nasi-goreng' };
  kitchen.plates = [
    { items: ['mie-matang', 'ayam-matang'], dish: null },
    { items: [], dish: null },
  ];
  kitchen.burners = [
    { item: 'telur', result: 'telur-matang', progress: 6, state: 'done' },
    null,
  ];
  kitchen.toast = { text: 'Antar ke Jendela Saji!', until: kitchen.elapsed + 2.2 };
}

// Susun adegan bernama ke dalam `kitchen` dan kembalikan layar
// yang harus digambar di atasnya.
export function stageShot(name, kitchen) {
  if (name === 'cover') {
    stageCover(kitchen);
    kitchen.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  if (name === 'chop') {
    stageChop(kitchen);
    kitchen.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  if (name === 'serve') {
    stageServe(kitchen);
    kitchen.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  kitchen.screen = SCREEN_TITLE;
  kitchen.frozen = true;
  return SCREEN_TITLE;
}
