import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants6.js';
import { storage } from './storage.js';
import { ui } from './ui.js';

// Namespace isolado para o Xingão (6 letras) — não mistura dados com o jogo de 5 letras
const NS = "xingo6";

const state = {
    fileira: 0,
    coluna: 0,
    fimDeJogo: false,
    travado: false,
    palavra: "",
    dataJogo: "",
    tiles: [],
    tentativas: []
};

function init() {

    const hoje = obterDataLocal();

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    const botaoFechar =
        document.getElementById("fechar-modal");

    if (botaoFechar) {
        botaoFechar.onclick = () => {
            ui.elements.modal.style.display = "none";
        };
    }

    const botaoRegras =
        document.getElementById("btn-regras");

    if (botaoRegras) {
        botaoRegras.onclick = () => {
            ui.elements.modal.style.display = "flex";
        };
    }

    iniciarJogo(hoje);

    document.addEventListener(
        'keyup',
        handleInput
    );
}

function iniciarJogo(dataStr) {

    const salvo =
        storage.obterProgresso(dataStr, NS);

    resetarEstado(dataStr);

    // A palavra é sempre derivada deterministicamente da data — nunca lida do storage
    configurarPalavraDoDia(dataStr);

    if (salvo && salvo.finalizado) {

        ui.elements.modal.style.display = "none";

        const stats = storage.obterEstatisticas(NS, TENTATIVAS);

        ui.mostrarStatusFinal(
            salvo.vitoria,
            state.palavra,
            {
                ...stats,
                ultimoAcerto:
                    salvo.tentativa ||
                    stats.ultimoAcerto
            },
            salvo.tentativa,
            obterConviteOntem(salvo.vitoria),
            obterConviteOutroJogo()
        );

        configurarBotaoOntem();

        return;
    }

    criarTabuleiro();

    renderTeclado();
}

function resetarEstado(dataStr) {

    state.fileira = 0;
    state.coluna = 0;
    state.fimDeJogo = false;
    state.travado = false;
    state.palavra = "";
    state.dataJogo = dataStr;
    state.tiles = [];
    state.tentativas = [];

    ui.elements.board.classList.remove("board-status");
    ui.elements.answer.innerText = "";

    if (ui.elements.keyboard) {
        ui.elements.keyboard.style.display = "";
    }
}

function obterConviteOntem(vitoria) {

    const hoje = obterDataLocal();
    const ontem = alterarData(hoje, -1);

    if (state.dataJogo !== hoje) return null;

    const progressoOntem =
        storage.obterProgresso(ontem, NS);

    if (
        progressoOntem &&
        progressoOntem.finalizado
    ) return null;

    return {
        data: ontem,
        texto: vitoria
            ? "Acertou, boa. Tente o feito com a palavra de ontem também."
            : "Que pena, perdeu. Tente a de ontem pra ver se consegue descobrir."
    };
}

function obterConviteOutroJogo() {

    const hoje = obterDataLocal();

    // Só mostra o convite se estiver jogando o jogo de hoje
    if (state.dataJogo !== hoje) return null;

    const progressoXingo =
        storage.obterProgresso(hoje, "xingo");

    // Se já jogou o Xingo de 5 letras hoje, não mostra o convite
    if (
        progressoXingo &&
        progressoXingo.finalizado
    ) return null;

    return {
        url: "./index.html",
        rotulo: "Jogar XINGO (5 letras)",
        texto: "Já jogou o XINGÃO — agora tenta o de 5 letras. Mais fácil? Talvez."
    };
}

function configurarBotaoOntem() {

    const botaoOntem =
        document.getElementById("jogar-ontem-btn");

    if (!botaoOntem) return;

    botaoOntem.onclick = () => {
        iniciarJogo(alterarData(obterDataLocal(), -1));
    };
}

function obterDataLocal(data = new Date()) {

    return `${data.getFullYear()}-${
        String(data.getMonth() + 1).padStart(2, '0')
    }-${
        String(data.getDate()).padStart(2, '0')
    }`;
}

