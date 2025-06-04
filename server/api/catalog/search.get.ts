import { Search } from "~/server/lib/models/Search";

function generateReplacements(input: { [key: string]: string }): { [key: string]: string } {
        const output: { [key: string]: string } = {};

        for (const [key, value] of Object.entries(input)) {
                for (let i = 1; i <= key.length; i++) {
                        const prefix = key.substring(0, i); // Получаем префикс от 1-й до полной длины ключа
                        if (!output[prefix]) {
                                output[prefix] = value; // Добавляем в выходной объект, если префикса еще нет
                        }
                }
        }

        return output;
}

const replacements = generateReplacements({
        'флауау': 'flowwow',
        'озон': 'ozon',
        'валдбериз': 'wildberries',
        'валбериз': 'wildberries',
        'валдберис': 'wildberries',
        'валберис': 'wildberries',
        'вайлдбериз': 'wildberries',
        'вайлбериз': 'wildberries',
        'вайлдберис': 'wildberries',
        'вайлберис': 'wildberries',
        'вб': 'wildberries',
        'wb': 'wildberries',
        'яндекс': 'yandexmarket',
        'маркет': 'yandexmarket',
        "яндекс маркет": 'yandexmarket',
        "маркет яндекс": 'yandexmarket',
        "яндексмаркет": 'yandexmarket',
        "маркетяндекс": 'yandexmarket',
        "yandex market": 'yandexmarket',
        "market yandex": 'yandexmarket',
        "ym": 'yandexmarket',
        "ям": 'yandexmarket',
        "золотое яблоко": 'goldapple',
        "яблоко золотое": 'goldapple',
        "финансы": 'paymenthistory',
        "партнерка": 'paymenthistory',
        "пополнение": 'paymenthistory',
        "пополнения": 'paymenthistory',
        "пополнение счета": 'paymenthistory',
        "вывод": 'paymenthistory',
        "вывод средств": 'paymenthistory',
})

export default defineEventHandler(async (event) => {
        const { query }: any = getQuery(event)

        const words = query.split(' ')
        const seenMp = new Set<string>()

        for (let i = 0; i < words.length; i++) {
                if (replacements[words[i]]) {
                        const mp = replacements[words[i]]
                        if (!seenMp.has(mp)) {
                                seenMp.add(mp)
                                words.splice(i, 1)
                                words.unshift(mp)
                        } else {
                                words.splice(i, 1)
                                i--
                        }
                }
        }
        
        const phrase = words.join('')
   
        const regex = new RegExp(phrase.trim().split(/\s+/).join('|'), 'i');

        const found = await Search.find(
                {
                        phrases: { $regex: regex },
                        disabled: { $ne: true }
                }
        ).select('-_id -__v -phrases').limit(20)

        return found
})