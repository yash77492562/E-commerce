import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { getUserId } from '../../userId/userID';
import { decrypt } from '@repo/encrypt/client';
import logger from '../../../src/utils/logger';

export async function GET() {
    try {
        // You can add your logic here to fetch or process data
        const id = await getUserId();
        const personalInfo = await prisma.admin.findUnique({
            where: {
                id
            },
            select: {
                username: true,
                email: true,
                phone: true
            }
        });
        if (!personalInfo) {
            return NextResponse.json(
                { message: 'No data found', success: false },
                { status: 404 }
            );
        }
        const personalData = {
            username: decrypt(personalInfo.username),
            email: decrypt(personalInfo.email),
            phone: decrypt(personalInfo.phone)
        };
        return NextResponse.json(
            { message: 'Successfully retrieved data', success: true, data: personalData },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Error retrieving personal data:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve data. Please try again later.', success: false },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}