// DAPUR KILAT — pesanan: tiket yang muncul, berdetak, dan kedaluwarsa.
// Modul ini tahu kapan tiket baru muncul, berapa lama ia bertahan,
// dan hidangan apa yang cocok dengan tiket yang mana.

import { RECIPES, DAY_SECONDS, pickFrom } from './config.js';

let nextOrderId = 1;

// Berapa banyak tiket boleh terbuka bersamaan di detik ke-`elapsed`.
export function maxOpenOrders(elapsed) {
  return Math.min(5, 3 + Math.floor(elapsed / 60));
}

// Jeda antar tiket baru: makin cepat seiring hari berjalan.
export function spawnGap(elapsed) {
  return Math.max(6, 14 - elapsed / 25);
}

// Lama tiket bertahan: makin singkat seiring hari berjalan.
export function orderLifetime(elapsed) {
  return Math.max(26, 52 - elapsed / 5);
}

export function createOrder(rng, elapsed) {
  const recipe = pickFrom(rng, RECIPES);
  return {
    id: nextOrderId,
    recipeId: recipe.id,
    name: recipe.name,
    timeLeft: orderLifetime(elapsed),
    totalTime: orderLifetime(elapsed),
    accent: recipe.accent,
  };
}

// Reset penomoran tiket (dipakai saat hari baru dimulai).
export function resetOrderIds() {
  nextOrderId = 1;
}

// Majukan semua tiket satu langkah; kembalikan id tiket yang
// baru saja kedaluwarsa supaya kitchen bisa memberi penalti.
export function tickOrders(orders, dt) {
  const expired = [];
  for (let index = orders.length - 1; index >= 0; index -= 1) {
    orders[index].timeLeft -= dt;
    if (orders[index].timeLeft <= 0) {
      expired.push(orders[index].id);
      orders.splice(index, 1);
    }
  }
  return expired;
}

// Tiket pertama yang memesan hidangan `recipeId`, atau null.
export function findOrderFor(orders, recipeId) {
  return orders.find((order) => order.recipeId === recipeId) ?? null;
}

// Sisa waktu hari dalam format menit:detik untuk HUD.
export function formatClock(secondsLeft) {
  const total = Math.max(0, Math.ceil(secondsLeft));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export { DAY_SECONDS };
