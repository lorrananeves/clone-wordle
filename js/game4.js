import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants4.js';
import { criarJogo } from './game-engine.js';

const { init } = criarJogo({
    XINGOS,
    TENTATIVAS,
    TAMANHO_PALAVRA,
    NS: "xingo4",
    SEMENTE_CICLO: 3,
    LABEL_TABULEIRO: "Tabuleiro do Xinguinho",
    TITULO_JOGO: "XINGUINHO",
    URL_JOGO: "https://lorrananeves.github.io/xingo/xinguinho.html",
    OUTROS_JOGOS: [
        {
            ns: "xingo",
            url: "./index.html",
            rotulo: "Jogar XINGO (5 letras)",
            texto: "Aqueceu com 4 letras — agora tenta o XINGO de 5. Vai encarar?"
        },
        {
            ns: "xingo6",
            url: "./xingao.html",
            rotulo: "Jogar XINGÃO (6 letras)",
            texto: "Quer mais desafio? Tenta o XINGÃO de 6 letras. Bem mais pesado."
        }
    ],
    EVENTO_WIN: "win_xinguinho",
    EVENTO_LOSE: "lose_xinguinho",
    EVENTO_SHARE: "share_xinguinho",
    EVENTO_COPY: "copy_xinguinho"
});

init();
