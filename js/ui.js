export const ui = {
    // Elementos inicializados de forma lazy para evitar acesso ao DOM antes do carregamento
    _elements: null,

    get elements() {
        if (!this._elements) {
            this._elements = {
                board: document.getElementById("board"),
                answer: document.getElementById("answer"),
                keyboard: document.getElementById("keyboard-container"),
                modal: document.getElementById("modal-regras")
            };
        }
        return this._elements;
    },

    // Escapa HTML para evitar XSS ao inserir valores dinâmicos em innerHTML
    _esc(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
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
        conviteOntem = null,
        conviteOutroJogo = null,
        nomeJogo = "Xingo",
        fraseFinal = ""
    ) {
        const winPct = stats.jogos > 0
            ? Math.round((stats.vitorias / stats.jogos) * 100)
            : 0;

        const conviteOntemHtml =
            conviteOntem
                ? `
                <div class="convite-ontem">
                    <p class="convite-ontem-texto">
                        ${this._esc(conviteOntem.texto)}
                    </p>

                    <button id="jogar-ontem-btn" class="reset-btn ontem-btn">
                        Jogar palavra de ontem
                    </button>
                </div>
        `
                : "";

        const conviteOutroJogoHtml =
            conviteOutroJogo
                ? `
                <div class="convite-outro-jogo">
                    <p class="convite-outro-jogo-texto">
                        ${this._esc(conviteOutroJogo.texto)}
                    </p>
                    <a href="${this._esc(conviteOutroJogo.url)}" class="reset-btn outro-jogo-btn">
                        ${this._esc(conviteOutroJogo.rotulo)}
                    </a>
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
                        ${this._esc(stats.jogos)}
                    </b>
                    <span class="stats-label">
                        Jogos
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${this._esc(winPct)}
                    </b>
                    <span class="stats-label">
                        % Vitórias
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${this._esc(stats.sequenciaAtual)}
                    </b>
                    <span class="stats-label">
                        🔥 Atual
                    </span>
                </div>

                <div class="stats-item">
                    <b class="stats-number">
                        ${this._esc(stats.melhorSequencia)}
                    </b>
                    <span class="stats-label">
                        🏆 Recorde
                    </span>
                </div>
            </div>

            <div class="palavra-container">

                <p class="palavra-label">
                    A palavra era:
                </p>

                <p class="palavra-final">
                    ${this._esc(palavra)}
                </p>

                <p class="frase-final">
                    ${this._esc(fraseFinal)}
                </p>

                <p class="proximo-xingo">
                    Próximo ${this._esc(nomeJogo)} disponível amanhã.
                </p>

                <div class="status-actions">
                    ${conviteOutroJogoHtml}

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
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        toast.innerText = texto;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    },

    abrirModalCompartilhar(resultadoTexto, tituloJogo) {

        // Remove modal anterior se existir
        document.getElementById("modal-share")?.remove();

        const textoUrl = encodeURIComponent(resultadoTexto);

        const overlay = document.createElement("div");
        overlay.id = "modal-share";
        overlay.className = "share-overlay";

        const box = document.createElement("div");
        box.className = "share-box";

        box.innerHTML = `
            <p class="share-box-title">Compartilhar resultado</p>

            <a class="share-btn-rede share-whatsapp"
               href="https://wa.me/?text=${textoUrl}"
               target="_blank" rel="noopener">
                WhatsApp
            </a>

            <a class="share-btn-rede share-twitter"
               href="https://x.com/intent/post?text=${textoUrl}"
               target="_blank" rel="noopener">
                Twitter / X
            </a>

            <a class="share-btn-rede share-telegram"
               href="https://t.me/share/url?url=${encodeURIComponent("https://lorrananeves.github.io/xingo/")}&text=${textoUrl}"
               target="_blank" rel="noopener">
                Telegram
            </a>

            <button id="share-copy-btn" class="share-btn-rede share-copy">
                Copiar texto
            </button>

            <button id="share-fechar-btn" class="share-btn-fechar">
                Fechar
            </button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
        box.querySelector("#share-fechar-btn").onclick = () => overlay.remove();

        return box.querySelector("#share-copy-btn");
    },

};
