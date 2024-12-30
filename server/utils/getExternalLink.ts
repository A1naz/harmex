export default function getMPLink(mp: string, article: any) {
        if (mp === 'wildberries') {
                return 'EXTERNALHREF||https://www.wildberries.ru/catalog/' + article + '/detail.aspx'
        }
        if (mp === 'ozon') {
                return 'EXTERNALHREF||https://www.ozon.ru/product/' + article
        } else return article
}