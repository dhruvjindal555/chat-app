import mongoose, { models } from "mongoose";
const { Schema } = mongoose

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    profileUrl: {
        type: String,
        default: "https://res.cloudinary.com/dclyvalfg/image/upload/v1745237151/f8y3pdelwag8hyun10ai.png"
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat'
        }
    ],
    lastActive: {
        type: Date
    },
    firebaseId: {
        type: String,
        required: true
    },
    about: {
        type: String
    }
},
    { timestamps: true }
)


const User = models.User || mongoose.model('User', UserSchema)

export default User