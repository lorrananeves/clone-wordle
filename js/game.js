import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants.js';
import { criarJogo } from './game-engine.js';

const { init } = criarJogo({
    XINGOS,
    TENTATIVAS,
    TAMANHO_PALAVRA,
    NS: "xingo",
    SEMENTE_CICLO: 1,
    LABEL_TABULEIRO: "Tabuleiro do Xingo",
    TITULO_JOGO: "XINGO",
    URL_JOGO: "https://lorrananeves.github.io/xingo/",
    OUTROS_JOGOS: [
        {
            ns: "xingo4",
            url: "./xinguinho.html",
            rotulo: "Jogar XINGUINHO (4 letras)",
            texto: "Aqueceu com 5 letras — agora tenta o XINGUINHO de 4. Mais fácil? Quase."
        },
        {
            ns: "xingo6",
            url: "./xingao.html",
            rotulo: "Jogar XINGÃO (6 letras)",
            texto: "Dominou o de 5 — agora enfrenta o XINGÃO de 6 letras. Tá preparado?"
        }
    ],
    EVENTO_WIN: "win_game",
    EVENTO_LOSE: "lose_game",
    EVENTO_SHARE: "share_result",
    EVENTO_COPY: "copy_result"
});

init();
