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
            if (key.classList.contains("correct")) return;

            if (
                key.classList.contains("present") &&
                classe === "absent"
            ) return;

            key.classList.remove("present", "absent");
            key.classList.add(classe);
        }
    },

    mostrarStatusFinal(
        vitoria,
        palavra,
        stats,
        tentativa,
        conviteOntem = null
    ) {
    const winPct = stats.jogos > 0
        ? Math.round((stats.vitorias / stats.jogos) * 100)
        : 0;

    const maxDist = Math.max(...Object.values(stats.distribuicao), 1);

    let distHtml = "";

    for (let i = 1; i <= 6; i++) {

    const valor = stats.distribuicao[i];

    const larguraBarra =
        (valor / maxDist) * 100;

    const corBarra =
        (vitoria && i === stats.ultimoAcerto)
            ? "#538d4e"
            : "#3a3a3c";

    distHtml += `
        <div class="dist-row">

            <span class="dist-index">
                ${i}
            </span>

            <div class="dist-bar-bg">

                <div
                    class="dist-bar"
                    style="
                        width: ${Math.max(larguraBarra, 8)}%;
                        background: ${corBarra};
                    "
                >

                    <span class="dist-value">
                        ${valor}
                    </span>

                </div>

            </div>

        </div>
    `;
}

const fraseFinal =
    this.obterMensagemFinal(
        vitoria,
        tentativa
    );

const conviteOntemHtml =
    conviteOntem
        ? `
                <div class="convite-ontem">
                    <p class="convite-ontem-texto">
                        ${conviteOntem.texto}
                    </p>

                    <button id="jogar-ontem-btn" class="reset-btn ontem-btn">
                        Jogar palavra de ontem
                    </button>
                </div>
        `
        : "";
    

    this.elements.board.classList.add("board-status");

    this.elements.board.innerHTML = `
        <div class="status-container status-wrapper">

            <h2 class="stats-title">
                ESTATÍSTICAS
            </h2>

            <div class="stats-resumo">

                <div class="stats-item">
                    <b class="stats-number">
                        ${stats.jogos}
                    </b>
                    <span class="stats-label">
                        Jogos
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${winPct}
                    </b>
                    <span class="stats-label">
                        % Vitórias
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${stats.sequenciaAtual}
                    </b>
                    <span class="stats-label">
                        🔥 Atual
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${stats.melhorSequencia}
                    </b>
                    <span class="stats-label">
                        🏆 Recorde
                    </span>
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

                <p class="frase-final">
                    ${fraseFinal}
                </p>

                <p class="proximo-xingo">
                    ${conviteOntem
                        ? "Próximo Xingo à meia-noite."
                        : "Próximo Xingo disponível amanhã."}
                </p>

                <div class="status-actions">
                    ${conviteOntemHtml}

                    <button id="share-btn" class="reset-btn share-btn">
                        Compartilhar
                    </button>
                </div>

            </div>

        </div>
    `;

    if (this.elements.keyboard) {
        this.elements.keyboard.style.display = "none";
    }
    },
    mostrarToast(texto) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = texto;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
    },

obterMensagemFinal(vitoria, tentativa) {

    if (!vitoria) {

        const derrotas = [
            "Vergonha nacional.",
            "Seu repertório tá triste.",
            "A internet esperava mais."
        ];

        return derrotas[
            Math.floor(
                Math.random() * derrotas.length
            )
        ];
    }

    const mensagens = {

        1: [
            "Mandou bem.",
            "Calma aí, profissional."
        ],

        2: [
            "Xingando com eficiência.",
            "Tá treinando bastante hein."
        ],

        3: [
            "Mandou bem.",
            "Tá aceitável."
        ],

        4: [
            "No sufoco, mas foi.",
            "Quase virou meme."
        ],

        5: [
            "Foi por pouco.",
            "Passou raspando."
        ],

        6: [
            "Vitória culposa.",
            "Nem você acreditou."
        ]
    };

    const lista =
    mensagens[tentativa] ||
    mensagens[6];

    return lista[
        Math.floor(Math.random() * lista.length)
    ];
}
};
