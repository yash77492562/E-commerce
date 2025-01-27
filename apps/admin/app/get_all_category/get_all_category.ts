import { prisma } from "@repo/prisma_database/client";

export const getAllCategory = async ()=>{
    try{
        const result = await prisma.product.findMany({
            select:{
                category:true,
                subCategory:true,
            }
        });
        if(!result){
            return {message:'error while getting details'}
        }
        return {data:result}
    }catch(error){
        return {message:'error while connecting with server'}
    }
}