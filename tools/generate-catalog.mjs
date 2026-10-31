#!/usr/bin/env node
/**
 * Gera os dados mock e as imagens SVG do domínio catalog.
 *
 *   node tools/generate-catalog.mjs
 *
 * Saída: projects/monolith/public/catalog/{products,categories,collections,banners}.json
 *        projects/monolith/public/catalog/images/*.svg
 *
 * Tudo é fictício e determinístico (sem aleatoriedade): rodar de novo produz os mesmos arquivos.
 * Nenhuma marca, logo ou texto de terceiros — as silhuetas e o monograma "M" são próprios.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'projects/monolith/public/catalog');
const IMAGES = join(OUT, 'images');
const IMG_PREFIX = 'catalog/images';
const SIZE = 800;

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
  lilas: { label: 'Lilás', hex: '#a142f4' },
};

// ---------------------------------------------------------------------------
// Categorias, coleções e banners
// ---------------------------------------------------------------------------
const categories = [
  {
    slug: 'vestuario',
    name: 'Vestuário',
    description: 'Camisetas, moletons, jaquetas e bonés para o dia a dia.',
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
    description: 'Mochilas, bolsas, pins e chaveiros para levar a marca com você.',
    subcategories: [
      { slug: 'mochilas', name: 'Mochilas' },
      { slug: 'bolsas-sacolas', name: 'Bolsas e sacolas' },
      { slug: 'chaveiros-pins', name: 'Chaveiros e pins' },
    ],
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Garrafas, canecas, papelaria e itens para casa.',
    subcategories: [
      { slug: 'garrafas-canecas', name: 'Garrafas e canecas' },
      { slug: 'escritorio', name: 'Escritório' },
      { slug: 'casa', name: 'Casa' },
    ],
  },
  {
    slug: 'presentes',
    name: 'Presentes',
    description: 'Kits prontos e pelúcias para presentear.',
    subcategories: [
      { slug: 'kits', name: 'Kits' },
      { slug: 'pelucias', name: 'Pelúcias' },
    ],
  },
];

const collections = [
  {
    slug: 'aurora',
    name: 'Coleção Aurora',
    tagline: 'Cores do amanhecer para a nova estação',
    description: 'Tons de azul e lilás inspirados no céu da manhã, em peças macias e versáteis.',
    theme: 'campaign-1',
    palette: ['#a142f4', '#1a73e8', '#e8f0fe'],
  },
  {
    slug: 'essenciais',
    name: 'Linha Essencial',
    tagline: 'Os básicos que combinam com tudo',
    description: 'Peças atemporais em cores neutras, feitas para durar e usar todos os dias.',
    theme: 'campaign-2',
    palette: ['#202124', '#9aa0a6', '#fef7e0'],
  },
  {
    slug: 'dev',
    name: 'Coleção Dev',
    tagline: 'Para quem vive entre commits e cafés',
    description: 'Estampas de pixel, código e terminal para quem desenvolve software.',
    theme: 'campaign-4',
    palette: ['#188038', '#202124', '#fce8e6'],
  },
  {
    slug: 'eco',
    name: 'Linha Eco',
    tagline: 'Materiais reciclados e reutilizáveis',
    description: 'Algodão reciclado, garrafas reutilizáveis e embalagens sem plástico.',
    theme: 'campaign-3',
    palette: ['#5f6b3a', '#188038', '#e6f4ea'],
  },
];

const banners = {
  hero: {
    eyebrow: 'Nova coleção',
    title: 'Aurora chegou',
    subtitle: 'Moletons, camisetas e acessórios em tons de amanhecer. Edição limitada.',
    ctaLabel: 'Conhecer a coleção',
    ctaUrl: '/c/todos?colecao=aurora',
    image: { src: `${IMG_PREFIX}/banner-hero.svg`, alt: '', width: 1600, height: 900 },
  },
  seasonal: {
    eyebrow: 'Temporada de presentes',
    title: 'Presentes que todo mundo usa',
    subtitle: 'Kits prontos para presentear, com embalagem reutilizável.',
    ctaLabel: 'Ver presentes',
    ctaUrl: '/c/presentes',
    image: { src: `${IMG_PREFIX}/banner-sazonal.svg`, alt: '', width: 1600, height: 700 },
  },
  sustainability: {
    title: 'Feito para durar',
    text: 'Usamos algodão reciclado, tintas à base d’água e embalagens sem plástico em toda a Linha Eco.',
    ctaLabel: 'Conhecer a Linha Eco',
    ctaUrl: '/c/todos?colecao=eco',
  },
};

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
const ADULT = ['P', 'M', 'G', 'GG'];
const KIDS = ['4', '6', '8', '10'];

/** Definição compacta. `out` = combinações esgotadas ("cor" ou "cor/tamanho" ou "*"). */
const defs = [
  // Vestuário — camisetas
  { name: 'Camiseta Clássica', shape: 'tshirt', cat: 'vestuario/camisetas', cols: ['essenciais'], price: 7990, colors: ['preto', 'branco', 'azul'], sizes: ADULT, badges: ['bestseller'], featured: true, pop: 98, date: '2025-03-10', out: ['branco/GG'], desc: 'Camiseta de algodão penteado com o monograma M bordado no peito. Modelagem reta e gola reforçada.' },
  { name: 'Camiseta Aurora Degradê', shape: 'tshirt', cat: 'vestuario/camisetas', cols: ['aurora'], price: 9990, colors: ['lilas', 'azul'], sizes: ADULT, badges: ['new'], featured: true, pop: 72, date: '2026-10-20', desc: 'Estampa em degradê inspirada no amanhecer, com toque macio e tinta à base d’água.' },
  { name: 'Camiseta Modo Escuro', shape: 'tshirt', cat: 'vestuario/camisetas', cols: ['dev'], price: 8990, compareAt: 11990, colors: ['preto', 'cinza'], sizes: ADULT, badges: ['sale'], pop: 66, date: '2025-08-02', desc: 'Para quem prefere o tema escuro também fora da tela. Estampa de terminal nas costas.' },
  { name: 'Camiseta Algodão Reciclado', shape: 'tshirt', cat: 'vestuario/camisetas', cols: ['eco'], price: 8490, colors: ['areia', 'oliva'], sizes: ADULT, badges: ['bestseller'], pop: 93, date: '2025-05-18', desc: 'Feita com 60% de algodão reciclado e 40% de poliéster de garrafas PET.' },
  // Vestuário — moletons
  { name: 'Moletom Canguru Essencial', shape: 'hoodie', cat: 'vestuario/moletons', cols: ['essenciais'], price: 22990, colors: ['cinza', 'preto', 'marinho'], sizes: ADULT, badges: ['bestseller'], featured: true, pop: 97, date: '2025-04-01', out: ['marinho/P'], desc: 'Moletom felpado com capuz forrado, bolso canguru e punhos em ribana.' },
  { name: 'Moletom Aurora', shape: 'hoodie', cat: 'vestuario/moletons', cols: ['aurora'], price: 25990, colors: ['lilas', 'azul'], sizes: ADULT, badges: ['new'], featured: true, pop: 75, date: '2026-10-22', desc: 'O favorito da nova coleção: capuz amplo, tecido encorpado e bordado tom sobre tom.' },
  { name: 'Moletom Dev com Zíper', shape: 'jacket', cat: 'vestuario/moletons', cols: ['dev'], price: 24990, compareAt: 29990, colors: ['preto'], sizes: ADULT, badges: ['sale'], pop: 61, date: '2025-09-12', out: ['preto/P', 'preto/GG'], desc: 'Moletom aberto com zíper reforçado e bolso interno para fones.' },
  // Vestuário — jaquetas
  { name: 'Jaqueta Corta-Vento', shape: 'jacket', cat: 'vestuario/jaquetas', cols: ['essenciais'], price: 32990, colors: ['azul', 'preto'], sizes: ADULT, badges: [], pop: 58, date: '2025-06-25', desc: 'Leve, repelente à água e dobrável na própria bolsa. Ideal para viagens.' },
  { name: 'Jaqueta Puffer Eco', shape: 'jacket', cat: 'vestuario/jaquetas', cols: ['eco'], price: 44990, compareAt: 52990, colors: ['oliva', 'preto'], sizes: ADULT, badges: ['sale'], pop: 54, date: '2025-07-30', desc: 'Enchimento térmico de fibras recicladas e tecido externo resistente ao vento.' },
  // Vestuário — bonés e gorros
  { name: 'Boné Aba Curva', shape: 'cap', cat: 'vestuario/bones-gorros', cols: ['essenciais'], price: 8990, colors: ['preto', 'branco', 'azul'], sizes: [], badges: ['bestseller'], pop: 91, date: '2025-02-14', out: ['branco'], desc: 'Boné de sarja com regulagem traseira em metal e monograma bordado.' },
  { name: 'Gorro Tricô Pompom', shape: 'beanie', cat: 'vestuario/bones-gorros', cols: ['aurora'], price: 6990, colors: ['vermelho', 'cinza'], sizes: [], badges: ['new'], pop: 64, date: '2026-10-18', desc: 'Gorro de tricô canelado com pompom removível. Quentinho e macio.' },
  { name: 'Boné Trucker Dev', shape: 'cap', cat: 'vestuario/bones-gorros', cols: ['dev'], price: 7990, colors: ['cinza', 'preto'], sizes: [], badges: [], pop: 40, date: '2025-01-20', out: ['*'], desc: 'Boné trucker com tela respirável e patch de pixel na frente.' },
  // Vestuário — infantil
  { name: 'Camiseta Infantil Pixel', shape: 'tshirt', cat: 'vestuario/infantil', cols: ['dev'], price: 5990, colors: ['amarelo', 'azul'], sizes: KIDS, badges: [], pop: 47, date: '2025-10-05', desc: 'Camiseta infantil com estampa de pixel que brilha no escuro.' },
  { name: 'Moletom Infantil', shape: 'hoodie', cat: 'vestuario/infantil', cols: ['essenciais'], price: 14990, compareAt: 17990, colors: ['amarelo', 'azul'], sizes: KIDS, badges: ['sale'], pop: 50, date: '2025-05-02', desc: 'Moletom infantil com capuz e punhos ajustados. Lavável na máquina.' },
  // Bolsas & Acessórios
  { name: 'Mochila Urbana', shape: 'backpack', cat: 'bolsas-acessorios/mochilas', cols: ['essenciais'], price: 34990, colors: ['preto', 'marinho'], sizes: [], badges: ['bestseller'], featured: true, pop: 95, date: '2025-03-28', desc: 'Compartimento acolchoado para notebook de até 15", alças ergonômicas e tecido impermeável.' },
  { name: 'Mochila Dev Notebook', shape: 'backpack', cat: 'bolsas-acessorios/mochilas', cols: ['dev'], price: 39990, colors: ['cinza'], sizes: [], badges: ['new'], pop: 70, date: '2026-10-25', desc: 'Abertura total estilo mala, organizador de cabos e bolso antifurto nas costas.' },
  { name: 'Ecobag de Algodão', shape: 'tote', cat: 'bolsas-acessorios/bolsas-sacolas', cols: ['eco'], price: 4990, colors: ['areia', 'oliva'], sizes: [], badges: ['bestseller'], pop: 92, date: '2025-04-22', desc: 'Sacola de algodão cru reforçada, com alças longas e bolso interno.' },
  { name: 'Bolsa Tiracolo Aurora', shape: 'tote', cat: 'bolsas-acessorios/bolsas-sacolas', cols: ['aurora'], price: 15990, compareAt: 19990, colors: ['lilas'], sizes: [], badges: ['sale'], pop: 57, date: '2025-11-11', desc: 'Bolsa transversal com alça ajustável e fechamento em zíper.' },
  { name: 'Kit de Pins Pixel', shape: 'pin', cat: 'bolsas-acessorios/chaveiros-pins', cols: ['dev'], price: 3990, colors: [], sizes: [], badges: [], pop: 45, date: '2025-02-02', desc: 'Conjunto com três pins esmaltados de pixel art e trava de borracha.' },
  { name: 'Chaveiro Monograma', shape: 'keychain', cat: 'bolsas-acessorios/chaveiros-pins', cols: ['essenciais'], price: 2990, colors: ['azul', 'vermelho', 'amarelo', 'verde'], sizes: [], badges: [], pop: 52, date: '2025-06-06', desc: 'Chaveiro de acrílico com argola de metal e o monograma M.' },
  // Lifestyle
  { name: 'Garrafa Térmica 500 ml', shape: 'bottle', cat: 'lifestyle/garrafas-canecas', cols: ['eco'], price: 12990, colors: ['preto', 'branco', 'verde'], sizes: [], badges: ['bestseller'], featured: true, pop: 96, date: '2025-03-03', out: ['verde'], desc: 'Aço inox com parede dupla: mantém bebidas geladas por 24 h e quentes por 12 h.' },
  { name: 'Caneca de Cerâmica 350 ml', shape: 'mug', cat: 'lifestyle/garrafas-canecas', cols: ['essenciais'], price: 5990, colors: ['branco', 'preto'], sizes: [], badges: ['bestseller'], pop: 90, date: '2025-01-15', desc: 'Caneca de cerâmica esmaltada, pode ir ao micro-ondas e à lava-louças.' },
  { name: 'Copo Térmico com Tampa', shape: 'bottle', cat: 'lifestyle/garrafas-canecas', cols: ['eco'], price: 7990, compareAt: 9990, colors: ['azul'], sizes: [], badges: ['sale'], pop: 55, date: '2025-08-19', desc: 'Copo reutilizável com tampa deslizante, perfeito para o café da manhã.' },
  { name: 'Caneca Esmaltada', shape: 'mug', cat: 'lifestyle/garrafas-canecas', cols: ['eco'], price: 6990, colors: ['verde', 'branco'], sizes: [], badges: [], pop: 42, date: '2025-09-01', desc: 'Caneca de metal esmaltado, leve e resistente para acampar ou para a mesa do escritório.' },
  { name: 'Caderno Pontilhado A5', shape: 'notebook', cat: 'lifestyle/escritorio', cols: ['dev'], price: 5490, colors: ['preto', 'azul'], sizes: [], badges: [], pop: 60, date: '2025-07-07', desc: 'Capa dura, 160 páginas pontilhadas de 90 g/m² e marcador de fita.' },
  { name: 'Kit de Adesivos Dev', shape: 'stickers', cat: 'lifestyle/escritorio', cols: ['dev'], price: 2490, colors: [], sizes: [], badges: [], pop: 38, date: '2025-02-20', out: ['*'], desc: 'Doze adesivos de vinil resistentes à água para notebook e garrafa.' },
  { name: 'Almofada Aurora', shape: 'cushion', cat: 'lifestyle/casa', cols: ['aurora'], price: 11990, colors: ['lilas', 'azul'], sizes: [], badges: ['new'], pop: 62, date: '2026-10-15', desc: 'Almofada de veludo com enchimento de fibra, capa removível e lavável.' },
  // Presentes
  { name: 'Kit Boas-Vindas', shape: 'giftbox', cat: 'presentes/kits', cols: ['essenciais'], price: 29990, compareAt: 34990, colors: [], sizes: [], badges: ['sale'], featured: true, pop: 80, date: '2025-11-20', desc: 'Caneca, caderno, garrafa e adesivos em uma caixa reutilizável. O presente certo para novos colegas.' },
  { name: 'Kit Dev Starter', shape: 'giftbox', cat: 'presentes/kits', cols: ['dev'], price: 19990, colors: [], sizes: [], badges: ['new'], pop: 68, date: '2026-10-28', desc: 'Camiseta Modo Escuro, pins de pixel e caderno pontilhado para quem está começando.' },
  { name: 'Pelúcia Mascote Bit', shape: 'plush', cat: 'presentes/pelucias', cols: ['dev'], price: 9990, colors: ['amarelo'], sizes: [], badges: [], pop: 78, date: '2025-12-01', desc: 'O Bit, nosso mascote, em pelúcia antialérgica de 25 cm.' },
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

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function shade(hex, amount) {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const out = n.map((c) => Math.max(0, Math.min(255, Math.round(c * (1 + amount)))));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Silhuetas (viewBox 0 0 800 800)
// ---------------------------------------------------------------------------
/** Monograma "M" próprio, centrado em (cx, cy) com largura w. */
function monogram(cx, cy, w, color) {
  const s = w / 32;
  const x = cx - 16 * s;
  const y = cy - 14 * s;
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 28V0h7l9 13 9-13h7v28h-7V12l-9 12-9-12v16z" fill="${color}"/>`;
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
  jacket: (c, m) => `
    <path d="M300 160 360 140h80l60 20 120 70 70 380-82 14-38-260v318H230V364l-38 260-82-14 70-380z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M360 140l40 50 40-50" fill="${shade(c, -0.2)}"/>
    <path d="M400 190v492" stroke="${shade(c, -0.4)}" stroke-width="8"/>
    <path d="M250 520h110M440 520h110" stroke="${shade(c, -0.3)}" stroke-width="6" stroke-linecap="round"/>
    ${monogram(320, 300, 50, m)}`,
  cap: (c, m) => `
    <path d="M200 480q0-230 200-235 200 5 200 235z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <path d="M180 478q240-40 520 30 18 30-30 44-240-56-490-30z" fill="${shade(c, -0.18)}" stroke="${shade(c, -0.3)}" stroke-width="6"/>
    <circle cx="400" cy="250" r="16" fill="${shade(c, -0.3)}"/>
    <path d="M400 255v220" stroke="${shade(c, -0.2)}" stroke-width="5"/>
    ${monogram(400, 380, 80, m)}`,
  beanie: (c, m) => `
    <circle cx="400" cy="205" r="58" fill="${shade(c, 0.15)}" stroke="${shade(c, -0.2)}" stroke-width="6"/>
    <path d="M230 540q0-280 170-285 170 5 170 285z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <rect x="215" y="520" width="370" height="120" rx="30" fill="${shade(c, -0.15)}" stroke="${shade(c, -0.3)}" stroke-width="6"/>
    ${[260, 310, 360, 410, 460, 510].map((x) => `<path d="M${x + 15} 535v90" stroke="${shade(c, -0.3)}" stroke-width="5"/>`).join('')}
    ${monogram(400, 420, 70, m)}`,
  backpack: (c, m) => `
    <path d="M330 190q0-70 70-70t70 70" fill="none" stroke="${shade(c, -0.3)}" stroke-width="22" stroke-linecap="round"/>
    <rect x="220" y="190" width="360" height="500" rx="90" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <rect x="270" y="440" width="260" height="200" rx="40" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="5"/>
    <path d="M290 470h220" stroke="${shade(c, -0.4)}" stroke-width="6" stroke-linecap="round"/>
    ${monogram(400, 320, 80, m)}`,
  tote: (c, m) => `
    <path d="M300 320q0-170 100-170t100 170" fill="none" stroke="${shade(c, -0.3)}" stroke-width="20"/>
    <path d="M210 300h380l-30 390H240z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6" stroke-linejoin="round"/>
    ${monogram(400, 480, 110, m)}`,
  pin: (c, m) => `
    <circle cx="280" cy="330" r="120" fill="#1a73e8" stroke="#174ea6" stroke-width="8"/>
    <rect x="410" y="200" width="200" height="200" rx="40" fill="#f9ab00" stroke="#c77c00" stroke-width="8"/>
    <path d="M400 470l110 190H290z" fill="#188038" stroke="#0d652d" stroke-width="8" stroke-linejoin="round"/>
    ${monogram(280, 330, 90, '#ffffff')}
    <rect x="460" y="250" width="40" height="40" fill="#202124"/><rect x="520" y="250" width="40" height="40" fill="#202124"/>
    <path d="M460 330h100v30H460z" fill="#202124"/>`,
  keychain: (c, m) => `
    <circle cx="400" cy="200" r="60" fill="none" stroke="#9aa0a6" stroke-width="16"/>
    <rect x="385" y="250" width="30" height="70" rx="10" fill="#80868b"/>
    <rect x="250" y="310" width="300" height="300" rx="70" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="8"/>
    ${monogram(400, 460, 150, m)}`,
  bottle: (c, m) => `
    <rect x="345" y="110" width="110" height="80" rx="20" fill="${shade(c, -0.3)}"/>
    <rect x="360" y="185" width="80" height="30" fill="${shade(c, -0.2)}"/>
    <rect x="290" y="210" width="220" height="490" rx="70" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <rect x="315" y="250" width="22" height="400" rx="11" fill="#ffffff" opacity="0.25"/>
    ${monogram(400, 450, 80, m)}`,
  mug: (c, m) => `
    <path d="M520 330h40q80 0 80 90t-80 90h-40" fill="none" stroke="${shade(c, -0.2)}" stroke-width="36"/>
    <rect x="220" y="260" width="320" height="380" rx="40" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <ellipse cx="380" cy="265" rx="160" ry="22" fill="${shade(c, -0.2)}"/>
    ${monogram(380, 450, 110, m)}`,
  notebook: (c, m) => `
    <rect x="240" y="150" width="340" height="500" rx="22" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <rect x="240" y="150" width="46" height="500" rx="16" fill="${shade(c, -0.2)}"/>
    <rect x="520" y="150" width="18" height="500" fill="${shade(c, -0.35)}"/>
    <path d="M440 640v80l20-20 20 20v-80" fill="#d93025"/>
    ${monogram(410, 360, 110, m)}`,
  stickers: () => `
    <rect x="170" y="180" width="260" height="260" rx="50" fill="#1a73e8" transform="rotate(-10 300 310)"/>
    <circle cx="530" cy="300" r="130" fill="#f9ab00"/>
    <rect x="230" y="430" width="240" height="200" rx="100" fill="#188038" transform="rotate(8 350 530)"/>
    <path d="M520 470l110 60-110 140-90-80z" fill="#d93025"/>
    ${monogram(300, 310, 110, '#ffffff')}
    ${monogram(530, 300, 90, '#202124')}`,
  cushion: (c, m) => `
    <path d="M190 210q210-40 420 0 40 190 0 380-210 40-420 0-40-190 0-380z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <path d="M230 250q170-30 340 0 30 150 0 300-170 30-340 0-30-150 0-300z" fill="none" stroke="${shade(c, -0.15)}" stroke-width="4" stroke-dasharray="14 10"/>
    ${monogram(400, 400, 130, m)}`,
  giftbox: (c, m) => `
    <rect x="200" y="330" width="400" height="340" rx="20" fill="#1a73e8" stroke="#174ea6" stroke-width="6"/>
    <rect x="180" y="270" width="440" height="90" rx="20" fill="#4285f4" stroke="#174ea6" stroke-width="6"/>
    <rect x="370" y="270" width="60" height="400" fill="#f9ab00"/>
    <path d="M400 270q-120-130-150-40-10 40 150 40zm0 0q120-130 150-40 10 40-150 40z" fill="#f9ab00" stroke="#c77c00" stroke-width="6"/>
    ${monogram(290, 510, 90, '#ffffff')}`,
  plush: (c) => `
    <circle cx="290" cy="210" r="60" fill="${shade(c, -0.1)}"/><circle cx="510" cy="210" r="60" fill="${shade(c, -0.1)}"/>
    <ellipse cx="400" cy="530" rx="190" ry="170" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <circle cx="400" cy="310" r="150" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="6"/>
    <circle cx="350" cy="295" r="16" fill="#202124"/><circle cx="450" cy="295" r="16" fill="#202124"/>
    <ellipse cx="400" cy="350" rx="40" ry="26" fill="${shade(c, 0.3)}"/>
    <path d="M385 345h30" stroke="#202124" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="400" cy="560" rx="100" ry="90" fill="${shade(c, 0.25)}"/>`,
};

function productSvg(shape, hex, { detail = false } = {}) {
  const markColor = luminance(hex) > 0.45 ? '#202124' : '#ffffff';
  const body = SHAPES[shape](hex, markColor);
  const viewBox = detail ? '200 200 400 400' : `0 0 ${SIZE} ${SIZE}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${SIZE}" height="${SIZE}">
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="#f1f3f4"/>
  <ellipse cx="400" cy="720" rx="230" ry="26" fill="#000" opacity="0.06"/>
  ${body.trim()}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Banners (formas abstratas; o texto fica no HTML, acessível)
// ---------------------------------------------------------------------------
function heroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8f0fe"/><stop offset="0.55" stop-color="#d7c4fb"/><stop offset="1" stop-color="#fbd2e6"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="1220" cy="430" r="300" fill="#ffffff" opacity="0.45"/>
  <circle cx="1220" cy="430" r="210" fill="#f9ab00" opacity="0.35"/>
  <path d="M0 720q400-120 800-20t800-60v260H0z" fill="#a142f4" opacity="0.25"/>
  <path d="M0 790q420-90 820 0t780-30v140H0z" fill="#1a73e8" opacity="0.25"/>
  <g transform="translate(1000 230) scale(0.55)">${SHAPES.hoodie('#a142f4', '#ffffff')}</g>
  <g transform="translate(1180 330) scale(0.42)">${SHAPES.tshirt('#1a73e8', '#ffffff')}</g>
</svg>
`;
}

function seasonalSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" width="1600" height="700">
  <rect width="1600" height="700" fill="#fef7e0"/>
  <circle cx="1350" cy="120" r="180" fill="#f9ab00" opacity="0.25"/>
  <circle cx="980" cy="640" r="220" fill="#d93025" opacity="0.12"/>
  <g transform="translate(900 120) scale(0.6)">${SHAPES.giftbox()}</g>
  <g transform="translate(1180 230) scale(0.45)">${SHAPES.plush('#f9ab00')}</g>
</svg>
`;
}

function collectionSvg(col) {
  const [a, b, bg] = col.palette;
  const shape = { aurora: 'hoodie', essenciais: 'tshirt', dev: 'backpack', eco: 'bottle' }[col.slug];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="${bg}"/>
  <circle cx="600" cy="140" r="160" fill="${a}" opacity="0.18"/>
  <circle cx="160" cy="520" r="200" fill="${b}" opacity="0.14"/>
  <g transform="translate(160 40) scale(0.65)">${SHAPES[shape](a, '#ffffff')}</g>
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

  const images = [];
  for (const key of colorKeys) {
    const hex = key ? COLORS[key].hex : '#1a73e8';
    const file = key ? `${slug}-${key}.svg` : `${slug}.svg`;
    write(join(IMAGES, file), productSvg(d.shape, hex));
    images.push({
      src: `${IMG_PREFIX}/${file}`,
      alt: key ? `${d.name} na cor ${COLORS[key].label.toLowerCase()}, vista frontal` : `${d.name}, vista frontal`,
      width: SIZE,
      height: SIZE,
    });
  }
  const firstHex = colorKeys[0] ? COLORS[colorKeys[0]].hex : '#1a73e8';
  write(join(IMAGES, `${slug}-detalhe.svg`), productSvg(d.shape, firstHex, { detail: true }));
  images.push({ src: `${IMG_PREFIX}/${slug}-detalhe.svg`, alt: `Detalhe ampliado de ${d.name}`, width: SIZE, height: SIZE });

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

const collectionsJson = collections.map(({ palette: _palette, ...c }) => ({
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
