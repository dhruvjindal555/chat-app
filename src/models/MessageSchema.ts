import mongoose, { models } from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: {
      type: String, // Firebase UID
      required: true,
    },
    receiver: {
      type: String, // Firebase UID
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum:['Sent', 'Delivered', 'Read'],
      default:'Sent'
    },
  },
  { timestamps: true } 
);

const Message = models.Message || mongoose.model("Message", MessageSchema);
export default Message;
