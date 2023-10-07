import { defineNuxtPlugin } from 'nuxt/app'

function inject(w: Window & typeof globalThis, d: Document, u: string) {
  const s = d.createElement('script')
  s.async = true
  s.src = `${u}?${(Date.now() / 60000) | 0}`
  // s.type = 'text/partytown'
  w.document.head.appendChild(s)
  s.addEventListener('load', () => {
    // Находим элемент с классом 'b24-widget-button-position-bottom-right'
    const widgetButton: any = d.querySelector(
      '.b24-widget-button-position-bottom-right'
    )

    if (widgetButton) {
      widgetButton.style.right = '10px' // Применяем правое смещение
      widgetButton.style.bottom = '15px'
    }
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  inject(
    window,
    document,
    'https://cdn-ru.bitrix24.ru/b25122566/crm/site_button/loader_3_bd3spe.js'
  )
})
