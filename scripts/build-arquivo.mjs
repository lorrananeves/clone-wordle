/**
 * build-arquivo.mjs
 *
 * Gera uma página HTML por ano (arquivo-AAAA.html) com as palavras
 * de cada dia daquele ano, e atualiza arquivo.html como índice de anos.
 *
 * Uso:
 *   node scripts/build-arquivo.mjs
 *
 * Estratégia de rebuild incremental:
 *   - Anos fechados (anteriores ao atual) só são (re)gerados se o arquivo
 *     ainda não existir — evita trabalho desnecessário no CI.
 *   - O ano corrente é sempre regenerado (novos dias a cada build).
 *   - arquivo.html (índice) é sempre regenerado.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ── Importa listas e funções de domínio ─────────────────────────────────── */
const { XINGOS: XINGOS5 } = await import('../js/constants.js');
const { XINGOS: XINGOS6 } = await import('../js/constants6.js');
const { XINGOS: XINGOS4 } = await import('../js/constants4.js');
const { obterIndiceDia, obterOrdemDoCiclo, criarDataUtc } = await import('../js/domain.js');

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function palavraDoDia(dataStr, lista, sementeCiclo) {
    const idx = obterIndiceDia(dataStr);
    if (idx < 0) return null;
    const ciclo      = Math.floor(idx / lista.length);
    const posNoCiclo = idx % lista.length;
    const ordem      = obterOrdemDoCiclo(lista.length, ciclo, sementeCiclo);
    return lista[ordem[posNoCiclo]];
}

