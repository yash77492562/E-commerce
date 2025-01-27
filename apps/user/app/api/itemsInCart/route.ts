import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { getUserId } from '../../userId/userID';

export async function GET() {
    try {
        const id = await getUserId()
        if(!id){
            return NextResponse.json({
                message:'Login to view items in cart',
                success:false
            },{status:400})
        }
        const userId = await prisma.user.findUnique({
            where:{
                id
            },
            select:{
                id:true
            }
        })
        if(!userId){
            return NextResponse.json({
                message:'Login to view items in cart',
                success:false
            },{status:400})
        }
        const count = await prisma.cart.count({
            where:{
                userId: userId.id
            }
        });
        
        return NextResponse.json({
            count: count,
            success: true
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: 'Error counting items',
            success: false
        }, { status: 500 });
    }
}