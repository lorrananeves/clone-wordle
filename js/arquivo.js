/**
 * arquivo.js — Gera a tabela de palavras passadas para arquivo.html
 *
 * Reutiliza as mesmas funções de domain.js e as mesmas listas de constants*.js
 * para calcular deterministicamente qual palavra saiu em cada data.
 */

import { XINGOS as XINGOS5 }  from './constants.js';
import { XINGOS as XINGOS6 }  from './constants6.js';
import { XINGOS as XINGOS4 }  from './constants4.js';
import { obterIndiceDia, obterOrdemDoCiclo, criarDataUtc } from './domain.js';

/* ── Retorna a palavra de um jogo para uma data específica ────────────────── */
function palavraDoDia(dataStr, lista, sementeCiclo) {
    const idx      = obterIndiceDia(dataStr);
    if (idx < 0) return null;
    const ciclo    = Math.floor(idx / lista.length);
    const posNoCiclo = idx % lista.length;
    const ordem    = obterOrdemDoCiclo(lista.length, ciclo, sementeCiclo);
    return lista[ordem[posNoCiclo]];
}

/* ── Formata data "AAAA-MM-DD" → "DD/MM/AAAA" ────────────────────────────── */
function formatarData(dataStr) {
    const [a, m, d] = dataStr.split('-');
    return `${d}/${m}/${a}`;
}

/* ── Gera lista de datas de 2024-01-01 até ontem (inclusive) ─────────────── */
function gerarDatasPassadas() {
    const hoje  = new Date();
    const ontem = new Date(Date.UTC(
        hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1
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

/* ── Renderiza a tabela ───────────────────────────────────────────────────── */
function renderizarTabela(datas) {
    const tbody = document.getElementById('arquivo-tbody');
    if (!tbody) return;

    const fragment = document.createDocumentFragment();

    for (const data of datas) {
        const xingo      = palavraDoDia(data, XINGOS5, 1);
        const xingao     = palavraDoDia(data, XINGOS6, 7);
        const xinguinho  = palavraDoDia(data, XINGOS4, 3);
        if (!xingo) continue;

        const tr = document.createElement('tr');
        tr.innerHTML =
            `<td>${formatarData(data)}</td>` +
            `<td class="palavra">${xingo.toUpperCase()}</td>` +
            `<td class="palavra">${xinguinho.toUpperCase()}</td>` +
            `<td class="palavra">${xingao.toUpperCase()}</td>`;
        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);
}

/* ── Filtragem por texto ──────────────────────────────────────────────────── */
function iniciarFiltro() {
    const input = document.getElementById('arquivo-filtro');
    const tbody = document.getElementById('arquivo-tbody');
    if (!input || !tbody) return;

    input.addEventListener('input', function () {
        const termo = this.value.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const linhas = tbody.querySelectorAll('tr');
        linhas.forEach(function (tr) {
            const texto = tr.textContent.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            tr.hidden = termo.length > 0 && !texto.includes(termo);
        });
    });
}

/* ── Ponto de entrada ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    const datas = gerarDatasPassadas();
    renderizarTabela(datas);
    iniciarFiltro();
});
