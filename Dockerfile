FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN ./node_modules/.bin/ng build --configuration production

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/superoffer/browser /usr/share/nginx/html
COPY runtime-config.sh /docker-entrypoint.d/40-superoffer-config.sh
RUN chmod +x /docker-entrypoint.d/40-superoffer-config.sh

EXPOSE 80

ENV SUPER_OFFER_API_URL=http://localhost:3000/api/v1

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
