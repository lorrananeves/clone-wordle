import { storage } from './storage.js';
import { ui } from './ui.js';

/**
 * Cria e retorna uma instância do motor de jogo.
 *
 * @param {object} config
 * @param {string[]} config.XINGOS         - Lista de palavras válidas
 * @param {number}  config.TENTATIVAS      - Número máximo de tentativas
 * @param {number}  config.TAMANHO_PALAVRA - Quantidade de letras da palavra
 * @param {string}  config.NS              - Namespace do localStorage ("xingo" | "xingo6")
 * @param {number}  config.SEMENTE_CICLO   - Multiplicador da semente para embaralhamento (ex: 1 ou 7)
 * @param {string}  config.LABEL_TABULEIRO - Texto do aria-label do board
 * @param {string}  config.TITULO_JOGO     - Título exibido no compartilhamento (ex: "XINGO")
 * @param {string}  config.URL_JOGO        - URL do jogo para o texto de compartilhamento
 * @param {string}  config.NS_OUTRO_JOGO   - Namespace do outro jogo (para cross-invite)
 * @param {string}  config.URL_OUTRO_JOGO  - URL do outro jogo (para cross-invite)
 * @param {string}  config.ROTULO_OUTRO_JOGO - Rótulo do botão do outro jogo
 * @param {string}  config.TEXTO_OUTRO_JOGO  - Texto do convite para o outro jogo
 * @param {string}  config.EVENTO_WIN      - Nome do evento gtag para vitória
 * @param {string}  config.EVENTO_LOSE     - Nome do evento gtag para derrota
 * @param {string}  config.EVENTO_SHARE    - Nome do evento gtag para compartilhar
 * @param {string}  config.EVENTO_COPY     - Nome do evento gtag para copiar
 */
