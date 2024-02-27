import { Test } from "~/server/lib/models/WB/Test"
import { TestSecond } from "~/server/lib/models/OZON/TestSecond";
import { TestThird } from "~/server/lib/models/OZON/TestSecondThird";;
import { Referral } from "~/server/lib/models/Referral";
import mongoose from "mongoose";


export default eventHandler(async (event) => {
    
 const tests = await Test.find()
 const refs = await Referral.find()
 const test2 = await TestSecond.find()
 const test3 = await TestThird.find()
return { refs, tests, test2, test3 }
})
