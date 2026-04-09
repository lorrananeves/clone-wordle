import { XINGOS, TENTATIVAS, TAMANHO_PALAVRA } from './constants.js';
import { storage } from './storage.js';
import { ui } from './ui.js';

const state = {
    fileira: 0,
    coluna: 0,
    fimDeJogo: false,
    travado: false,
    palavra: "",
    tiles: [] 
};

function init() {
    const hoje = new Date().toISOString().split('T')[0];
    const salvo = storage.obterProgresso();

    // Configurar Modal
    const botaoFechar = document.getElementById("fechar-modal");
    if (botaoFechar) {
        botaoFechar.onclick = () => ui.elements.modal.style.display = "none";
    }

    if (salvo && salvo.data === hoje && salvo.finalizado) {
        ui.elements.modal.style.display = "none";
        ui.mostrarStatusFinal(salvo.vitoria, salvo.palavra);
        return;
    }

    configurarPalavraDoDia(hoje);
    criarTabuleiro();
    renderTeclado(); // Adicionado para desenhar o teclado
    document.addEventListener('keyup', handleInput);
}

function configurarPalavraDoDia(dataStr) {
    const semente = dataStr.split('-').join('');
    let hash = 0;
    for (let i = 0; i < semente.length; i++) {
        hash = (hash << 5) - hash + semente.charCodeAt(i);
    }
    state.palavra = XINGOS[Math.abs(hash) % XINGOS.length].toUpperCase();
}

function criarTabuleiro() {
    ui.elements.board.innerHTML = "";
    for (let r = 0; r < TENTATIVAS; r++) {
        state.tiles[r] = [];
        for (let c = 0; c < TAMANHO_PALAVRA; c++) {
            const tile = document.createElement("span");
            tile.classList.add("tile");
            ui.elements.board.appendChild(tile);
            state.tiles[r][c] = tile;
        }
    }
}

function renderTeclado() {
    const layout = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["Enter","Z","X","C","V","B","N","M","⌫"]
    ];
    
    ui.elements.keyboard.innerHTML = "";
    layout.forEach(row => {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");
        row.forEach(key => {
            let keyTile = document.createElement("div");
            keyTile.innerText = key;
            keyTile.className = key === "Enter" ? "enter-key-tile" : "key-tile";
            keyTile.id = key === "⌫" ? "Backspace" : (key === "Enter" ? "Enter" : "Key" + key);
            keyTile.onclick = () => handleInput({ code: keyTile.id });
            rowDiv.appendChild(keyTile);
        });
        ui.elements.keyboard.appendChild(rowDiv);
    });
}

function handleInput(e) {
    if (state.fimDeJogo || state.travado) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (state.coluna < TAMANHO_PALAVRA) {
            state.tiles[state.fileira][state.coluna].innerText = e.code.replace("Key", "");
            state.coluna++;
        }
    } else if (e.code === "Backspace" && state.coluna > 0) {
        state.coluna--;
        state.tiles[state.fileira][state.coluna].innerText = "";
    } else if (e.code === "Enter") {
        validarTentativa();
    }
}

function validarTentativa() {
    let tentativa = "";
    for (let c = 0; c < TAMANHO_PALAVRA; c++) {
        tentativa += state.tiles[state.fileira][c].innerText;
    }

    if (tentativa.length < TAMANHO_PALAVRA) {
        ui.triggerShake();
        return;
    }

    processarResultado(tentativa);
}

function processarResultado(tentativa) {
    state.travado = true;
    let correct = 0;
    const palavraLimpa = state.palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let letterCount = {};
    
    for (let l of palavraLimpa) letterCount[l] = (letterCount[l] || 0) + 1;

    // Lógica de cores e animação (Simplified for brevity)
    for (let c = 0; c < TAMANHO_PALAVRA; c++) {
        let tile = state.tiles[state.fileira][c];
        let letra = tile.innerText;

        setTimeout(() => {
            tile.classList.add("flip");
            if (palavraLimpa[c] === letra) {
                tile.classList.add("correct");
                ui.atualizarTecla(letra, "correct");
                correct++;
                letterCount[letra]--;
            }
        }, c * 150);
    }

    setTimeout(() => {
        for (let c = 0; c < TAMANHO_PALAVRA; c++) {
            let tile = state.tiles[state.fileira][c];
            if (tile.classList.contains("correct")) continue;

            let letra = tile.innerText;
            if (palavraLimpa.includes(letra) && letterCount[letra] > 0) {
                tile.classList.add("present");
                ui.atualizarTecla(letra, "present");
                letterCount[letra]--;
            } else {
                tile.classList.add("absent");
                ui.atualizarTecla(letra, "absent");
            }
        }

        if (correct === TAMANHO_PALAVRA || state.fileira === TENTATIVAS - 1) {
            state.fimDeJogo = true;
            storage.salvarProgresso(correct === TAMANHO_PALAVRA, state.palavra);
            ui.exibirMensagem(correct === TAMANHO_PALAVRA ? "Boa! 👍" : "A palavra era: " + state.palavra);
        } else {
            state.fileira++;
            state.coluna = 0;
            state.travado = false;
        }
    }, 800);
}

init();