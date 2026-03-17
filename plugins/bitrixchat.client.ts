import { defineNuxtPlugin } from 'nuxt/app'

function inject(w: Window & typeof globalThis, d: Document, u: string) {
  const s = d.createElement('script');
  s.async = true;
  s.src = `${u}?${(Date.now() / 60000) | 0}`;
  const h = d.getElementsByTagName('script')[0];
  w.document.head.appendChild(s);

  s.addEventListener('load', () => {
    // Находим элемент с классом 'b24-widget-button-position-bottom-right'
    const mainButton: HTMLElement | null = d.querySelector(
      '.b24-widget-button-position-bottom-right'
    );

    if (mainButton) {
      // Проверяем, мобильное устройство или ПК
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      if (isMobile) {
        // Стили для мобильного экрана
        mainButton.style.bottom = '60px';
        mainButton.style.right = '10px';
      } else {
        // Стили для ПК
        mainButton.style.bottom = '10px';
        mainButton.style.right = '10px';
      }

    }
  });
}

export default defineNuxtPlugin((nuxtApp) => {
  inject(
    window,
    document,
    'https://harmex.pro/widget/harmex-widget.js'
  );
});
