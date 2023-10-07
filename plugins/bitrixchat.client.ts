import { defineNuxtPlugin } from 'nuxt/app'
import bitrix from './bitrix'

function inject(w: any, d: any, u: any) {
  const s = d.createElement('script')
  s.src = `${u}?${(Date.now() / 60000) | 0}`
  // s.type = 'text/partytown'
  
  w.document.head.appendChild(s)
}

export default defineNuxtPlugin((nuxtApp) => {
  inject(window, document, bitrix)
})