function formatarData(dataStr) {
    const [a, m, d] = dataStr.split('-');
    return `${d}/${m}/${a}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

/** Retorna todas as datas de um ano específico, do mais recente ao mais antigo. */
function datasDoAno(ano, ontem) {
    const inicio = new Date(Date.UTC(ano, 0, 1));
    const fim    = new Date(Math.min(Date.UTC(ano, 11, 31), ontem.getTime()));
    if (inicio > ontem) return [];
    const datas  = [];
    const cursor = new Date(inicio);
    while (cursor <= fim) {
        datas.push(`${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth()+1)}-${pad(cursor.getUTCDate())}`);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return datas.reverse();
}

function gerarLinhas(datas) {
    return datas.map(data => {
        const xingo     = palavraDoDia(data, XINGOS5, 1);
        const xingao    = palavraDoDia(data, XINGOS6, 7);
        const xinguinho = palavraDoDia(data, XINGOS4, 3);
        if (!xingo) return '';
        return `                <tr><td>${formatarData(data)}</td>` +
               `<td class="palavra">${xingo.toUpperCase()}</td>` +
               `<td class="palavra">${xinguinho.toUpperCase()}</td>` +
               `<td class="palavra">${xingao.toUpperCase()}</td></tr>`;
    }).filter(Boolean).join('\n');
}

/* ── Lê o template base de arquivo.html ──────────────────────────────────── */
function lerTemplate() {
    return readFileSync(join(ROOT, 'arquivo.html'), 'utf-8');
}

/* ── Gera o HTML de uma página de ano ───────────────────────────────────── */
function gerarPaginaAno(ano, datas, anos, hoje) {
    const template = lerTemplate();
    const anoAtual = new Date().getUTCFullYear();

    // Navegação entre anos
    const navAnos = anos.map(a =>
        a === ano
            ? `<span class="ano-nav-ativo">${a}</span>`
            : `<a href="./arquivo-${a}.html" class="ano-nav-link">${a}</a>`
    ).join('');

    const prevAno = anos[anos.indexOf(ano) + 1];
    const nextAno = anos[anos.indexOf(ano) - 1];
    const navPrev = prevAno ? `<a href="./arquivo-${prevAno}.html" class="ano-nav-btn">← ${prevAno}</a>` : '';
    const navNext = nextAno ? `<a href="./arquivo-${nextAno}.html" class="ano-nav-btn">${nextAno} →</a>` : '';

    const linhas = gerarLinhas(datas);
    const titulo = `Respostas de ${ano} — Xingo, Xinguinho e Xingão`;
    const desc   = `Veja todas as respostas do Xingo, Xinguinho e Xingão de ${ano}. Confira qual foi a palavra de cada dia.`;
    const url    = `https://lorrananeves.github.io/clone-wordle/arquivo-${ano}.html`;
    const idHoje = ano === anoAtual ? ' id="arquivo-tbody"' : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
    <meta name="description" content="${desc}">
    <link rel="icon" type="image/png" href="icons/icon-192.png">
    <meta property="og:title" content="${titulo}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://lorrananeves.github.io/clone-wordle/icons/og-cover.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${titulo}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://lorrananeves.github.io/clone-wordle/icons/og-cover.png">
    <link rel="canonical" href="${url}">
    <link rel="manifest" href="manifest.json">
    <link rel="sitemap" type="application/xml" href="sitemap.xml">
    <meta name="theme-color" content="#131213">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="stylesheet" href="style.css">
    <link rel="apple-touch-icon" href="icons/icon-192.png">

    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HK87QQNRB8');
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${titulo}",
      "url": "${url}",
      "description": "${desc}",
      "dateModified": "${hoje}",
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "XINGO",
        "url": "https://lorrananeves.github.io/clone-wordle/"
      }
    }
    </script>

    <style>
        body { height: auto; min-height: 100dvh; overflow-y: auto; }
        .arquivo-container { width: 100%; max-width: 620px; margin: 0 auto; padding: 20px 16px 40px; box-sizing: border-box; }
        .arquivo-header { text-align: center; margin-bottom: 20px; }
        .arquivo-header h1 { font-size: clamp(1.2rem, 4vw, 1.7rem); letter-spacing: 2px; margin: 0 0 6px; }
        .arquivo-header p { font-size: 0.88rem; color: var(--text-muted); margin: 0; }
        .arquivo-filtro-wrap { margin-bottom: 16px; }
        #arquivo-filtro { width: 100%; box-sizing: border-box; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.15s; }
        #arquivo-filtro:focus { border-color: var(--text-muted); }
        #arquivo-filtro::placeholder { color: var(--text-muted); }
        .arquivo-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
        .arquivo-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .arquivo-table thead th { background: var(--surface); color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 1px; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
        .arquivo-table tbody tr { border-bottom: 1px solid var(--border); transition: background-color 0.1s; }
        .arquivo-table tbody tr:last-child { border-bottom: none; }
        .arquivo-table tbody tr:hover { background: var(--surface); }
        .arquivo-table td { padding: 10px 14px; color: var(--text-dim); white-space: nowrap; }
        .arquivo-table td.palavra { font-weight: bold; letter-spacing: 2px; color: var(--text); }
        /* ── Navegação entre anos ── */
        .ano-nav { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .ano-nav-anos { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; flex: 1; }
        .ano-nav-link, .ano-nav-ativo, .ano-nav-btn {
            padding: 5px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;
            text-decoration: none; white-space: nowrap;
        }
        .ano-nav-link { background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); transition: border-color 0.15s, color 0.15s; }
        .ano-nav-link:hover { color: var(--text); border-color: var(--text-muted); }
        .ano-nav-ativo { background: var(--color-correct); color: #fff; border: 1px solid transparent; }
        .ano-nav-btn { background: transparent; border: 1px solid var(--border-key); color: var(--text-muted); transition: border-color 0.15s, color 0.15s; }
        .ano-nav-btn:hover { color: var(--text); border-color: var(--text-muted); }
    </style>
</head>

<body>
    <header>
        <a href="./arquivo.html" class="header-btn" aria-label="Índice do arquivo" title="Índice do arquivo">←</a>
        <h1 id="title">ARQUIVO ${ano}</h1>
        <div class="header-right">
            <button id="btn-tema" class="header-btn" aria-label="Ativar modo claro" title="Modo claro">☀️</button>
        </div>
    </header>

    <div class="arquivo-container">

        <div class="arquivo-header">
            <h1>Respostas de ${ano}</h1>
            <p>Palavras do <strong>Xingo</strong>, <strong>Xinguinho</strong> e <strong>Xingão</strong> em ${ano}.</p>
        </div>

        <nav class="ano-nav" aria-label="Navegar entre anos">
            ${navPrev}
            <div class="ano-nav-anos">${navAnos}</div>
            ${navNext}
        </nav>

        <div class="arquivo-filtro-wrap">
            <input
                id="arquivo-filtro"
                type="search"
                placeholder="Buscar por data (ex: 15/03) ou palavra (ex: burro)…"
                aria-label="Filtrar por data ou palavra"
                autocomplete="off"
                spellcheck="false"
            >
        </div>

        <div class="arquivo-table-wrap">
            <table class="arquivo-table" aria-label="Respostas de ${ano}">
                <thead>
                    <tr>
                        <th scope="col">Data</th>
                        <th scope="col">Xingo <span style="font-weight:400">(5)</span></th>
                        <th scope="col">Xinguinho <span style="font-weight:400">(4)</span></th>
                        <th scope="col">Xingão <span style="font-weight:400">(6)</span></th>
                    </tr>
                </thead>
                <tbody${idHoje}>
                <!-- ARQUIVO:START -->
${linhas}
                <!-- ARQUIVO:END -->
                </tbody>
            </table>
        </div>

    </div>

    <script src="./js/sw-register.js"></script>
    ${ano === anoAtual ? '<script type="module" src="./js/arquivo.js"></script>' : ''}

    <script>
    (function () {
        var saved = localStorage.getItem('xingo_tema');
        if (saved === 'light') document.body.classList.add('light');
        var btn = document.getElementById('btn-tema');
        if (btn) {
            btn.addEventListener('click', function () {
                document.body.classList.toggle('light');
                var isLight = document.body.classList.contains('light');
                localStorage.setItem('xingo_tema', isLight ? 'light' : 'dark');
                btn.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
                btn.title = isLight ? 'Modo escuro' : 'Modo claro';
            });
            var isLight = document.body.classList.contains('light');
            btn.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
            btn.title = isLight ? 'Modo escuro' : 'Modo claro';
        }
        /* Filtro */
        var input = document.getElementById('arquivo-filtro');
        var tbody = document.getElementById('arquivo-tbody') || document.querySelector('.arquivo-table tbody');
        if (input && tbody) {
            input.addEventListener('input', function () {
                var termo = this.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                tbody.querySelectorAll('tr').forEach(function (tr) {
                    var txt = tr.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    tr.hidden = termo.length > 0 && !txt.includes(termo);
                });
            });
        }
    })();
    </script>

    <script src="./js/consent.js"></script>
</body>
</html>`;
}

/* ── Gera arquivo.html como índice dos anos ──────────────────────────────── */
function gerarIndice(anos, anoAtual, hoje) {
    const itens = anos.map(ano => {
        const label = ano === anoAtual ? `${ano} (atual)` : String(ano);
        return `            <li><a href="./arquivo-${ano}.html" class="ano-index-link">${label}</a></li>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arquivo de Respostas — Xingo, Xinguinho e Xingão</title>
    <meta name="description" content="Veja todas as respostas passadas do Xingo, Xinguinho e Xingão desde 2024, organizadas por ano.">
    <link rel="icon" type="image/png" href="icons/icon-192.png">
    <meta property="og:title" content="Arquivo de Respostas — Xingo">
    <meta property="og:description" content="Todas as palavras do Xingo, Xinguinho e Xingão desde 2024, organizadas por ano.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://lorrananeves.github.io/clone-wordle/arquivo.html">
    <meta property="og:image" content="https://lorrananeves.github.io/clone-wordle/icons/og-cover.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Arquivo de Respostas — Xingo">
    <meta name="twitter:description" content="Todas as palavras do Xingo, Xinguinho e Xingão desde 2024, organizadas por ano.">
    <meta name="twitter:image" content="https://lorrananeves.github.io/clone-wordle/icons/og-cover.png">
    <link rel="canonical" href="https://lorrananeves.github.io/clone-wordle/arquivo.html">
    <link rel="manifest" href="manifest.json">
    <link rel="sitemap" type="application/xml" href="sitemap.xml">
    <meta name="theme-color" content="#131213">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="stylesheet" href="style.css">
    <link rel="apple-touch-icon" href="icons/icon-192.png">

    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HK87QQNRB8');
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Arquivo de Respostas — Xingo, Xinguinho e Xingão",
      "url": "https://lorrananeves.github.io/clone-wordle/arquivo.html",
      "description": "Todas as palavras do Xingo, Xinguinho e Xingão desde 2024, organizadas por ano.",
      "dateModified": "${hoje}",
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "XINGO",
        "url": "https://lorrananeves.github.io/clone-wordle/"
      }
    }
    </script>

    <style>
        body { height: auto; min-height: 100dvh; overflow-y: auto; }
        .arquivo-container { width: 100%; max-width: 480px; margin: 0 auto; padding: 20px 16px 40px; box-sizing: border-box; text-align: center; }
        .arquivo-header { margin-bottom: 28px; }
        .arquivo-header h1 { font-size: clamp(1.3rem, 4vw, 1.8rem); letter-spacing: 3px; margin: 0 0 8px; }
        .arquivo-header p { font-size: 0.88rem; color: var(--text-muted); margin: 0; }
        .ano-index-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .ano-index-link {
            display: block; padding: 14px 20px;
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 10px; text-decoration: none;
            font-size: 1.1rem; font-weight: bold; letter-spacing: 2px;
            color: var(--text); transition: border-color 0.15s, background-color 0.15s;
        }
        .ano-index-link:hover { border-color: var(--text-muted); background: var(--header-hover); }
        .ano-index-link:first-child { border-color: var(--color-correct); color: var(--color-correct); }
    </style>
