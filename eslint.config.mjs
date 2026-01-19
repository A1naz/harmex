// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    // Настройки форматирования через Prettier
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    
    rules: {
      'no-unused-vars': 'off', // Disable the no-unused-vars rule
      // 'unused-imports/no-unused-vars': 'warn', // Disable the unused-imports/no-unused-vars rule
      
      // Отключаем правила, которые могут конфликтовать с Prettier
      'style/semi': 'off',
      'style/quotes': 'off',
      'style/indent': 'off',
      'style/comma-dangle': 'off',
    },
  }),
)
