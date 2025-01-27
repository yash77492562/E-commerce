import { NextResponse } from 'next/server';
import { getUserId } from '../../userId/userID';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function GET() {
    try {
        const id = await getUserId()
        
        if (!id) {
            return NextResponse.json({
                message: 'Please login to continue',
                success: false
            }, { status: 401 })
        }

        const admin = await prisma.admin.findUnique({
            where: { id },
            select: { id: true }
        })

        if (!admin) {
            return NextResponse.json({
                message: 'Access denied',
                success: false
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            message: 'Authentication successful'
        }, { status: 200 })

    } catch (error) {
        logger.error('Admin authentication error:', { error });
        return NextResponse.json({
            message: 'Unable to verify login status',
            success: false
        }, { status: 500 })
    } finally {
        await prisma.$disconnect();
    }
}