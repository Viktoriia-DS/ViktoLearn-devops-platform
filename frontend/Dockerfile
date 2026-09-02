# ---------- Builder ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM nginxinc/nginx-unprivileged:alpine AS runtime

USER root
RUN apk add --no-cache libexpat=2.8.4-r0
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
