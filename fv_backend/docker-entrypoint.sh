#!/bin/sh
set -e

# Portainer/compose ile tek tikta ayaga kalkabilmesi icin migration'lari
# uygulama baslamadan once calistiriyoruz. Kapatmak icin: RUN_MIGRATIONS=false
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] prisma migrate deploy calistiriliyor..."
  ./node_modules/.bin/prisma migrate deploy
fi

# Seed idempotent'tir, ancak sabit demo hesaplari olusturdugu icin sadece acikca
# RUN_SEED=true verildiginde calisir. Migration'dan sonra kosmasi zorunludur.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] idempotent seed calistiriliyor..."
  node prisma/seed.cjs
fi

echo "[entrypoint] uygulama baslatiliyor: $*"
exec "$@"
