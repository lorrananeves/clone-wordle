import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../js/storage.js";

// ─── Mock de localStorage ─────────────────────────────────────────────────────
// Node não tem localStorage nativo; simulamos com um Map simples.

const _store = new Map();

globalThis.localStorage = {
    getItem:    (k) => _store.has(k) ? _store.get(k) : null,
    setItem:    (k, v) => _store.set(k, String(v)),
    removeItem: (k) => _store.delete(k),
    clear:      () => _store.clear()
};

beforeEach(() => _store.clear());

// ─── getHojeLocal ─────────────────────────────────────────────────────────────

describe("storage.getHojeLocal", () => {

    it("retorna string no formato AAAA-MM-DD", () => {
        const hoje = storage.getHojeLocal();
        expect(hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("aceita um objeto Date como argumento", () => {
        const data = new Date(2024, 0, 15); // 15 de janeiro de 2024
        expect(storage.getHojeLocal(data)).toBe("2024-01-15");
    });

    it("preenche mês e dia com zero à esquerda", () => {
        const data = new Date(2024, 2, 5); // 5 de março
        expect(storage.getHojeLocal(data)).toBe("2024-03-05");
    });

    // #7 — virada de mês e de ano
    it("virada de mês: 31 de dezembro", () => {
        const data = new Date(2024, 11, 31); // 31/dez/2024
        expect(storage.getHojeLocal(data)).toBe("2024-12-31");
    });

    it("virada de ano: 1 de janeiro", () => {
        const data = new Date(2025, 0, 1); // 1/jan/2025
        expect(storage.getHojeLocal(data)).toBe("2025-01-01");
    });
});

// ─── salvarProgresso / obterProgresso ─────────────────────────────────────────

describe("storage.salvarProgresso / obterProgresso", () => {

    it("salva e recupera um progresso de vitória", () => {
        storage.salvarProgresso(true, "2025-01-10", 3, "xingo");
        const p = storage.obterProgresso("2025-01-10", "xingo");
        expect(p.vitoria).toBe(true);
        expect(p.tentativa).toBe(3);
        expect(p.finalizado).toBe(true);
    });

    it("salva e recupera um progresso de derrota", () => {
        storage.salvarProgresso(false, "2025-01-10", 6, "xingo");
        const p = storage.obterProgresso("2025-01-10", "xingo");
        expect(p.vitoria).toBe(false);
    });

    it("retorna null para data sem progresso salvo", () => {
        expect(storage.obterProgresso("2099-12-31", "xingo")).toBeNull();
    });

    it("namespaces são isolados entre si", () => {
        storage.salvarProgresso(true, "2025-01-10", 2, "xingo");
        expect(storage.obterProgresso("2025-01-10", "xingo6")).toBeNull();
    });

    it("sobrescreve progresso anterior da mesma data", () => {
        storage.salvarProgresso(false, "2025-01-10", 6, "xingo");
        storage.salvarProgresso(true,  "2025-01-10", 3, "xingo");
        const p = storage.obterProgresso("2025-01-10", "xingo");
        expect(p.vitoria).toBe(true);
        expect(p.tentativa).toBe(3);
    });

    // #9 — localStorage corrompido retorna null
    it("retorna null quando o localStorage está corrompido", () => {
        localStorage.setItem("xingo_status_por_data", "{ JSON INVALIDO }");
        expect(storage.obterProgresso("2025-01-10", "xingo")).toBeNull();
    });
});

// ─── obterEstatisticas ────────────────────────────────────────────────────────

describe("storage.obterEstatisticas", () => {

    it("retorna estrutura padrão zerada quando não há dados", () => {
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogos).toBe(0);
        expect(stats.vitorias).toBe(0);
        expect(stats.sequenciaAtual).toBe(0);
        expect(stats.melhorSequencia).toBe(0);
        expect(stats.ultimoJogo).toBeNull();
    });

    it("distribuição padrão tem chaves de 1 até N tentativas", () => {
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(Object.keys(stats.distribuicao).map(Number)).toEqual([1,2,3,4,5,6]);
        Object.values(stats.distribuicao).forEach(v => expect(v).toBe(0));
    });

    it("distribuição para Xingão (7 tentativas) tem chaves de 1 a 7", () => {
        const stats = storage.obterEstatisticas("xingo6", 7);
        expect(Object.keys(stats.distribuicao).map(Number)).toEqual([1,2,3,4,5,6,7]);
    });

    // #8 — localStorage corrompido retorna estrutura padrão zerada
    it("retorna estrutura padrão quando o localStorage está corrompido", () => {
        localStorage.setItem("xingo_stats", "{ JSON INVALIDO }");
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogos).toBe(0);
        expect(stats.vitorias).toBe(0);
        expect(stats.sequenciaAtual).toBe(0);
        expect(stats.ultimoJogo).toBeNull();
    });
});

// ─── atualizarEstatisticas ────────────────────────────────────────────────────

describe("storage.atualizarEstatisticas", () => {

    it("incrementa jogos e vitorias numa vitória", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogos).toBe(1);
        expect(stats.vitorias).toBe(1);
    });

    it("incrementa jogos mas não vitorias numa derrota", () => {
        storage.atualizarEstatisticas(false, 5, "2025-01-10", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogos).toBe(1);
        expect(stats.vitorias).toBe(0);
    });

    it("não duplica estatísticas se chamado duas vezes na mesma data", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogos).toBe(1);
    });

    it("incrementa sequência em dias consecutivos de vitória", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(true, 3, "2025-01-11", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.sequenciaAtual).toBe(2);
        expect(stats.melhorSequencia).toBe(2);
    });

    it("zera sequência quando há um dia de intervalo", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        // Pula 11/01 — joga em 12/01
        storage.atualizarEstatisticas(true, 2, "2025-01-12", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.sequenciaAtual).toBe(1);
    });

    it("derrota zera a sequência atual", () => {
        storage.atualizarEstatisticas(true,  2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(true,  2, "2025-01-11", "xingo", 6);
        storage.atualizarEstatisticas(false, 6, "2025-01-12", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.sequenciaAtual).toBe(0);
    });

    it("melhorSequencia não regride após uma derrota", () => {
        storage.atualizarEstatisticas(true,  2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(true,  2, "2025-01-11", "xingo", 6);
        storage.atualizarEstatisticas(true,  2, "2025-01-12", "xingo", 6);
        storage.atualizarEstatisticas(false, 6, "2025-01-13", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.melhorSequencia).toBe(3);
        expect(stats.sequenciaAtual).toBe(0);
    });

    it("registra corretamente a distribuição de tentativas", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        // tentativaFinal=2 → distribuicao[3]++ (índice é tentativaFinal + 1)
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.distribuicao[3]).toBe(1);
    });

    it("namespaces são completamente isolados", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo",  6);
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo6", 7);
        const s1 = storage.obterEstatisticas("xingo",  6);
        const s2 = storage.obterEstatisticas("xingo6", 7);
        expect(s1.jogos).toBe(1);
        expect(s2.jogos).toBe(1);
        // garantia de que não compartilham o mesmo bucket
        expect(s1.distribuicao[7]).toBeUndefined();
    });

    // #1 — jogo retroativo não afeta sequência nem melhorSequencia
    it("jogar uma data anterior ao ultimoJogo não altera sequência nem melhorSequencia", () => {
        storage.atualizarEstatisticas(true, 2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(true, 2, "2025-01-11", "xingo", 6);
        // Joga retroativamente o dia 09/01 (anterior ao ultimoJogo = 11/01)
        storage.atualizarEstatisticas(true, 2, "2025-01-09", "xingo", 6);
        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.sequenciaAtual).toBe(2);
        expect(stats.melhorSequencia).toBe(2);
    });

    // #10 — vitória retroativa não incrementa sequência
    it("vitória em data retroativa não incrementa sequenciaAtual", () => {
        storage.atualizarEstatisticas(true,  2, "2025-01-10", "xingo", 6);
        storage.atualizarEstatisticas(false, 5, "2025-01-11", "xingo", 6); // derrota → sequencia = 0
        storage.atualizarEstatisticas(true,  2, "2025-01-09", "xingo", 6); // vitória retroativa
        const stats = storage.obterEstatisticas("xingo", 6);
        // A derrota de 11/01 era o último jogo — sequencia deve continuar 0
        expect(stats.sequenciaAtual).toBe(0);
    });

    // #2 — limpeza do jogosPorData remove entradas com mais de 90 dias
    it("entradas com mais de 90 dias são removidas do jogosPorData ao finalizar uma partida", () => {
        // Data artificial > 90 dias atrás
        const dataAntiga = "2020-01-01";
        const dataRecente = "2025-06-01";

        // Insere a antiga manualmente no stats antes de processar a recente
        const chave = "xingo_stats";
        const statsBase = storage.obterEstatisticas("xingo", 6);
        statsBase.jogosPorData[dataAntiga] = true;
        localStorage.setItem(chave, JSON.stringify(statsBase));

        // Finaliza uma partida recente — deve acionar a limpeza
        storage.atualizarEstatisticas(true, 2, dataRecente, "xingo", 6);

        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogosPorData[dataAntiga]).toBeUndefined();
        expect(stats.jogosPorData[dataRecente]).toBe(true);
    });

    it("entradas com menos de 90 dias são preservadas no jogosPorData", () => {
        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        const dataOntem = storage.getHojeLocal(ontem);
        const dataHoje  = storage.getHojeLocal(hoje);

        storage.atualizarEstatisticas(true, 2, dataOntem, "xingo", 6);
        storage.atualizarEstatisticas(true, 2, dataHoje,  "xingo", 6);

        const stats = storage.obterEstatisticas("xingo", 6);
        expect(stats.jogosPorData[dataOntem]).toBe(true);
        expect(stats.jogosPorData[dataHoje]).toBe(true);
    });
});
