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
        // Cálculo seguro de porcentagem para evitar divisão por zero
        const winPct = stats.jogos > 0 ? Math.round((stats.vitorias / stats.jogos) * 100) : 0;
        
        // Encontra o maior valor para escalar as barras proporcionalmente
        const maxDist = Math.max(...Object.values(stats.distribuicao), 1);
        
        let distHtml = "";
        for (let i = 1; i <= 6; i++) {
            const valor = stats.distribuicao[i];
            const larguraBarra = (valor / maxDist) * 100;
            
            // Cor verde para a linha do acerto atual, cinza para as outras
            const corBarra = (vitoria && i === stats.ultimoAcerto) ? '#538d4e' : '#3a3a3c';
            
            distHtml += `
                <div style="display: flex; align-items: center; margin: 8px 0; font-size: 0.9rem; font-family: sans-serif;">
                    <span style="width: 20px; font-weight: bold;">${i}</span>
                    <div style="flex-grow: 1; background: #121213; height: 20px; border-radius: 2px; margin-left: 5px;">
                        <div style="width: ${Math.max(larguraBarra, 8)}%; background: ${corBarra}; height: 100%; border-radius: 2px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; box-sizing: border-box; transition: width 0.5s ease-out;">
                            <span style="font-weight: bold; font-size: 0.75rem; color: white;">${valor}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Atualiza o Board com o painel de estatísticas
        this.elements.board.style.display = "flex";
        this.elements.board.style.flexDirection = "column";
        this.elements.board.innerHTML = `
            <div class="status-container" style="width: 100%; box-sizing: border-box;">
                <h2 style="margin-top: 0; letter-spacing: 1px; font-size: 1.2rem;">ESTATÍSTICAS</h2>
                
                <div style="display: flex; justify-content: space-between; margin: 20px 0; text-align: center;">
                    <div style="flex: 1;"><b style="font-size: 1.8rem; display: block;">${stats.jogos}</b><span style="font-size: 0.7rem; text-transform: uppercase;">Jogos</span></div>
                    <div style="flex: 1;"><b style="font-size: 1.8rem; display: block;">${winPct}</b><span style="font-size: 0.7rem; text-transform: uppercase;">% Vitórias</span></div>
                    <div style="flex: 1;"><b style="font-size: 1.8rem; display: block;">${stats.sequenciaAtual}</b><span style="font-size: 0.7rem; text-transform: uppercase;">Sequência</span></div>
                </div>
                
                <h3 style="text-align: left; font-size: 1rem; margin-bottom: 15px; letter-spacing: 1px;">DISTRIBUIÇÃO</h3>
                <div style="margin-bottom: 25px;">
                    ${distHtml}
                </div>

                <div style="border-top: 1px solid #3a3a3c; padding-top: 20px;">
                    <p style="margin: 0; color: #818384; text-transform: uppercase; font-size: 0.8rem;">A palavra era:</p>
                    <p style="margin: 5px 0 20px 0; font-size: 1.8rem; font-weight: bold; letter-spacing: 4px;">${palavra}</p>
                    <p style="margin: 0; font-size: 0.85rem; color: #818384;">Próximo Xingo à meia-noite.</p>
                </div>
            </div>
        `;
        
        if (this.elements.keyboard) {
            this.elements.keyboard.style.display = "none";
        }
    }
};