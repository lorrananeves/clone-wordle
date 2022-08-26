var tentativas = 6; 
var tamanhoPalavra = 5; 

var fileira = 0;
var coluna = 0; //letra atual

var fimDeJogo = false;

var xingos =
["sagaz", "bagos","bebum", "besta", "bicha", "bisca", "bosta", "bunda", "burro", "cagão", "burra", "carga", 
"corno", "corna", "cuzao","putao", "doida", "doido", "grelo", "idiota", "ladra", "merda", "mijao", "otario", "otaria",
"peido", "penis", "picao", "porra", "tezao", "trouxa", "viado", "viada", "xibiu", "calvo", "calva", "meiao", "merda", "porco", "porca", "bobao"]

var listaDeTentativas = []

listaDeTentativas = listaDeTentativas.concat(xingos);

var palavra = xingos[Math.floor(Math.random()*xingos.length)].toUpperCase();
console.log(palavra);

window.onload = function() {
    iniciar();
}

function iniciar() {
    for ( let r = 0; r < tentativas; r++) {
        for (let c = 0; c < tamanhoPalavra; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }
    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L",],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫" ]
    ]
    for (let i= 0; i < keyboard.length; i++) {
        let fileiraAtual = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < fileiraAtual.length; j++) {
            let keyTile = document.createElement("div");

            let key = fileiraAtual[j];
            keyTile.innerText = key;
            if (key == 'Enter') {
               keyTile.id = "Enter"; 
            }
        
            else if (key == "⌫") {
                keyTile.id = "Backspace";
            }
            else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key;
            }
            keyTile.addEventListener("click", processKey);

            if (key == "Enter") {
                keyTile.classList.add("enter-key-tile");

            } else {
                keyTile.classList.add("key-tile");
            }
            keyboardRow.appendChild(keyTile);

        }
        document.body.appendChild(keyboardRow);
    }
    document.addEventListener('keyup', (e) => {
        processInput(e);
    })
}

function processKey() {
    e = { "code" : this.id };
    processInput(e);
}

function processInput(e) {
    if (fimDeJogo) return; 

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (coluna < tamanhoPalavra) {
            let currTile = document.getElementById(fileira.toString() + '-' + coluna.toString());
            if (currTile.innerText == "") {
                currTile.innerText = e.code[3];
                coluna += 1;
            }
        }
    }
    else if (e.code == "Backspace") {
        if (0 < coluna && coluna <= tamanhoPalavra) {
            coluna -=1;
        }
        let currTile = document.getElementById(fileira.toString() + '-' + coluna.toString());
        currTile.innerText = "";
    }

    else if (e.code == "Enter") {
        update();
    }

    if (!fimDeJogo && fileira == tentativas) {
        fimDeJogo = true;
        document.getElementById("answer").innerText = palavra;
    }
}

function update() {
    let tentativa = "";
    document.getElementById("answer").innerText = "";

    for (let c = 0; c < tamanhoPalavra; c++) {
        let currTile = document.getElementById(fileira.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        tentativa += letter;
    }

    tentativa = tentativa.toLowerCase();
    console.log(tentativa);

    if (!listaDeTentativas.includes(tentativa)) {
        document.getElementById("answer").innerText = "não existe em nosso dicionario";
        return;
    }

    let correct = 0;
    
    let letterCount = {};

    for (let i = 0; i < palavra.length; i++) {
        let letter = palavra[i];
        if (letterCount[letter]) {
            letterCount[letter] += 1;
        }
        else {
            letterCount[letter] = 1;
        }
    }
    console.log(letterCount)

    for (let c = 0; c < tamanhoPalavra; c++) {
        let currTile = document.getElementById(fileira.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        //tá na posição correta?
        if (palavra[c] == letter) {
            currTile.classList.add("correct");

            let keyTile = document.getElementById("Key" + letter);
            keyTile.classList.remove("present");
            keyTile.classList.add("correct");

            correct += 1;
            letterCount[letter] -= 1;
        }
        if (correct == tamanhoPalavra) {
            fimDeJogo = true;
            startConfetti();
        }
    }
    console.log(letterCount);

    for (let c = 0; c < tamanhoPalavra; c++) {
        let currTile = document.getElementById(fileira.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (!currTile.classList.contains("correct")) {

            if (palavra.includes(letter) && letterCount[letter] > 0) {
                currTile.classList.add("present");
                let keyTile = document.getElementById("Key" + letter);
                if (!keyTile.classList.contains("correct")) {
                    keyTile.classList.add("present");
                }        
                letterCount[letter] -= 1;
            }
            else {
                currTile.classList.add("absent");
                let keyTile = document.getElementById("Key" + letter);
                keyTile.classList.add("absent")
            }
        } 
    }

fileira += 1;
coluna = 0;
}
