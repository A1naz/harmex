import { defineNuxtPlugin } from 'nuxt/app'

function inject(w: Window & typeof globalThis, d: Document, u: string) {
  const s = d.createElement('script')
  s.async = true
  s.src = `${u}?${(Date.now() / 60000) | 0}`
  // s.type = 'text/partytown'
  w.document.head.appendChild(s)
  s.addEventListener('load', () => {
    // Находим элемент с классом 'b24-widget-button-position-bottom-right'
    const mainButton: any = d.querySelector(
      '.b24-widget-button-position-bottom-right'
    )

    if (mainButton) {

      mainButton.style.right = '10px' // Применяем правое смещение
      mainButton.style.bottom = '10px'


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
