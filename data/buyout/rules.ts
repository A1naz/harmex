interface Rule {
  id: number
  description: string
  category: number
  relies?: number
  disabled?: boolean
}
const rules: Rule[] = [{ id: 1, description: 'Добавление 1 товара конкурента', category: 1 },
  { id: 2, description: 'Добавление 2х товаров конкурентов', category: 1 },
  { id: 3, description: 'Добавление 3х товаров конкурентов', category: 1 },
  { id: 4, description: 'Находиться в карточке товара не менее 60 секунд, изучать карточку', category: 2 },
  { id: 5, description: 'Не выкупать если товар не найден в поисковой выдаче', category: 3 },
  { id: 6, description: 'Выкупать только по будням, не выкупать в выходные дни', category: 4 },
  { id: 7, description: 'Выкупать только в выходные дни', category: 4, disabled: true },
  { id: 8, description: 'Выкупать только с рекламы, если реклама не найдена - не выкупать', category: 5,disabled: true },
  { id: 9, description: 'Выкупать с рекламы, если реклама не найдена - выкупать с поиска', category: 5, disabled: true },
  { id: 10, description: 'Использовать сортировку в поиске "Популярные"', category: 6, relies: 8 },
  { id: 11, description: 'Использовать сортировку в поиске "Дешевле"', category: 6, relies: 8 },
  { id: 12, description: 'Использовать сортировку в поиске "Дороже"', category: 6, relies: 8 },
  { id: 13, description: 'Использовать сортировку в поиске "Новинки"', category: 6, relies: 8 },
  { id: 14, description: 'Использовать сортировку в поиске "С большими скидками"', category: 6, relies: 8 },
  { id: 15, description: 'Использовать сортировку в поиске "С высоким рейтингом"', category: 6, relies: 8 },
]
export { rules }
export type { Rule }
