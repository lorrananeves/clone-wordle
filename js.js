var tentativas = 6;
var tamanhoPalavra = 5;
var fileira = 0;
var coluna = 0;
var fimDeJogo = false;
var travado = false;

var xingos = [
"sagaz","bagos","bebum","besta","bicha","bisca","bosta","bunda","burro",
"cagao","corno","corna","cuzao","putao","doida","doido","grelo","ladra",
"merda","mijao","picao","porra","tezao","viado","viada","xibiu","calvo",
"calva","meiao","porco","porca","bobao","vacao","tosco","tosca","pifio",
"pifia","podre","verme","pobre","brega","falso","falsa","vazio","vazia",
"feiao","chato","chata","chupa"
];

// remove duplicados
xingos = [...new Set(xingos)];

var dicionarioGeral = [];
var palavra = "";

function removerAcentos(str) {
return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

window.onload = function() {
fetch('https://raw.githubusercontent.com/python-br/palavras/master/palavras.txt')
.then(res => res.text())
.then(data => {
dicionarioGeral = data.split('\n')
.filter(p => p.length === 5)
.map(p => removerAcentos(p));
iniciar();
})
.catch(() => {
console.warn("Fallback ativado");
dicionarioGeral = [...xingos];
iniciar();
});
}

function iniciar() {
palavra = xingos[Math.floor(Math.random() * xingos.length)].toUpperCase();

```
for (let r = 0; r < tentativas; r++) {
    for (let c = 0; c < tamanhoPalavra; c++) {
        let tile = document.createElement("span");
        tile.id = r + "-" + c;
        tile.classList.add("tile");
        document.getElementById("board").appendChild(tile);
    }
}

const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Enter","Z","X","C","V","B","N","M","⌫"]
];

layout.forEach(row => {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach(key => {
        let keyTile = document.createElement("div");
        keyTile.innerText = key;
        keyTile.classList.add(key === "Enter" ? "enter-key-tile" : "key-tile");

        if (key === "⌫") keyTile.id = "Backspace";
        else if (key === "Enter") keyTile.id = "Enter";
        else keyTile.id = "Key" + key;

        keyTile.addEventListener("click", () => processInput({ code: keyTile.id }));
        rowDiv.appendChild(keyTile);
    });

    document.getElementById("keyboard-container").appendChild(rowDiv);
});

document.addEventListener('keyup', processInput);
```

}

function processInput(e) {
if (fimDeJogo || travado) return;

```
if ("KeyA" <= e.code && e.code <= "KeyZ") {
    if (coluna < tamanhoPalavra) {
        let currTile = document.getElementById(fileira + '-' + coluna);
        currTile.innerText = e.code[3];
        coluna++;
    }
} 
else if (e.code === "Backspace" && coluna > 0) {
    coluna--;
    document.getElementById(fileira + '-' + coluna).innerText = "";
} 
else if (e.code === "Enter") {
    update();
}
```

}

function pintarTecla(letra, classe) {
let key = document.getElementById("Key" + letra);
if (!key) return;

```
if (classe === "correct") {
    key.classList.remove("present");
    key.classList.add("correct");
} 
else if (classe === "present" && !key.classList.contains("correct")) {
    key.classList.add("present");
} 
else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
    key.classList.add("absent");
}
```

}

function update() {
let tentativa = "";

```
for (let c = 0; c < tamanhoPalavra; c++) {
    tentativa += document.getElementById(fileira + '-' + c).innerText;
}

if (tentativa.length < tamanhoPalavra) {
    document.getElementById("answer").innerText = "Completa a palavra, gênio.";
    return;
}

let tentativaLimpa = removerAcentos(tentativa);

if (!dicionarioGeral.includes(tentativaLimpa) && !xingos.includes(tentativaLimpa)) {
    document.getElementById("answer").innerText = "Não está no dicionário!";
    return;
}

document.getElementById("answer").innerText = "";
travado = true;

let correct = 0;
let letterCount = {};

for (let l of palavra) letterCount[l] = (letterCount[l] || 0) + 1;

for (let c = 0; c < tamanhoPalavra; c++) {
    let tile = document.getElementById(fileira + '-' + c);
    let letra = tile.innerText;

    setTimeout(() => {
        tile.classList.add("flip");

        if (palavra[c] === letra) {
            tile.classList.add("correct");
            pintarTecla(letra, "correct");
            correct++;
            letterCount[letra]--;
        }
    }, c * 150);
}

setTimeout(() => {
    for (let c = 0; c < tamanhoPalavra; c++) {
        let tile = document.getElementById(fileira + '-' + c);
        let letra = tile.innerText;

        if (tile.classList.contains("correct")) continue;

        if (palavra.includes(letra) && letterCount[letra] > 0) {
            tile.classList.add("present");
            pintarTecla(letra, "present");
            letterCount[letra]--;
        } else {
            tile.classList.add("absent");
            pintarTecla(letra, "absent");
        }
    }

    if (correct === tamanhoPalavra) {
        fimDeJogo = true;
        document.getElementById("answer").innerText = "BOA, GAZELA! 🏳️‍🌈";
    } else {
        fileira++;
        coluna = 0;

        if (fileira === tentativas) {
            fimDeJogo = true;
            document.getElementById("answer").innerText = "BURRO! ERA: " + palavra;
        }
    }

    travado = false;
}, 800);
```

}
