import Message from "@/models/MessageSchema";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const { id, status }: { id: string[], status: string } = await req.json()
        console.log(id);
        if (id.length < 1) return NextResponse.json({
            message: 'ok'
        }, { status: 200 })

        id.forEach(async (_id) => {
            const message = await Message.findById(_id)
            if (!message) {
                return NextResponse.json({
                    error: 'Message not found'
                }, { status: 404 })
            }

            message.status = status
            await message.save();
        })


        return NextResponse.json({
            message: 'ok'
        }, { status: 200 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}