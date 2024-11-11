// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    rules: {
      'no-unused-vars': 'off', // Disable the no-unused-vars rule
      // 'unused-imports/no-unused-vars': 'warn', // Disable the unused-imports/no-unused-vars rule
    },
  }),
)
