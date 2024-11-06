<script setup lang="ts">
interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'ru', name: 'Русский', flag: '/icons/figma/profile/rsFlag.svg' },
  { code: 'en', name: 'English', flag: '/icons/figma/profile/usaFlag.svg' },
]

const store = usePersistedStore()
const selectedLanguageCode = ref(store.language ?? languages[0].code)

const selectedLanguage = computed(() => {
  return languages.find(language => language.code === selectedLanguageCode.value) || languages[0]
})
function updateLanguage(code: string) {
  store.language = code
  selectedLanguageCode.value = code
}
</script>

<template>
  <SelectRoot v-model="selectedLanguageCode" @update:model-value="updateLanguage">
    <SelectTrigger class="select select-primary items-center w-36">
      <SelectValue>
        <div class="flex items-center space-x-2">
          <NuxtImg :src="selectedLanguage.flag" class="w-6 h-4" />
          <span class="text-sm font-medium text-gray-700">{{ selectedLanguage.name }}</span>
        </div>
      </SelectValue>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent position="popper" class="bg-white border border-gray-200 rounded-lg shadow-lg z-[100] w-36">
        <SelectItem
          v-for="language in languages" :key="language.code" :value="language.code"
          class="p-2 hover:bg-gray-100 cursor-pointer w-full hover:border-primary"
        >
          <div class="flex items-center space-x-2 w-full">
            <img :src="language.flag" :alt="`${language.name} flag`" class="w-6 h-4 object-cover">
            <span class="text-sm">{{ language.name }}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
