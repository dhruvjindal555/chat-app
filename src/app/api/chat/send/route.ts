import dbConnect from "@/lib/dbConnect";
import Chat from "@/models/ChatSchema";
import Message from "@/models/MessageSchema";
import User from "@/models/UserSchema";

// Get chat and if not exist create one
export async function POST(req: Request) {
    try {
        await dbConnect();

        const body: {
            receiver: string;
            message: string;
            sender: string; // sender email
            status: string;
        } = await req.json();

        const sender = await User.findOne({ email: body.sender });
        const receiver = await User.findOne({ email: body.receiver });

        if (!sender || !receiver) {
            return new Response(
                JSON.stringify({ message: "User doesn't exist with this email id" }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const newMessage = await Message.create({
            sender: sender.firebaseId,
            receiver: receiver.firebaseId,
            message: body.message,
            status: body.status,
        });


        let chatId =
            sender.firebaseId > receiver.firebaseId
                ? receiver.firebaseId + sender.firebaseId
                : sender.firebaseId + receiver.firebaseId;


        let chat = await Chat.findOne({ chatId });

        if (!chat) {
            console.log("Chat doesn't exist, creating one.");
            chat = await Chat.create({
                chatId,
                users: [sender._id, receiver._id], // Store _id refs here
                messages: [newMessage._id],
                lastMessage: newMessage._id,
            });
        } else {

            await Chat.findOneAndUpdate(
                { chatId },
                {
                    $push: { messages: newMessage._id },
                    $set: { lastMessage: newMessage._id },
                },
                { new: true }
            );
        }

        // ensure chat is linked to both users if not already
        const updatedSender = await User.findById(sender._id).populate("chats");
        const chatExistsInSender = updatedSender.chats.some(
            (c: any) => c.chatId === chatId
        );

        if (!chatExistsInSender) {
            sender.chats.push(chat._id);
            receiver.chats.push(chat._id);
            await sender.save();
            await receiver.save();
        }

        return new Response(
            JSON.stringify({ newMessage }),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({
                message: "An error occurred while sending the message.",
                error: error instanceof Error ? error.message : error,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