function alterarData(dataStr, diferencaDias) {

    const data = criarDataUtc(dataStr);

    data.setUTCDate(
        data.getUTCDate() + diferencaDias
    );

    return `${data.getUTCFullYear()}-${
        String(data.getUTCMonth() + 1).padStart(2, '0')
    }-${
        String(data.getUTCDate()).padStart(2, '0')
    }`;
}

/**
 * Gera a palavra do dia baseada na data.
 */
function configurarPalavraDoDia(dataStr) {

    const indiceDia =
        obterIndiceDia(dataStr);

    const ciclo =
        Math.floor(indiceDia / XINGOS.length);

    const posicao =
        indiceDia % XINGOS.length;

    const ordem =
        obterOrdemDoCiclo(ciclo);

    state.palavra =
        XINGOS[ordem[posicao]].toUpperCase();
}

function obterIndiceDia(dataStr) {

    const inicio =
        criarDataUtc("2024-01-01");

    const data =
        criarDataUtc(dataStr);

    return Math.floor(
        (data - inicio) / 86400000
    );
}

function criarDataUtc(dataStr) {

    const [ano, mes, dia] =
        dataStr.split('-').map(Number);

    return new Date(
        Date.UTC(ano, mes - 1, dia)
    );
}

function obterOrdemDoCiclo(ciclo) {

    const ordem =
        XINGOS.map((_, indice) => indice);

    // Semente diferente da do jogo de 5 letras para sequências independentes
    let semente =
        (ciclo + 7) * 2654435761;

    for (
        let i = ordem.length - 1;
        i > 0;
        i--
    ) {

        semente =
            (semente * 1664525 + 1013904223) %
            4294967296;

        const j =
            semente % (i + 1);

        const temporario = ordem[i];
        ordem[i] = ordem[j];
        ordem[j] = temporario;
    }

    return ordem;
}

function obterDescricaoTile(linha, coluna, letra = "", resultado = "") {

    const posicao =
        `Linha ${linha + 1}, coluna ${coluna + 1}`;

    if (!letra) {
        return `${posicao}, vazio`;
    }

    if (!resultado) {
        return `${posicao}, letra ${letra}`;
    }

    return `${posicao}, letra ${letra}, ${resultado}`;
}

function obterDescricaoResultado(resultado) {

    const descricoes = {
        correct: "correta no lugar certo",
        present: "existe na palavra em outro lugar",
        absent: "não existe na palavra"
    };

    return descricoes[resultado] || "";
}

/**
 * Cria tabuleiro com 6 colunas.
 */
function criarTabuleiro() {

    ui.elements.board.innerHTML = "";
    ui.elements.board.setAttribute("role", "grid");
    ui.elements.board.setAttribute(
        "aria-label",
        "Tabuleiro do Xingão"
    );

    // Ajusta o grid para 6 colunas via variável CSS
    ui.elements.board.style.setProperty(
        "--colunas",
        TAMANHO_PALAVRA
    );

    for (let r = 0; r < TENTATIVAS; r++) {

        state.tiles[r] = [];

        for (
            let c = 0;
            c < TAMANHO_PALAVRA;
            c++
        ) {

            const tile =
                document.createElement("span");

            tile.classList.add("tile");
            tile.setAttribute("role", "gridcell");
            tile.setAttribute("aria-rowindex", r + 1);
            tile.setAttribute("aria-colindex", c + 1);
            tile.setAttribute(
                "aria-label",
                obterDescricaoTile(r, c)
            );

            ui.elements.board.appendChild(tile);

            state.tiles[r][c] = tile;
        }
    }
}

/**
 * Renderiza teclado virtual.
 */
