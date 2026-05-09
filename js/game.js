import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants.js';
import { storage } from './storage.js';
import { ui } from './ui.js';

const state = {
    fileira: 0,
    coluna: 0,
    fimDeJogo: false,
    travado: false,
    palavra: "",
    tiles: [],
    tentativas: []
};

function init() {

    const agora = new Date();

    const hoje =
        `${agora.getFullYear()}-${
            String(agora.getMonth() + 1).padStart(2, '0')
        }-${
            String(agora.getDate()).padStart(2, '0')
        }`;

    const salvo = storage.obterProgresso();

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

    if (
        salvo &&
        salvo.data === hoje &&
        salvo.finalizado
    ) {

        ui.elements.modal.style.display = "none";

        const stats = storage.obterEstatisticas();

        ui.mostrarStatusFinal(
            salvo.vitoria,
            salvo.palavra,
            stats
        );

        return;
    }

    configurarPalavraDoDia(hoje);

    criarTabuleiro();

    renderTeclado();

    document.addEventListener(
        'keyup',
        handleInput
    );
}

/**
 * Gera a palavra do dia baseada na data.
 */
function configurarPalavraDoDia(dataStr) {

    const semente =
        dataStr.split('-').join('');

    let hash = 0;

    for (let i = 0; i < semente.length; i++) {

        hash =
            (
                hash * 31 +
                semente.charCodeAt(i)
            ) % 1000000007;
    }

    state.palavra =
        XINGOS[
            hash % XINGOS.length
        ].toUpperCase();
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
 * Cria tabuleiro.
 */
function criarTabuleiro() {

    ui.elements.board.innerHTML = "";
    ui.elements.board.setAttribute("role", "grid");
    ui.elements.board.setAttribute(
        "aria-label",
        "Tabuleiro do Xingo"
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

        let letra = tile.innerText;

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
            ][c].innerText;

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
        if (window.gtag) {

            if (vitoria) {

                gtag('event', 'win_game', {
                    tentativas: state.fileira + 1
                });

            } else {

                gtag('event', 'lose_game');

            }
        }

        storage.salvarProgresso(
            vitoria,
            state.palavra
        );

        storage.atualizarEstatisticas(
            vitoria,
            state.fileira
        );

        const stats =
            storage.obterEstatisticas();

        setTimeout(() => {

            ui.mostrarStatusFinal(
                vitoria,
                state.palavra,
                stats,
                state.fileira + 1
            );

            const shareBtn =
                document.getElementById(
                    "share-btn"
                );

            if (shareBtn) {

                shareBtn.onclick =
                    async () => {

                    const numeroJogo =
                        Math.floor(
                            Date.now() / 86400000
                        );

                    const resultadoTexto =
`XINGO #${numeroJogo}

${state.tentativas.join("\n")}

${vitoria
    ? "🔥 Brabo demais."
    : "💀 Tomei um pau."
}

https://lorrananeves.github.io/xingo/`;

                    try {

                        if (
                            navigator.share &&
                            /Mobi|Android/i.test(
                                navigator.userAgent
                            )
                        ) {

                            if (window.gtag) {
                                gtag('event', 'share_result');
                            }

                            await navigator.share({
                                title: "XINGO",
                                text: resultadoTexto
                            });

                        } else {

                            if (window.gtag) {
                                gtag('event', 'copy_result');
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
                                gtag('event', 'copy_result');
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

        state.fileira++;

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
