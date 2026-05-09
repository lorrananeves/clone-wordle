export const storage = {
    // Utilitário interno para gerar a data local formatada (AAAA-MM-DD)
    _getHojeLocal() {
        const agora = new Date();
        return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    },

    salvarPalavraDoDia(palavra) {
        const dadosSalvos =
            this.obterProgresso() || {};

        const dados = {
            ...dadosSalvos,
            data: this._getHojeLocal(),
            finalizado: false,
            palavra
        };

        localStorage.setItem(
            "xingo_status",
            JSON.stringify(dados)
        );
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

        const hoje = new Date();

        const hojeStr = this._getHojeLocal();

        const ultimoJogo = stats.ultimoJogo
            ? new Date(stats.ultimoJogo)
            : null;

        // Diferença em dias
        let diferencaDias = 0;

        if (ultimoJogo) {

            const diffMs =
                hoje - ultimoJogo;

            diferencaDias =
                Math.floor(
                    diffMs / (1000 * 60 * 60 * 24)
                );
        }

        // Se ficou mais de 1 dia sem jogar
        if (diferencaDias > 1) {
            stats.sequenciaAtual = 0;
        }

        stats.jogos++;
        if (vitoria) {
            stats.vitorias++;

            // Só aumenta streak se ainda não jogou hoje
            if (stats.ultimoJogo !== hojeStr) {
                stats.sequenciaAtual++;
            }

            if (
                stats.sequenciaAtual >
                stats.melhorSequencia
            ) {
                stats.melhorSequencia =
                    stats.sequenciaAtual;
            }

            stats.distribuicao[
                tentativaFinal + 1
            ]++;

            stats.ultimoAcerto =
                tentativaFinal + 1;
        } else {
            stats.sequenciaAtual = 0;
            stats.ultimoAcerto = null;
        }

        stats.ultimoJogo = hojeStr;
        localStorage.setItem(
            "xingo_stats",
            JSON.stringify(stats)
        );
    },

    obterEstatisticas() {
        const padrao = {
            jogos: 0,
            vitorias: 0,
            sequenciaAtual: 0,
            melhorSequencia: 0,
            ultimoJogo: null,
            ultimoAcerto: null,
            distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
        };
        try {
            const salvo =
                JSON.parse(
                    localStorage.getItem("xingo_stats")
                );

            if (!salvo) return padrao;

            return {
                ...padrao,
                ...salvo,
                distribuicao: {
                    ...padrao.distribuicao,
                    ...salvo.distribuicao
                }
            };
        } catch { return padrao; }
    }
};