</head>

<body>
    <header>
        <a href="./index.html" class="header-btn" aria-label="Voltar ao Xingo" title="Voltar ao Xingo">←</a>
        <h1 id="title">ARQUIVO</h1>
        <div class="header-right">
            <button id="btn-tema" class="header-btn" aria-label="Ativar modo claro" title="Modo claro">☀️</button>
        </div>
    </header>

    <div class="arquivo-container">
        <div class="arquivo-header">
            <h1>Respostas anteriores</h1>
            <p>Escolha um ano para ver todas as palavras do <strong>Xingo</strong>, <strong>Xinguinho</strong> e <strong>Xingão</strong>.</p>
        </div>

        <ul class="ano-index-list">
${itens}
        </ul>
    </div>

    <script src="./js/sw-register.js"></script>
    <script>
    (function () {
        var saved = localStorage.getItem('xingo_tema');
        if (saved === 'light') document.body.classList.add('light');
        var btn = document.getElementById('btn-tema');
        if (btn) {
            btn.addEventListener('click', function () {
                document.body.classList.toggle('light');
                var isLight = document.body.classList.contains('light');
                localStorage.setItem('xingo_tema', isLight ? 'light' : 'dark');
                btn.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
                btn.title = isLight ? 'Modo escuro' : 'Modo claro';
            });
        }
    })();
    </script>
    <script src="./js/consent.js"></script>
