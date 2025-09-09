<script setup lang="ts">
const props = defineProps({
  draft: {
    type: Object as PropType<IReviewDraft>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits(["updateDraft", "deleterDraft"]);

const isEdit = ref(false);
const editData = ref<IReviewDraft>({});

function toEdit(bool?: boolean) {
  editData.value = { ...props.draft };
  if (!!bool) {
    isEdit.value = bool;
  } else {
    isEdit.value = !isEdit.value;
  }
}

function toSave() {
  isEdit.value = false;
  const nw = JSON.stringify(editData.value);
  const old = JSON.stringify(props.draft);
  if (nw !== old) {
    emit("updateDraft", { ...editData.value }, props.index);
  }
}

function deleteDraft() {
  emit("deleterDraft", { ...props.draft._id }, props.index);
}

const classEditable = [
  "hover:outline hover:outline-warning hover:rounded hover:cursor-text",
];
const classEditing = [
  "bg-white outline outline-warning rounded cursor-text p-2 w-full bg-base-200",
];
</script>
<template>
  <div class="buyout-card card bg-base-200 shadow-lg">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative"
    >
      <div v-if="draft.isEdit">...updating</div>
      <div v-else>
        <div class="h-[30px] mb-2">
          <div
            v-if="!isEdit"
            :class="[classEditable, 'w-full p-1']"
            @dblclick="toEdit(true)"
          >
            <h2 v-if="draft.draftName" class="card-title">
              {{ draft.draftName }}
            </h2>
            <h2 v-else class="card-title text-sm text-gray-500 italic">
              без названия
            </h2>
          </div>

          <div v-else>
            <input
              type="text"
              v-model="editData.draftName"
              :class="classEditing"
            />
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col w-full">
            <div class="relative w-full rounded-lg">
              <div class="font-bold">Артикул</div>
              <div class="w-full">
                <div
                  v-if="!isEdit"
                  :class="[
                    classEditable,
                    'w-full p-1 text-sm text-primary link link-hover h-[30px]',
                  ]"
                  @dblclick="toEdit(true)"
                >
                  <a
                    :href="`https://market.yandex.ru/search?text=${draft.article}&cvredirect=1`"
                    target="_blank"
                  >
                    {{ draft.article }}
                  </a>
                </div>

                <div v-else>
                  <input
                    type="text"
                    v-model="editData.article"
                    :class="classEditing"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="w-full">
            <div class="font-bold">Отзыв от товаре</div>

            <div
              v-if="!isEdit"
              :class="[
                classEditable,
                'p-1 w-full bg-base-200  h-[180px]  overflow-y-auto scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin',
              ]"
              @dblclick="toEdit(true)"
            >
              {{ draft.text }}
            </div>

            <div v-else>
              <textarea
                v-model="editData.text"
                :class="[classEditing, 'h-[180px]']"
              ></textarea>
              <div class="flex flex-row gap-2">
                <button
                  class="btn btn-neutral btn-sm normal-case font-medium"
                  @click="toEdit(false)"
                >
                  отменить
                </button>
                <button
                  class="btn btn-primary btn-sm normal-case font-medium"
                  @click="toSave"
                >
                  сохранить
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-row justify-between p-1">
            <div>
              <div class="font-bold">Дата создания</div>
              <div class="relative w-full rounded-lg">
                <div>
                  {{ defaultDate(draft.createdAt) }}
                </div>
              </div>
            </div>
            <Button
              class="btn btn-sm m-1 btn-outline btn-error"
              @click="deleteDraft"
            >
              <span class="pi pi-trash"></span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
