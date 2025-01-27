import { NextRequest, NextResponse } from "next/server";
import { password_update } from "../../database_update/password";

export async function POST(req: NextRequest) {  // Remove res parameter as it's not needed
    try {
        const body = await req.json(); 
        const {password} = body;
        const setPassword = password_update(password)
        if(!setPassword){
            return NextResponse.json(
                { success: false, message: "Error while setting your new password" },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Password set successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in email validation:', error);  // Added error logging
        return NextResponse.json(
            { success: false, message: "Trouble while connecting with database" },
            { status: 500 }
        );
    }
}