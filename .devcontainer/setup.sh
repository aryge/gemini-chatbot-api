#!/usr/bin/env bash
set -Eeuo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

version_ge() {
  [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

info "Memulai inisialisasi environment..."

# 1. Validasi Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VERSION="$(node --version | sed 's/^v//')"
  if version_ge "$NODE_VERSION" "18.0.0"; then
    success "Node.js v${NODE_VERSION} tersedia."
  else
    warn "Node.js v${NODE_VERSION} terdeteksi; modul membutuhkan v18+."
  fi
else
  warn "Node.js tidak ditemukan."
fi

# 2. Validasi Git
if command -v git >/dev/null 2>&1; then
  GIT_VERSION="$(git --version | awk '{print $3}')"
  if version_ge "$GIT_VERSION" "2.40.0"; then
    success "Git v${GIT_VERSION} tersedia."
  else
    warn "Git v${GIT_VERSION} terdeteksi; disarankan v2.40+."
  fi
else
  warn "Git tidak ditemukan."
fi

# 3. Konfigurasi Git fallback
if [ -z "$(git config --global user.name || true)" ]; then
  git config --global user.name "${GITHUB_USER:-Cloud Developer}"
  warn "Git user.name belum ada; fallback diterapkan."
else
  success "Git user.name sudah tersedia."
fi

if [ -z "$(git config --global user.email || true)" ]; then
  git config --global user.email "developer@cloud.local"
  warn "Git user.email belum ada; ganti sebelum commit."
else
  success "Git user.email sudah tersedia."
fi

# 4. Template environment variable (.env.example)
if [ ! -f ".env.example" ]; then
  cat > .env.example <<'EOF'
GEMINI_API_KEY=
EOF
  success ".env.example dibuat."
else
  success ".env.example sudah tersedia."
fi

# 5. Lindungi secret dan folder spesifik dari Git
if [ ! -f ".gitignore" ]; then
  echo -e "/node_modules\n.env\npackage-lock.json\nuploads/" > .gitignore
  success ".gitignore dibuat."
else
  grep -qxF ".env" .gitignore || echo ".env" >> .gitignore
  grep -qxF "/node_modules" .gitignore || echo "/node_modules" >> .gitignore
  grep -qxF "package-lock.json" .gitignore || echo "package-lock.json" >> .gitignore
  success ".gitignore divalidasi."
fi

# 6. Setup Dependency Dinamis (Auto-Scaffolding)
if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ] && [ ! -f "Cargo.toml" ]; then
  info "Direktori kosong terdeteksi. Menginisialisasi stack Gemini API..."
  npm init -y > /dev/null
  npm pkg set type="module"
  success "package.json diatur dengan 'type': 'module'."
  info "Menginstal dependensi utama (express, dotenv, @google/genai, multer)..."
  npm install express dotenv @google/genai cors
  success "Stack Gemini API berhasil disiapkan."
elif [ -f "package-lock.json" ]; then
  info "package-lock.json terdeteksi; menjalankan npm ci..."
  npm ci
  success "Dependency Node.js terpasang."
elif [ -f "package.json" ]; then
  info "package.json terdeteksi; menjalankan npm install..."
  npm install
  success "Dependency Node.js terpasang."
else
  warn "Tidak ada manifest dependency yang dikenali; melewatkan instalasi package."
fi

# 7. Injeksi Gemini Secret Lokal
if [ -n "${GEMINI_API_KEY:-}" ]; then
  success "GEMINI_API_KEY tersedia dari environment secret."
  if [ ! -f ".env" ]; then
    printf 'GEMINI_API_KEY=%s\n' "$GEMINI_API_KEY" > .env
    chmod 600 .env
    success ".env dibuat dari Codespaces Secret."
  fi
else
  warn "GEMINI_API_KEY belum tersedia. Tambahkan sebagai Codespaces Secret."
fi

success "Inisialisasi selesai. Environment siap digunakan."
