/**
 * arquivo.js — Filtro interativo da tabela de respostas.
 *
 * O conteúdo da tabela (<tr>) é gerado em tempo de build pelo script
 * scripts/build-arquivo.mjs e já existe no HTML estático.
 * Este arquivo só adiciona a busca/filtro client-side.
 */

import { criarDataUtc } from './domain.js';

/* ── Adiciona linha de "hoje" se ainda não estiver na tabela ─────────────── */
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

/* ── Injecta hoje no topo da tabela (não está no HTML estático) ──────────── */
function injetarHoje() {
    const tbody = document.getElementById('arquivo-tbody');
    if (!tbody) return;

    const hoje      = getHoje();
    const xingo     = palavraDoDia(hoje, XINGOS5, 1);
    const xingao    = palavraDoDia(hoje, XINGOS6, 7);
    const xinguinho = palavraDoDia(hoje, XINGOS4, 3);
    if (!xingo) return;

    // Evita duplicar se o build já incluiu hoje
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

/* ── Filtragem por texto ──────────────────────────────────────────────────── */
function iniciarFiltro() {
    const input = document.getElementById('arquivo-filtro');
    const tbody = document.getElementById('arquivo-tbody');
    if (!input || !tbody) return;

    input.addEventListener('input', function () {
        const termo = this.value.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        tbody.querySelectorAll('tr').forEach(function (tr) {
            const texto = tr.textContent.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            tr.hidden = termo.length > 0 && !texto.includes(termo);
        });
    });
}

/* ── Ponto de entrada ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    injetarHoje();
    iniciarFiltro();
});
