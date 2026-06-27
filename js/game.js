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
    NS_OUTRO_JOGO: "xingo6",
    URL_OUTRO_JOGO: "./xingao.html",
    ROTULO_OUTRO_JOGO: "Jogar XINGÃO (6 letras)",
    TEXTO_OUTRO_JOGO: "Já jogou o de 5 letras — agora tenta o XINGÃO com 6 letras. Tá preparado?",
    EVENTO_WIN: "win_game",
    EVENTO_LOSE: "lose_game",
    EVENTO_SHARE: "share_result",
    EVENTO_COPY: "copy_result"
});

init();
