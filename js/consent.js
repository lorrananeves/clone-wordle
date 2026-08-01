/**
 * consent.js — Gerenciamento de consentimento LGPD
 *
 * Fluxo:
 *  1. Na primeira visita, exibe banner de cookies.
 *  2. Se o usuário aceitar  → grava "consent=granted"  no localStorage e carrega analytics.
 *  3. Se o usuário recusar  → grava "consent=denied"   no localStorage; analytics nunca carrega.
 *  4. Nas visitas seguintes → lê a preferência salva sem mostrar o banner novamente.
 */

(function () {
    var STORAGE_KEY = 'xingo_consent';

    /* ── Carrega os scripts de analytics ─────────────────────────── */
    function loadAnalytics() {
        // Google Analytics
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-HK87QQNRB8';
        document.head.appendChild(s);

        // Microsoft Clarity
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', 'wo3g0xxakg');
    }

    /* ── Remove o banner do DOM ───────────────────────────────────── */
    function removeBanner() {
        var banner = document.getElementById('consent-banner');
        if (banner) { banner.remove(); }
    }

    /* ── Aceitar ──────────────────────────────────────────────────── */
    function onAccept() {
        try { localStorage.setItem(STORAGE_KEY, 'granted'); } catch (_) {}
        removeBanner();
        loadAnalytics();
    }

    /* ── Recusar ──────────────────────────────────────────────────── */
    function onDeny() {
        try { localStorage.setItem(STORAGE_KEY, 'denied'); } catch (_) {}
        removeBanner();
    }

    /* ── Cria e injeta o banner no DOM ────────────────────────────── */
    function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML =
            '<p class="consent-text">' +
                'Este site usa cookies de analytics (Google Analytics e Microsoft Clarity) ' +
                'para entender como você usa o jogo. Nenhum dado é vendido ou compartilhado.' +
            '</p>' +
            '<div class="consent-actions">' +
                '<button id="consent-accept" class="consent-btn consent-btn--accept">Aceitar</button>' +
                '<button id="consent-deny"   class="consent-btn consent-btn--deny">Recusar</button>' +
            '</div>';

        document.body.appendChild(banner);

        document.getElementById('consent-accept').addEventListener('click', onAccept);
        document.getElementById('consent-deny').addEventListener('click', onDeny);
    }

    /* ── Ponto de entrada ─────────────────────────────────────────── */
    function init() {
        var saved;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { saved = null; }

        if (saved === 'granted') {
            // Já aceitou: carrega analytics silenciosamente após idle
            if ('requestIdleCallback' in window) {
                requestIdleCallback(loadAnalytics, { timeout: 4000 });
            } else {
                window.addEventListener('load', function () { setTimeout(loadAnalytics, 1000); });
            }
        } else if (saved === 'denied') {
            // Já recusou: não faz nada
        } else {
            // Primeira visita: mostra banner após o DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showBanner);
            } else {
                showBanner();
            }
        }
    }

    init();
})();
