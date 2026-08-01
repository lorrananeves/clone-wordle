/**
 * build-arquivo.mjs
 *
 * Gera as linhas estáticas da tabela de palavras passadas e as injeta
 * diretamente no arquivo.html — para que o conteúdo exista no HTML
 * entregue pelo servidor, sem depender de JavaScript no browser.
 *
 * Uso:
 *   node scripts/build-arquivo.mjs
 *
 * O script lê arquivo.html, substitui o bloco entre os marcadores
 * <!-- ARQUIVO:START --> e <!-- ARQUIVO:END --> e salva o arquivo.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ── Importa as listas e funções de domínio ───────────────────────────────── */
const { XINGOS: XINGOS5 } = await import('../js/constants.js');
const { XINGOS: XINGOS6 } = await import('../js/constants6.js');
const { XINGOS: XINGOS4 } = await import('../js/constants4.js');
const { obterIndiceDia, obterOrdemDoCiclo, criarDataUtc } = await import('../js/domain.js');

/* ── Mesma lógica de palavraDoDia do arquivo.js ──────────────────────────── */
function palavraDoDia(dataStr, lista, sementeCiclo) {
    const idx = obterIndiceDia(dataStr);
    if (idx < 0) return null;
    const ciclo      = Math.floor(idx / lista.length);
    const posNoCiclo = idx % lista.length;
    const ordem      = obterOrdemDoCiclo(lista.length, ciclo, sementeCiclo);
    return lista[ordem[posNoCiclo]];
}

/* ── Gera datas de 2024-01-01 até ontem (UTC) ────────────────────────────── */
function gerarDatasPassadas() {
    const hoje  = new Date();
    const ontem = new Date(Date.UTC(
        hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - 1
    ));
    const inicio = criarDataUtc('2024-01-01');
    const datas  = [];
    const cursor = new Date(inicio);

    while (cursor <= ontem) {
        const y = cursor.getUTCFullYear();
        const m = String(cursor.getUTCMonth() + 1).padStart(2, '0');
        const d = String(cursor.getUTCDate()).padStart(2, '0');
        datas.push(`${y}-${m}-${d}`);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return datas.reverse(); // mais recente primeiro
}

/* ── Formata data "AAAA-MM-DD" → "DD/MM/AAAA" ───────────────────────────── */
function formatarData(dataStr) {
    const [a, m, d] = dataStr.split('-');
    return `${d}/${m}/${a}`;
}

/* ── Gera o bloco de <tr> como string HTML ───────────────────────────────── */
function gerarLinhas(datas) {
    const linhas = [];
    for (const data of datas) {
        const xingo     = palavraDoDia(data, XINGOS5, 1);
        const xingao    = palavraDoDia(data, XINGOS6, 7);
        const xinguinho = palavraDoDia(data, XINGOS4, 3);
        if (!xingo) continue;

        linhas.push(
            `                <tr>` +
            `<td>${formatarData(data)}</td>` +
            `<td class="palavra">${xingo.toUpperCase()}</td>` +
            `<td class="palavra">${xinguinho.toUpperCase()}</td>` +
            `<td class="palavra">${xingao.toUpperCase()}</td>` +
            `</tr>`
        );
    }
    return linhas.join('\n');
}

/* ── Injeta no arquivo.html ──────────────────────────────────────────────── */
const htmlPath  = join(ROOT, 'arquivo.html');
let   html      = readFileSync(htmlPath, 'utf-8');

const START_TAG = '<!-- ARQUIVO:START -->';
const END_TAG   = '<!-- ARQUIVO:END -->';

const startIdx = html.indexOf(START_TAG);
const endIdx   = html.indexOf(END_TAG);

if (startIdx === -1 || endIdx === -1) {
    console.error('Marcadores <!-- ARQUIVO:START --> / <!-- ARQUIVO:END --> não encontrados em arquivo.html');
    process.exit(1);
}

const datas  = gerarDatasPassadas();
const linhas = gerarLinhas(datas);
const hoje   = new Date().toISOString().slice(0, 10);

html = html.slice(0, startIdx + START_TAG.length)
    + `\n${linhas}\n                `
    + html.slice(endIdx);

/* ── Atualiza dateModified no JSON-LD ────────────────────────────────────── */
html = html.replace(/"dateModified": "\d{4}-\d{2}-\d{2}"/, `"dateModified": "${hoje}"`);

writeFileSync(htmlPath, html, 'utf-8');
console.log(`✓ arquivo.html atualizado — ${datas.length} datas, lastmod ${hoje}`);
