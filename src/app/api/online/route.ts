import dbConnect from "@/lib/dbConnect";
import User from "@/models/UserSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // For example, fetch data from your DB here
    try {
        await dbConnect()
        const { email } = await req.json()

        const user = await User.findOne({ email })

        if (!user) throw new Error('User does not exist')

        user.lastActive = Date.now()

        await user.save()

        return NextResponse.json({
            user: user
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : error
        }, { status: 500 })
    }


}