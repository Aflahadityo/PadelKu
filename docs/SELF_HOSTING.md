# Self-hosting PadelKu

Infrastruktur ini memakai snapshot resmi Supabase `self-hosted/v0.8.0` pada commit `241bb11c0627f2981746d37033f57dbfa81d29b0`. Snapshot tersebut memakai Postgres 17 dan Envoy sebagai API gateway. File vendor resmi tidak disalin ke Git; bootstrap menaruhnya di `.supabase/docker`, mencatat `.supabase-version`, lalu root `compose.yaml` melapisinya dengan `infra/supabase/compose.app.yaml`.

## Prasyarat

- Git, Node.js 22, OpenSSL, Docker Engine, dan Docker Compose modern dengan dukungan `include` serta tag `!override`.
- Windows memerlukan Docker Desktop untuk development dan Git for Windows agar `sh` serta utilitas POSIX tersedia.
- Minimum Supabase adalah 4 GB RAM, 2 CPU, dan SSD 40 GB. Alokasikan setidaknya 8 GB RAM serta 4 CPU untuk stack lengkap dan aplikasi.

Docker Desktop hanya untuk workstation development. **Jangan gunakan Docker Desktop sebagai host production.** Production harus memakai Linux server yang dipelihara, Docker Engine, Compose plugin, firewall, monitoring, backup eksternal, dan kebijakan patch yang jelas.

## Development lokal

Untuk iterasi aplikasi tercepat, jalankan stack development Supabase CLI yang sudah dikonfigurasi oleh `supabase/config.toml`:

```sh
npx supabase start
npm run dev
```

Supabase CLI menyediakan API di `http://127.0.0.1:54321`, database di `127.0.0.1:54322`, Studio di `http://127.0.0.1:54323`, dan Mailpit di `http://127.0.0.1:54324`. Gunakan nilai dari `npx supabase status -o env` untuk environment aplikasi lokal. Hentikan stack dengan `npx supabase stop`.

Jangan jalankan stack CLI dan full Docker secara bersamaan karena port database `54322` akan bentrok.

## Bootstrap full Docker

POSIX shell:

```sh
sh infra/supabase/bootstrap.sh
docker compose config --quiet
docker compose up --build -d --wait
```

Windows PowerShell 5.1 atau yang lebih baru:

```powershell
powershell -ExecutionPolicy Bypass -File infra/supabase/bootstrap.ps1
docker compose config --quiet
docker compose up --build -d --wait
```

Bootstrap melakukan langkah berikut:

1. Mengambil tag resmi `self-hosted/v0.8.0` dan memverifikasi commit tag.
2. Menyalin direktori resmi `docker/` ke runtime `.supabase/docker` yang di-ignore.
3. Menulis `ref` dan commit ke `.supabase/docker/.supabase-version`.
4. Membuat `.supabase/docker/.env` dari contoh resmi.
5. Menjalankan `utils/generate-keys.sh --update-env` dan `utils/add-new-auth-keys.sh --update-env` resmi.
6. Mengaktifkan URL development, direct database port `54322`, dan override aplikasi.

Bootstrap aman dijalankan ulang pada snapshot yang sama dan tidak mengganti `.env` yang sudah dikustomisasi. Bootstrap menolak runtime tanpa stamp atau dengan versi lain agar data tidak tertimpa. `.env.docker.example` hanya referensi nama variabel; jangan memakainya sebagai `env_file` dan jangan memasukkan secret hasil generator ke Git.

Endpoint full Docker:

| Layanan | URL lokal | Catatan |
| --- | --- | --- |
| Aplikasi | `http://localhost:3000` | Port loopback, healthcheck pada `/` |
| Supabase gateway | `http://supabase.localhost:8000` | Envoy; browser dan container memakai URL yang sama |
| Studio | `http://localhost:8000` | Dirutekan Envoy dan dilindungi HTTP Basic Auth |
| Postgres direct | `127.0.0.1:54322` | Untuk migration, dump, dan administrasi lokal |
| Supavisor session | `127.0.0.1:5432` | Session pooling |
| Supavisor transaction | `127.0.0.1:6543` | Transaction pooling |

