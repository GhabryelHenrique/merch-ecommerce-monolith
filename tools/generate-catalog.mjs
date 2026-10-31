#!/usr/bin/env node
/**
 * Gera os dados mock e as imagens SVG do domínio catalog.
 *
 *   node tools/generate-catalog.mjs
 *
 * Saída: projects/monolith/public/catalog/{products,categories,collections,banners}.json
 *        projects/monolith/public/catalog/images/*.svg
 *
 * Determinístico (sem aleatoriedade): rodar de novo produz os mesmos arquivos.
 * Nomes, preços e URLs das fotos vêm do catálogo público da Google Merch Shop (preços convertidos
 * para BRL; fotos referenciadas por URL a partir de tools/official-images.json). Descrições,
 * banners e imagens de coleção são próprios (SVG gerado aqui).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'projects/monolith/public/catalog');
const IMAGES = join(OUT, 'images');
const IMG_PREFIX = 'catalog/images';
const SIZE = 800;
const OFFICIAL_IMAGES = JSON.parse(readFileSync(join(ROOT, 'tools/official-images.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Paleta de cores das variantes
// ---------------------------------------------------------------------------
const COLORS = {
  preto: { label: 'Preto', hex: '#202124' },
  branco: { label: 'Branco', hex: '#f8f9fa' },
  azul: { label: 'Azul', hex: '#1a73e8' },
  marinho: { label: 'Azul-marinho', hex: '#174ea6' },
  vermelho: { label: 'Vermelho', hex: '#d93025' },
  verde: { label: 'Verde', hex: '#188038' },
  oliva: { label: 'Verde-oliva', hex: '#5f6b3a' },
  amarelo: { label: 'Amarelo', hex: '#f9ab00' },
  cinza: { label: 'Cinza', hex: '#9aa0a6' },
  areia: { label: 'Areia', hex: '#e6d5b8' },
  bordo: { label: 'Bordô', hex: '#912a36' },
  creme: { label: 'Creme', hex: '#faeed4' },
  mocha: { label: 'Mocha', hex: '#715c57' },
};

// ---------------------------------------------------------------------------
// Categorias, coleções e banners
// ---------------------------------------------------------------------------
const categories = [
  {
    slug: 'vestuario',
    name: 'Vestuário',
    description: 'Camisetas, moletons, jaquetas, bonés e roupas infantis.',
    subcategories: [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'moletons', name: 'Moletons' },
      { slug: 'jaquetas', name: 'Jaquetas' },
      { slug: 'bones-gorros', name: 'Bonés e gorros' },
      { slug: 'infantil', name: 'Infantil' },
    ],
  },
  {
    slug: 'bolsas-acessorios',
    name: 'Bolsas & Acessórios',
    description: 'Mochilas, bolsas, pins e chaveiros.',
    subcategories: [
      { slug: 'mochilas', name: 'Mochilas' },
      { slug: 'bolsas-sacolas', name: 'Bolsas e sacolas' },
      { slug: 'chaveiros-pins', name: 'Chaveiros e pins' },
    ],
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Garrafas, cadernos, adesivos e itens para casa.',
    subcategories: [
      { slug: 'garrafas-canecas', name: 'Garrafas e canecas' },
      { slug: 'escritorio', name: 'Escritório' },
      { slug: 'casa', name: 'Casa' },
    ],
  },
  {
    slug: 'presentes',
    name: 'Presentes',
    description: 'Colecionáveis e brinquedos para presentear.',
    subcategories: [
      { slug: 'colecionaveis', name: 'Colecionáveis' },
      { slug: 'brinquedos', name: 'Brinquedos' },
    ],
  },
];

const collections = [
  {
    slug: 'holiday-2026',
    name: 'Holiday 2026',
    tagline: 'Clima de festa para o fim de ano',
    description: 'Suéter, gorro e globo de neve em vermelho e verde para as festas.',
    theme: 'campaign-4',
    palette: ['#d93025', '#188038', '#fce8e6'],
    art: { shape: 'hoodie', mark: 'dots' },
  },
  {
    slug: 'google-g',
    name: 'Google G',
    tagline: 'As quatro cores em peças do dia a dia',
    description: 'Camisetas, moletons, garrafas e acessórios com as cores clássicas.',
    theme: 'campaign-1',
    palette: ['#1a73e8', '#d93025', '#e8f0fe'],
    art: { shape: 'tshirt', mark: 'dots' },
  },
  {
    slug: 'chrome-dino',
    name: 'Chrome Dino',
    tagline: 'Para quem já ficou sem internet',
    description: 'Peças em pixel art inspiradas no jogo do navegador offline.',
    theme: 'campaign-2',
    palette: ['#5f6368', '#202124', '#fef7e0'],
    art: { shape: 'tshirt', mark: 'pixel' },
  },
  {
    slug: 'g-bike',
    name: 'G Bike',
    tagline: 'As bicicletas coloridas do campus',
    description: 'Camisetas, garrafas e miniaturas inspiradas nas bicicletas do campus.',
    theme: 'campaign-3',
    palette: ['#188038', '#f9ab00', '#e6f4ea'],
    art: { shape: 'bike', mark: 'dots' },
  },
  {
    slug: 'sustentavel',
    name: 'Sustentável',
    tagline: 'Orgânico, reciclado e reutilizável',
    description: 'Algodão orgânico, materiais reciclados e garrafas reutilizáveis.',
    theme: 'campaign-3',
    palette: ['#5f6b3a', '#188038', '#e6f4ea'],
    art: { shape: 'tote', mark: 'dots' },
  },
];

const banners = {
  hero: {
    eyebrow: 'Nova coleção',
    title: 'Holiday 2026 chegou',
    subtitle: 'Suéter, gorro e globo de neve para as festas de fim de ano. Edição limitada.',
    ctaLabel: 'Conhecer a coleção',
    ctaUrl: '/c/todos?colecao=holiday-2026',
    image: { src: `${IMG_PREFIX}/banner-hero.svg`, alt: '', width: 1600, height: 900 },
  },
  seasonal: {
    eyebrow: 'Temporada de presentes',
    title: 'Presentes que todo mundo usa',
    subtitle: 'Colecionáveis Chrome Dino, miniaturas G Bike e brinquedos para todas as idades.',
    ctaLabel: 'Ver presentes',
    ctaUrl: '/c/presentes',
    image: { src: `${IMG_PREFIX}/banner-sazonal.svg`, alt: '', width: 1600, height: 700 },
  },
  sustainability: {
    title: 'Feito para durar',
    text: 'Algodão orgânico, materiais reciclados e garrafas reutilizáveis em toda a linha Sustentável.',
    ctaLabel: 'Conhecer a linha Sustentável',
    ctaUrl: '/c/todos?colecao=sustentavel',
  },
};

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
// Nomes e preços baseados no catálogo público da Google Merch Shop (página "Brands › Google").
// Preço em libras convertido a R$ 7/£ e arredondado para ,90 — `gbp(21)` → 14690 centavos.
// Fotos: URLs oficiais (your.merch.google), carregadas do próprio site — não são copiadas para o repo.
// Itens de outras marcas (The North Face, Lululemon, Stanley, Columbia…) ficaram de fora.
const gbp = (pounds) => Math.ceil(pounds * 7) * 100 - 10;

const ADULT = ['P', 'M', 'G', 'GG'];
const KIDS = ['4', '6', '8', '10'];
const BABY = ['6-12M', '12-18M', '18-24M'];

/**
 * Definição compacta. `out` = combinações esgotadas ("cor" ou "cor/tamanho" ou "*").
 * `ref` = slug do produto na Google Merch Shop; as fotos vêm de `tools/official-images.json`.
 */
