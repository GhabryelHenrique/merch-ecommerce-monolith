# Deploy no Cloud Run — monólito (fase 1)

> **Documentação apenas.** Nada aqui foi executado: publicar imagem e criar serviço gastam recursos
> e exigem pedido explícito (AGENTS.md §10).

## 1. Imagem local

```bash
# contexto = raiz do workspace
docker build -f projects/monolith/Dockerfile -t merch-monolith:f1 .

# roda em http://localhost:8080 (mesma porta do Cloud Run)
docker run --rm -p 8080:8080 \
  -e STORE_NAME="Merch Store" \
  -e APP_ENVIRONMENT="local-docker" \
  merch-monolith:f1

# paridade: a mesma suíte e2e contra o container
BASE_URL=http://localhost:8080 npm run e2e
```

## 2. Artifact Registry

```bash
export PROJECT_ID="<seu-projeto>"
export REGION="southamerica-east1"
export REPO="merch"
export IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/merch-monolith"
export TAG="$(git rev-parse --short HEAD)"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker --location="$REGION" \
  --description="Merch Store (workshop)"
gcloud auth configure-docker "$REGION-docker.pkg.dev"

docker build -f projects/monolith/Dockerfile -t "$IMAGE:$TAG" .
docker push "$IMAGE:$TAG"
```

> Alternativa sem Docker local: `gcloud builds submit --tag "$IMAGE:$TAG" -f projects/monolith/Dockerfile .`
> (o Cloud Build usa o mesmo Dockerfile; ajuste com um `cloudbuild.yaml` se a flag `-f` não for aceita na sua versão).

## 3. Cloud Run

```bash
gcloud run deploy merch-monolith \
  --image "$IMAGE:$TAG" \
  --region southamerica-east1 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "STORE_NAME=Merch Store,APP_ENVIRONMENT=production"
```

## 4. Mudar configuração sem rebuild

O `config.json` é gerado no start do container (`/docker-entrypoint.d/40-merch-config.sh`) a partir de
variáveis de ambiente. Uma nova revisão com outras variáveis **reaproveita a mesma imagem**:

```bash
gcloud run services update merch-monolith --region southamerica-east1 \
  --update-env-vars "PROMO_MESSAGE=Frete grátis neste fim de semana,PROMO_LINK_URL=/c/promocoes,PROMO_LINK_LABEL=Ver ofertas"
```

| Variável | Campo do `config.json` |
|---|---|
| `STORE_NAME` | `storeName` |
| `APP_ENVIRONMENT` | `environment` |
| `PROMO_MESSAGE` · `PROMO_LINK_LABEL` · `PROMO_LINK_URL` | `promo.*` |
| `CONTACT_EMAIL` · `CONTACT_PHONE` · `CONTACT_HOURS` | `contact.*` |

## 5. Validar a revisão publicada

```bash
URL="$(gcloud run services describe merch-monolith --region southamerica-east1 --format='value(status.url)')"
BASE_URL="$URL" npm run e2e
```

## Cache e segurança (nginx)

| Recurso | `Cache-Control` |
|---|---|
| `index.html`, rotas da SPA, `config.json` | `no-cache` |
| `main-*.js`, `chunk-*.js`, `styles-*.css` (hash no nome) | `public, max-age=31536000, immutable` |
| Demais assets (`catalog/*.json`, SVGs) | `public, max-age=300` |

Cabeçalhos: `Content-Security-Policy` (sem script inline — por isso `inlineCritical: false` no build),
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`. Gzip para JS, CSS, JSON e SVG. Asset inexistente → 404 (não cai no `index.html`).
