import { Buyout } from '@/server/lib/models/flowwow/Buyout'

export default async function getMPLink(mp: string, article: any) {
        if (mp === 'wildberries') {
                return 'EXTERNALHREF||https://www.wildberries.ru/catalog/' + article + '/detail.aspx'
        }
        if (mp === 'ozon') {
                return 'EXTERNALHREF||https://www.ozon.ru/product/' + article
        }
        if (mp === 'flowwow') {
                if (article.includes('Выкуп #')) {

                        const buyout: any = await Buyout.findOne({ uuid: article.replace('Выкуп #', '') })
                        if (buyout) {
                                return 'EXTERNALHREF||' + buyout?.url + '||' + buyout?.url.replace('https://', '').replace('?from=direct', '')
                        }
                }
                return 'неизвестно'
        }
        else return article
}