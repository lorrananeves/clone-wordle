export const storage = {
    // Utilitário interno para gerar a data local formatada (AAAA-MM-DD)
    _getHojeLocal() {
        const agora = new Date();
        return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    },

    // ns = namespace: "xingo" (5 letras) ou "xingo6" (6 letras)
    _chaveProgressos(ns) {
        return `${ns}_status_por_data`;
    },

    _chaveStats(ns) {
        return `${ns}_stats`;
    },

    _obterProgressos(ns = "xingo") {
        try {
            return JSON.parse(
                localStorage.getItem(this._chaveProgressos(ns))
            ) || {};
        } catch { return {}; }
    },

    _salvarProgressos(progressos, ns = "xingo") {
        localStorage.setItem(
            this._chaveProgressos(ns),
            JSON.stringify(progressos)
        );
    },

    salvarProgresso(
        vitoria,
        data = this._getHojeLocal(),
        tentativa = null,
        ns = "xingo"
    ) {
        const dados = {
            data,
            finalizado: true,
            vitoria,
            tentativa
        };

        const progressos =
            this._obterProgressos(ns);

        progressos[data] = dados;

        this._salvarProgressos(progressos, ns);
    },

    obterProgresso(data = this._getHojeLocal(), ns = "xingo") {
        try {
            const progressos =
                this._obterProgressos(ns);

            if (progressos[data]) {
                return progressos[data];
            }

            return null;
        } catch { return null; }
    },

    atualizarEstatisticas(
        vitoria,
        tentativaFinal,
        data = this._getHojeLocal(),
        ns = "xingo"
    ) {
        const stats = this.obterEstatisticas(ns);

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
            this._chaveStats(ns),
            JSON.stringify(stats)
        );
    },

    obterEstatisticas(ns = "xingo", tentativas = 6) {
        const distribuicaoPadrao = {};
        for (let i = 1; i <= tentativas; i++) {
            distribuicaoPadrao[i] = 0;
        }

        const padrao = {
            jogos: 0,
            vitorias: 0,
            sequenciaAtual: 0,
            melhorSequencia: 0,
            ultimoJogo: null,
            ultimoAcerto: null,
            jogosPorData: {},
            distribuicao: distribuicaoPadrao
        };
        try {
            const salvo =
                JSON.parse(
                    localStorage.getItem(this._chaveStats(ns))
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
