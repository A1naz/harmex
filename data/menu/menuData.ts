import { MenuSectionList, MenuDataList } from "./types";

export const menuSectionList: MenuSectionList[] = [
    { section: 'products', subTitle: 'Продвижение товаров' },
    { section: 'reputation', subTitle: 'Улучшение репутации' },
    { section: 'additional', subTitle: 'Дополнительно' },
    // { section: 'bidder', subTitle: 'Биддер' },
]

export const menuDataList: MenuDataList[] = [
    { section: 'products', path: "/buyouts", title: "Выкупы", icon: "fluent:payment-24-filled" },
    { section: 'products', path: "/delivery", title: "Доставки", icon: "fluent:box-24-filled" },
    { section: 'products', path: "/reviews", title: "Отзывы", icon: "fluent:comment-24-filled" },
    { section: 'reputation', path: "/likes", title: "Лайки на отзывы", icon: "fluent:thumb-like-24-filled" },
    { section: 'reputation', path: "/productlikes", title: "Лайки на товар / бренд", icon: "fluent:heart-24-filled" },
    { section: 'reputation', path: "/questions", title: "Вопросы", icon: "fluent:chat-bubbles-question-24-filled" },
    { section: 'reputation', path: "/cart", title: "Корзина", icon: "fluent:cart-24-filled" },
    { section: 'reputation', path: "/autoanswer", title: "Автоответчик на отзывы", icon: "fluent:phone-chat-24-filled" },
    { section: 'additional', path: "/paymenthistory", title: "Финансы", icon: "fluent:history-24-filled" },
    { section: 'additional', path: "/reports", title: "Отчеты", icon: "fluent:document-bullet-list-24-filled" },
    { section: 'additional', path: "/partner", title: "Партнерка", icon: "fluent:people-team-24-filled" },
    { section: 'additional', path: "/stats", title: "Аналитика", icon: "mdi:google-analytics" },
    { section: 'additional', path: "/team", title: "Моя команда", icon: "mdi:office-building-cog" },
    // { section: 'bidder', path: "/campaigns", title: "Рекламные кампании", icon: "mdi:briefcase" },
]
// export const menuDataList: MenuDataList[] = [
//     { section: 'products', path: "/buyouts", title: "Выкупы", icon: "buyouts" },
//     { section: 'products', path: "/delivery", title: "Доставки", icon: "delivery" },
//     { section: 'products', path: "/reviews", title: "Отзывы", icon: "reviews" },
//     { section: 'reputation', path: "/likes", title: "Лайки на отзывы", icon: "likes" },
//     { section: 'reputation', path: "/productlikes", title: "Лайки на товар / бренд", icon: "productlikes" },
//     { section: 'reputation', path: "/questions", title: "Вопросы", icon: "questions" },
//     { section: 'reputation', path: "/cart", title: "Корзина", icon: "cart" },
//     { section: 'reputation', path: "/autoanswer", title: "Автоответчик на отзывы", icon: "fluent:phone-chat-24-filled" },
//     { section: 'additional', path: "/paymenthistory", title: "Финансы", icon: "paymenthistory" },
//     { section: 'additional', path: "/reports", title: "Отчеты", icon: "reports" },
//     { section: 'additional', path: "/partner", title: "Партнерка", icon: "partner" },
//     { section: 'additional', path: "/stats", title: "Аналитика", icon: "stats" },
//     { section: 'additional', path: "/team", title: "Моя команда", icon: "team" },
//     // { section: 'bidder', path: "/campaigns", title: "Рекламные кампании", icon: "mdi:briefcase" },
// ]
