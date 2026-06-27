// Registro do Service Worker e tracking de instalação PWA.
// Mantido num arquivo separado para não duplicar em game.js e game6.js.

if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {

            console.log("Service Worker registrado");

        })
        .catch((erro) => {

            console.error("Erro no Service Worker:", erro);
        });
}

window.addEventListener('appinstalled', () => {

    if (window.gtag) {

        gtag('event', 'pwa_installed');

    }
});
