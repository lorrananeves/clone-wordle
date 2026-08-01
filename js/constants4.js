export const TENTATIVAS = 5;
export const TAMANHO_PALAVRA = 4;

export const XINGOS = [
    "anta", "asco", "asno",
    "baba", "bobo", "boco", "bico", "buxa",
    "cafa", "cuzo",
    "feio",
    "gado",
    "jega", "jego",
    "lixo", "loco",
    "mala", "mané", "mula",
    "nojo",
    "pata", "pato", "puta",
    "rata", "rato", "ruim",
    "sapo", "sujo",
    "toca", "tolo",
    "vaca",
    "zica", "zero",
].filter((p, i, arr) => {
    // Remove duplicatas
    if (arr.indexOf(p) !== i) return false;
    // Garante exatamente 4 letras base (sem diacríticos)
    const limpa = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return limpa.length === 4;
});
