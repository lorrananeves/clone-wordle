export const ui = {
    // Cache dos elementos para performance
    elements: {
        board: document.getElementById("board"),
        answer: document.getElementById("answer"),
        keyboard: document.getElementById("keyboard-container"),
        modal: document.getElementById("modal-regras")
    },

    exibirMensagem(texto) {
        this.elements.answer.innerText = texto;
    },

    triggerShake() {
        this.elements.board.classList.add("shake");
        setTimeout(() => this.elements.board.classList.remove("shake"), 500);
    },

    atualizarTecla(letra, classe) {
        const key = document.getElementById("Key" + letra);
        if (key) {
            // Remove classes antigas para não acumular cores
            key.classList.remove("present", "absent");
            key.classList.add(classe);
        }
    },

    mostrarStatusFinal(vitoria, palavra, stats) {
    const winPct = stats.jogos > 0
        ? Math.round((stats.vitorias / stats.jogos) * 100)
        : 0;

    const maxDist = Math.max(...Object.values(stats.distribuicao), 1);

    let distHtml = "";

    for (let i = 1; i <= 6; i++) {
        const valor = stats.distribuicao[i];
        const larguraBarra = (valor / maxDist) * 100;

        const corBarra =
            (vitoria && i === stats.ultimoAcerto)
                ? "#538d4e"
                : "#3a3a3c";

        distHtml += `
            <div class="dist-row">
                <span class="dist-index">${i}</span>

                <div class="dist-bar-bg">
                    <div
                        class="dist-bar"
                        style="width: ${Math.max(larguraBarra, 8)}%; background: ${corBarra};"
                    >
                        <span class="dist-value">${valor}</span>
                    </div>
                </div>
            </div>
        `;
    }

    this.elements.board.classList.add("board-status");

    this.elements.board.innerHTML = `
        <div class="status-container status-wrapper">

            <h2 class="stats-title">
                ESTATÍSTICAS
            </h2>

            <div class="stats-resumo">

                <div class="stats-item">
                    <b class="stats-number">${stats.jogos}</b>
                    <span class="stats-label">Jogos</span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">${winPct}</b>
                    <span class="stats-label">% Vitórias</span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">${stats.sequenciaAtual}</b>
                    <span class="stats-label">Sequência</span>
                </div>

            </div>

            <h3 class="dist-title">
                DISTRIBUIÇÃO
            </h3>

            <div class="dist-container">
                ${distHtml}
            </div>

            <div class="palavra-container">

                <p class="palavra-label">
                    A palavra era:
                </p>

                <p class="palavra-final">
                    ${palavra}
                </p>

                <p class="proximo-xingo">
                    Próximo Xingo à meia-noite.
                </p>

            </div>

        </div>
    `;

    if (this.elements.keyboard) {
        this.elements.keyboard.style.display = "none";
    }
    }
};