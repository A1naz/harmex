import { Test } from "~/server/lib/models/WB/Test"
import { Referral } from "~/server/lib/models/Referral";
import mongoose from "mongoose";


export default eventHandler(async (event) => {
    
 const tests = await Test.find()
 const refs = await Referral.find()
return { refs, tests}
})
