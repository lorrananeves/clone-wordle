import { describe, it, expect } from "vitest";
import {
    avaliarTentativa,
    obterMensagemFinal,
    criarDataUtc,
    obterIndiceDia,
    obterOrdemDoCiclo
} from "../js/domain.js";

// ─── avaliarTentativa ─────────────────────────────────────────────────────────

describe("avaliarTentativa", () => {

    it("acerto total: todas as letras corretas", () => {
        const { resultados, correct } = avaliarTentativa("BURRO", "BURRO");
        expect(correct).toBe(5);
        expect(resultados).toEqual(["correct", "correct", "correct", "correct", "correct"]);
    });

    it("nenhuma letra presente", () => {
        const { resultados, correct } = avaliarTentativa("ZZZZZ", "BURRO");
        expect(correct).toBe(0);
        expect(resultados).toEqual(["absent", "absent", "absent", "absent", "absent"]);
    });

    it("letra presente mas no lugar errado", () => {
        const { resultados } = avaliarTentativa("OBLUR", "BURRO");
        // B está em BURRO mas não na posição 0
        expect(resultados[0]).toBe("present");
    });

    it("letra correta na posição certa vira 'correct', não 'present'", () => {
        const { resultados } = avaliarTentativa("BURRO", "BURRO");
        expect(resultados[0]).toBe("correct");
        expect(resultados[1]).toBe("correct");
    });

    it("letra duplicada na tentativa: não conta mais vezes do que existe na palavra", () => {
        // BURRO tem 2 R's; tentativa RRRXX tem 3 R's
        // dois devem ser correct/present, o terceiro absent
        const { resultados } = avaliarTentativa("RRRXX", "BURRO");
        const rs = resultados.filter(r => r === "correct" || r === "present");
        expect(rs.length).toBe(2);
        // posição 0: R não está em BURRO[0] (B), mas R existe → present
        // posição 1: R não está em BURRO[1] (U), mas 1 R ainda disponível → present
        // posição 2: R está em BURRO[2] (R) → correct, mas já esgotamos os 2 R's nos índices 0 e 1
        // na prática: pos 2 é correct (R==R), pos 0 e 1 ficam com apenas 1 R restante
        // resultado esperado: [present, absent, correct, absent, absent]
        expect(resultados[0]).toBe("present");
        expect(resultados[1]).toBe("absent");
        expect(resultados[2]).toBe("correct");
        expect(resultados[3]).toBe("absent");
        expect(resultados[4]).toBe("absent");
    });

    it("letra duplicada na palavra: conta corretamente", () => {
        // ABOBA — A aparece 2x; tentativa AAXXX deve marcar 2 presents/corrects para A
        const { resultados } = avaliarTentativa("AAXXX", "ABOBA");
        const as = resultados.filter(r => r === "correct" || r === "present");
        expect(as.length).toBe(2);
    });

    it("emojis no resultadoLinha batem com os resultados", () => {
        const { resultados, resultadoLinha } = avaliarTentativa("BURRO", "BURRO");
        resultados.forEach((r, i) => {
            if (r === "correct")  expect(resultadoLinha[i]).toBe("🟩");
            if (r === "present")  expect(resultadoLinha[i]).toBe("🟨");
            if (r === "absent")   expect(resultadoLinha[i]).toBe("⬛");
        });
    });

    it("palavra de 4 letras (Xinguinho)", () => {
        const { resultados, correct } = avaliarTentativa("GADO", "GADO");
        expect(correct).toBe(4);
        expect(resultados).toEqual(["correct", "correct", "correct", "correct"]);
    });

    it("palavra de 6 letras (Xingão)", () => {
        const { resultados, correct } = avaliarTentativa("BABACA", "BABACA");
        expect(correct).toBe(6);
        expect(resultados).toHaveLength(6);
    });
});

// ─── obterMensagemFinal ───────────────────────────────────────────────────────

describe("obterMensagemFinal", () => {

    it("retorna string na derrota", () => {
        const msg = obterMensagemFinal(false, 0);
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
    });

    it("retorna string na vitória para cada tentativa válida (1–7)", () => {
        for (let t = 1; t <= 7; t++) {
            const msg = obterMensagemFinal(true, t);
            expect(typeof msg).toBe("string");
            expect(msg.length).toBeGreaterThan(0);
        }
    });

    it("tentativa fora do range cai no fallback sem lançar erro", () => {
        expect(() => obterMensagemFinal(true, 99)).not.toThrow();
        expect(typeof obterMensagemFinal(true, 99)).toBe("string");
    });
});

// ─── criarDataUtc ─────────────────────────────────────────────────────────────

describe("criarDataUtc", () => {

    it("cria data UTC correta a partir de string AAAA-MM-DD", () => {
        const d = criarDataUtc("2024-01-15");
        expect(d.getUTCFullYear()).toBe(2024);
        expect(d.getUTCMonth()).toBe(0); // janeiro = 0
        expect(d.getUTCDate()).toBe(15);
    });

    it("não tem offset de fuso horário", () => {
        const d = criarDataUtc("2024-01-01");
        expect(d.getUTCHours()).toBe(0);
        expect(d.getUTCMinutes()).toBe(0);
    });
});

// ─── obterIndiceDia ───────────────────────────────────────────────────────────

describe("obterIndiceDia", () => {

    it("dia de início (2024-01-01) é índice 0", () => {
        expect(obterIndiceDia("2024-01-01")).toBe(0);
    });

    it("dia seguinte é índice 1", () => {
        expect(obterIndiceDia("2024-01-02")).toBe(1);
    });

    it("índices crescem corretamente ao longo do ano", () => {
        // 2024 é bissexto: 366 dias
        expect(obterIndiceDia("2025-01-01")).toBe(366);
    });

    it("sempre retorna número inteiro não-negativo", () => {
        const idx = obterIndiceDia("2025-06-01");
        expect(Number.isInteger(idx)).toBe(true);
        expect(idx).toBeGreaterThanOrEqual(0);
    });
});

// ─── obterOrdemDoCiclo ────────────────────────────────────────────────────────

describe("obterOrdemDoCiclo", () => {

    it("retorna array com o mesmo tamanho que totalPalavras", () => {
        const ordem = obterOrdemDoCiclo(10, 0, 1);
        expect(ordem).toHaveLength(10);
    });

    it("contém cada índice exatamente uma vez (é uma permutação)", () => {
        const ordem = obterOrdemDoCiclo(20, 0, 1);
        const sorted = [...ordem].sort((a, b) => a - b);
        expect(sorted).toEqual(Array.from({ length: 20 }, (_, i) => i));
    });

    it("é determinístico: mesma semente sempre produz a mesma ordem", () => {
        const a = obterOrdemDoCiclo(50, 3, 1);
        const b = obterOrdemDoCiclo(50, 3, 1);
        expect(a).toEqual(b);
    });

    it("semente diferente produz ordem diferente", () => {
        const a = obterOrdemDoCiclo(50, 0, 1);
        const b = obterOrdemDoCiclo(50, 0, 7);
        expect(a).not.toEqual(b);
    });

    it("ciclo diferente produz ordem diferente", () => {
        const a = obterOrdemDoCiclo(50, 0, 1);
        const b = obterOrdemDoCiclo(50, 1, 1);
        expect(a).not.toEqual(b);
    });
});
