// Suprimir warnings de eventos pasivos
(window as any).__zone_symbol__PASSIVE_EVENTS = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];

// Deshabilitar custom elements de Zone.js (mejora performance)
(window as any).__Zone_disable_customElements = true;