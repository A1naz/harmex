import { MenuSection } from "./types";

export const menuData = new Map<number, MenuSection>([
    [1000, {
        subTitle: 'Продвижение товаров',
        items: [
            { id: 1, title: "Выкупы", icon: "fluent:payment-24-filled", href: "/buyouts" },
            { id: 2, title: "Доставки", icon: "fluent:box-24-filled", href: "/delivery" },
            { id: 3, title: "Отзывы", icon: "fluent:comment-24-filled", href: "/reviews" },
        ]
    }],
    [2000, {
        subTitle: 'Улучшение репутации',
        items: [
            { id: 1, title: "Лайки на отзывы", icon: "fluent:thumb-like-24-filled", href: "/likes" },
            { id: 2, title: "Лайки на товар / бренд", icon: "fluent:heart-24-filled", href: "/productlikes" },
            { id: 3, title: "Вопросы", icon: "fluent:chat-bubbles-question-24-filled", href: "/questions" },
            { id: 4, title: "Корзина", icon: "fluent:cart-24-filled", href: "/cart" },
            { id: 5, title: "Автоответчик на отзывы", icon: "fluent:phone-chat-24-filled", href: "/autoanswer" },
        ]
    }],
    [3000, {
        subTitle: 'Дополнительно',
        items: [
            { id: 1, title: "История платежей", icon: "fluent:history-24-filled", href: "/paymenthistory" },
            { id: 2, title: "Отчеты по выкупам", icon: "fluent:document-bullet-list-24-filled", href: "/reports" },
            { id: 3, title: "Партнерская программа", icon: "fluent:people-team-24-filled", href: "/partner" },
            { id: 4, title: "Аналитика", icon: "mdi:google-analytics", href: "/stats?type=all&period=today" },
            { id: 5, title: "Моя команда", icon: "mdi:office-building-cog", href: "/team" },
        ]
    }],
])
