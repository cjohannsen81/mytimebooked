#!/usr/bin/env bash
# MyTimeBooked — single-VM bootstrap.
#
# RUN ONCE on a fresh Ubuntu 22.04 / 24.04 VM. Do NOT re-run on a
# populated VM to "deploy updates" — that's what `git push origin main`
# is for (.github/workflows/deploy.yml). This script will refuse to
# reseed an existing database to protect production data; if you
# really mean it, set FORCE_RESEED=1 in the environment.
#
#   curl -fsSL https://raw.githubusercontent.com/cjohannsen81/mytimebooked/main/bootstrap.sh | bash
#
# Or after cloning:
#   bash bootstrap.sh

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/cjohannsen81/mytimebooked.git}"
APP_DIR="${APP_DIR:-$HOME/mytimebooked}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -hex 16)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

log() { echo -e "\n\033[1;36m▶ $*\033[0m"; }

# ---------- 1. System packages ----------
log "Updating system & installing base packages"
sudo apt-get update -y
sudo apt-get install -y curl git ca-certificates gnupg ufw nginx rsync

# ---------- 2. Node 22 ----------
if ! command -v node &>/dev/null || [[ "$(node -v)" != v22* ]]; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v && npm -v

# ---------- 3. Docker (for Postgres) ----------
if ! command -v docker &>/dev/null; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

# ---------- 4. Postgres in Docker ----------
if ! sudo docker ps -a --format '{{.Names}}' | grep -q '^mytimebooked-pg$'; then
  log "Starting Postgres container"
  sudo docker run -d \
    --name mytimebooked-pg \
    --restart unless-stopped \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -e POSTGRES_DB=mytimebooked \
    -p 127.0.0.1:5432:5432 \
    -v mytimebooked-pgdata:/var/lib/postgresql/data \
    postgres:16
  echo "Waiting for Postgres to accept connections..."
  for i in {1..30}; do
    sudo docker exec mytimebooked-pg pg_isready -U postgres &>/dev/null && break
    sleep 1
  done
fi

# ---------- 5. Clone the repo ----------
if [ ! -d "$APP_DIR" ]; then
  log "Cloning $REPO_URL"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# ---------- 6. Server setup ----------
log "Installing server dependencies"
cd "$APP_DIR/server"

# Build .env if not present
if [ ! -f .env ]; then
  cat > .env <<EOF
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/mytimebooked?schema=public"
JWT_SECRET="${JWT_SECRET}"
# IMPORTANT: once your domain points at this VM, keep this as the real domain.
# Used for links in emails and any absolute redirects.
CLIENT_URL="https://mytimebooked.com"
PORT=4000
EOF
  chmod 600 .env
  echo "✓ Wrote $APP_DIR/server/.env (DB password + JWT secret generated, 600 perms)"
fi

npm install
npx prisma generate
npx prisma migrate deploy
# Seed only on a fresh DB. seed.js itself also bails out if users exist
# (set FORCE_RESEED=1 to override), so this is belt-and-suspenders.
USER_COUNT=$(sudo docker exec -i mytimebooked-pg psql -U postgres -d mytimebooked -tAc "SELECT COUNT(*) FROM \"User\";" 2>/dev/null || echo 0)
if [ "${USER_COUNT:-0}" = "0" ]; then
  npm run seed
else
  echo "✓ Skipping seed — database already has $USER_COUNT users."
fi

# ---------- 7. Client build ----------
log "Building client"
cd "$APP_DIR/client"
if [ ! -f .env ]; then
  cat > .env <<EOF
VITE_API_URL=/api
EOF
  chmod 600 .env
fi
npm install
npm run build

# ---------- 8. PM2 to keep the server alive ----------
log "Installing PM2 and starting API"
sudo npm install -g pm2

cd "$APP_DIR/server"
pm2 delete mytimebooked-api 2>/dev/null || true
pm2 start src/index.js --name mytimebooked-api
pm2 save
# Auto-start on reboot
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$USER" --hp "$HOME"

# ---------- 9. Nginx reverse proxy ----------
log "Configuring nginx from repo template"
if [ -f /etc/letsencrypt/live/mytimebooked.com/fullchain.pem ]; then
  NGINX_TEMPLATE="$APP_DIR/deploy/nginx/mytimebooked.https.conf.template"
else
  NGINX_TEMPLATE="$APP_DIR/deploy/nginx/mytimebooked.http.conf.template"
fi
sed "s|__APP_DIR__|$APP_DIR|g" "$NGINX_TEMPLATE" \
  | sudo tee /etc/nginx/sites-available/mytimebooked > /dev/null

sudo ln -sf /etc/nginx/sites-available/mytimebooked /etc/nginx/sites-enabled/mytimebooked
sudo rm -f /etc/nginx/sites-enabled/default

# Let nginx (www-data) traverse the deploy user's home so it can read client/dist
sudo usermod -a -G "$USER" www-data

sudo nginx -t
sudo systemctl restart nginx

# ---------- 9b. Sudoers entry for GH Actions deploys ----------
log "Installing sudoers entry for GH Actions deploys"
sed "s|__DEPLOY_USER__|$USER|g" \
  "$APP_DIR/deploy/sudoers-mytimebooked-deploy.template" > /tmp/sudoers-mytimebooked-deploy
sudo install -m 440 -o root -g root /tmp/sudoers-mytimebooked-deploy /etc/sudoers.d/mytimebooked-deploy
sudo visudo -c -f /etc/sudoers.d/mytimebooked-deploy
rm -f /tmp/sudoers-mytimebooked-deploy

# ---------- 9c. Certbot (Let's Encrypt) — install only ----------
# Once DNS points at this VM, run:
#   sudo certbot certonly --webroot -w /var/www/certbot \
#     -d mytimebooked.com -d www.mytimebooked.com
#   sudo chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
# The chmod lets the deploy workflow detect cert presence as the deploy
# user (file perms inside archive/ still protect the private key).
# After certs exist, the next deploy auto-switches to the HTTPS template.
if ! command -v certbot &>/dev/null; then
  log "Installing certbot"
  sudo apt-get install -y certbot
  sudo mkdir -p /var/www/certbot
fi

# ---------- 10. Firewall ----------
log "Configuring firewall"
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS (for later when you add a domain)
sudo ufw --force enable

# ---------- Done ----------
PUBLIC_IP=$(curl -s ifconfig.me)
cat <<EOF


╔════════════════════════════════════════════════════════════════╗
║  ✓ MyTimeBooked is live                                        ║
╠════════════════════════════════════════════════════════════════╣
║  URL:        http://$PUBLIC_IP
║  Health:     http://$PUBLIC_IP/api/health
║
║  Demo login (customer):  demo@mytimebooked.com / password123
║  Demo login (pro):       maria.santos@mytimebooked.com / password123
║
║  Useful commands:
║    pm2 logs mytimebooked-api     # see server logs
║    pm2 restart mytimebooked-api  # restart server
║    sudo docker logs mytimebooked-pg  # postgres logs
║    sudo systemctl reload nginx   # reload nginx
║
║  To deploy updates:
║    Push to main — GitHub Actions runs .github/workflows/deploy.yml
║
║  To enable HTTPS (once DNS points at this VM):
║    sudo certbot certonly --webroot -w /var/www/certbot \\
║      -d mytimebooked.com -d www.mytimebooked.com
║    sudo chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
╚════════════════════════════════════════════════════════════════╝

EOF
