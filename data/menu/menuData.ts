import { MenuSectionList, MenuDataList } from "./types";

export const menuSectionList: MenuSectionList[] = [
    { section: 'products', subTitle: 'Продвижение' },
    { section: 'reputation', subTitle: 'Рейтинг' },
    { section: 'additional', subTitle: 'Дополнительно' },
    // { section: 'bidder', subTitle: 'Биддер' },
]

export const menuDataList: MenuDataList[] = [
    { section: 'products', path: "/buyouts", title: "Выкупы", icon: "ph:wallet-fill" },
    { section: 'products', path: "/delivery", title: "Доставки", icon: "solar:box-minimalistic-bold" },
    { section: 'products', path: "/reviews", title: "Отзывы", icon: "bxs:message-detail" },
    { section: 'reputation', path: "/likes", title: "Лайки на отзывы", icon: "fa-solid:thumbs-up" },
    { section: 'reputation', path: "/productlikes", title: "Лайки на товар / бренд", icon: "fluent:heart-24-filled" },
    { section: 'reputation', path: "/questions", title: "Вопросы", icon: "fa-solid:question-circle" },
    { section: 'reputation', path: "/cart", title: "Корзина", icon: "solar:cart-large-minimalistic-bold" },
    { section: 'reputation', path: "/autoanswer", title: "Автоответчик на отзывы", icon: "fluent:phone-chat-24-filled" },
    { section: 'additional', path: "/paymenthistory", title: "Финансы", icon: "fa-solid:coins" },
    { section: 'additional', path: "/reports", title: "Отчеты", icon: "lets-icons:file-dock-fill" },
    { section: 'additional', path: "/partner", title: "Партнерка", icon: "mdi:handshake" },
    { section: 'additional', path: "/stats", title: "Аналитика", icon: "mdi:google-analytics" },
    { section: 'additional', path: "/team", title: "Моя команда", icon: "fluent:people-team-16-filled" },
    // { section: 'bidder', path: "/campaigns", title: "Рекламные кампании", icon: "mdi:briefcase" },
]

