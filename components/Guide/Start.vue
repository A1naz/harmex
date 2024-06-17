<script setup lang="ts">
const liData = [
  'Изучите бегло всю информацию, чтобы знать, что где находится',
  'Разберитесь в разделах и материалах, чтобы быстрее вникнуть и разобраться',
  'Выберите стратегию и создайте план действий (если не знаете, напишите в Службу заботы)',
  'Изучите кабинет и функционал платформы (меню Справочник - Обзор кабинета)',
  'Все вопросы задавайте на встречах, в анонимной анкете или в Службу заботы',
  'Присутствуйте на групповых встречах с разборами ситуаций и ответами на вопросы (меню Необходимые ссылки)',
  'Изучайте дополнительную информацию или узнавайте у Службы заботы, есть ли решение по задаче, которая вас интересует',
  'Используйте для рекомендаций наши материалы или на основе них создавайте свои',
  'Тестируйте разные стратегии и анализируйте, что срабатывает лучше всего',
]
</script>

<template>
  <div class="flex flex-col gap-4 w-full overflow-y-auto pb-20 px-5">
    <div class="flex flex-col gap-4 text-xl font-bold px-2">С чего начать</div>
    <div class="divider w-full my-0"></div>
    <div tabindex="0" class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none">
      <div class="collapse-title text-lg font-bold">Введение</div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p>
            В данном меню вы всегда будете находить нужную вам информацию,
            касающуюся бизнеса и разработок в Market Monstr.
          </p>
          <p>Информация регулярно будет обновляться и расширяться.</p>
          <p>
            Если вы хотите поспособствовать наполнению/качеству Информации, то
            присылайте свои материалы/пожелания/идеи в Службу заботы.
          </p>
          <p>
            Когда у вас возникают какие-то вопросы или уточнения, задавайте их в
            Службу заботы или вашему персональному Аккаунт менеджеру.
          </p>
          <p>
            Кроме этого мы создали специальную
            <a
              class="link link-hover text-primary underline"
              href="https://forms.gle/RVSct9BsCd3rCcfC7"
              >анонимную анкету
            </a>
            в которую вы также можете писать свои вопросы, уточнения, ситуации и
            каждую неделю мы всё будем разбирать на наших общих встречах.
          </p>
        </div>
      </div>
    </div>
    <div tabindex="0" class="collapse collapse-arrow bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 rounded-box z-0 flex-none">
      <div class="collapse-title text-lg font-bold">Рекомендации</div>
      <div class="collapse-content">
        <div class="flex flex-col gap-4">
          <p class="-py-7">
            Перед началом взаимодействия с платформой Market Monstr, выполните
            простые рекомендации:
          </p>
          <ul class="">
            <li class="my-1 text-sm" v-for="(li, index) in liData">
              {{ index + 1 }}. {{ li }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
p {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
