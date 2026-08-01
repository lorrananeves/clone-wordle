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
    OUTROS_JOGOS: [
        {
            ns: "xingo4",
            url: "./xinguinho.html",
            rotulo: "Jogar XINGUINHO (4 letras)",
            texto: "Sobrou tempo? Tenta o XINGUINHO de 4 letras. Parece fácil..."
        },
        {
            ns: "xingo",
            url: "./index.html",
            rotulo: "Jogar XINGO (5 letras)",
            texto: "Já encarou o XINGÃO — agora tenta o XINGO de 5 letras. Mais fácil? Talvez."
        }
    ],
    EVENTO_WIN: "win_xingao",
    EVENTO_LOSE: "lose_xingao",
    EVENTO_SHARE: "share_xingao",
    EVENTO_COPY: "copy_xingao"
});

init();