const defs = [
  // Vestuário — camisetas
  { name: 'Camiseta Google G', ref: 'super-g-black-tee', cat: 'vestuario/camisetas', cols: ['google-g'], price: gbp(30), colors: ['preto'], sizes: ADULT, badges: ['bestseller'], featured: true, pop: 98, date: '2025-03-10', out: ['preto/GG'], desc: 'Camiseta unissex de algodão orgânico com o G em quatro cores no peito. Modelagem reta e gola reforçada.' },
  { name: 'Camiseta Google Cloud Azul-marinho', ref: 'google-cloud-navy-tee', cat: 'vestuario/camisetas', cols: [], price: gbp(26), colors: ['marinho'], sizes: ADULT, badges: [], pop: 63, date: '2025-06-12', desc: 'Camiseta azul-marinho com a nuvem do Google Cloud estampada em branco.' },
  { name: 'Camiseta Unissex Chrome Dino', ref: 'stan-dino-unisex-tee', cat: 'vestuario/camisetas', cols: ['chrome-dino'], price: gbp(26), colors: ['branco'], sizes: ADULT, badges: ['bestseller'], pop: 90, date: '2025-04-20', desc: 'Estampa em pixel art do dinossauro mais famoso do navegador. Algodão macio e toque leve.' },
  { name: 'Camiseta G Bike Azul-gelo', ref: 'g-bike-unisex-tee-blue-ice', cat: 'vestuario/camisetas', cols: ['g-bike'], price: gbp(36), colors: ['azul'], sizes: ADULT, badges: [], pop: 58, date: '2025-08-01', desc: 'Camiseta com a bicicleta colorida do campus estampada nas costas.' },
  { name: 'Camiseta Boxy Verde-oliva', ref: 'olive-boxy-tee', cat: 'vestuario/camisetas', cols: ['holiday-2026', 'sustentavel'], price: gbp(32), colors: ['oliva'], sizes: ADULT, badges: ['new'], pop: 70, date: '2026-10-12', desc: 'Modelagem ampla e ombro caído, em algodão orgânico encorpado.' },
  { name: 'Camiseta Google Oceano Profundo', ref: 'ocean-depth-tee', cat: 'vestuario/camisetas', cols: [], price: gbp(20.16), compareAt: gbp(30), colors: ['marinho'], sizes: ADULT, badges: ['sale'], pop: 52, date: '2025-05-14', desc: 'Camiseta unissex em azul profundo com a logo bordada em tom sobre tom.' },
  // Vestuário — moletons
  { name: 'Moletom com Zíper Google Plymouth 3.0', ref: 'google-plymouth-3-0-navy-zip-hoodie', cat: 'vestuario/moletons', cols: [], price: gbp(73), colors: ['marinho'], sizes: ADULT, badges: ['bestseller'], featured: true, pop: 97, date: '2025-09-01', out: ['marinho/P'], desc: 'Moletom aberto com capuz, zíper frontal e bolsos laterais. Felpa macia por dentro.' },
  { name: 'Suéter Google Holidays 2026', ref: 'google-holidays-2026-jumper', cat: 'vestuario/moletons', cols: ['holiday-2026'], price: gbp(60), colors: ['vermelho'], sizes: ADULT, badges: ['new'], featured: true, pop: 82, date: '2026-10-20', desc: 'Suéter de tricô com padronagem natalina, edição limitada de fim de ano.' },
  { name: 'Moletom Google G Bordô', ref: 'super-g-unisex-burgundy-hoodie', cat: 'vestuario/moletons', cols: ['google-g'], price: gbp(35), compareAt: gbp(70), colors: ['bordo'], sizes: ADULT, badges: ['sale'], pop: 66, date: '2025-07-15', desc: 'Moletom canguru com capuz forrado e o G bordado no peito.' },
  { name: 'Moletom Google G Retrô Azul', ref: 'super-g-unisex-retro-blue-sweatshirt', cat: 'vestuario/moletons', cols: ['google-g'], price: gbp(35), compareAt: gbp(70), colors: ['azul'], sizes: ADULT, badges: ['sale'], pop: 56, date: '2025-02-18', desc: 'Moletom gola careca com estampa retrô e punhos em ribana.' },
  { name: 'Moletom Nano Banana Butter', ref: 'nano-banana-butter-sweatshirt', cat: 'vestuario/moletons', cols: [], price: gbp(81), colors: ['amarelo'], sizes: ADULT, badges: ['new'], pop: 74, date: '2026-10-05', desc: 'Moletom amarelo-manteiga com bordado do Nano Banana. Tecido encorpado e caimento solto.' },
  { name: 'Moletom Unissex Google Mocha', ref: 'google-unisex-mocha-sweatshirt', cat: 'vestuario/moletons', cols: ['sustentavel'], price: gbp(56), colors: ['mocha'], sizes: ADULT, badges: [], pop: 55, date: '2025-11-03', desc: 'Moletom de algodão orgânico na cor mocha, com logo discreta no peito.' },
  // Vestuário — jaquetas
  { name: 'Fleece Google Creme', ref: 'google-unisex-cream-fleece', cat: 'vestuario/jaquetas', cols: ['holiday-2026'], price: gbp(74), colors: ['creme'], sizes: ADULT, badges: ['new'], pop: 60, date: '2026-10-08', desc: 'Jaqueta de fleece felpudo com zíper inteiro e bolsos com zíper.' },
  { name: 'Colete Google Cloud Azul-marinho', ref: 'google-cloud-gilet-navy', cat: 'vestuario/jaquetas', cols: [], price: gbp(70.56), compareAt: gbp(94), colors: ['marinho'], sizes: ADULT, badges: ['sale'], pop: 51, date: '2025-02-10', desc: 'Colete acolchoado leve, repelente à água, com a nuvem do Google Cloud.' },
  { name: 'Colete Matelassê Super G Preto', ref: 'super-g-quilted-black-gilet', cat: 'vestuario/jaquetas', cols: ['google-g'], price: gbp(39), compareAt: gbp(78), colors: ['preto'], sizes: ADULT, badges: ['sale'], pop: 48, date: '2025-01-22', out: ['preto/P', 'preto/GG'], desc: 'Colete matelassê com gola alta e o Super G bordado.' },
  { name: 'Jaqueta Google Joey', ref: 'google-joey-jacket', cat: 'vestuario/jaquetas', cols: [], price: gbp(43), compareAt: gbp(86), colors: ['preto'], sizes: ADULT, badges: ['sale'], pop: 46, date: '2025-04-04', desc: 'Jaqueta leve com capuz embutido na gola, dobrável na própria bolsa.' },
  // Vestuário — bonés e gorros
  { name: 'Boné Google Preto', ref: 'google-black-baseball-cap', cat: 'vestuario/bones-gorros', cols: [], price: gbp(21), colors: ['preto'], sizes: [], badges: ['new'], featured: true, pop: 91, date: '2026-10-01', desc: 'Boné de beisebol em sarja com a logo bordada e regulagem traseira em metal.' },
  { name: 'Gorro Google Holidays 2026', ref: 'google-holidays-2026-beanie', cat: 'vestuario/bones-gorros', cols: ['holiday-2026'], price: gbp(15), colors: ['vermelho'], sizes: [], badges: ['new'], pop: 73, date: '2026-10-18', desc: 'Gorro de tricô canelado com padronagem de fim de ano.' },
  { name: 'Gorro Pescador Google', ref: 'fisherman-beanie', cat: 'vestuario/bones-gorros', cols: [], price: gbp(21), colors: ['cinza'], sizes: [], badges: [], pop: 45, date: '2025-12-01', out: ['*'], desc: 'Gorro curto estilo pescador em tricô grosso, com etiqueta bordada.' },
  // Vestuário — infantil
  { name: 'Camiseta Infantil Chrome Dino Verde', ref: 'chrome-dino-kids-tee-green', cat: 'vestuario/infantil', cols: ['chrome-dino'], price: gbp(23), colors: ['verde'], sizes: KIDS, badges: [], pop: 57, date: '2025-04-02', desc: 'Camiseta infantil com o dinossauro em pixel art. Lavável na máquina.' },
  { name: 'Body Googler em Treinamento', ref: 'googler-in-training-body-suit', cat: 'vestuario/infantil', cols: [], price: gbp(28), colors: ['azul'], sizes: BABY, badges: [], pop: 49, date: '2025-06-30', desc: 'Body de algodão orgânico com botões de pressão, para os futuros Googlers.' },
  { name: 'Camiseta Infantil G Bike Amarela', ref: 'g-bike-kids-tee-yellow', cat: 'vestuario/infantil', cols: ['g-bike'], price: gbp(30), colors: ['amarelo'], sizes: KIDS, badges: [], pop: 44, date: '2025-08-10', desc: 'Camiseta infantil amarela com a bicicleta colorida do campus.' },
  // Bolsas & Acessórios — mochilas
  { name: 'Mochila Google com Cordão', ref: 'google-cinched-backpack', cat: 'bolsas-acessorios/mochilas', cols: [], price: gbp(63), colors: ['preto'], sizes: [], badges: ['bestseller'], featured: true, pop: 95, date: '2025-03-28', desc: 'Mochila com fechamento por cordão, aba magnética e compartimento acolchoado para notebook.' },
  { name: 'Mini Mochila Google', ref: 'google-mini-backpack', cat: 'bolsas-acessorios/mochilas', cols: [], price: gbp(29), colors: ['preto'], sizes: [], badges: ['new'], pop: 68, date: '2026-09-28', desc: 'Mochila compacta para o dia a dia, com bolso frontal e alças acolchoadas.' },
  // Bolsas & Acessórios — bolsas e sacolas
  { name: 'Sacola de Algodão Google', ref: 'google-cotton-shopper', cat: 'bolsas-acessorios/bolsas-sacolas', cols: ['sustentavel'], price: gbp(4), colors: ['areia'], sizes: [], badges: ['bestseller'], pop: 92, date: '2025-04-22', desc: 'Sacola de algodão cru com alças longas e a logo em quatro cores.' },
  { name: 'Bolsa Transversal Google', ref: 'google-crossbody-bag-black', cat: 'bolsas-acessorios/bolsas-sacolas', cols: [], price: gbp(27), colors: ['preto'], sizes: [], badges: ['new'], pop: 64, date: '2026-10-03', desc: 'Bolsa transversal com alça ajustável, fechamento em zíper e bolso interno.' },
  { name: 'Ecobag Reciclada G Bike', ref: 'g-bike-recycled-tote-bag-navy', cat: 'bolsas-acessorios/bolsas-sacolas', cols: ['g-bike', 'sustentavel'], price: gbp(8), colors: ['marinho'], sizes: [], badges: [], pop: 40, date: '2025-08-15', out: ['*'], desc: 'Ecobag de poliéster reciclado com a bicicleta do campus estampada.' },
  // Bolsas & Acessórios — chaveiros e pins
  { name: 'Chaveiro Google G', ref: 'super-g-keychain', cat: 'bolsas-acessorios/chaveiros-pins', cols: ['google-g'], price: gbp(4), colors: [], sizes: [], badges: ['bestseller'], pop: 89, date: '2025-06-06', desc: 'Chaveiro de silicone com argola de metal, em quatro cores.' },
  { name: 'Pin Google G', ref: 'super-g-pin', cat: 'bolsas-acessorios/chaveiros-pins', cols: ['google-g'], price: gbp(4), colors: [], sizes: [], badges: ['new'], pop: 46, date: '2026-09-15', desc: 'Pin esmaltado com trava de borracha, para mochila ou jaqueta.' },
  // Lifestyle — garrafas e canecas
  { name: 'Garrafa Térmica Google G', ref: 'super-g-insulated-capri-bottle', cat: 'lifestyle/garrafas-canecas', cols: ['google-g', 'sustentavel'], price: gbp(29), colors: [], sizes: [], badges: ['bestseller'], featured: true, pop: 96, date: '2025-03-03', desc: 'Garrafa de aço inox com parede dupla: mantém bebidas geladas por 24 h e quentes por 12 h.' },
  { name: 'Garrafa Térmica G Bike', ref: 'g-bike-fuel-insulated-bottle', cat: 'lifestyle/garrafas-canecas', cols: ['g-bike'], price: gbp(36), colors: [], sizes: [], badges: [], pop: 50, date: '2025-08-20', desc: 'Garrafa térmica com bico esportivo, do tamanho do suporte de bicicleta.' },
  { name: 'Copo Térmico Google Corzo', ref: 'google-corzo-insulated-cup-white', cat: 'lifestyle/garrafas-canecas', cols: [], price: gbp(19), colors: ['branco'], sizes: [], badges: [], pop: 54, date: '2025-08-19', desc: 'Copo térmico com tampa deslizante, para o café do caminho.' },
  { name: 'Garrafa Chrome Dino', ref: 'stan-dino-bottle', cat: 'lifestyle/garrafas-canecas', cols: ['chrome-dino'], price: gbp(32), colors: [], sizes: [], badges: [], pop: 59, date: '2025-05-25', desc: 'Garrafa reutilizável com estampa em pixel art e tampa de rosca.' },
  // Lifestyle — escritório
  { name: 'Caderno A5 Reciclado Google', ref: 'google-a5-recycled-notebook-green', cat: 'lifestyle/escritorio', cols: ['sustentavel'], price: gbp(10), colors: ['verde'], sizes: [], badges: ['bestseller'], pop: 88, date: '2025-07-07', desc: 'Caderno A5 com capa de papel reciclado e 120 páginas pautadas.' },
  { name: 'Caderno A5 Capa Dura G Bike', ref: 'g-bike-a5-harcover-notebook', cat: 'lifestyle/escritorio', cols: ['g-bike'], price: gbp(16), colors: [], sizes: [], badges: [], pop: 42, date: '2025-08-12', desc: 'Caderno de capa dura com a bicicleta do campus e marcador de fita.' },
  { name: 'Kit de Adesivos Google G', ref: 'super-g-sticker-pack', cat: 'lifestyle/escritorio', cols: ['google-g'], price: gbp(4), colors: [], sizes: [], badges: ['new'], pop: 47, date: '2026-09-20', desc: 'Adesivos de vinil resistentes à água para notebook e garrafa.' },
  // Lifestyle — casa
  { name: 'Guarda-chuva Médio Google', ref: 'google-midsize-umbrella', cat: 'lifestyle/casa', cols: [], price: gbp(45), colors: [], sizes: [], badges: [], pop: 41, date: '2025-11-20', desc: 'Guarda-chuva de abertura automática com hastes de fibra resistentes ao vento.' },
  // Presentes — colecionáveis
  { name: 'Globo de Neve Chrome Dino', ref: 'stan-dino-glass-globe', cat: 'presentes/colecionaveis', cols: ['chrome-dino', 'holiday-2026'], price: gbp(26), colors: [], sizes: [], badges: ['new'], featured: true, pop: 80, date: '2026-10-25', desc: 'Globo de vidro com neve e o dinossauro em pixel art na base.' },
  { name: 'Bicicleta Miniatura Google', ref: 'google-model-bike', cat: 'presentes/colecionaveis', cols: ['g-bike'], price: gbp(45), colors: [], sizes: [], badges: [], pop: 62, date: '2025-09-09', desc: 'Miniatura de metal da bicicleta colorida do campus, com rodas que giram.' },
  // Presentes — brinquedos
  { name: 'Quebra-cabeça de Blocos Chrome Dino', ref: 'stan-dino-brick-puzzle', cat: 'presentes/brinquedos', cols: ['chrome-dino'], price: gbp(23), colors: [], sizes: [], badges: [], pop: 53, date: '2025-10-01', desc: 'Blocos de montar para criar o dinossauro em 3D. A partir de 8 anos.' },
  { name: 'Kit de Mágica Chrome Dino', ref: 'chrome-dino-magic-accessory-pack', cat: 'presentes/brinquedos', cols: ['chrome-dino'], price: gbp(15), colors: [], sizes: [], badges: [], pop: 39, date: '2025-12-05', desc: 'Cartola, varinha e capa em miniatura para os fãs do dinossauro.' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Estoque determinístico por índice (3..14). */
const stockFor = (i, j) => 3 + ((i * 7 + j * 5) % 12);

function shade(hex, amount) {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const out = n.map((c) => Math.max(0, Math.min(255, Math.round(c * (1 + amount)))));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Silhuetas dos banners e coleções (viewBox 0 0 800 800)
// ---------------------------------------------------------------------------
const DOTS = ['#4285f4', '#ea4335', '#fbbc04', '#34a853'];
const PIXELS = ['01110', '11011', '11111', '10101'];

/**
 * Estampa genérica (não reproduz logo nem arte de terceiros), centrada em (cx, cy) com largura w.
 * `m` é a cor da estampa ou `{ color, kind }` com kind = 'dots' | 'pixel' | 'cloud'.
 */
function monogram(cx, cy, w, m) {
  const { color, kind } = typeof m === 'string' ? { color: m, kind: 'dots' } : m;
  if (kind === 'pixel') {
    const p = w / 5;
    const x0 = cx - w / 2;
    const y0 = cy - 2 * p;
    return PIXELS.flatMap((row, r) =>
      [...row].map((on, c) =>
        on === '1' ? `<rect x="${x0 + c * p}" y="${y0 + r * p}" width="${p}" height="${p}" fill="${color}"/>` : '',
      ),
    ).join('');
  }
  if (kind === 'cloud') {
    const s = w / 100;
    return `<path transform="translate(${cx - 50 * s} ${cy - 40 * s}) scale(${s})" d="M25 60a20 20 0 0 1 2-40 28 28 0 0 1 50 6 18 18 0 0 1-2 34z" fill="${color}"/>`;
  }
  const r = w / 10;
  const step = w / 4;
  return DOTS.map(
    (fill, i) =>
      `<circle cx="${cx - 1.5 * step + i * step}" cy="${cy}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${r * 0.4}"/>`,
  ).join('');
}

const SHAPES = {
  tshirt: (c, m) => `
    <path d="M285 150 340 128q60 52 120 0l55 22 140 92-58 104-62-34v340H265V312l-62 34-58-104z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M340 128q60 52 120 0" fill="none" stroke="${shade(c, -0.3)}" stroke-width="10"/>
    ${monogram(400, 290, 70, m)}`,
  hoodie: (c, m) => `
    <path d="M300 170q100-90 200 0l120 60 70 380-82 14-38-260v318H230V364l-38 260-82-14 70-380z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M318 176q82 110 164 0" fill="${shade(c, -0.15)}"/>
    <path d="M300 520h200l-20 90H320z" fill="${shade(c, -0.1)}" stroke="${shade(c, -0.25)}" stroke-width="4"/>
    <path d="M380 250v70M420 250v70" stroke="${shade(c, -0.35)}" stroke-width="6" stroke-linecap="round"/>
    ${monogram(400, 400, 80, m)}`,
  beanie: (c, m) => `
    <circle cx="400" cy="205" r="58" fill="${shade(c, 0.15)}" stroke="${shade(c, -0.2)}" stroke-width="6"/>
    <path d="M230 540q0-280 170-285 170 5 170 285z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <rect x="215" y="520" width="370" height="120" rx="30" fill="${shade(c, -0.15)}" stroke="${shade(c, -0.3)}" stroke-width="6"/>
    ${[260, 310, 360, 410, 460, 510].map((x) => `<path d="M${x + 15} 535v90" stroke="${shade(c, -0.3)}" stroke-width="5"/>`).join('')}
    ${monogram(400, 420, 70, m)}`,
  tote: (c, m) => `
    <path d="M300 320q0-170 100-170t100 170" fill="none" stroke="${shade(c, -0.3)}" stroke-width="20"/>
    <path d="M210 300h380l-30 390H240z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    ${monogram(400, 480, 110, m)}`,
  giftbox: (c, m) => `
    <rect x="200" y="330" width="400" height="340" rx="20" fill="#1a73e8" stroke="#174ea6" stroke-width="6"/>
    <rect x="180" y="270" width="440" height="90" rx="20" fill="#4285f4" stroke="#174ea6" stroke-width="6"/>
    <rect x="370" y="270" width="60" height="400" fill="#f9ab00"/>
    <path d="M400 270q-120-130-150-40-10 40 150 40zm0 0q120-130 150-40 10 40-150 40z" fill="#f9ab00" stroke="#c77c00" stroke-width="6"/>
    ${monogram(290, 510, 90, '#ffffff')}`,
  globe: (c, m) => `
    <circle cx="400" cy="330" r="210" fill="#e8f0fe" stroke="#9aa0a6" stroke-width="8"/>
    <path d="M230 450q170-50 340 0l-20 50H250z" fill="#ffffff"/>
    ${[[320, 230], [470, 210], [380, 170], [520, 320], [270, 340], [430, 280]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#ffffff" stroke="#dadce0" stroke-width="2"/>`).join('')}
    <path d="M385 300h30v150h-30zM340 350h25v50h-25zM340 390h45v25h-45zM435 330h25v50h-25zM415 370h45v25h-45z" fill="#5f6368"/>
    <path d="M250 520h300l40 150H210z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    ${monogram(400, 600, 90, m)}`,
  bike: (c) => `
    <circle cx="240" cy="500" r="120" fill="none" stroke="#202124" stroke-width="18"/>
    <circle cx="560" cy="500" r="120" fill="none" stroke="#202124" stroke-width="18"/>
    <path d="M240 500 360 300l60 200zM360 300h160l-100 200M520 300l40 200" fill="none" stroke="${c}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M325 285h80M520 300l10-50h50" fill="none" stroke="#202124" stroke-width="18" stroke-linecap="round"/>
    <circle cx="420" cy="500" r="18" fill="#202124"/>`,
};

// ---------------------------------------------------------------------------
// Banners (formas abstratas; o texto fica no HTML, acessível)
// ---------------------------------------------------------------------------
function heroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fce8e6"/><stop offset="0.55" stop-color="#fef7e0"/><stop offset="1" stop-color="#e6f4ea"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="1220" cy="430" r="300" fill="#ffffff" opacity="0.45"/>
  <circle cx="1220" cy="430" r="210" fill="#f9ab00" opacity="0.3"/>
  <path d="M0 720q400-120 800-20t800-60v260H0z" fill="#188038" opacity="0.22"/>
  <path d="M0 790q420-90 820 0t780-30v140H0z" fill="#d93025" opacity="0.2"/>
  <g transform="translate(1000 230) scale(0.55)">${SHAPES.hoodie('#d93025', '#ffffff')}</g>
  <g transform="translate(1190 340) scale(0.42)">${SHAPES.beanie('#188038', '#ffffff')}</g>
</svg>
`;
}

function seasonalSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" width="1600" height="700">
  <rect width="1600" height="700" fill="#fef7e0"/>
  <circle cx="1350" cy="120" r="180" fill="#f9ab00" opacity="0.25"/>
  <circle cx="980" cy="640" r="220" fill="#d93025" opacity="0.12"/>
  <g transform="translate(900 120) scale(0.6)">${SHAPES.giftbox()}</g>
  <g transform="translate(1180 230) scale(0.45)">${SHAPES.globe('#188038', { color: '#ffffff', kind: 'pixel' })}</g>
</svg>
`;
}

