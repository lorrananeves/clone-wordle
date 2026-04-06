var tentativas = 6; 
var tamanhoPalavra = 5; 
var fileira = 0;
var coluna = 0;
var fimDeJogo = false;

// lista curada para SORTEIO
var xingos = [
    "sagaz", "bagos", "bebum", "besta", "bicha", "bisca", "bosta", "bunda", "burro", 
    "cagao", "corno", "corna", "cuzao", "putao", "doida", "doido", "grelo", "ladra", 
    "merda", "mijao", "picao", "porra", "tezao", "viado", "viada", "xibiu", "calvo", 
    "calva", "meiao", "porco", "porca", "bobao", "vacao", "tosco", "tosca", "pifio", 
    "pifia", "podre", "verme", "pobre", "brega",  "falso", "falsa", "vazio", "vazia", 
    "podre", "feiao", "chato", "chata", "chupa", "bunda",
];
var dicionarioGeral = [];
var palavra = "";

// Função essencial para ignorar acentos na comparação
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

window.onload = function() {
    // Carrega palavras do português para validação (Robustez)
    fetch('https://raw.githubusercontent.com/python-br/palavras/master/palavras.txt')
        .then(res => res.text())
        .then(data => {
            dicionarioGeral = data.split('\n')
                .filter(p => p.length === 5)
                .map(p => removerAcentos(p));
            
            iniciar();
        });
}

function iniciar() {
    // Sorteia um xingo da sua lista
    palavra = xingos[Math.floor(Math.random() * xingos.length)].toUpperCase();
    console.log("Palavra secreta:", palavra);

    // Criar o tabuleiro
    for (let r = 0; r < tentativas; r++) {
        for (let c = 0; c < tamanhoPalavra; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            document.getElementById("board").appendChild(tile);
        }
    }

    // Criar o teclado
    const layout = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
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
}

function processInput(e) {
    if (fimDeJogo) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (coluna < tamanhoPalavra) {
            let currTile = document.getElementById(fileira + '-' + coluna);
            currTile.innerText = e.code[3];
            coluna++;
        }
    } else if (e.code === "Backspace" && coluna > 0) {
        coluna--;
        document.getElementById(fileira + '-' + coluna).innerText = "";
    } else if (e.code === "Enter" && coluna === tamanhoPalavra) {
        update();
    }
}

function update() {
    let tentativa = "";
    for (let c = 0; c < tamanhoPalavra; c++) {
        tentativa += document.getElementById(fileira + '-' + c).innerText;
    }

    let tentativaLimpa = removerAcentos(tentativa);

    // Validação Robusta: Aceita qualquer palavra do dicionário BR
    if (!dicionarioGeral.includes(tentativaLimpa) && !xingos.includes(tentativaLimpa)) {
        document.getElementById("answer").innerText = "Não está no dicionário!";
        return;
    }

    document.getElementById("answer").innerText = "";
    let correct = 0;
    let letterCount = {};
    for (let l of palavra) letterCount[l] = (letterCount[l] || 0) + 1;

    // Primeira passada: Verdes (Corretas)
    for (let c = 0; c < tamanhoPalavra; c++) {
        let tile = document.getElementById(fileira + '-' + c);
        let letra = tile.innerText;
        if (palavra[c] === letra) {
            tile.classList.add("correct");
            document.getElementById("Key" + letra).classList.add("correct");
            correct++;
            letterCount[letra]--;
        }
    }

    // Segunda passada: Amarelas (Presentes) e Cinzas (Ausentes)
    for (let c = 0; c < tamanhoPalavra; c++) {
        let tile = document.getElementById(fileira + '-' + c);
        if (tile.classList.contains("correct")) continue;

        let letra = tile.innerText;
        if (palavra.includes(letra) && letterCount[letra] > 0) {
            tile.classList.add("present");
            letterCount[letra]--;
        } else {
            tile.classList.add("absent");
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
}