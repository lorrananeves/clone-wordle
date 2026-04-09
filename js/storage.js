export const storage = {
    salvarProgresso(vitoria, palavra) {
        const dados = {
            data: new Date().toISOString().split('T')[0],
            finalizado: true,
            vitoria,
            palavra
        };
        localStorage.setItem("xingo_status", JSON.stringify(dados));
    },

    obterProgresso() {
        try {
            return JSON.parse(localStorage.getItem("xingo_status"));
        } catch {
            return null;
        }
    }
};