export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const storedColorMode = localStorage.getItem('nuxt-color-mode')
    if (storedColorMode) {
        console.log( nuxtApp.colorMode);
        
      nuxtApp.colorMode = storedColorMode
    }
  })
})
