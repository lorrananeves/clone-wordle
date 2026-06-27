export const TENTATIVAS = 7;
export const TAMANHO_PALAVRA = 6;

// Todas as palavras têm exatamente 6 letras (sem contar acentos).
// O filter no final garante isso mesmo para palavras com acentos (ex: "bêbado" tem 5 letras
// sem acento? não — tem 6: b-e-b-a-d-o — mas o normalize remove apenas os diacríticos,
// mantendo as letras base, então "bêbado" → "bebado" = 6 letras. Correto.)
export const XINGOS = [
    "abjeto", "abutre", "abusão", "animal", "arroto", "asnice",
    "babaca", "babona", "baboso", "bagaço", "banana", "barata",
    "bêbado", "bestão", "bichão", "biruta", "boboca", "bocona",
    "bostão", "bronco", "brutão", "burrão",
    "cafona", "cagada", "cagado", "cagona", "capeta", "chorão",
    "cínico", "cornos", "cuzona", "cuzudo",
    "doidão",
    "fajuta", "fajuto", "falsão", "fanfão", "fedida", "fedido",
    "feiosa", "feioso", "fodida", "franga", "frango", "frouxo", "froxão",
    "gaiato", "grosso",
    "idiota",
    "lambão", "lesado", "levada", "levado", "lixona",
    "maluco",
    "otária", "otário",
    "panaca", "paspal", "pateta", "patife", "pirado",
    "tapado", "tontão", "trouxa",
    "zangão",
].filter((p, i, arr) => {
    // Remove duplicatas
    if (arr.indexOf(p) !== i) return false;
    // Garante exatamente 6 letras base (sem diacríticos)
    const limpa = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return limpa.length === 6;
});
