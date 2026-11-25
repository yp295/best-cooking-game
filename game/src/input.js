// DAPUR KILAT — masukan pemain: keyboard dan mouse.
// Modul ini hanya mencatat apa yang ditekan/diklik; logika game
// yang membaca catatan itu tinggal di kitchen.js.

export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    // Tombol aksi sedang ditahan (E atau Spasi): dipakai untuk
    // memotong dan memasak yang butuh progress.
    actionHeld: false,
    // Tombol aksi baru saja ditekan sekali: dipakai untuk ambil,
    // taruh, dan sajikan yang sekali tekan cukup.
    actionPressed: false,
    pausePressed: false,
    restartPressed: false,
    // Tujuan jalan dari klik mouse, dalam koordinat canvas.
    clickTarget: null,
    // Klik terakhir pada stasiun: stasiun yang diklik pemain.
    clickStation: null,
    anyKey: false,
  };

  function keyName(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    return key;
  }

  function onKeyDown(event) {
    const key = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    input.anyKey = true;
    if (key === 'w' || event.key === 'ArrowUp') input.up = true;
    if (key === 's' || event.key === 'ArrowDown') input.down = true;
    if (key === 'a' || event.key === 'ArrowLeft') input.left = true;
    if (key === 'd' || event.key === 'ArrowRight') input.right = true;
    if (key === 'e' || event.key === ' ') {
      if (!input.actionHeld) input.actionPressed = true;
      input.actionHeld = true;
    }
    if (key === 'p' || event.key === 'Escape') input.pausePressed = true;
    if (key === 'r') input.restartPressed = true;
  }

  function onKeyUp(event) {
    const key = keyName(event);
    if (key === 'w' || event.key === 'ArrowUp') input.up = false;
    if (key === 's' || event.key === 'ArrowDown') input.down = false;
    if (key === 'a' || event.key === 'ArrowLeft') input.left = false;
    if (key === 'd' || event.key === 'ArrowRight') input.right = false;
    if (key === 'e' || event.key === ' ') input.actionHeld = false;
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function onMouseDown(event) {
    const point = canvasPoint(event);
    input.clickTarget = point;
    input.clickStation = point;
    input.anyKey = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  // Dipanggil tiap frame oleh loop utama sesudah kitchen membaca
  // masukan, supaya tekan-sekali tidak terbaca dua frame.
  input.endFrame = function endFrame() {
    input.actionPressed = false;
    input.pausePressed = false;
    input.restartPressed = false;
    input.clickStation = null;
  };

  return input;
}
