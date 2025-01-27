import { prisma } from "@repo/prisma_database/client";
import * as argon2 from "argon2";

import { getUserId } from "../userId/userID";

export const password_update = async (password: string) => {
    try{
        const adminId = await getUserId();
        if(!adminId){
            return false
        }
        const hashedPassword = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4
        });
      
        await prisma.user.update({
          where: {
            id: adminId 
          },
          data: {
            password: hashedPassword
          }
        });
        return true
    }catch(error){
        return false
    }
};