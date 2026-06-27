import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants6.js';
import { criarJogo } from './game-engine.js';

const { init } = criarJogo({
    XINGOS,
    TENTATIVAS,
    TAMANHO_PALAVRA,
    NS: "xingo6",
    SEMENTE_CICLO: 7,
    LABEL_TABULEIRO: "Tabuleiro do Xingão",
    TITULO_JOGO: "XINGÃO",
    URL_JOGO: "https://lorrananeves.github.io/xingo/xingao.html",
    NS_OUTRO_JOGO: "xingo",
    URL_OUTRO_JOGO: "./index.html",
    ROTULO_OUTRO_JOGO: "Jogar XINGO (5 letras)",
    TEXTO_OUTRO_JOGO: "Já jogou o XINGÃO — agora tenta o de 5 letras. Mais fácil? Talvez.",
    EVENTO_WIN: "win_xingao",
    EVENTO_LOSE: "lose_xingao",
    EVENTO_SHARE: "share_xingao",
    EVENTO_COPY: "copy_xingao"
});

if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {

            console.log("Service Worker registrado");

        })
        .catch((erro) => {

            console.error("Erro no Service Worker:", erro);
        });
}

window.addEventListener('appinstalled', () => {

    if (window.gtag) {

        gtag('event', 'pwa_installed');

    }
});

init();
