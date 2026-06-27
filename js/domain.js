/**
 * Domain — funções puras do jogo.
 *
 * Nenhuma função aqui toca no DOM, no localStorage, em analytics
 * ou em qualquer outra infraestrutura. São testáveis de forma isolada.
 */

// ─── Avaliação de tentativa ───────────────────────────────────────────────────

/**
 * Avalia uma tentativa contra a palavra do dia.
 *
 * @param {string} tentativa   - Letras digitadas (sem acentos, uppercase)
 * @param {string} palavraAlvo - Palavra do dia (sem acentos, uppercase)
 * @returns {{ resultados: string[], resultadoLinha: string[], correct: number }}
 *   resultados: array de "correct" | "present" | "absent"
 *   resultadoLinha: array de emojis para compartilhamento ("🟩" | "🟨" | "⬛")
 *   correct: número de letras na posição correta
 */
export function avaliarTentativa(tentativa, palavraAlvo) {

    const tamanho = palavraAlvo.length;
    const resultados = Array(tamanho).fill(null);
    const resultadoLinha = Array(tamanho).fill("");
    const letterCount = {};
    let correct = 0;

    for (const l of palavraAlvo) {
        letterCount[l] = (letterCount[l] || 0) + 1;
    }

    // Primeira passagem: posições corretas
    for (let c = 0; c < tamanho; c++) {
        if (palavraAlvo[c] === tentativa[c]) {
            resultados[c] = "correct";
            resultadoLinha[c] = "🟩";
            correct++;
            letterCount[tentativa[c]]--;
        }
    }

    // Segunda passagem: presentes em outra posição ou ausentes
    for (let c = 0; c < tamanho; c++) {

        if (resultados[c] === "correct") continue;

        const letra = tentativa[c];

        if (palavraAlvo.includes(letra) && letterCount[letra] > 0) {
            resultados[c] = "present";
            resultadoLinha[c] = "🟨";
            letterCount[letra]--;
        } else {
            resultados[c] = "absent";
            resultadoLinha[c] = "⬛";
        }
    }

    return { resultados, resultadoLinha, correct };
}

// ─── Mensagem final ───────────────────────────────────────────────────────────

/**
 * Retorna uma mensagem aleatória adequada ao resultado da partida.
 *
 * @param {boolean} vitoria
 * @param {number}  tentativa - Número de tentativas usadas (1–6+)
 * @returns {string}
 */
export function obterMensagemFinal(vitoria, tentativa) {

    if (!vitoria) {
        const derrotas = [
            "Vergonha nacional.",
            "Seu repertório tá triste.",
            "A internet esperava mais."
        ];
        return derrotas[Math.floor(Math.random() * derrotas.length)];
    }

    const mensagens = {
        1: ["Mandou bem.", "Calma aí, profissional."],
        2: ["Xingando com eficiência.", "Tá treinando bastante hein."],
        3: ["Quase sem precisar pensar.", "Tá aceitável."],
        4: ["No sufoco, mas foi.", "Quase virou meme."],
        5: ["Foi por pouco.", "Passou raspando."],
        6: ["Vitória culposa.", "Nem você acreditou."]
    };

    const lista = mensagens[tentativa] || mensagens[6];
    return lista[Math.floor(Math.random() * lista.length)];
}

// ─── Calendário / palavra do dia ──────────────────────────────────────────────

/**
 * Cria um objeto Date em UTC a partir de uma string "AAAA-MM-DD".
 */
export function criarDataUtc(dataStr) {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
}

/**
 * Retorna o índice numérico do dia relativo a 2024-01-01.
 */
export function obterIndiceDia(dataStr) {
    const inicio = criarDataUtc("2024-01-01");
    const data = criarDataUtc(dataStr);
    return Math.floor((data - inicio) / 86400000);
}

/**
 * Retorna a ordem embaralhada dos índices da lista de palavras para um dado ciclo.
 * Usa Fisher-Yates com LCG determinístico — mesma semente = mesma ordem sempre.
 *
 * @param {number} totalPalavras - Tamanho da lista
 * @param {number} ciclo         - Número do ciclo (incrementa quando a lista é esgotada)
 * @param {number} sementeCiclo  - Diferenciador entre jogos (ex: 1 para Xingo, 7 para Xingão)
 */
export function obterOrdemDoCiclo(totalPalavras, ciclo, sementeCiclo) {

    const ordem = Array.from({ length: totalPalavras }, (_, i) => i);

    let semente = (ciclo + sementeCiclo) * 2654435761;

    for (let i = ordem.length - 1; i > 0; i--) {
        semente = (semente * 1664525 + 1013904223) % 4294967296;
        const j = semente % (i + 1);
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }

    return ordem;
}
