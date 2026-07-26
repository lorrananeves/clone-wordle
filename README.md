# XINGO 🤬

Um clone do Wordle em português — mas com xingamentos.

Feito originalmente quando eu trabalhava como dev fullstack, com o objetivo de praticar e melhorar meu conhecimento em JavaScript puro no frontend. Com o tempo, percebi que gosto muito mais de codar por diversão do que como profissão, então deixei o desenvolvimento de lado. Mas quando a saudade bate, volto aqui pra melhorar algo ou implementar uma ideia nova.

---

## 🎮 Jogue agora

O projeto tem três versões do jogo, cada uma com um nível diferente de dificuldade:

| Modo | Letras | Tentativas | Link |
|---|---|---|---|
| **XINGUINHO** | 4 letras | 5 tentativas | [jogar](https://lorrananeves.github.io/clone-wordle/xinguinho.html) |
| **XINGO** | 5 letras | 6 tentativas | [jogar](https://lorrananeves.github.io/clone-wordle/) |
| **XINGÃO** | 6 letras | 7 tentativas | [jogar](https://lorrananeves.github.io/clone-wordle/xingao.html) |

---

## Como funciona

A mecânica é a mesma do Wordle: você tem algumas tentativas para adivinhar a palavra do dia. Depois de cada chute, as letras revelam pistas:

- 🟩 **Verde** — letra certa no lugar certo
- 🟨 **Amarelo** — letra existe na palavra, mas está no lugar errado
- ⬛ **Cinza** — letra não faz parte da palavra

A palavra muda todo dia e é a mesma para todo mundo.

---

## Funcionalidades

- **Três modos de dificuldade** — 4, 5 ou 6 letras, cada um com número de tentativas ajustado
- **Modo claro / escuro** — alterna pelo botão ☀️ no cabeçalho
- **PWA (Progressive Web App)** — pode ser instalado como app no celular ou desktop, funciona offline graças ao Service Worker
- **Teclado virtual** — teclado na tela que também reflete o estado de cada letra já tentada
- **Palavra diária** — determinada por uma função de seed baseada na data, garantindo que todos joguem a mesma palavra no mesmo dia
- **Testes automatizados** — lógica de domínio e storage cobertos com Vitest

---

## Stack

- HTML + CSS + JavaScript puro (sem frameworks)
- [Vitest](https://vitest.dev/) para testes
- GitHub Pages para o deploy

---

## Rodar localmente

```bash
# instalar dependências (só Vitest)
npm install

# rodar os testes
npm test
```

Para abrir o jogo localmente, basta abrir o `index.html` num servidor estático (ex: extensão Live Server do VS Code).

---

## Contexto

Esse projeto nasceu como exercício de JavaScript — manipulação de DOM, módulos ES, lógica de estado, armazenamento local, Service Worker. Nenhuma dependência de runtime, tudo vanilla.

Hoje ele vive como um projeto de hobby que eu retomo quando sinto vontade de codar. Cada melhoria aqui não tem prazo nem sprint — só tem a vontade de fazer algo divertido.
