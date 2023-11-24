<!-- eslint-disable eqeqeq -->
<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Профиль',
})
const warning = ref('')

const isChatBotEnabled = ref(false)

const store = useMainStore()

const wbApiKeys = ref([''])
const form: any = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
})
const alert = reactive({
  show: false,
  message: '',
  type: 'success',
})
const { start, stop } = useTimeoutFn(
  () => {
    alert.show = false
  },
  3000,
  { immediate: false }
)
const initialForm: any = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
})
function updateInitital() {
  initialForm.firstName = store.client.firstName
  initialForm.lastName = store.client.lastName
  initialForm.email = store.client.email
  initialForm.username = store.client.username
  wbApiKeys.value = store.client.wbApiKeys.length
    ? JSON.parse(JSON.stringify(store.client.wbApiKeys))
    : ['']
}
onMounted(async () => {
  updateInitital()
  form.firstName = store.client.firstName
  form.lastName = store.client.lastName
  form.email = store.client.email
  form.username = store.client.username
})
// if (!store.checkTelegramId())
// warning.value =
//   'Пожалуйста перепривяжите Телеграм для корректной работы портала.'
const headers = useRequestHeaders(['cookie']) as HeadersInit
const disabledSaveButton = computed(() => {
  return (
    form.firstName == initialForm.firstName &&
    form.lastName == initialForm.lastName &&
    form.email == initialForm.email &&
    form.username == initialForm.username
  )
})
const disabledChangePasswordButton = computed(() => {
  if (store.client.hasPassword)
    return passwordForm.oldPassword == '' || passwordForm.newPassword == ''
  else return passwordForm.newPassword == ''
})

