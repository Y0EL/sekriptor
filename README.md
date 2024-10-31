# Sekriptor

**Sekriptor** adalah aplikasi web buat lo yang mau bikin skrip konten dengan gampang, mulai dari TikTok, YouTube Shorts, Instagram Reels, dan lainnya. Interface-nya simpel banget dan udah ada sistem autentikasi juga. Lo bisa generate skrip, kelola histori skrip, sampai edit judul skrip yang udah lo buat. Plus, ada fitur toggle tema gelap/terang biar mata gak cepet capek.

## Fitur-Fitur

- **Bikin Skrip**: Generate skrip berdasarkan judul, alasan, dan tipe konten (TikTok, YouTube Shorts, dll.).
- **Histori Skrip**: Simpen dan lihat lagi skrip-skrip yang udah lo buat sebelumnya. Lo juga bisa edit judul skrip yang udah tersimpan.
- **Dark/Light Mode**: Ganti mode gelap atau terang sesuai selera lo, cukup satu klik aja.
- **Autentikasi**: Akses aplikasi pakai password yang bisa diinget sampai 1 jam.

## Teknologi yang Dipake

- **Next.js** pake directive `use client` biar lebih optimal
- **React Hooks** buat manage state kayak `useState`, `useEffect`
- **Next Themes** buat switch tema (dark/light mode)
- **Lucide Icons** buat ikon-ikon UI (MoonIcon, SunIcon, dll.)
- **Komponen UI Custom**: Button, Card, Input, Select, Textarea, Alert, Dialog dari library UI custom

## Cara Instalasi

1. Clone repo ini, terus pindah ke folder proyeknya.
2. Install semua dependencies.
3. Jalankan server development, terus buka di browser lo.

## Cara Pakai

1. **Login**: Masukin password `dev` buat login. Lo bisa pilih opsi "ingat password" biar gak bolak-balik login selama 1 jam.
2. **Generate Skrip**: Isi kolom judul, alasan, dan pilih tipe konten (TikTok, YouTube Shorts, dll.). Abis itu tinggal submit.
3. **Histori Skrip**: Lihat histori skrip lo di menu atau di halaman utama. Judul skrip yang udah tersimpan juga bisa lo edit.
4. **Ganti Tema**: Klik ikon matahari atau bulan buat switch antara mode terang dan gelap.

## Kustomisasi

- **Ganti Password**: Lo bisa edit logika password di fungsi `handleAuth` di komponen `Home`.
- **Tambah Tipe Konten**: Kalo mau nambah tipe konten lain, tinggal edit `<SelectItem>` di dropdown tipe konten.
- **Ganti Ikon**: Mau ganti ikon? Lo bisa pake import lain dari library `lucide-react`.

## Dependencies

- [Next.js](https://nextjs.org/) - Framework React buat Production
- [React](https://reactjs.org/) - Library JavaScript buat bikin UI
- [Lucide React](https://lucide.dev/) - Set ikon open-source
- [Next Themes](https://github.com/pacocoursey/next-themes) - Buat manage tema di app Next.js

## Kontribusi

Kalo ada saran, ide, atau mau kontribusi fitur baru, feel free buat buka issue atau submit pull request. Semua kontribusi bakal gue sambut!

## Lisensi

Proyek ini dilisensiin di bawah MIT License. Cek file [LICENSE](LICENSE) buat detailnya.
