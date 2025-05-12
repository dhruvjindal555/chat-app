import mongoose, { models } from "mongoose"
const { Schema } = mongoose


const ChatSchema = new Schema({
    users : [{
        type: Schema.Types.ObjectId,
        ref : 'User'
    }],
    chatId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },

}, {timestamps: true})

const Chat = models.Chat || mongoose.model('Chat', ChatSchema);
export default Chat;
