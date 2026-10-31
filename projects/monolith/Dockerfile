# syntax=docker/dockerfile:1
#
# Merch Store — monólito (fase 1) para Cloud Run.
# Contexto do build = RAIZ do workspace:
#   docker build -f projects/monolith/Dockerfile -t merch-monolith .
#   docker run --rm -p 8080:8080 -e STORE_NAME="Merch Store" merch-monolith

# ---------- 1) build (Node LTS) ----------
FROM node:24-alpine AS build
WORKDIR /workspace
ENV NG_CLI_ANALYTICS=false CI=true

# Dependências primeiro: camada reaproveitada enquanto o lockfile não muda.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY angular.json tsconfig.json ./
COPY projects/monolith ./projects/monolith
RUN npx ng build monolith --configuration production

# ---------- 2) runtime (nginx) ----------
FROM nginx:alpine AS runtime

# Valores padrão da config de runtime (sobrescreva com -e / --set-env-vars).
ENV STORE_NAME="Merch Store" \
    APP_ENVIRONMENT="production" \
    PROMO_MESSAGE="Cadastre-se e ganhe 10% de desconto com o cupom WORKSHOP10" \
    PROMO_LINK_LABEL="Cadastrar" \
    PROMO_LINK_URL="#newsletter" \
    CONTACT_EMAIL="atendimento@merchstore.example" \
    CONTACT_PHONE="(11) 4000-0000" \
    CONTACT_HOURS="Segunda a sexta, das 9h às 18h"

RUN rm -f /etc/nginx/conf.d/default.conf
COPY projects/monolith/nginx.conf /etc/nginx/conf.d/merch.conf
# Gera config.json a partir das variáveis de ambiente a cada start (sem rebuild).
COPY --chmod=755 projects/monolith/docker-entrypoint.d/40-merch-config.sh /docker-entrypoint.d/40-merch-config.sh
# Defesa contra checkout com CRLF (Windows): /bin/sh não executa scripts com "\r".
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-merch-config.sh
COPY --from=build /workspace/dist/monolith/browser /usr/share/nginx/html

EXPOSE 8080
