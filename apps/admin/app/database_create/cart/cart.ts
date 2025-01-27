import { prisma } from "@repo/prisma_database/client";
import { getUserId } from "../../userId/userID";

export const cart =async (productId :string)=>{
    try {
        const userId = await getUserId()
        if(!userId){
            return false
        }
        const result = await prisma.cart.create({
            data:{
                userId,
                productId
            }
        })
        return result
    }catch(error){
        return false
    }
}