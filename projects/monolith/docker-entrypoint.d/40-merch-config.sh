#!/bin/sh
# Gera /usr/share/nginx/html/config.json a partir de variáveis de ambiente no start do
# container. Mudar a configuração = novo deploy/revisão SEM rebuild da imagem
# (precursor do federation.manifest.json da fase 2).
set -eu

TARGET="/usr/share/nginx/html/config.json"

# Escapa para string JSON: barra invertida e aspas.
json() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

cat > "$TARGET" <<EOF
{
  "storeName": "$(json "${STORE_NAME:-Merch Store}")",
  "environment": "$(json "${APP_ENVIRONMENT:-production}")",
  "promo": {
    "message": "$(json "${PROMO_MESSAGE:-}")",
    "linkLabel": "$(json "${PROMO_LINK_LABEL:-}")",
    "linkUrl": "$(json "${PROMO_LINK_URL:-/}")"
  },
  "contact": {
    "email": "$(json "${CONTACT_EMAIL:-}")",
    "phone": "$(json "${CONTACT_PHONE:-}")",
    "hours": "$(json "${CONTACT_HOURS:-}")"
  }
}
EOF

echo "40-merch-config: config.json gerado (environment=${APP_ENVIRONMENT:-production}, store=${STORE_NAME:-Merch Store})"