</body>
</html>`;
}

/* ── Atualiza sitemap.xml com as páginas de ano ──────────────────────────── */
function atualizarSitemap(anos, hoje) {
    const sitemapPath = join(ROOT, 'sitemap.xml');
    let sitemap = readFileSync(sitemapPath, 'utf-8');

    // Remove entradas de anos anteriores para regravar limpas
    sitemap = sitemap.replace(/\n\s*<url>\s*<loc>[^<]*arquivo-\d{4}[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

    const entradas = anos.map(ano => `
    <url>
        <loc>https://lorrananeves.github.io/clone-wordle/arquivo-${ano}.html</loc>
        <lastmod>${hoje}</lastmod>
        <changefreq>${ano === new Date().getUTCFullYear() ? 'daily' : 'never'}</changefreq>
        <priority>0.6</priority>
    </url>`).join('');

    sitemap = sitemap.replace('</urlset>', `${entradas}\n\n</urlset>`);
    writeFileSync(sitemapPath, sitemap, 'utf-8');
}

/* ── Ponto de entrada ─────────────────────────────────────────────────────── */
const hoje     = new Date().toISOString().slice(0, 10);
const anoAtual = new Date().getUTCFullYear();
const ontem    = new Date(Date.UTC(
    new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1
));

// Descobre quais anos têm dados (de 2024 até o ano corrente)
const anos = [];
for (let a = anoAtual; a >= 2024; a--) {
    if (datasDoAno(a, ontem).length > 0) anos.push(a);
}

let totalDatas = 0;
let paginasGeradas = 0;

for (const ano of anos) {
    const outPath = join(ROOT, `arquivo-${ano}.html`);
    const fechado = ano < anoAtual;

    // Anos fechados: só gera se o arquivo não existir
    if (fechado && existsSync(outPath)) {
        console.log(`  ↳ arquivo-${ano}.html já existe (ano fechado) — pulando`);
        continue;
    }

    const datas = datasDoAno(ano, ontem);
    const html  = gerarPaginaAno(ano, datas, anos, hoje);
    writeFileSync(outPath, html, 'utf-8');
    totalDatas += datas.length;
    paginasGeradas++;
    console.log(`✓ arquivo-${ano}.html — ${datas.length} dias`);
}

// Sempre atualiza o índice
const indice = gerarIndice(anos, anoAtual, hoje);
writeFileSync(join(ROOT, 'arquivo.html'), indice, 'utf-8');
console.log(`✓ arquivo.html (índice) — ${anos.length} anos`);

atualizarSitemap(anos, hoje);
console.log(`✓ sitemap.xml atualizado`);
console.log(`\nTotal: ${paginasGeradas} página(s) gerada(s), ${totalDatas} novas entradas, lastmod ${hoje}`);
