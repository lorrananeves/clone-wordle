var tentativas = 6;
var tamanhoPalavra = 5;
var fileira = 0;
var coluna = 0;
var fimDeJogo = false;
var travado = false;

// Lista de palavras refinada
var xingos = [
    "antas", "antao", "azeda", "azedo", "babao", "bagos", "bebum", "besta", 
    "bicha", "bicho", "birra", "bisca", "bobao", "bocao", "bosta", 
    "brega", "bruta", "bruto", "bunda", "burra", "burro", "cagao", 
    "calva", "calvo", "chata", "chato", "choco", "chupa", "corna", "corno", 
    "cuzao", "doida", "doido", "falsa", "falso", "feiao", "fraco", "grelo", 
    "ladra", "lerda", "lerdo", "lesmo", "lixao", "meiao", "merda", 
    "mijao", "nojao", "patao", "peida", "peido", "peste", "picao", "pifia", 
    "pifio", "pobre", "podre", "porca", "porco", "porra", "putao", "ranco", 
    "ranha", "ranho", "suina", "suino", "sujas", "sujos", "teima", 
    "tensa", "tenso", "tezao", "tonta", "tonto", "tosca", "tosco", 
    "trapo", "troxa", "vadia", "vadio", "vazia", "vazio", "verme", 
    "viada", "viado", "xibiu",
];

var palavra = "";

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

window.onload = function() {
    const hoje = new Date().toISOString().split('T')[0];
    const jogoSalvo = JSON.parse(localStorage.getItem("xingo_status"));

    // Verifica se o usuário já jogou hoje
    if (jogoSalvo && jogoSalvo.data === hoje && jogoSalvo.finalizado) {
        document.getElementById("modal-regras").style.display = "none";
        exibirMensagemJaJogou(jogoSalvo.vitoria, jogoSalvo.palavra);
    } else {
        iniciar();
    }

    // Lógica do Modal
    const modal = document.getElementById("modal-regras");
    const botaoFechar = document.getElementById("fechar-modal");
    botaoFechar.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }
}

function iniciar() {
    // Gerar palavra do dia baseada na data para ser igual para todos
    const hoje = new Date().toISOString().split('T')[0];
    const semente = hoje.split('-').join('');
    const indiceDodia = parseInt(semente) % xingos.length;
    palavra = xingos[indiceDodia].toUpperCase();

    let board = document.getElementById("board");
    board.innerHTML = ""; 
    for (let r = 0; r < tentativas; r++) {
        for (let c = 0; c < tamanhoPalavra; c++) {
            let tile = document.createElement("span");
            tile.id = r + "-" + c;
            tile.classList.add("tile");
            board.appendChild(tile);
        }
    }

    const layout = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["Enter","Z","X","C","V","B","N","M","⌫"]
    ];

    let keyboardContainer = document.getElementById("keyboard-container");
    keyboardContainer.innerHTML = "";
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
        keyboardContainer.appendChild(rowDiv);
    });

    document.addEventListener('keyup', processInput);
}

function processInput(e) {
    if (fimDeJogo || travado) return;
    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (coluna < tamanhoPalavra) {
            let currTile = document.getElementById(fileira + '-' + coluna);
            currTile.innerText = e.code.replace("Key", "");
            coluna++;
        }
    } else if (e.code === "Backspace" && coluna > 0) {
        coluna--;
        document.getElementById(fileira + '-' + coluna).innerText = "";
    } else if (e.code === "Enter") {
        update();
    }
}

function pintarTecla(letra, classe) {
    let key = document.getElementById("Key" + letra);
    if (!key) return;
    if (classe === "correct") {
        key.classList.remove("present");
        key.classList.add("correct");
    } else if (classe === "present" && !key.classList.contains("correct")) {
        key.classList.add("present");
    } else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
        key.classList.add("absent");
    }
}

function update() {
    let tentativa = "";
    for (let c = 0; c < tamanhoPalavra; c++) {
        tentativa += document.getElementById(fileira + '-' + c).innerText;
    }

    if (tentativa.length < tamanhoPalavra) {
        document.getElementById("answer").innerText = "Completa a palavra, gênio.";
        return;
    }

    document.getElementById("answer").innerText = "";
    travado = true;

    let correct = 0;
    let letterCount = {};
    let palavraSemAcento = removerAcentos(palavra).toUpperCase();
    for (let l of palavraSemAcento) letterCount[l] = (letterCount[l] || 0) + 1;

    for (let c = 0; c < tamanhoPalavra; c++) {
        let tile = document.getElementById(fileira + '-' + c);
        let letra = tile.innerText;
        setTimeout(() => {
            tile.classList.add("flip");
            if (palavraSemAcento[c] === letra) {
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
            if (palavraSemAcento.includes(letra) && letterCount[letra] > 0) {
                tile.classList.add("present");
                pintarTecla(letra, "present");
                letterCount[letra]--;
            } else {
                tile.classList.add("absent");
                pintarTecla(letra, "absent");
            }
        }

        if (correct === tamanhoPalavra || fileira === tentativas - 1) {
            fimDeJogo = true;
            const vitoria = (correct === tamanhoPalavra);
            
            // Salva o status no LocalStorage
            const hoje = new Date().toISOString().split('T')[0];
            localStorage.setItem("xingo_status", JSON.stringify({
                data: hoje,
                finalizado: true,
                vitoria: vitoria,
                palavra: palavra
            }));

            document.getElementById("answer").innerText = vitoria ? 
                "Boa! Você é muito inteligente! 👍" : 
                "Quase lá! A palavra era: " + palavra;

            setTimeout(() => {
                document.getElementById("keyboard-container").style.display = "none";
            }, 1000);
        } else {
            fileira++;
            coluna = 0;
            travado = false;
        }
    }, 800);
}

function exibirMensagemJaJogou(vitoria, pal) {
    const board = document.getElementById("board");
    
    // Remove o grid do board para o card ocupar o espaço todo
    board.style.display = "block"; 
    
    board.innerHTML = `
        <div class="status-container">
            <div class="status-icon">${vitoria ? '🏆' : '⏰'}</div>
            <h3>Desafio Concluído!</h3>
            <p>A palavra de hoje era: <br><strong style="font-size: 1.8rem; letter-spacing: 3px;">${pal}</strong></p>
            <hr style="border: 0; border-top: 1px solid #3a3a3c; margin: 20px 0;">
            <p>Você já jogou hoje.<br>Volte amanhã para uma nova palavra!</p>
        </div>
    `;
    
    document.getElementById("keyboard-container").style.display = "none";
    document.getElementById("answer").innerText = "";
}