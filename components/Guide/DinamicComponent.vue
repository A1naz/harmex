<script setup lang="ts">
import GuideUpdates from '~/components/Guide/Updates.vue';
import GuideStart from '~/components/Guide/Start.vue';
import GuidePopularQuestions from '~/components/Guide/PopularQuestions.vue';
import GuidePartner from '~/components/Guide/Partner.vue';
import GuideWildberries from '~/components/Guide/Wildberries.vue';
import GuideOzon from '~/components/Guide/Ozon.vue';
import GuideAvito from '~/components/Guide/Avito.vue';
import GuideFlowwow from '~/components/Guide/Flowwow.vue';

const components = [
  GuideStart,
  GuideUpdates,
  GuidePopularQuestions,
  GuidePartner,
  GuideWildberries,
  GuideOzon,
  GuideAvito,
  GuideFlowwow,
];

const currentComponent = ref<string>('GuideStart'); 
const setComponent = (componentName: string) => {
  currentComponent.value = componentName;
};

const resolvedComponent = computed(() => {
  return components.find((component) => component.__name === currentComponent.value.replace('Guide', ''));
});

function changePage(type: string){
  const componentIndex = components.findIndex((component) => component.__name === currentComponent.value.replace('Guide', ''))
  if (type === 'next') {
    if(!components[componentIndex+1]) {
      setComponent(`Guide${components[0].__name}`)
      return
    }
    setComponent(`Guide${components[componentIndex + 1].__name}`)
  } else {
    if(!components[componentIndex-1]) {
      setComponent(`Guide${components[components.length - 1].__name}`)
      return
    }
    setComponent(`Guide${components[componentIndex - 1].__name}`)
  }
}

defineExpose({
  setComponent
})

</script>

<template>
  <div class="bg-base-100 rounded-lg flex flex-col gap-4 w-full overflow-y-auto">
    <div class="flex justify-between px-7 pt-5">
      <button class="btn btn-sm bg-base-100 drop-shadow-sm" @click="changePage('back')">
        <Icon name="mdi:arrow-left" class="w-6 h-6" />
      </button>
      <button class="btn btn-sm bg-base-100 drop-shadow-sm" @click="changePage('next')">
        <Icon name="mdi:arrow-right" class="w-6 h-6" />
      </button>
    </div>
    <component :is="resolvedComponent"></component>
    <div class="h-10" />
  </div>
</template>

<style scoped>

</style>
