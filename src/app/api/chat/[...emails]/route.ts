import dbConnect from '@/lib/dbConnect';
import Chat from '@/models/ChatSchema';
import '@/models/MessageSchema'
import User from '@/models/UserSchema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ emails: string[] }> }
) {
    try {
        const { emails } = await context.params;
        const [senderEmail, receiverEmail] = emails;
        if (!senderEmail || !receiverEmail) {
            return NextResponse.json({ error: 'Both emails are required' }, { status: 400 });
        }

        await dbConnect();

        const sender = await User.findOne({ email: senderEmail });
        const receiver = await User.findOne({ email: receiverEmail });

        if (!sender || !receiver) {
            return NextResponse.json({ error: "User doesn't exist with this email id" }, { status: 404 });
        }

        let chatId =
            sender.firebaseId > receiver.firebaseId
                ? receiver.firebaseId + sender.firebaseId
                : sender.firebaseId + receiver.firebaseId;

        const chat = await Chat.findOne({ chatId });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const populatedChat = await chat.populate([            
            { path: 'users' },
            { path: 'messages' },
            { path: 'lastMessage' }
        ]);

        return NextResponse.json({
            chat: populatedChat,
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
