# syntax=docker/dockerfile:1

###############################################################################
# 1) Derleme
###############################################################################
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# Vite degiskenleri derleme zamaninda gomulur; bos birakilirsa uygulama
# ayni origin uzerinden /api/v1 yolunu kullanir (nginx proxy'ler).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

###############################################################################
# 2) Statik dosyalari nginx ile servis et
###############################################################################
FROM nginx:1.27-alpine AS runner

# Backend adresini calisma zamaninda enjekte edebilmek icin nginx template'i.
# Sadece BACKEND_ ile baslayan degiskenler degistirilir; $host, $uri gibi
# nginx degiskenleri oldugu gibi kalir.
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=3000
ENV NGINX_ENVSUBST_FILTER=^BACKEND_

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