Semua port infrastruktur dibatasi ke loopback. Aplikasi terhubung ke service `api-gw` melalui network Compose dengan alias `supabase.localhost`. Data Postgres dan Storage memakai named volume agar I/O Docker Desktop Windows tidak bergantung pada bind mount NTFS yang lambat.

Dockerfile mengaktifkan `NEXT_BUILD_TARGET=standalone` untuk menghasilkan server minimal. Jangan set variabel ini pada Vercel; Vercel harus memakai output Next.js default agar adapter deployment dapat membangun Functions dan output tracing secara native.

Operasi harian:

```sh
docker compose ps
docker compose logs -f app
docker compose logs -f api-gw auth rest db
docker compose restart app
docker compose down
```

`docker compose down` mempertahankan named volume. Perintah `docker compose down -v` menghapus database, file Storage, dan konfigurasi database; gunakan hanya untuk reset yang disengaja setelah backup terverifikasi.

## Health dan diagnosis

`docker compose up -d --wait` menunggu healthcheck upstream dan aplikasi. Aplikasi baru dimulai setelah Envoy, Auth, PostgREST, dan Storage sehat. Verifikasi manual:

```sh
docker compose ps
curl --fail http://localhost:3000/
curl --fail http://localhost:8000/auth/v1/health
```

Jika service tidak sehat, lihat log service tersebut dan jalankan pemeriksaan resmi Supabase:

```sh
sh .supabase/docker/tests/test-container-logs.sh
```

Kegagalan entrypoint Envoy di Windows biasanya menandakan line ending CRLF. `.gitattributes` repository dan snapshot resmi memaksa shell, YAML, serta template runtime memakai LF.

## Migration dan seed

Sumber schema tetap `supabase/migrations`. Workflow deployment memakai Supabase CLI, bukan Prisma.

Setelah stack sehat, jalankan migration yang belum tercatat dan seed standar jika `supabase/seed.sql` tersedia:

```sh
sh infra/supabase/db-push.sh
```

```powershell
powershell -ExecutionPolicy Bypass -File infra/supabase/db-push.ps1
```

Helper membaca password hasil generator dari runtime yang di-ignore, meng-URL-encode password, lalu menjalankan `npx supabase db push --db-url` ke direct Postgres port. Jika `supabase/seed.sql` ada, helper menambahkan `--include-seed`. Seed harus idempotent untuk environment yang dapat menerima eksekusi ulang.

Alur perubahan schema:

```sh
npx supabase migration new nama_perubahan
npx supabase db reset
npx supabase migration list --local
```

Review SQL migration, uji RLS, lalu commit migration. Untuk production, buat backup dan jalankan helper migration sebagai langkah release terpisah sebelum mengganti container aplikasi. Jangan menjalankan `db reset` terhadap production karena perintah itu destruktif.

## Production

1. Gunakan Linux server dengan Docker Engine dan Compose plugin, bukan Docker Desktop.
2. Simpan `.supabase/docker/.env` dalam secret manager atau filesystem terenkripsi dengan permission ketat. Jangan masukkan file itu ke image, Git, artifact CI, atau log.
3. Ubah `SUPABASE_PUBLIC_URL`, `API_EXTERNAL_URL`, `SITE_URL`, dan `ADDITIONAL_REDIRECT_URLS` di runtime `.env` ke domain HTTPS production.
4. Set `ENABLE_EMAIL_AUTOCONFIRM=false`, konfigurasi SMTP production, dan review kebijakan signup, redirect Auth, OAuth, SMS, serta MFA.
5. Rebuild image aplikasi setelah URL atau publishable key berubah karena variabel `NEXT_PUBLIC_*` di-inline saat `next build`.
6. Jalankan migration terkontrol, smoke test, dan `docker compose up -d --wait`.

### TLS dan reverse proxy

