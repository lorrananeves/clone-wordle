const gameState = {
    tentativas: 6,
    tamanhoPalavra: 5,
    fileira: 0,
    coluna: 0,
    fimDeJogo: false,
    travado: false,
    palavra: "",
    boardTiles: [] // Cache do DOM
};

const xingos = [
    "antas", "antao", "azeda", "azedo", "babao", "bagos", "bebum", "besta", 
    "bicha", "bicho", "birra", "bisca", "bobao", "bocao", "bosta", 
    "brega", "bruta", "bruto", "bunda", "burra", "burro", "cagao", 
    "calva", "calvo", "chata", "chato", "chupa", "corna", "corno", 
    "cuzao", "doida", "doido", "falsa", "falso", "feiao", "fraco", "grelo", 
    "ladra", "lerda", "lerdo", "lesmo", "lixao", "meiao", "merda", 
    "mijao", "nojao", "patao", "peida", "peido", "peste", "picao", "pifia", 
    "pifio", "pobre", "podre", "porca", "porco", "porra", "putao", "ranco", 
    "ranho", "suina", "suino", "sujas", "sujos", "teima", 
    "tensa", "tenso", "tezao", "tonta", "tonto", "tosca", "tosco", 
    "trapo", "troxa", "vadia", "vadio", "vazia", "vazio", "verme", 
    "viada", "viado", "xibiu",
];

// Utilitários
const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getJogoSalvo = () => {
    try {
        return JSON.parse(localStorage.getItem("xingo_status"));
    } catch (e) {
        return null;
    }
};

window.onload = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const salvo = getJogoSalvo();

    if (salvo && salvo.data === hoje && salvo.finalizado) {
        document.getElementById("modal-regras").style.display = "none";
        exibirMensagemJaJogou(salvo.vitoria, salvo.palavra);
    } else {
        configurarModal();
        iniciar();
    }
};

function configurarModal() {
    const modal = document.getElementById("modal-regras");
    const botaoFechar = document.getElementById("fechar-modal");
    botaoFechar.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
}

function iniciar() {
    // Gerar palavra do dia (Hash mais robusto)
    const hoje = new Date().toISOString().split('T')[0];
    const semente = hoje.split('-').join('');
    let hash = 0;
    for (let i = 0; i < semente.length; i++) {
        hash = (hash << 5) - hash + semente.charCodeAt(i);
    }
    const indice = Math.abs(hash) % xingos.length;
    gameState.palavra = xingos[indice].toUpperCase();

    // Criar Board e Cache
    const board = document.getElementById("board");
    board.innerHTML = "";
    for (let r = 0; r < gameState.tentativas; r++) {
        gameState.boardTiles[r] = [];
        for (let c = 0; c < gameState.tamanhoPalavra; c++) {
            let tile = document.createElement("span");
            tile.id = `${r}-${c}`;
            tile.classList.add("tile");
            board.appendChild(tile);
            gameState.boardTiles[r][c] = tile;
        }
    }

    renderTeclado();
    document.removeEventListener('keyup', processInput);
    document.addEventListener('keyup', processInput);
}

function renderTeclado() {
    const layout = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["Enter","Z","X","C","V","B","N","M","⌫"]
    ];
    const container = document.getElementById("keyboard-container");
    container.innerHTML = "";

    layout.forEach(row => {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");
        row.forEach(key => {
            let keyTile = document.createElement("div");
            keyTile.innerText = key;
            keyTile.className = key === "Enter" ? "enter-key-tile" : "key-tile";
            keyTile.id = key === "⌫" ? "Backspace" : (key === "Enter" ? "Enter" : "Key" + key);
            keyTile.onclick = () => processInput({ code: keyTile.id });
            rowDiv.appendChild(keyTile);
        });
        container.appendChild(rowDiv);
    });
}

