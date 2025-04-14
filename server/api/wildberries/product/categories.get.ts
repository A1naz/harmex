import fs from "node:fs";

function formatWBCategories(categories) {
  // Рекурсивная функция для обработки категорий
  function processCategory(category) {
    const formattedCategory = {
      name: category.name,
      childrenOnly: category.childrenOnly || false,
    };

    // Если есть подкатегории (nodes), обрабатываем их
    if (category.nodes && category.nodes.length > 0) {
      formattedCategory.subcategories = category.nodes.map(processCategory);
    }

    return formattedCategory;
  }

  // Обрабатываем все корневые категории
  return categories.map(processCategory);
}

export default defineEventHandler(async (event) => {
  const response: any = await $fetch(
    "https://catalog.wb.ru/menu/v11/api?locale=ru&lang=ru",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response || !response.data) {
    const categoriesFromFile = fs.readFileSync(
   "./pvz/wbCategories.json",
      "utf8"
    );
    const parsed = JSON.parse(categoriesFromFile);
    return formatWBCategories(parsed.data);
  }

  return formatWBCategories(response.data);
});
