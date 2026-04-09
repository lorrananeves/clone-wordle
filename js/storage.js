export const storage = {
    // Utilitário interno para gerar a data local formatada (AAAA-MM-DD)
    _getHojeLocal() {
        const agora = new Date();
        return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    },

    salvarProgresso(vitoria, palavra) {
        const dados = {
            data: this._getHojeLocal(),
            finalizado: true,
            vitoria,
            palavra
        };
        localStorage.setItem("xingo_status", JSON.stringify(dados));
    },

    obterProgresso() {
        try {
            return JSON.parse(localStorage.getItem("xingo_status"));
        } catch { return null; }
    },

    atualizarEstatisticas(vitoria, tentativaFinal) {
        const stats = this.obterEstatisticas();
        
        stats.jogos++;
        if (vitoria) {
            stats.vitorias++;
            stats.sequenciaAtual++;
            if (stats.sequenciaAtual > stats.melhorSequencia) {
                stats.melhorSequencia = stats.sequenciaAtual;
            }
            // tentativaFinal vem de 0 a 5, então salvamos de 1 a 6
            stats.distribuicao[tentativaFinal + 1]++;
        } else {
            stats.sequenciaAtual = 0;
        }

        localStorage.setItem("xingo_stats", JSON.stringify(stats));
    },

    obterEstatisticas() {
        const padrao = {
            jogos: 0,
            vitorias: 0,
            sequenciaAtual: 0,
            melhorSequencia: 0,
            distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
        };
        try {
            return JSON.parse(localStorage.getItem("xingo_stats")) || padrao;
        } catch { return padrao; }
    }
};