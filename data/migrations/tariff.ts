import { TariffTypeEnum } from '~/data/enums';
import { Plans } from '~/server/lib/models/Plans';
import { User } from '~~/server/lib/models/User';
import { ITariff } from '~/data/types';

const tariff: ITariff = {
    buyouts: { type: TariffTypeEnum.price, value: 100},
    deliveryStorage: { type: TariffTypeEnum.price, value: 25},
    review: { type: TariffTypeEnum.price, value: 40},
    likeReview: { type: TariffTypeEnum.price, value: 5},
    likeProduct: { type: TariffTypeEnum.price, value: 5},
    questionProduct: { type: TariffTypeEnum.price, value: 7},
    cart: { type: TariffTypeEnum.price, value: 5},
    autoAnswer: { type: TariffTypeEnum.price, value: 100},
}

const planNew = new Plans({
    name: 'Standart',
    tariff: tariff
})

// Stage 1
export async function standartPlan(){
    try{
        const plan = await Plans.findOne({name: 'Standart'})
        if(!plan) await planNew.save()
    }
    catch(e: any){
        throw Error(e)
    }
}

// Stage 2
export async function setupTariffForAllUsers(){
    try{
        await User.updateMany(
            { 
                // username: 'vasyutenko2015',
                roles: { $nin: [ 'staff' ] } // SHOULD BE NOT STAFF
            }, 
            { $set: { tariff: tariff } }
        )
    }
    catch(e: any){
        throw Error(e)
    }
}