function renderTeclado() {

    const layout = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["Enter","Z","X","C","V","B","N","M","⌫"]
    ];

    ui.elements.keyboard.innerHTML = "";

    layout.forEach(row => {

        let rowDiv =
            document.createElement("div");

        rowDiv.classList.add("keyboard-row");

        row.forEach(key => {

            let keyTile =
                document.createElement("div");

            keyTile.innerText = key;

            keyTile.className =
                key === "Enter"
                    ? "enter-key-tile"
                    : "key-tile";

            keyTile.id =
                key === "⌫"
                    ? "Backspace"
                    : (
                        key === "Enter"
                            ? "Enter"
                            : "Key" + key
                    );

            keyTile.onclick = () =>
                handleInput({
                    code: keyTile.id
                });

            rowDiv.appendChild(keyTile);
        });

        ui.elements.keyboard.appendChild(rowDiv);
    });
}

/**
 * Input físico e virtual.
 */
function handleInput(e) {

    if (
        state.fimDeJogo ||
        state.travado
    ) return;

    if (
        "KeyA" <= e.code &&
        e.code <= "KeyZ"
    ) {

        if (
            state.coluna <
            TAMANHO_PALAVRA
        ) {

            let tile =
                state.tiles[
                    state.fileira
                ][
                    state.coluna
                ];

            tile.innerText =
                e.code.replace("Key", "");

            tile.setAttribute(
                "aria-label",
                obterDescricaoTile(
                    state.fileira,
                    state.coluna,
                    tile.innerText
                )
            );

            tile.classList.add("pop");

            setTimeout(() => {
                tile.classList.remove("pop");
            }, 100);

            state.coluna++;
        }

    } else if (
        e.code === "Backspace" &&
        state.coluna > 0
    ) {

        state.coluna--;

        state.tiles[
            state.fileira
        ][
            state.coluna
        ].innerText = "";

        state.tiles[
            state.fileira
        ][
            state.coluna
        ].setAttribute(
            "aria-label",
            obterDescricaoTile(
                state.fileira,
                state.coluna
            )
        );

    } else if (e.code === "Enter") {

        validarTentativa();
    }
}

/**
 * Valida tentativa.
 */
function validarTentativa() {

    let tentativa = "";

    for (
        let c = 0;
        c < TAMANHO_PALAVRA;
        c++
    ) {

        tentativa +=
            state.tiles[
                state.fileira
            ][c].innerText;
    }

    if (
        tentativa.length <
        TAMANHO_PALAVRA
    ) {

        ui.triggerShake();

        ui.exibirMensagem(
            "Completa a palavra, gênio."
        );

        return;
    }

    processarResultado(tentativa);
}

/**
 * Processa resultado.
 */
function processarResultado(tentativa) {

    state.travado = true;

    let correct = 0;

    const resultados =
        Array(TAMANHO_PALAVRA).fill(null);

    const resultadoLinha =
        Array(TAMANHO_PALAVRA).fill("");

    const palavraLimpa =
        state.palavra
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    let letterCount = {};

    for (let l of palavraLimpa) {
        letterCount[l] =
            (letterCount[l] || 0) + 1;
    }

    // Letras corretas
    for (
        let c = 0;
        c < TAMANHO_PALAVRA;
        c++
    ) {

        let tile =
            state.tiles[
                state.fileira
            ][c];

        // Normaliza a letra digitada para remover acentos antes de comparar
        let letra = tile.innerText
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        tile.innerText = letra;

        if (
            palavraLimpa[c] === letra
        ) {

            resultados[c] = "correct";

            resultadoLinha[c] = "🟩";

            correct++;

            letterCount[letra]--;
        }
    }

    // Letras presentes/ausentes
    for (
        let c = 0;
        c < TAMANHO_PALAVRA;
        c++
    ) {

        if (
            resultados[c] === "correct"
        ) continue;

        let letra =
            state.tiles[
                state.fileira
            ][c].innerText
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            palavraLimpa.includes(letra) &&
            letterCount[letra] > 0
        ) {

            resultados[c] = "present";

            resultadoLinha[c] = "🟨";

            letterCount[letra]--;

        } else {

            resultados[c] = "absent";

            resultadoLinha[c] = "⬛";
        }
    }

    for (
        let c = 0;
        c < TAMANHO_PALAVRA;
        c++
    ) {

        const tile =
            state.tiles[
                state.fileira
            ][c];

        const letra = tile.innerText;

        setTimeout(() => {
            tile.classList.add("flip");
        }, c * 150);

        setTimeout(() => {
            tile.classList.add(resultados[c]);
            tile.setAttribute(
                "aria-label",
                obterDescricaoTile(
                    state.fileira,
                    c,
                    letra,
                    obterDescricaoResultado(resultados[c])
                )
            );
            ui.atualizarTecla(
                letra,
                resultados[c]
            );
        }, c * 150 + 300);
    }

    setTimeout(() => {
        state.tentativas.push(
            resultadoLinha.join("")
        );

        verificarFimDeJogo(correct);

    }, (TAMANHO_PALAVRA - 1) * 150 + 650);
}

