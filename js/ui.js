export const ui = {
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
        if (key) key.classList.add(classe);
    },

    mostrarStatusFinal(vitoria, palavra, stats) {
        const winPct = stats.jogos > 0 ? Math.round((stats.vitorias / stats.jogos) * 100) : 0;
        
        // Criar as barras de distribuição
        let distHtml = "";
        for (let i = 1; i <= 6; i++) {
            const valor = stats.distribuicao[i];
            const percent = stats.vitorias > 0 ? (valor / stats.vitorias) * 100 : 0;
            distHtml += `
                <div style="display: flex; align-items: center; margin: 5px 0; font-size: 0.8rem;">
                    <span style="width: 15px;">${i}</span>
                    <div style="flex-grow: 1; background: #3a3a3c; margin-left: 5px; height: 12px; border-radius: 2px;">
                        <div style="width: ${percent || 5}%; background: ${vitoria && i === (stats.ultimoAcerto) ? '#538d4e' : '#818384'}; height: 100%; border-radius: 2px; text-align: right; padding-right: 5px; color: white; font-size: 10px;">
                            ${valor}
                        </div>
                    </div>
                </div>
            `;
        }

        this.elements.board.style.display = "block";
        this.elements.board.innerHTML = `
            <div class="status-container">
                <h3 style="color: white; margin-top: 0;">ESTATÍSTICAS</h3>
                <div style="display: flex; justify-content: space-around; margin: 20px 0;">
                    <div><b style="font-size: 1.5rem;">${stats.jogos}</b><br><small>Jogos</small></div>
                    <div><b style="font-size: 1.5rem;">${winPct}</b><br><small>% vitórias</small></div>
                    <div><b style="font-size: 1.5rem;">${stats.sequenciaAtual}</b><br><small>Sequência</small></div>
                </div>
                
                <h4 style="text-align: left; margin-bottom: 10px;">DISTRIBUIÇÃO</h4>
                ${distHtml}

                <hr style="border: 0; border-top: 1px solid #3a3a3c; margin: 20px 0;">
                <p>A palavra era: <br><strong>${palavra}</strong></p>
                <p style="font-size: 0.8rem; color: #818384;">Próximo Xingo à meia-noite.</p>
            </div>
        `;
        this.elements.keyboard.style.visibility = "hidden";
    }
};