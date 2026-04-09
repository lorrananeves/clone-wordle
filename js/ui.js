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
        this.exibirMensagem("Completa a palavra, gênio.");
    },

    atualizarTecla(letra, classe) {
        const key = document.getElementById("Key" + letra);
        if (!key) return;
        
        if (classe === "correct") {
            key.classList.remove("present");
            key.classList.add("correct");
        } else if (classe === "present" && !key.classList.contains("correct")) {
            key.classList.add("present");
        } else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
            key.classList.add("absent");
        }
    },

    mostrarStatusFinal(vitoria, palavra) {
        this.elements.board.style.display = "block";
        this.elements.board.innerHTML = `
            <div class="status-container">
                <div class="status-icon">${vitoria ? '🏆' : '⏰'}</div>
                <h3>Desafio Concluído!</h3>
                <p>A palavra era: <br><strong>${palavra}</strong></p>
                <hr style="border: 0; border-top: 1px solid #3a3a3c; margin: 20px 0;">
                <p>Volte amanhã!</p>
            </div>
        `;
        this.elements.keyboard.style.display = "none";
    }
};