<template>
  <aside
    class="w-[460px] h-screen py-4 border-2 border-l-0 border-t-0 border-b-0 border-[#bdc8fc] lg:block hidden"
  >
    <ul class="space-y-2 mx-2 mt-4">
      <li>
        <a
          href="#"
          class="flex justify-between p-3 text-gray-900 bg-[#f5f7ff] rounded-lg"
        >
          <div>
            <Icon
              name="iconamoon:menu-burger-horizontal-fill"
              size="24"
              class="text-[#F72585] mr-4"
            />
            <span class="font-medium text-[16px]">Маркетплейсы</span>
          </div>
          <div>
            <Icon
              name="material-symbols-light:keyboard-arrow-right"
              size="30"
              class="text-[#F72585] mr-4"
            />
          </div>
        </a>
      </li>
      <li>
        <a
          href="#"
          class="flex justify-between p-2 text-gray-600 hover:bg-[#f5f7ff] rounded-lg"
        >
          <div>
            <Icon
              name="iconamoon:menu-burger-horizontal-fill"
              size="24"
              class="text-[#909090] mr-4"
            />
            <span class="font-medium text-[16px]">Отели</span>
          </div>

          <Icon
            name="material-symbols-light:keyboard-arrow-right"
            size="30"
            class="text-[#909090] mr-4"
          />
        </a>
      </li>
    </ul>
  </aside>
</template>
