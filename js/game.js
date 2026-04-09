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

/**
 * Inicializa o jogo verificando o estado atual e configurando o ambiente.
 */
function init() {
    const hoje = new Date().toISOString().split('T')[0];
    const salvo = storage.obterProgresso();

    // Prevenção de gestos de zoom/scroll excessivo no mobile
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    const botaoFechar = document.getElementById("fechar-modal");
    if (botaoFechar) {
        botaoFechar.onclick = () => ui.elements.modal.style.display = "none";
    }

    if (salvo && salvo.data === hoje && salvo.finalizado) {
        ui.elements.modal.style.display = "none";
        ui.mostrarStatusFinal(salvo.vitoria, salvo.palavra, storage.obterEstatisticas());
        return;
    }

    configurarPalavraDoDia(hoje);
    criarTabuleiro();
    renderTeclado();
    document.addEventListener('keyup', handleInput);
}

/**
 * Gera a palavra do dia baseada em um hash da data atual.
 */
function configurarPalavraDoDia(dataStr) {
    const semente = dataStr.split('-').join('');
    let hash = 0;
    for (let i = 0; i < semente.length; i++) {
        hash = (hash << 5) - hash + semente.charCodeAt(i);
    }
    state.palavra = XINGOS[Math.abs(hash) % XINGOS.length].toUpperCase();
}

/**
 * Monta a grade do jogo no DOM e salva as referências no estado.
 */
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

/**
 * Renderiza o teclado virtual e atribui os eventos de clique.
 */
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

/**
 * Gerencia as entradas do teclado físico e virtual.
 */
function handleInput(e) {
    if (state.fimDeJogo || state.travado) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (state.coluna < TAMANHO_PALAVRA) {
            let tile = state.tiles[state.fileira][state.coluna];
            tile.innerText = e.code.replace("Key", "");
            
            // Feedback Visual POP
            tile.classList.add("pop");
            setTimeout(() => tile.classList.remove("pop"), 100);

            state.coluna++;
        }
    } else if (e.code === "Backspace" && state.coluna > 0) {
        state.coluna--;
        state.tiles[state.fileira][state.coluna].innerText = "";
    } else if (e.code === "Enter") {
        validarTentativa();
    }
}

/**
 * Verifica se a palavra foi preenchida antes de processar.
 */
function validarTentativa() {
    let tentativa = "";
    for (let c = 0; c < TAMANHO_PALAVRA; c++) {
        tentativa += state.tiles[state.fileira][c].innerText;
    }

    if (tentativa.length < TAMANHO_PALAVRA) {
        ui.triggerShake();
        ui.exibirMensagem("Completa a palavra, gênio.");
        return;
    }
    processarResultado(tentativa);
}

/**
 * Compara a tentativa com a palavra do dia e aplica os estilos.
 */
function processarResultado(tentativa) {
    state.travado = true;
    let correct = 0;
    const palavraLimpa = state.palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let letterCount = {};
    for (let l of palavraLimpa) letterCount[l] = (letterCount[l] || 0) + 1;

    // Primeiro pass: Encontrar letras corretas (Verde)
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

    // Segundo pass: Encontrar letras presentes ou ausentes
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
        verificarFimDeJogo(correct);
    }, 800);
}

/**
 * Finaliza o jogo ou prepara para a próxima linha.
 */
function verificarFimDeJogo(correct) {
    if (correct === TAMANHO_PALAVRA || state.fileira === TENTATIVAS - 1) {
        state.fimDeJogo = true;
        const vitoria = (correct === TAMANHO_PALAVRA);
        storage.salvarProgresso(vitoria, state.palavra);
        storage.atualizarEstatisticas(vitoria, state.fileira);
        
        const stats = storage.obterEstatisticas();
        if (vitoria) stats.ultimoAcerto = state.fileira + 1;

        setTimeout(() => {
            ui.mostrarStatusFinal(vitoria, state.palavra, stats);
        }, 1500);
    } else {
        state.fileira++;
        state.coluna = 0;
        state.travado = false;
    }
}

init();