/**
 * Finaliza jogo.
 */
function verificarFimDeJogo(correct) {

    if (
        correct === TAMANHO_PALAVRA ||
        state.fileira === TENTATIVAS - 1
    ) {

        state.fimDeJogo = true;

        const vitoria = (correct === TAMANHO_PALAVRA);
        const fileiraDaVez = state.fileira;

        // Avança fileira antes do setTimeout para não corromper o estado
        state.fileira++;

        if (window.gtag) {

            if (vitoria) {

                gtag('event', 'win_xingao', {
                    tentativas: fileiraDaVez + 1
                });

            } else {

                gtag('event', 'lose_xingao');

            }
        }

        storage.salvarProgresso(
            vitoria,
            state.dataJogo,
            fileiraDaVez + 1,
            NS
        );

        storage.atualizarEstatisticas(
            vitoria,
            fileiraDaVez,
            state.dataJogo,
            NS
        );

        const stats =
            storage.obterEstatisticas(NS, TENTATIVAS);

        setTimeout(() => {

            ui.mostrarStatusFinal(
                vitoria,
                state.palavra,
                {
                    ...stats,
                    ultimoAcerto: fileiraDaVez + 1
                },
                fileiraDaVez + 1,
                obterConviteOntem(vitoria),
                obterConviteOutroJogo()
            );

            configurarBotaoOntem();

            const shareBtn =
                document.getElementById(
                    "share-btn"
                );

            if (shareBtn) {

                shareBtn.onclick =
                    async () => {

                    const numeroJogo =
                        obterIndiceDia(state.dataJogo) + 1;

                    const resultadoTexto =
`XINGÃO #${numeroJogo}

${state.tentativas.join("\n")}

${vitoria
    ? "🔥 Brabo demais."
    : "💀 Tomei um pau."
}

https://lorrananeves.github.io/xingo/xingao.html`;

                    try {

                        if (
                            navigator.share &&
                            /Mobi|Android/i.test(
                                navigator.userAgent
                            )
                        ) {

                            if (window.gtag) {
                                gtag('event', 'share_xingao');
                            }

                            await navigator.share({
                                title: "XINGÃO",
                                text: resultadoTexto
                            });

                        } else {

                            if (window.gtag) {
                                gtag('event', 'copy_xingao');
                            }

                            await navigator.clipboard
                                .writeText(resultadoTexto);

                            ui.mostrarToast(
                                "Resultado copiado!"
                            );
                        }

                    } catch (erro) {

                        console.error(
                            "Erro ao compartilhar:",
                            erro
                        );

                        try {

                            if (window.gtag) {
                                gtag('event', 'copy_xingao');
                            }

                            await navigator.clipboard
                                .writeText(resultadoTexto);

                            ui.mostrarToast(
                                "Resultado copiado!"
                            );

                        } catch {

                            ui.mostrarToast(
                                "Não foi possível compartilhar."
                            );
                        }
                    }
                };
            }

        }, 1500);

    } else {

        state.fileira++;
        state.coluna = 0;
        state.travado = false;
    }
}

if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {

            console.log(
                "Service Worker registrado"
            );

        })
        .catch((erro) => {

            console.error(
                "Erro no Service Worker:",
                erro
            );
        });
}

window.addEventListener('appinstalled', () => {

    if (window.gtag) {

        gtag('event', 'pwa_installed');

    }
});

init();
