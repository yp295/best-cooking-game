[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/yp295/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/yp295/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat

Game memasak 2D yang dimainkan di browser: satu hari kerja dapur selama tiga menit.
Pesanan datang lewat papan di atas, kamu berlari di antara rak bahan, talenan,
kompor, dan meja plating, lalu mengantar hidangan ke Jendela Saji sebelum
timer tiket habis. Makin lama hari berjalan, pesanan datang makin cepat dan
timernya makin pendek — combo yang panjang adalah kunci koin besar.

Dibuat untuk bounty [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
di make.fun.

## Cara main

- **WASD / tombol panah** — gerakkan koki.
- **E / Spasi** — ambil bahan, taruh di kompor, ambil piring, sajikan. Tahan
  untuk memotong di talenan.
- **Klik mouse** — klik stasiun supaya koki berjalan ke sana.
- **P** — jeda, **R** — mulai hari baru.

Alur satu hidangan:

1. Ambil bahan dari rak di dinding atas (nasi, mie, ayam, daging, telur,
   sayur, sambal, kecap, teh, gula, es, bumbu).
2. Bahan mentah dipotong dulu di **talenan** (tahan E), lalu dimasak di
   **kompor** (tungku matang dalam 6 detik — biarkan lebih lama, gosong!).
3. Rakit di piring pada **meja plating**: piring yang isinya persis sama
   dengan resep berubah jadi hidangan jadi.
4. Bawa piring ke **Jendela Saji** dan tekan E. Hidangan yang dipesan
   memberi koin + bonus kecepatan + bonus combo. Pesanan yang kedaluwarsa
   memutus combo dan mengurangi 10 koin.

Resep: Nasi Goreng (nasi + telur matang + kecap), Mie Ayam (mie matang +
ayam matang + sayur potong), Sate Ayam (daging matang + bumbu + sambal),
Es Teh Manis (teh + gula + es), Ayam Geprek (nasi + ayam matang + sambal),
Telur Dadar (telur matang + sayur potong).

## Cara jalanin

Game ini berkas statis biasa — tanpa build step, tanpa network, tanpa
library. Semua gambar digambar pakai kode (canvas 2D) dan semua suara
dibuat dari osilator WebAudio.

```sh
# dari folder repo ini, sajikan folder game/ di server lokal:
python3 -m http.server 8080 --directory game
# lalu buka http://localhost:8080 di Chrome desktop
```

Atau pakai Node:

```sh
node serve.ts
```

`serve.ts` menyajikan `game/` di http://localhost:8080 dan membuka
browser — cukup untuk main dan mengambil screenshot.

Untuk screenshot deterministik, buka dengan query:

```
http://localhost:8080/?shot=cover&seed=1
http://localhost:8080/?shot=chop&seed=1
http://localhost:8080/?shot=serve&seed=1
http://localhost:8080/?shot=title&seed=1
```

## Struktur kode

```
game/
  index.html        halaman + canvas
  css/style.css     gaya halaman di sekitar canvas
  src/main.js       titik masuk: loop permainan
  src/config.js     konstanta, resep, dan pengacak berbenih
  src/input.js      keyboard + mouse
  src/kitchen.js    keadaan dapur dan semua aturan main
  src/orders.js     pesanan: muncul, berdetak, kedaluwarsa
  src/player.js     koki dan denah stasiun dapur
  src/render.js     semua gambar (vector canvas)
  src/audio.js      bunyi dari osilator WebAudio
  src/shots.js      adegan ?shot= untuk screenshot
main.ts             menyerahkan entry: salin game/ + screenshots/
                    ke /output dan tulis dossier.json
vendor/             pustaka make.fun (tidak diubah)
screenshots/        4 screenshot asli dari game ini
```

## Penyerahan

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).
