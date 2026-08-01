/**
 * arquivo.js — Injecta "hoje" no topo da tabela do ano corrente.
 *
 * O conteúdo da tabela (<tr> de dias passados) é gerado em build-time
 * por scripts/build-arquivo.mjs. Este módulo só adiciona o dia de hoje
 * (que ainda não está no HTML estático) e ativa o filtro de busca.
 *
 * Só é carregado na página arquivo-AAAA.html do ano corrente.
 */

import { XINGOS as XINGOS5 } from './constants.js';
import { XINGOS as XINGOS6 } from './constants6.js';
import { XINGOS as XINGOS4 } from './constants4.js';
import { obterIndiceDia, obterOrdemDoCiclo } from './domain.js';

function palavraDoDia(dataStr, lista, sementeCiclo) {
    const idx = obterIndiceDia(dataStr);
    if (idx < 0) return null;
    const ciclo      = Math.floor(idx / lista.length);
    const posNoCiclo = idx % lista.length;
    const ordem      = obterOrdemDoCiclo(lista.length, ciclo, sementeCiclo);
    return lista[ordem[posNoCiclo]];
}

function getHoje() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

function formatarData(dataStr) {
    const [a, m, d] = dataStr.split('-');
    return `${d}/${m}/${a}`;
}

/* ── Injecta hoje no topo (não está no HTML estático) ────────────────────── */
function injetarHoje() {
    const tbody = document.getElementById('arquivo-tbody');
    if (!tbody) return;

    const hoje      = getHoje();
    const xingo     = palavraDoDia(hoje, XINGOS5, 1);
    const xingao    = palavraDoDia(hoje, XINGOS6, 7);
    const xinguinho = palavraDoDia(hoje, XINGOS4, 3);
    if (!xingo) return;

    // Evita duplicar se o build de hoje já foi rodado
    const primeira = tbody.querySelector('tr td');
    if (primeira && primeira.textContent === formatarData(hoje)) return;

    const tr = document.createElement('tr');
    tr.innerHTML =
        `<td>${formatarData(hoje)}</td>` +
        `<td class="palavra">${xingo.toUpperCase()}</td>` +
        `<td class="palavra">${xinguinho.toUpperCase()}</td>` +
        `<td class="palavra">${xingao.toUpperCase()}</td>`;
    tbody.insertBefore(tr, tbody.firstChild);
}

/* ── Ponto de entrada ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', injetarHoje);
