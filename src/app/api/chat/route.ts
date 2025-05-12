import dbConnect from "@/lib/dbConnect";
import User from "@/models/UserSchema";
import { NextRequest } from "next/server";
import '@/models/ChatSchema'
import '@/models/MessageSchema'

// Get all chats with this user
export async function GET(req: NextRequest) {
    try {
        await dbConnect()
        const userEmail = req.nextUrl.searchParams.get('userEmail')

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return new Response(JSON.stringify({
                message: "User doesn't exist with this user id"
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        if (!user.chats || Array.from(user.chats).length == 0) {
            return new Response(
                JSON.stringify({
                    chats: []
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        let userChats = await user.populate(
            {
                path: 'chats',
                populate: [
                    { path: 'users' },
                    { path: 'lastMessage' }
                ]
            })



        await user.save()
        return new Response(
            JSON.stringify({
                chats: userChats
            }),
            {
                status: 201, // 201 = Created
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify({
                message: "An error occurred while fetching the chats",
                error: error instanceof Error ? error.message : error,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}




