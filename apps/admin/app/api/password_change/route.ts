import { NextRequest, NextResponse } from "next/server";
import { password_update } from "../../database_update/password";
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password } = body;
        const setPassword = password_update(password);
        if (!setPassword) {
            return NextResponse.json(
                { success: false, message: "Error while setting your new password" },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: true, message: "Password set successfully" },
            { status: 200 }
        );

    } catch (error) {
        logger.error('Error in password change:', error);
        return NextResponse.json(
            { success: false, message: "Failed to change password. Please try again later." },
            { status: 500 }
        );
    }
}