export function criarJogo(config) {

    const {
        XINGOS,
        TENTATIVAS,
        TAMANHO_PALAVRA,
        NS,
        SEMENTE_CICLO,
        LABEL_TABULEIRO,
        TITULO_JOGO,
        URL_JOGO,
        NS_OUTRO_JOGO,
        URL_OUTRO_JOGO,
        ROTULO_OUTRO_JOGO,
        TEXTO_OUTRO_JOGO,
        EVENTO_WIN,
        EVENTO_LOSE,
        EVENTO_SHARE,
        EVENTO_COPY
    } = config;

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

    // ─── Inicialização ────────────────────────────────────────────────────────

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

        document.addEventListener('keyup', handleInput);
    }

    function iniciarJogo(dataStr) {

        const salvo = storage.obterProgresso(dataStr, NS);

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

    // ─── Convites cruzados ────────────────────────────────────────────────────

    function obterConviteOntem(vitoria) {

        const hoje = obterDataLocal();
        const ontem = alterarData(hoje, -1);

        if (state.dataJogo !== hoje) return null;

        const progressoOntem = storage.obterProgresso(ontem, NS);

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

        const progressoOutro = storage.obterProgresso(hoje, NS_OUTRO_JOGO);

        if (
            progressoOutro &&
            progressoOutro.finalizado
        ) return null;

        return {
            url: URL_OUTRO_JOGO,
            rotulo: ROTULO_OUTRO_JOGO,
            texto: TEXTO_OUTRO_JOGO
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

    // ─── Utilitários de data ──────────────────────────────────────────────────

    function obterDataLocal(data = new Date()) {

        return `${data.getFullYear()}-${
            String(data.getMonth() + 1).padStart(2, '0')
        }-${
            String(data.getDate()).padStart(2, '0')
        }`;
    }

    function alterarData(dataStr, diferencaDias) {

        const data = criarDataUtc(dataStr);

        data.setUTCDate(data.getUTCDate() + diferencaDias);

        return `${data.getUTCFullYear()}-${
            String(data.getUTCMonth() + 1).padStart(2, '0')
        }-${
            String(data.getUTCDate()).padStart(2, '0')
        }`;
    }

    function criarDataUtc(dataStr) {

        const [ano, mes, dia] = dataStr.split('-').map(Number);

        return new Date(Date.UTC(ano, mes - 1, dia));
    }

    // ─── Palavra do dia ───────────────────────────────────────────────────────

    /**
     * Gera a palavra do dia baseada na data.
     */
    function configurarPalavraDoDia(dataStr) {

        const indiceDia = obterIndiceDia(dataStr);

        const ciclo = Math.floor(indiceDia / XINGOS.length);

        const posicao = indiceDia % XINGOS.length;

        const ordem = obterOrdemDoCiclo(ciclo);

        state.palavra = XINGOS[ordem[posicao]].toUpperCase();
    }

    function obterIndiceDia(dataStr) {

        const inicio = criarDataUtc("2024-01-01");

        const data = criarDataUtc(dataStr);

        return Math.floor((data - inicio) / 86400000);
    }

    function obterOrdemDoCiclo(ciclo) {

        const ordem = XINGOS.map((_, indice) => indice);

        let semente = (ciclo + SEMENTE_CICLO) * 2654435761;

        for (let i = ordem.length - 1; i > 0; i--) {

            semente =
                (semente * 1664525 + 1013904223) %
                4294967296;

            const j = semente % (i + 1);

            const temporario = ordem[i];
            ordem[i] = ordem[j];
            ordem[j] = temporario;
        }

        return ordem;
    }

    // ─── Acessibilidade ───────────────────────────────────────────────────────

    function obterDescricaoTile(linha, coluna, letra = "", resultado = "") {

        const posicao = `Linha ${linha + 1}, coluna ${coluna + 1}`;

        if (!letra) return `${posicao}, vazio`;

        if (!resultado) return `${posicao}, letra ${letra}`;

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

    // ─── Tabuleiro & Teclado ──────────────────────────────────────────────────

    /**
     * Cria tabuleiro.
     */
    function criarTabuleiro() {

        ui.elements.board.innerHTML = "";
        ui.elements.board.setAttribute("role", "grid");
        ui.elements.board.setAttribute("aria-label", LABEL_TABULEIRO);

        // Garante que o grid CSS use o número correto de colunas
        ui.elements.board.style.setProperty("--colunas", TAMANHO_PALAVRA);

        for (let r = 0; r < TENTATIVAS; r++) {

            state.tiles[r] = [];

            for (let c = 0; c < TAMANHO_PALAVRA; c++) {

                const tile = document.createElement("span");

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

            const rowDiv = document.createElement("div");
            rowDiv.classList.add("keyboard-row");

            row.forEach(key => {

                const keyTile = document.createElement("div");

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
                    handleInput({ code: keyTile.id });

                rowDiv.appendChild(keyTile);
            });

            ui.elements.keyboard.appendChild(rowDiv);
        });
    }

    // ─── Input ────────────────────────────────────────────────────────────────

    /**
     * Input físico e virtual.
     */
    function handleInput(e) {

        if (state.fimDeJogo || state.travado) return;

        if ("KeyA" <= e.code && e.code <= "KeyZ") {

            if (state.coluna < TAMANHO_PALAVRA) {

                const tile = state.tiles[state.fileira][state.coluna];

                tile.innerText = e.code.replace("Key", "");

                tile.setAttribute(
                    "aria-label",
                    obterDescricaoTile(
                        state.fileira,
                        state.coluna,
                        tile.innerText
                    )
                );

                tile.classList.add("pop");

                setTimeout(() => tile.classList.remove("pop"), 100);

                state.coluna++;
            }

        } else if (e.code === "Backspace" && state.coluna > 0) {

            state.coluna--;

            state.tiles[state.fileira][state.coluna].innerText = "";

            state.tiles[state.fileira][state.coluna].setAttribute(
                "aria-label",
                obterDescricaoTile(state.fileira, state.coluna)
            );

        } else if (e.code === "Enter") {

            validarTentativa();
        }
    }

    // ─── Validação e resultado ────────────────────────────────────────────────

    /**
     * Valida tentativa.
     */
    function validarTentativa() {

        let tentativa = "";

        for (let c = 0; c < TAMANHO_PALAVRA; c++) {
            tentativa += state.tiles[state.fileira][c].innerText;
        }

        if (tentativa.length < TAMANHO_PALAVRA) {

            ui.triggerShake();
            ui.exibirMensagem("Completa a palavra, gênio.");

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

        const resultados = Array(TAMANHO_PALAVRA).fill(null);
        const resultadoLinha = Array(TAMANHO_PALAVRA).fill("");

        const palavraLimpa =
            state.palavra
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const letterCount = {};

        for (const l of palavraLimpa) {
            letterCount[l] = (letterCount[l] || 0) + 1;
        }

        // Primeira passagem: letras na posição correta
        for (let c = 0; c < TAMANHO_PALAVRA; c++) {

            const tile = state.tiles[state.fileira][c];

            // Normaliza a letra digitada para remover acentos antes de comparar
            const letra = tile.innerText
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            tile.innerText = letra;

            if (palavraLimpa[c] === letra) {

                resultados[c] = "correct";
                resultadoLinha[c] = "🟩";
                correct++;
                letterCount[letra]--;
            }
        }

        // Segunda passagem: letras presentes em outra posição ou ausentes
        for (let c = 0; c < TAMANHO_PALAVRA; c++) {

            if (resultados[c] === "correct") continue;

            const letra = state.tiles[state.fileira][c].innerText
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

        // Aplica animações e classes de resultado
        for (let c = 0; c < TAMANHO_PALAVRA; c++) {

            const tile = state.tiles[state.fileira][c];
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
                ui.atualizarTecla(letra, resultados[c]);
            }, c * 150 + 300);
        }

        setTimeout(() => {
            state.tentativas.push(resultadoLinha.join(""));
            verificarFimDeJogo(correct);
        }, (TAMANHO_PALAVRA - 1) * 150 + 650);
    }

    // ─── Fim de jogo ──────────────────────────────────────────────────────────

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
                    gtag('event', EVENTO_WIN, { tentativas: fileiraDaVez + 1 });
                } else {
                    gtag('event', EVENTO_LOSE);
                }
            }

            storage.salvarProgresso(vitoria, state.dataJogo, fileiraDaVez + 1, NS);

            storage.atualizarEstatisticas(vitoria, fileiraDaVez, state.dataJogo, NS);

            const stats = storage.obterEstatisticas(NS, TENTATIVAS);

            setTimeout(() => {

                ui.mostrarStatusFinal(
                    vitoria,
                    state.palavra,
                    { ...stats, ultimoAcerto: fileiraDaVez + 1 },
                    fileiraDaVez + 1,
                    obterConviteOntem(vitoria),
                    obterConviteOutroJogo()
                );

                configurarBotaoOntem();

                const shareBtn = document.getElementById("share-btn");

                if (shareBtn) {
                    shareBtn.onclick = async () => {

                        const numeroJogo =
                            obterIndiceDia(state.dataJogo) + 1;

                        const resultadoTexto =
`${TITULO_JOGO} #${numeroJogo}

${state.tentativas.join("\n")}

${vitoria
    ? "🔥 Brabo demais."
    : "💀 Tomei um pau."
}

${URL_JOGO}`;

                        try {

                            // Usa a Web Share API quando disponível (sem detecção de userAgent)
                            if (navigator.share) {

                                if (window.gtag) {
                                    gtag('event', EVENTO_SHARE);
                                }

                                await navigator.share({
                                    title: TITULO_JOGO,
                                    text: resultadoTexto
                                });

                            } else {

                                if (window.gtag) {
                                    gtag('event', EVENTO_COPY);
                                }

                                await navigator.clipboard.writeText(resultadoTexto);

                                ui.mostrarToast("Resultado copiado!");
                            }

                        } catch (erro) {

                            console.error("Erro ao compartilhar:", erro);

                            try {

                                if (window.gtag) {
                                    gtag('event', EVENTO_COPY);
                                }

                                await navigator.clipboard.writeText(resultadoTexto);

                                ui.mostrarToast("Resultado copiado!");

                            } catch {

                                ui.mostrarToast("Não foi possível compartilhar.");
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

    return { init };
}
