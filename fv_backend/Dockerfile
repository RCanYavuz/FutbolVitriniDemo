# syntax=docker/dockerfile:1

###############################################################################
# 1) Bagimliliklar - tum bagimliliklar (dev dahil) derleme icin
###############################################################################
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

###############################################################################
# 2) Derleme - Prisma istemcisi + nest build
###############################################################################
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Seed TypeScript kaynakli, fakat uretim imajinda tsx/devDependencies bulunmuyor.
# Yerel Prisma istemcisini bundle'a dahil edip sadece calisma zamani paketlerini
# external birakiyoruz; boylece runner `node prisma/seed.cjs` ile seed edebilir.
RUN npx prisma generate \
  && npx nest build \
  && ./node_modules/.bin/esbuild prisma/seed.ts \
    --bundle \
    --platform=node \
    --target=node22 \
    --format=cjs \
    --packages=external \
    --outfile=prisma/seed.cjs

###############################################################################
# 3) Uretim bagimliliklari - dev paketleri olmadan
###############################################################################
FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
# prisma CLI dependencies altinda; migrate deploy calistirabilmek icin gerekli.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

###############################################################################
# 4) Calisma imaji
###############################################################################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Prisma'nin ihtiyac duydugu OpenSSL + saglik kontrolu icin wget zaten alpine'da var
RUN apk add --no-cache openssl dumb-init

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/prisma/seed.cjs ./prisma/seed.cjs
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh \
  && chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health > /dev/null || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