function processInput(e) {
    if (gameState.fimDeJogo || gameState.travado) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (gameState.coluna < gameState.tamanhoPalavra) {
            let tile = gameState.boardTiles[gameState.fileira][gameState.coluna];
            tile.innerText = e.code.replace("Key", "");
            gameState.coluna++;
        }
    } else if (e.code === "Backspace" && gameState.coluna > 0) {
        gameState.coluna--;
        gameState.boardTiles[gameState.fileira][gameState.coluna].innerText = "";
    } else if (e.code === "Enter") {
        confirmarTentativa();
    }
}

function confirmarTentativa() {
    let tentativa = "";
    for (let c = 0; c < gameState.tamanhoPalavra; c++) {
        tentativa += gameState.boardTiles[gameState.fileira][c].innerText;
    }

    if (tentativa.length < gameState.tamanhoPalavra) {
        triggerShake();
        return;
    }

    processarResultado(tentativa);
}

function triggerShake() {
    const board = document.getElementById("board");
    board.classList.add("shake");
    setTimeout(() => board.classList.remove("shake"), 500);
    document.getElementById("answer").innerText = "Completa a palavra, gênio.";
}

function processarResultado(tentativa) {
    gameState.travado = true;
    let correct = 0;
    let letterCount = {};
    const palavraLimpa = removerAcentos(gameState.palavra).toUpperCase();
    
    for (let l of palavraLimpa) letterCount[l] = (letterCount[l] || 0) + 1;

    // Primeiro pass: Verdes (Corretos)
    for (let c = 0; c < gameState.tamanhoPalavra; c++) {
        let tile = gameState.boardTiles[gameState.fileira][c];
        let letra = tile.innerText;

        setTimeout(() => {
            tile.classList.add("flip");
            if (palavraLimpa[c] === letra) {
                tile.classList.add("correct");
                atualizarTecla(letra, "correct");
                correct++;
                letterCount[letra]--;
            }
        }, c * 150);
    }

    // Segundo pass: Amarelos e Cinzas
    setTimeout(() => {
        for (let c = 0; c < gameState.tamanhoPalavra; c++) {
            let tile = gameState.boardTiles[gameState.fileira][c];
            if (tile.classList.contains("correct")) continue;

            let letra = tile.innerText;
            if (palavraLimpa.includes(letra) && letterCount[letra] > 0) {
                tile.classList.add("present");
                atualizarTecla(letra, "present");
                letterCount[letra]--;
            } else {
                tile.classList.add("absent");
                atualizarTecla(letra, "absent");
            }
        }

        verificarFimDeJogo(correct);
    }, 800);
}

function atualizarTecla(letra, classe) {
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

function verificarFimDeJogo(correct) {
    if (correct === gameState.tamanhoPalavra || gameState.fileira === gameState.tentativas - 1) {
        gameState.fimDeJogo = true;
        const vitoria = (correct === gameState.tamanhoPalavra);
        
        localStorage.setItem("xingo_status", JSON.stringify({
            data: new Date().toISOString().split('T')[0],
            finalizado: true,
            vitoria: vitoria,
            palavra: gameState.palavra
        }));

        document.getElementById("answer").innerText = vitoria ? 
            "Boa! Você é muito inteligente! 👍" : 
            "Quase lá! A palavra era: " + gameState.palavra;

        setTimeout(() => {
            document.getElementById("keyboard-container").style.visibility = "hidden";
        }, 1000);
    } else {
        gameState.fileira++;
        gameState.coluna = 0;
        gameState.travado = false;
    }
}

function exibirMensagemJaJogou(vitoria, pal) {
    const board = document.getElementById("board");
    board.style.display = "block"; 
    board.innerHTML = `
        <div class="status-container">
            <div class="status-icon">${vitoria ? '🏆' : '⏰'}</div>
            <h3>Desafio Concluído!</h3>
            <p>A palavra de hoje era: <br><strong>${pal}</strong></p>
            <hr style="border: 0; border-top: 1px solid #3a3a3c; margin: 20px 0;">
            <p>Volte amanhã para uma nova palavra!</p>
        </div>
    `;
    document.getElementById("keyboard-container").style.display = "none";
}