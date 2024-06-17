<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  }
})
const emit = defineEmits(['close'])
const currency = useCurrency()
const store = useMainStore()
const logs = ref<any[]>([])

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
   <div class='container'>
      <div class="sitemap">
         <div class="sitemap__row">
            <a href="pay.html">Оплата тарифа</a>
            <a href="balance.html">Пополнение баланса</a>
         </div>

         <hr>

         <div class="sitemap__row">
            <a href="#success-popup" class="btn-popup">success</a>
            <a href="#error-popup" class="btn-popup">error</a>
            <a href="#bank-pay" class="btn-popup">bank-pay</a>
            <a href="#account-pay" class="btn-popup">account-pay</a>
            <a href="#credit-pay" class="btn-popup">credit-pay</a>
            <a href="#credit-bank1" class="btn-popup">credit-bank1</a>
            <a href="#credit-bank2" class="btn-popup">credit-bank2</a>
            <a href="#credit-bank3" class="btn-popup">credit-bank3</a>

            <a href="#balance-pay" class="btn-popup">Пополение баланса</a>
         </div>
      </div>
   </div>
</template>

<style scoped></style>
