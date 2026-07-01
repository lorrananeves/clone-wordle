export const storage = {
    // Retorna a data local formatada (AAAA-MM-DD)
    getHojeLocal(data = new Date()) {
        return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
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

    // Nota: os parâmetros com default `this.getHojeLocal()` funcionam corretamente
    // enquanto o método for sempre chamado como `storage.salvarProgresso(...)`.
    // Evite desestruturar o objeto storage, pois isso quebraria o `this` nos defaults.
    salvarProgresso(
        vitoria,
        data = this.getHojeLocal(),
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

    // Mesmo aviso: não desestruture o objeto storage ao usar este método.
    obterProgresso(data = this.getHojeLocal(), ns = "xingo") {
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
        data = this.getHojeLocal(),
        ns = "xingo",
        tentativas = 6
    ) {
        const stats = this.obterEstatisticas(ns, tentativas);

        if (stats.jogosPorData[data]) return;

        // Usa UTC para evitar erro de fuso horário ao calcular diferença de dias
        const dataJogo =
            new Date(`${data}T00:00:00Z`);

        const ultimoJogo = stats.ultimoJogo
            ? new Date(`${stats.ultimoJogo}T00:00:00Z`)
            : null;

        // Comparação de strings funciona corretamente aqui porque o formato
        // AAAA-MM-DD é lexicograficamente ordenável (ex: "2025-01-10" > "2024-12-31")
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

    obterEstatisticas(ns = "xingo", tentativas = 6 /* sempre passe TENTATIVAS do jogo */) {
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
