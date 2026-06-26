export const TENTATIVAS = 7;
export const TAMANHO_PALAVRA = 6;

// Todas as palavras têm exatamente 6 letras (sem contar acentos)
export const XINGOS = [
  "abutre","animal","arroto", "asnice","babaca","babona",
  "baboso", "bagaço", "banana", "barata", "bêbado", "bestão", "bichão", "biruta",
"boboca", "bocona", "bostão","bronco", "brutão", "burrão", "cagada", "cagado", "cagona", 
"capeta","chorão","cornos", "cuzona", "cuzudo","doidão", "fajuta", "fajuto","falsão", "fanfão",
"fedida","fedido","feiosa","feioso","fodida","frango", "frouxo", "froxão", "gaiato","grosso", 
"idiota", "lambão", "lesado","levada", "levado", "lixona", "lorpona", "maluco", "otária", "otário",
"panaca", "pateta", "pirado", "tapado","tontão", "trouxa","zangão","abjeto","abusão","cafona","cínico",
"fedido","fedida","franga","frango","grosse","otária","otário","patife","paspal"
].filter((p) => {
    const limpa = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return limpa.length === 6;
});
