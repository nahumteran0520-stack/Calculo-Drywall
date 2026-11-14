if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: '/Calculo-Drywall/' })
      .then(() => console.log('Service Worker registrado correctamente'))
      .catch(err => console.error('Error en Service Worker:', err));
  });
}
