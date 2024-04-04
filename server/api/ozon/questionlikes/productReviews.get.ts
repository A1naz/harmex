import { getServerSession } from '#auth'
import request from 'request'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
const elPerPage = 50
const apiKey = config.serverLoadApiKey

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const { article, limit, page } = getQuery(event)

  if (!article) {
    return send(event, {
      status: 400,
      body: 'Article is required',
    })
  }

  // const data: any = await $fetch('http://95.163.249.133:4141', {
  //   method: 'POST',
  //   parseResponse: JSON.parse,
  //   body: {
  //     type: 'ozonQuestions',
  //     url: `https://www.ozon.ru/product/${article}/`,
  //     count: elPerPage,
  //   },
  // })

  // if (!data || data.status === 'error') {
  //   return {
  //     feedbacks: [],
  //     feedbacksCount: 0,
  //   }
  // }

  const data = [
    {
        "id": 234751283,
        "question": {
            "author": "Раскильдин Д.",
            "text": "Уже 11:11 Где фиолетовая и чёрная расцветка? И ещё вопрос если закажу фиолетовую то на каких свитчах они",
            "createdAt": "7 ноября 2023",
            "likes": 2
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, фиолетовый и черный цвета появились на полках магазинов 11 числа, но запасы были распроданы в тот же день",
            "createdAt": "16 ноября 2023",
            "likes": 3,
            "dislikes": 2
        }
    },
    {
        "id": 236928767,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Есть ли в комплекте Пуллер для свитчей",
            "createdAt": "16 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, они входят в комплект",
            "createdAt": "23 ноября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 237845082,
        "question": {
            "author": "Мурат А.",
            "text": "Когда появится в наличии",
            "createdAt": "21 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, точное время пока не определено.",
            "createdAt": "23 ноября 2023",
            "likes": 0,
            "dislikes": 1
        }
    },
    {
        "id": 238419388,
        "question": {
            "author": "Иван Никишин",
            "text": "А будет эта клавиатура без PRO? Или только есть на складе прошки?",
            "createdAt": "23 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, есть и другие версии",
            "createdAt": "4 декабря 2023",
            "likes": 2,
            "dislikes": 3
        }
    },
    {
        "id": 238475045,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Здравствуйте, это клавиатура версии pro или обычная и чем они отличаются?",
            "createdAt": "24 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, в версии PRO есть функция беспроводной связи, и переключатель работает лучше.",
            "createdAt": "4 декабря 2023",
            "likes": 0,
            "dislikes": 3
        }
    },
    {
        "id": 240121788,
        "question": {
            "author": "Богдан С.",
            "text": "А есть софт(программа для настраивания подцветки и запрограммирован я клавиш)?",
            "createdAt": "1 декабря 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, вы можете скачать программное обеспечение с официального сайта",
            "createdAt": "4 декабря 2023",
            "likes": 3,
            "dislikes": 0
        }
    },
    {
        "id": 243868215,
        "question": {
            "author": "Саматов М.",
            "text": "Какие свитчи на Grey+White?",
            "createdAt": "20 декабря 2023",
            "likes": 5
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуй, красный выключатель.",
            "createdAt": "21 декабря 2023",
            "likes": 11,
            "dislikes": 3
        }
    },
    {
        "id": 246304582,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Здраствуйте, как определить по картинке с зеленой клавиатурой pro версия или обычная",
            "createdAt": "5 января 2024",
            "likes": 0
        },
        "answer": {
            "author": "Ян К.",
            "text": "На pro на картинке будет экранчик и дороже стоимость.",
            "createdAt": "6 февраля 2024",
            "likes": 4,
            "dislikes": 1
        }
    },
    {
        "id": 251547302,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "На картинках товара правильно указаны переключатели?",
            "createdAt": "3 февраля 2024",
            "likes": 0
        },
        "answer": {
            "author": "Кирилл К.",
            "text": "да",
            "createdAt": "12 февраля 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 254679086,
        "question": {
            "author": "Вадим К.",
            "text": "Здравствуйте, у модели ak820 pro hot swap 5pin или 3pin?",
            "createdAt": "19 февраля 2024",
            "likes": 0
        },
        "answer": {
            "author": "Лучан Ч.",
            "text": "5 пин, подходит и для 4 пин",
            "createdAt": "25 февраля 2024",
            "likes": 3,
            "dislikes": 1
        }
    },
    {
        "id": 232243637,
        "question": {
            "author": "Амаяк Б.",
            "text": "Здравствуйте а какие светчи gateron yellow?",
            "createdAt": "24 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "RGB-подсветка, возможность регулировки нескольких цветов освещения",
            "createdAt": "26 октября 2023",
            "likes": 0,
            "dislikes": 12
        }
    },
    {
        "id": 232247954,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "здравствуйте а на серо желтой версии какие переключатели gateron yellow?",
            "createdAt": "24 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте,Линейные переключатели",
            "createdAt": "26 октября 2023",
            "likes": 0,
            "dislikes": 3
        }
    },
    {
        "id": 232563826,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "А линейные переключатели на серо желтой клавиатуре желтые?",
            "createdAt": "26 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, да.",
            "createdAt": "28 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 233090668,
        "question": {
            "author": "Андрей С.",
            "text": "Добрый день! Подскажите по шумоизоляции, что в ней за шумка и есть ли она вообще?",
            "createdAt": "29 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, изделие имеет пять слоев прокладки, что эффективно снижает шум, создаваемый клавишными переключателями",
            "createdAt": "31 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 233751256,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Какие типы подключения есть?",
            "createdAt": "1 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, версия PRO имеет три режима подключения: Bluetooth/2.4G приемник/USB, все остальные версии имеют USB подключение",
            "createdAt": "4 ноября 2023",
            "likes": 6,
            "dislikes": 0
        }
    },
    {
        "id": 233762973,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Какие свитчи на клавиатуре?",
            "createdAt": "1 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Переключатели клавиш с различными ощущениями и звучанием",
            "createdAt": "4 ноября 2023",
            "likes": 0,
            "dislikes": 16
        }
    },
    {
        "id": 234092703,
        "question": {
            "author": "Антон С.",
            "text": "Есть софт?",
            "createdAt": "3 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, вы можете скачать программу с официального сайта",
            "createdAt": "4 ноября 2023",
            "likes": 0,
            "dislikes": 3
        }
    },
    {
        "id": 234904071,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Здравствуйте Подскажите а какие здесь свитчи стоят?",
            "createdAt": "7 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, выключатель изготавливается по индивидуальному заказу, информацию вы можете увидеть на главной картинке",
            "createdAt": "16 ноября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 236216486,
        "question": {
            "author": "Владислав Н.",
            "text": "Будет ли в будущем времени, пополнение, количества клавиатур? В белом и фиолетовом цвете,не про версии?",
            "createdAt": "13 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, будут",
            "createdAt": "20 ноября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 236820898,
        "question": {
            "author": "Рамиль А.",
            "text": "Добрый день! Что входит в комплект?",
            "createdAt": "16 ноября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Клавиатура, кабель передачи данных, съемник клавиш, руководство по эксплуатации",
            "createdAt": "23 ноября 2023",
            "likes": 4,
            "dislikes": 0
        }
    },
    {
        "id": 230598438,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Какие есть подключения у клавиатуры?",
            "createdAt": "15 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, черный цвет имеет только USB подключение",
            "createdAt": "16 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 230600807,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Какое подключение?",
            "createdAt": "15 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, черный цвет - это USB-соединение",
            "createdAt": "19 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 231068130,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "А чёрная клавиатура имеет подсвеку?",
            "createdAt": "17 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, есть подсветка",
            "createdAt": "19 октября 2023",
            "likes": 1,
            "dislikes": 0
        }
    },
    {
        "id": 231160482,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Какие свитчи стоят в черной клавиатуре?",
            "createdAt": "18 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуй, красный выключатель.",
            "createdAt": "19 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 231247375,
        "question": {
            "author": "Антон Ч.",
            "text": "есть ли програмное обеспичение ?",
            "createdAt": "18 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, вы можете скачать программное обеспечение с официального сайта",
            "createdAt": "19 октября 2023",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 231418052,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Есть ли хотсвап на клавиатуре?",
            "createdAt": "19 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, есть функция горячей замены",
            "createdAt": "21 октября 2023",
            "likes": 3,
            "dislikes": 0
        }
    },
    {
        "id": 231694162,
        "question": {
            "author": "Ильдар К.",
            "text": "Добрый день, товар оригинальный?",
            "createdAt": "21 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, да.",
            "createdAt": "24 октября 2023",
            "likes": 1,
            "dislikes": 1
        }
    },
    {
        "id": 231877526,
        "question": {
            "author": "Альви А.",
            "text": "Здравствуйте, черная клавиатура беспроводная??",
            "createdAt": "22 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, подключение по USB\nPRO является беспроводным.",
            "createdAt": "24 октября 2023",
            "likes": 1,
            "dislikes": 0
        }
    },
    {
        "id": 232012206,
        "question": {
            "author": "Леонид В.",
            "text": "Когда появиться в продаже версия с экраном?",
            "createdAt": "23 октября 2023",
            "likes": 0
        },
        "answer": {
            "author": "AJAZZ",
            "text": "Здравствуйте, в настоящее время он продается, для экранной версии вы можете выбрать зеленую PRO-версию",
            "createdAt": "24 октября 2023",
            "likes": 1,
            "dislikes": 1
        }
    },
    {
        "id": 248542021,
        "question": {
            "author": "Пользователь OZON",
            "text": "Есть русская расскладка?",
            "createdAt": "17 января 2024",
            "likes": 4
        },
        "answer": {
            "author": "Александр Т.",
            "text": "нет",
            "createdAt": "25 января 2024",
            "likes": 1,
            "dislikes": 0
        }
    },
    {
        "id": 249497530,
        "question": {
            "author": "Муслим А.",
            "text": "Какие свитчи у White+Grey?",
            "createdAt": "23 января 2024",
            "likes": 1
        },
        "answer": {
            "author": "Alara",
            "text": "ajazz as 101 yellow switch, тактильные, +-55 г. нажатия",
            "createdAt": "2 февраля 2024",
            "likes": 4,
            "dislikes": 0
        }
    },
    {
        "id": 254072183,
        "question": {
            "author": "Игнатьев Е.",
            "text": "Здравствуйте ,  когда появится клавиатура с русской раскладкой ?",
            "createdAt": "16 февраля 2024",
            "likes": 1
        },
        "answer": {
            "author": "Антон Б.",
            "text": "никогда?",
            "createdAt": "19 февраля 2024",
            "likes": 3,
            "dislikes": 0
        }
    },
    {
        "id": 258109735,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "а на клавиатуре с цветом gray+white ,там какие свитчи стоят?и да,на трех клавах (которая желто серая ,фиолетовая,зеленая )на каких из них самый тихий тайпинг ,ну или самые тихие свичи?",
            "createdAt": "8 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "красные",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 258204798,
        "question": {
            "author": "Александр К.",
            "text": "Добрый день \nХочу расцветку серо бело желтый\nЧтоб там был экранчик \nНо в выборе его не вижу \nОни по умолчанию с ним идут?",
            "createdAt": "8 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Вадим Д.",
            "text": "С экранчиком это AK820 PRO, без экранчика AK 820.",
            "createdAt": "9 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 258229745,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "клавиатура, про версия белый свет, хот свап, проводное подключение, экран будет же, верно?",
            "createdAt": "8 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Руслан С.",
            "text": "Не будет",
            "createdAt": "14 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 258952889,
        "question": {
            "author": "Елена П.",
            "text": "как поставить запятую на русской раскладке?",
            "createdAt": "12 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "перекл на англ и пишешь",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 259040938,
        "question": {
            "author": "Баганд М.",
            "text": "Здравствуйте, а в светло-серый расцветке подсветка rgb или только белая?",
            "createdAt": "12 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Руслан С.",
            "text": "Только белая",
            "createdAt": "14 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 259088652,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Можно отключить подсветку?",
            "createdAt": "13 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Дмитрий Е.",
            "text": "Да",
            "createdAt": "20 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 259799500,
        "question": {
            "author": "Данила Г.",
            "text": "здравствуйте как менять режим подсветки?",
            "createdAt": "16 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "fn + \\| (кнопка слева PgUp либо через софт)",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 259821236,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Что то нажал на клавиатуре и теперь при нажатии альт нажимается вин, а при нажатии вин, нажимается альт. Как можно перебидить обратно?",
            "createdAt": "16 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Дмитрий Е.",
            "text": "Через софт",
            "createdAt": "20 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 255668442,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "Здравствуйте , а у этой клавиатуры есть экранчик?  Если нету то у каких он есть , просто до конца не понимаю где есть , а где его нету",
            "createdAt": "24 февраля 2024",
            "likes": 0
        },
        "answer": {
            "author": "константин к.",
            "text": "на  фото  где  есть экранчик   там есть",
            "createdAt": "2 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 256296869,
        "question": {
            "author": "Максим Ш.",
            "text": "Что означает надпись сверху картинки \"профессиональная версия\"?\nТо, что это версия pro с экраном?",
            "createdAt": "27 февраля 2024",
            "likes": 0
        },
        "answer": {
            "author": "константин к.",
            "text": "нет",
            "createdAt": "2 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 256982940,
        "question": {
            "author": "Никита Б.",
            "text": "Снимается ли кабель у обычной версии?",
            "createdAt": "2 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "константин к.",
            "text": "да",
            "createdAt": "2 марта 2024",
            "likes": 1,
            "dislikes": 0
        }
    },
    {
        "id": 256996424,
        "question": {
            "author": "Владислав Б.",
            "text": "Какая задержка нажатия?",
            "createdAt": "2 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "до 10 мс",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 257114119,
        "question": {
            "author": "Данила Ж.",
            "text": "А имеется софт?",
            "createdAt": "3 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "да",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 257179360,
        "question": {
            "author": "Андрей Ч.",
            "text": "а на всех моделях одинаковые свитчи? если да, то какие ?",
            "createdAt": "3 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Лариса Г.",
            "text": "Нет заказали полностью белую пришли синие свитчи я разочаровался по отзывам смотрите у какой версии какие свитчи",
            "createdAt": "3 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 257441998,
        "question": {
            "author": "Гармаев А.",
            "text": "Какие свитчи поддерживает клавиатура?",
            "createdAt": "4 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "westmorell",
            "text": "у нее хот свап, а с завода красные стоят",
            "createdAt": "27 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 257813518,
        "question": {
            "author": "Пользователь предпочёл скрыть свои данные",
            "text": "какие свитчи на клавиатуре в черном свете , с пометкой \"базовая\"?",
            "createdAt": "6 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "пупок н.",
            "text": "красные",
            "createdAt": "9 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    },
    {
        "id": 257858264,
        "question": {
            "author": "Денис Н.",
            "text": "Какие свитчи на White",
            "createdAt": "6 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "Лариса Г.",
            "text": "Синие",
            "createdAt": "6 марта 2024",
            "likes": 1,
            "dislikes": 0
        }
    },
    {
        "id": 258030249,
        "question": {
            "author": "Андрей С.",
            "text": "Какой сокет у свитча у клавиатуры Black без приставки pro (3pin или 5pin)?\nС какой стороны находится светодиод?",
            "createdAt": "7 марта 2024",
            "likes": 0
        },
        "answer": {
            "author": "пупок н.",
            "text": "3 pin",
            "createdAt": "9 марта 2024",
            "likes": 0,
            "dislikes": 0
        }
    }
]

data.forEach((feedback) => {
  feedback.answer.addLikes = 0;
  feedback.answer.addDislikes = 0;
});



  return {
    feedbacks: data,
    feedbacksCount: 0,
  }
})