function collectionSvg(col) {
  const [a, b, bg] = col.palette;
  const { shape, mark } = col.art;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="${bg}"/>
  <circle cx="600" cy="140" r="160" fill="${a}" opacity="0.18"/>
  <circle cx="160" cy="520" r="200" fill="${b}" opacity="0.14"/>
  <g transform="translate(160 40) scale(0.65)">${SHAPES[shape](a, { color: '#ffffff', kind: mark })}</g>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------
rmSync(IMAGES, { recursive: true, force: true });
mkdirSync(IMAGES, { recursive: true });
const write = (file, content) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const products = defs.map((d, i) => {
  const id = String(i + 1).padStart(3, '0');
  const slug = slugify(d.name);
  const [categorySlug, subcategorySlug] = d.cat.split('/');
  const out = new Set(d.out ?? []);
  const colorKeys = d.colors.length ? d.colors : [null];
  const sizeKeys = d.sizes.length ? d.sizes : [null];

  const urls = OFFICIAL_IMAGES[d.ref];
  if (!urls?.length) throw new Error(`sem foto oficial para ${d.name} (${d.ref})`);
  const images = urls.map((src, k) => ({
    src,
    alt: k === 0 ? `${d.name}, foto do produto` : `${d.name}, outra vista`,
    width: SIZE,
    height: SIZE,
  }));

  const variants = [];
  colorKeys.forEach((color, ci) =>
    sizeKeys.forEach((size, si) => {
      const combo = [color, size].filter(Boolean).join('/');
      const soldOut = out.has('*') || out.has(combo) || (color && out.has(color));
      variants.push({
        sku: ['MS', id, color, size].filter(Boolean).join('-').toUpperCase(),
        ...(color ? { color } : {}),
        ...(size ? { size } : {}),
        stock: soldOut ? 0 : stockFor(i + ci, si),
      });
    }),
  );

  return {
    id,
    slug,
    name: d.name,
    description: d.desc,
    categorySlug,
    subcategorySlug,
    collectionSlugs: d.cols,
    priceInCents: d.price,
    ...(d.compareAt ? { compareAtPriceInCents: d.compareAt } : {}),
    images,
    options: {
      ...(d.colors.length ? { colors: d.colors.map((k) => ({ slug: k, label: COLORS[k].label, hex: COLORS[k].hex })) } : {}),
      ...(d.sizes.length ? { sizes: d.sizes } : {}),
    },
    variants,
    badges: d.badges,
    featured: Boolean(d.featured),
    popularity: d.pop,
    createdAt: `${d.date}T12:00:00.000Z`,
  };
});

for (const col of collections) {
  write(join(IMAGES, `colecao-${col.slug}.svg`), collectionSvg(col));
}
write(join(IMAGES, 'banner-hero.svg'), heroSvg());
write(join(IMAGES, 'banner-sazonal.svg'), seasonalSvg());

const collectionsJson = collections.map(({ palette: _palette, art: _art, ...c }) => ({
  ...c,
  image: { src: `${IMG_PREFIX}/colecao-${c.slug}.svg`, alt: '', width: 800, height: 600 },
}));

const json = (v) => JSON.stringify(v, null, 2) + '\n';
write(join(OUT, 'products.json'), json(products));
write(join(OUT, 'categories.json'), json(categories));
write(join(OUT, 'collections.json'), json(collectionsJson));
write(join(OUT, 'banners.json'), json(banners));

// Resumo para conferência
const sale = products.filter((p) => p.compareAtPriceInCents).length;
const fresh = products.filter((p) => p.badges.includes('new')).length;
const popular = products.filter((p) => p.badges.includes('bestseller')).length;
const soldOut = products.filter((p) => p.variants.every((v) => v.stock === 0)).length;
const partial = products.filter((p) => p.variants.some((v) => v.stock === 0) && p.variants.some((v) => v.stock > 0)).length;
const subs = categories.reduce((n, c) => n + c.subcategories.length, 0);
console.log(
  `produtos=${products.length} promo=${sale} novidades=${fresh} populares=${popular} esgotados=${soldOut} ` +
    `parcialmente-esgotados=${partial} categorias=${categories.length} subcategorias=${subs} colecoes=${collections.length}`,
);