async function updatePassword() {
  if (passwordForm.oldPassword == '' && passwordForm.newPassword == '') return

  const { data, error }: any = await useFetch('/api/user/updatePassword', {
    method: 'POST',
    body: passwordForm,
    headers,
  })
  if ((data.value as any)?.status === 'error') {
    alert.show = true
    alert.message = (data.value as any).error!
    alert.type = 'error'
    setTimeout(() => {
      location.reload()
    }, 2000)
  } else {
    if (data.value.newPassword) {
      alert.message = 'Пароль успешно установлен.'
    } else
      alert.message = 'Подтверждение смены пароля было отправлено на ваш email.'

    alert.show = true
    alert.type = 'success'
  }
  start()
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  await store.getClient()
}
async function setApiKey() {
  const { data, error } = await useFetch('/api/user/setApiKey', {
    method: 'POST',
    body: {
      wbApiKeys: wbApiKeys.value,
    },
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  } else {
    alert.show = true
    alert.message = 'API ключи изменены.'
    alert.type = 'success'
  }
  start()
  await store.getClient()
  updateInitital()
}
async function update() {
  if (
    form.firstName == store.client.firstName &&
    form.lastName == store.client.lastName &&
    form.email == store.client.email &&
    form.username == store.client.username
  )
    return

  const { data, error } = await useFetch('/api/user/update', {
    method: 'POST',
    body: form,
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  } else {
    alert.message = 'Данные успешно обновлены'
    if (data.value?.emailUpdated) {
      alert.message =
        'Письмо для подтверждения было отправлено на указанный email. (Проверьте папку Спам)'
    }
    alert.type = 'success'
    alert.show = true
  }
  start()
  await store.getClient()
  updateInitital()
}
async function unlinkTelegram() {
  const { data, error } = await useFetch('/api/user/unlinkTelegram', {
    method: 'POST',
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  } else {
    alert.show = true
    alert.message =
      'Письмо для подтверждения было отправлено на указанный email. (Проверьте папку Спам)'
    alert.type = 'success'
  }
  start()
  await store.getClient()
}
function onTelegramLink(data: any) {
  if (data.status === 'ok') {
    alert.show = true
    alert.message = 'Telegram успешно привязан'
    alert.type = 'success'
  } else {
    alert.show = true
    alert.message = data.error.data?.message || 'Произошла ошибка'
    alert.type = 'error'
  }
  start()
}

const botNotifications: any = ref([
  {
    type: 1,
    text: 'Вы успешно пополнили баланс',
    isEnabled: false,
  },
  {
    type: 2,
    text: 'Выкуп ушел на паузу',
    isEnabled: false,
  },
  {
    type: 3,
    text: 'Выкуп ушел в архив',
    isEnabled: false,
  },
  {
    type: 4,
    text: 'Баланс меньше',
    value: 100,
    isEnabled: false,
  },
  {
    type: 5,
    text: 'Штраф за не забранный товар',
    isEnabled: false,
  },
  {
    type: 6,
    text: 'Начислено партнерское вознаграждение',
    isEnabled: false,
  },
  {
    type: 7,
    text: 'Новый реферал в 1-й линии',
    isEnabled: false,
  },
  {
    type: 8,
    text: 'Новый реферал в 2-й линии',
    isEnabled: false,
  },
  {
    type: 9,
    text: 'Выкуп забран с ПВЗ: ID, адрес, Имя',
    isEnabled: false,
  },
])

async function getTGBotInfo() {
  const { data, error }: any = await useFetch('/api/tgBot/getTGBotInfo', {
    method: 'GET',
  })

  if (data.value) {
    isChatBotEnabled.value = data.value.isEnabled
    if (data.value.settings && data.value.settings.length > 0) {
      botNotifications.value.forEach((el: any) => {
        data.value.settings.forEach((setting: any) => {
          if (el.type === setting.type) {
            el.isEnabled = true
            if (setting.value !== null) {
              el.value = setting.value
            }
          }
        })
      })
    }
  }
}
if (store.client.telegram) {
  await getTGBotInfo()
}

async function setChatBot() {
  if (!store.client.telegram) {
    notify({
      type: 'error',
      title: 'Для включения чат-бота необходимо привязать Telegram',
    })
    isChatBotEnabled.value = false
    return
  }

  const { data, error }: any = await useFetch('/api/tgBot/setChatBot', {
    method: 'GET',
    query: {
      isEnabled: isChatBotEnabled.value,
    },
  })

  if (data.value) {
    notify({
      type: 'success',
      title: data.value.message,
    })
  }
}

async function setChatBotSettings() {
  const trueSettings: Array<any> = []
  botNotifications.value.forEach((el: any) => {
    if (el.isEnabled) {
      trueSettings.push({
        type: el.type,
        text: el.text,
        value: el.value !== null ? el.value : null,
      })
    }
  })
  const { data, error }: any = await useFetch('/api/tgBot/setChatBotSettings', {
    method: 'POST',
    body: {
      settings: trueSettings,
    },
  })

  if (data.value) {
    window.location.reload()
  }
}
</script>

<template>
  <div>
    <Toast :type="alert.type" :active="alert.show">
      {{ alert.message }}
    </Toast>
    <div v-if="warning" class="alert alert-warning mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>{{ warning }}</span>
    </div>
    <div class="page-header mb-16">
      <h1 class="text-2xl font-bold mt-4">Профиль</h1>
      <p class="description">
        Здесь вы можете управлять настройками вашего аккаунта.
      </p>
      <p class="description">
        Запустите чат-бот уведомлений по платформе. Привяжите Telegram-аккаунт и активируйте чат-бот.
      </p>
    </div>

    <section
      class="profile-options flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
        <div class="heading">Контактные данные</div>
        <div class="text-xs text-gray-400">
          Заполните свои контактные данные, чтобы получать актуальные
          рекомендации по продвижению
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full mt-1">
        <div class="w-full flex gap-8">
          <input
            v-model="form.firstName"
            placeholder="Имя"
            class="input input-bordered w-full"
          />
          <input
            v-model="form.lastName"
            placeholder="Фамилия"
            class="input input-bordered w-full"
          />
        </div>

        <div class="flex flex-col w-full gap-8 xl:flex-row">
          <input
            v-model="form.username"
            type="text"
            placeholder="Никнейм"
            class="input input-bordered w-full xl:w-1/2"
          />
          <div class="tg w-full justify-between flex gap-2 xl:gap-4 xl:w-1/2">
            <div
              class="relative flex justify-end w-full items-center flex-grow-0"
            >
              <input
                :value="
                  store.client?.telegram
                    ? `@${store.client.telegram}`
                    : `${store.client.telegramUserId ?? ''}`
                "
                placeholder="Telegram"
                class="input input-bordered w-full"
                disabled
              />
              <Icon class="absolute mr-4" size="24" name="logos:telegram" />
            </div>

            <LinkTelegram
              v-if="!store.client.telegramUserId"
              @callback="onTelegramLink"
            />
            <button
              v-if="store.client.telegramUserId || store.client.telegram"
              class="btn btn-primary"
              @click="unlinkTelegram"
            >
              Отвязать
            </button>
          </div>
        </div>
        <input
          v-model="form.email"
          type="text"
          placeholder="Почта (email)"
          class="input input-bordered w-full"
        />

        <div class="flex w-full gap-4 justify-end">
          <button
            :disabled="disabledSaveButton"
            class="btn btn-primary xl:w-40 mr-0 self-end"
            @click="update"
          >
            Сохранить
          </button>
        </div>
      </div>
    </section>
    <section
      class="profile-options mt-20 flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
        <div class="heading relative">Пароль</div>
        <div class="text-xs text-gray-400">
          Установите или поменяйте пароль для вашего аккаунта
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full mt-1">
        <div class="w-full flex flex-col gap-4 xl:gap-8 xl:flex-row">
          <input
            v-show="store.client.hasPassword"
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="Старый пароль"
            class="input input-bordered w-full"
          />
          <input
            v-model="passwordForm.newPassword"
            :class="{
              'input-primary': !store.client.hasPassword,
            }"
            type="password"
            placeholder="Новый пароль"
            class="input input-bordered w-full"
          />
        </div>

        <button
          :disabled="disabledChangePasswordButton"
          class="btn btn-primary xl:w-40 mr-0 self-end"
          @click="updatePassword"
        >
          {{ store.client.hasPassword ? 'Изменить' : 'Сохранить' }}
        </button>
      </div>
    </section>
    <section
      class="profile-options mt-20 flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
        <div class="heading relative">Настройки</div>
        <div class="text-xs text-gray-400">
          Введите стандартный ключ api для работы автоответчика
        </div>
      </div>
      <div class="flex flex-col gap-2 w-full">
        <div
          v-for="(key, index) of wbApiKeys"
          :key="key"
          class="flex flex-col gap-6 w-full mt-1 relative"
        >
          <div class="flex gap-2 relative">
            <input
              v-model="wbApiKeys[index]"
              :disabled="store.client.wbApiKeys[index] === wbApiKeys[index]"
              type="text"
              placeholder="Стандартный апи ключ Wildberries"
              class="input input-bordered input-primary w-full"
            />

            <div
              v-if="index === 0"
              class="btn btn-primary btn-square"
              @click="wbApiKeys[0] = ''"
            >
              <IconCSS size="20" name="material-symbols:close" />
            </div>
            <div
              v-else
              class="btn btn-primary btn-square"
              @click="wbApiKeys.splice(index, 1)"
            >
              <IconCSS size="20" name="material-symbols:close" />
            </div>
            <div
              v-if="index === 0"
              class="btn btn-primary btn-square"
              @click="wbApiKeys.push('')"
            >
              <IconCSS size="20" name="fluent:add-20-filled" />
            </div>
          </div>
        </div>
        <button
          class="btn btn-primary xl:w-40 mr-0 self-end"
          @click="setApiKey"
        >
          Сохранить
        </button>
      </div>
    </section>
    <section>
      <div
        class="profile-options mt-14 flex flex-col justify-end items-end gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
      >
        <div class="self-start description-container xl:basis-1/3">
          <div
            class="self-start description-container xl:basis-1/3"
            v-if="isChatBotEnabled && store.client.telegram"
          >
            <div class="heading relative">Настройки чат-бота</div>
            <div class="mt-1 text-gray-40">
              Ссылка на бота:
              <a
                href="https://t.me/topvtop_notifications_bot"
                target="_blank"
                class="text-primary text-lg"
              >
                @topvtop_notifications_bot</a
              >
            </div>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-2 w-full">
            <div class="form-control w-52">
              <label class="cursor-pointer label">
                <span class="label-text">Включить чат-бота</span>
                <input
                  v-model="isChatBotEnabled"
                  @change="setChatBot"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex justify-end gap-2 w-full"
        v-if="isChatBotEnabled && store.client.telegram"
      >
        <div class="flex flex-col gap-2 w-full">
          <div
            class="flex flex-wrap justify-end md:justify-start mt-4 mr-3 mb-2 md:mr-5"
          >
            <div v-for="notification in botNotifications">
              <div class="form-control md:w-80 w-full mt-2 mr-2">
                <label class="cursor-pointer text-right label flex justify-end">
                  <span class="label-text mr-4">{{ notification.text }}</span>
                  <input
                    v-if="notification.type == 4"
                    type="number"
                    v-model="notification.value"
                    placeholder="Сумма ₽"
                    class="input w-20 input-sm input-bordered max-w-xs mr-2"
                  />
                  <input
                    v-model="notification.isEnabled"
                    type="checkbox"
                    class="toggle toggle-primary"
                  />
                </label>
              </div>
            </div>
          </div>

          <button
            class="btn btn-primary xl:w-40 mr-0 self-end"
            @click="setChatBotSettings"
          >
            Сохранить
          </button>
        </div>
      </div>
    </section>
  </div>
  <div class="h-20"></div>
</template>

<style scoped></style>
