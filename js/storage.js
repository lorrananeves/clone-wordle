export const storage = {
    // Utilitário interno para gerar a data local formatada (AAAA-MM-DD)
    _getHojeLocal() {
        const agora = new Date();
        return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    },

    _obterProgressos() {
        try {
            return JSON.parse(
                localStorage.getItem("xingo_status_por_data")
            ) || {};
        } catch { return {}; }
    },

    _salvarProgressos(progressos) {
        localStorage.setItem(
            "xingo_status_por_data",
            JSON.stringify(progressos)
        );
    },

    salvarProgresso(
        vitoria,
        data = this._getHojeLocal(),
        tentativa = null
    ) {
        const dados = {
            data,
            finalizado: true,
            vitoria,
            tentativa
        };

        const progressos =
            this._obterProgressos();

        progressos[data] = dados;

        this._salvarProgressos(progressos);
    },

    obterProgresso(data = this._getHojeLocal()) {
        try {
            const progressos =
                this._obterProgressos();

            if (progressos[data]) {
                return progressos[data];
            }

            return null;
        } catch { return null; }
    },

    atualizarEstatisticas(
        vitoria,
        tentativaFinal,
        data = this._getHojeLocal()
    ) {
        const stats = this.obterEstatisticas();

        if (stats.jogosPorData[data]) return;

        // Usa UTC para evitar erro de fuso horário ao calcular diferença de dias
        const dataJogo =
            new Date(`${data}T00:00:00Z`);

        const ultimoJogo = stats.ultimoJogo
            ? new Date(`${stats.ultimoJogo}T00:00:00Z`)
            : null;

        const jogoMaisRecente =
            !stats.ultimoJogo ||
            data >= stats.ultimoJogo;

        // Diferença em dias
        let diferencaDias = 0;

        if (ultimoJogo) {

            const diffMs =
                dataJogo - ultimoJogo;

            diferencaDias =
                Math.floor(
                    diffMs / (1000 * 60 * 60 * 24)
                );
        }

        // Se ficou mais de 1 dia sem jogar
        if (
            diferencaDias > 1 &&
            (!stats.ultimoJogo || data > stats.ultimoJogo)
        ) {
            stats.sequenciaAtual = 0;
        }

        stats.jogos++;
        if (vitoria) {
            stats.vitorias++;

            if (
                !stats.ultimoJogo ||
                data > stats.ultimoJogo
            ) {
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

            if (jogoMaisRecente) {
                stats.ultimoAcerto =
                    tentativaFinal + 1;
            }
        } else {
            if (jogoMaisRecente) {
                stats.sequenciaAtual = 0;
                stats.ultimoAcerto = null;
            }
        }

        stats.jogosPorData[data] = true;

        if (
            !stats.ultimoJogo ||
            data > stats.ultimoJogo
        ) {
            stats.ultimoJogo = data;
        }

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
            jogosPorData: {},
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
                jogosPorData: {
                    ...padrao.jogosPorData,
                    ...salvo.jogosPorData
                },
                distribuicao: {
                    ...padrao.distribuicao,
                    ...salvo.distribuicao
                }
            };
        } catch { return padrao; }
    }
};