Terminasi TLS di reverse proxy Caddy, Nginx, HAProxy, atau load balancer yang dipelihara. Jangan membuka port `8000`, `5432`, `54322`, atau `6543` ke Internet. Reverse proxy hanya perlu meneruskan domain aplikasi ke `127.0.0.1:3000` dan domain API ke `127.0.0.1:8000`.

Contoh Caddy pada host Linux:

```caddyfile
app.example.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}

api.example.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:8000
}
```

Runtime production yang sesuai:

```dotenv
SUPABASE_PUBLIC_URL=https://api.example.com
API_EXTERNAL_URL=https://api.example.com/auth/v1
SITE_URL=https://app.example.com
ADDITIONAL_REDIRECT_URLS=https://app.example.com/**
MAINTENANCE_SECRET=<random-secret-minimum-32-characters>
```

Pastikan container aplikasi dapat me-resolve dan mengakses domain API publik melalui reverse proxy; gunakan split-horizon DNS bila host tidak mendukung NAT hairpin. Caddy meneruskan WebSocket Realtime secara otomatis. Untuk Nginx, aktifkan header upgrade WebSocket, timeout yang memadai, batas upload sesuai Storage, dan `X-Forwarded-Proto`. Batasi akses Studio dengan VPN, allowlist IP, atau lapisan autentikasi tambahan meskipun Envoy sudah memberi Basic Auth.

Jadwalkan request berikut setiap menit dari scheduler yang dipercaya. Jangan menaruh secret di URL atau log:

```sh
curl --fail --request POST \
  --header "Authorization: Bearer $MAINTENANCE_SECRET" \
  https://app.example.com/api/internal/maintenance
```

Endpoint menjalankan expiry booking/payment dan completion booking dalam batch. Pantau respons non-2xx dan ulangi dengan backoff; operasi database bersifat idempotent.

### SMTP

Supabase Auth membutuhkan SMTP nyata agar confirmation, invite, recovery, dan email change dapat dikirim. Isi runtime `.env`:

```dotenv
SMTP_ADMIN_EMAIL=auth@example.com
SMTP_HOST=smtp.provider.example
SMTP_PORT=465
SMTP_USER=<smtp-user-from-secret-manager>
SMTP_PASS=<smtp-password-from-secret-manager>
SMTP_SENDER_NAME=PadelKu
ENABLE_EMAIL_AUTOCONFIRM=false
```

Gunakan port dan mode TLS yang diwajibkan provider, konfigurasi SPF, DKIM, dan DMARC, lalu recreate Auth agar environment baru diterapkan:

```sh
docker compose up -d --wait --force-recreate auth
```

## Backup dan restore

Production memerlukan backup otomatis ke host atau object storage terpisah, enkripsi, retensi, monitoring kegagalan, dan uji restore berkala. Snapshot named volume berikut cocok untuk backup penuh yang konsisten pada deployment kecil. Ia membutuhkan downtime dan hanya boleh direstore pada arsitektur serta snapshot Supabase yang kompatibel.

POSIX backup:

```sh
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP="$PWD/.supabase/backups/$STAMP"
mkdir -p "$BACKUP"
docker compose down
docker run --rm --mount type=volume,src=padelku_supabase-db-data,dst=/source,readonly --mount "type=bind,src=$BACKUP,dst=/backup" alpine:3.22 tar -czf /backup/postgres-data.tgz -C /source .
docker run --rm --mount type=volume,src=padelku_supabase-storage-data,dst=/source,readonly --mount "type=bind,src=$BACKUP,dst=/backup" alpine:3.22 tar -czf /backup/storage-data.tgz -C /source .
docker run --rm --mount type=volume,src=padelku_db-config,dst=/source,readonly --mount "type=bind,src=$BACKUP,dst=/backup" alpine:3.22 tar -czf /backup/db-config.tgz -C /source .
docker compose up -d --wait
```

PowerShell backup:

```powershell
$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$backup = Join-Path $PWD ".supabase\backups\$stamp"
New-Item -ItemType Directory -Path $backup | Out-Null
docker compose down
docker run --rm --mount "type=volume,src=padelku_supabase-db-data,dst=/source,readonly" --mount "type=bind,src=$backup,dst=/backup" alpine:3.22 tar -czf /backup/postgres-data.tgz -C /source .
docker run --rm --mount "type=volume,src=padelku_supabase-storage-data,dst=/source,readonly" --mount "type=bind,src=$backup,dst=/backup" alpine:3.22 tar -czf /backup/storage-data.tgz -C /source .
docker run --rm --mount "type=volume,src=padelku_db-config,dst=/source,readonly" --mount "type=bind,src=$backup,dst=/backup" alpine:3.22 tar -czf /backup/db-config.tgz -C /source .
docker compose up -d --wait
```

Backup runtime `.env` secara terpisah ke secret manager. Simpan juga fungsi yang dikustomisasi di `.supabase/docker/volumes/functions` dan snippet Studio yang perlu dipertahankan. Tanpa JWT signing keys, encryption keys, dan password yang sama, restore data tidak menghasilkan sistem Auth dan Vault yang setara.

Restore bersifat destruktif. Verifikasi checksum serta salinan off-host, hentikan stack, lalu buat ulang volume kosong:

```sh
docker compose down
docker volume rm padelku_supabase-db-data padelku_supabase-storage-data padelku_db-config
docker volume create padelku_supabase-db-data
docker volume create padelku_supabase-storage-data
docker volume create padelku_db-config
docker run --rm --mount type=volume,src=padelku_supabase-db-data,dst=/target --mount "type=bind,src=$BACKUP,dst=/backup,readonly" alpine:3.22 tar -xzf /backup/postgres-data.tgz -C /target
docker run --rm --mount type=volume,src=padelku_supabase-storage-data,dst=/target --mount "type=bind,src=$BACKUP,dst=/backup,readonly" alpine:3.22 tar -xzf /backup/storage-data.tgz -C /target
docker run --rm --mount type=volume,src=padelku_db-config,dst=/target --mount "type=bind,src=$BACKUP,dst=/backup,readonly" alpine:3.22 tar -xzf /backup/db-config.tgz -C /target
docker compose up -d --wait
```

Pada PowerShell, set `$BACKUP` ke direktori backup absolut dan gunakan tiga perintah `docker run` yang sama. Setelah restore, cek `docker compose ps`, Auth, REST, Realtime, object Storage, dan migration history. Untuk production dengan target RPO/RTO ketat, gunakan backup logis terjadwal, WAL archiving atau pgBackRest, dan mekanisme backup object storage; snapshot volume tunggal bukan pengganti point-in-time recovery.

## Update snapshot Supabase

Jangan memperbarui image service satu per satu. Snapshot resmi diuji sebagai satu set. Untuk setiap update:

1. Backup database, Storage, `db-config`, dan runtime `.env`.
2. Baca `docker/CHANGELOG.md`, release notes, serta breaking-change gate versi target.
3. Jalankan dry run dari runtime: `sh .supabase/docker/update.sh --dry-run --to self-hosted/vX.Y.Z`.
4. Uji restore backup dan update pada staging.
5. Jalankan `sh .supabase/docker/update.sh --to self-hosted/vX.Y.Z` pada maintenance window.
6. Review merge conflict, `.supabase-version`, perubahan `.env.example`, image Postgres, dan gateway.
7. Jalankan `docker compose config --quiet`, tarik image, start dengan `--wait`, migration aplikasi, lalu smoke test.
8. Dalam perubahan repository yang sama, perbarui pin ref dan commit terverifikasi pada kedua bootstrap script, `.env.docker.example`, serta dokumen ini.

Untuk perpindahan major Postgres, ikuti upgrade script dan release notes resmi; jangan memasang volume data major lama langsung ke image Postgres major baru. Rollback dilakukan dengan restore backup teruji, bukan dengan mengganti tag image secara acak.
