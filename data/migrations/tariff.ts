import { TariffTypeEnum } from '~/data/enums';
import { Plans } from '~/server/lib/models/Plans';

export async function standartPlan(){

    const planNew = new Plans({
        name: 'Standart',
        tariff: {
            buyouts: { type: TariffTypeEnum.price, value: 100},
            deliveryStorage: { type: TariffTypeEnum.price, value: 25},
            review: { type: TariffTypeEnum.price, value: 40},
            likeReview: { type: TariffTypeEnum.price, value: 5},
            likeProduct: { type: TariffTypeEnum.price, value: 5},
            questionProduct: { type: TariffTypeEnum.price, value: 7},
            addToBasket: { type: TariffTypeEnum.price, value: 5},
            autoAnswer: { type: TariffTypeEnum.price, value: 100},
        }
    } )

    try{
        await planNew.save()
    }
    catch(e: any){
        throw Error(e)
    }
    
}
