import { User } from "~/server/lib/models/User";

// Рабочее окно времени (МСК)
const WORK_START_HOUR = 8; // Начало работы: 8:00 утра
const WORK_END_HOUR = 13; // Конец работы: 13:00 утра
const MAX_CYCLES_PER_DAY = 5; // Максимум 5 циклов рассылки в день
const CYCLE_INTERVAL = 24 * 60 * 1000; // 24 минуты между циклами (5 циклов за 2 часа)
const START_DATE = new Date("2025-11-20T00:00:00.000Z");

// Максимальное количество писем
const MAX_EMAILS = 21;

export default eventHandler(async (event) => {
    const users = await User.find({
        registrationDate: { $gte: START_DATE },
        $or: [
            { emailAutoSentCount: { $exists: false } },
            { emailAutoSentCount: { $lt: MAX_EMAILS } },
        ],
        email: { $exists: true, $nin: [null, ""] },
        // Включаем пользователей где поле отсутствует, false или null
        disableEmailAutoSender: { $ne: true },
    });

    console.log(users.length)

    const filter = users.map((el: any) => {
        return {
            email: el.email,
            username: el.username
        }
    })

    return filter
})

