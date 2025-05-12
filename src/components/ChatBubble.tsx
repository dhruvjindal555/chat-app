import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from '@/store/MessageStore';

// A single chat bubble with entry animation
interface ChatBubbleProps {
    msg: Message
    i: number;
    isSelf: boolean;
    showDate: boolean
    display: string
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ msg, i, isSelf, showDate, display }) => {
    return (
        <React.Fragment >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                    "max-w-[60%] my-2 ",
                    isSelf ?
                        "self-end text-gray-900  " :
                        "self-start text-gray-900  "
                )}
            >
                <div className=
                    {cn(
                        '   px-4 py-2 rounded-full break-all',
                        isSelf ?
                            "rounded-br-none bg-blue-200" :
                            "rounded-tl-none bg-gray-200"
                    )}

                >
                    {msg.message}
                </div>
                <div className={
                    cn(
                        "text-xs  text-gray-500 mt-1",
                        isSelf ? "pr-1 text-right" : "pl-1 text-left"
                    )
                }>
                    <span>
                        {new Date(msg.createdAt).toLocaleTimeString().split(':')[0] +
                            ":" + new Date(msg.createdAt).toLocaleTimeString().split(':')[1] +
                            " " + new Date(msg.createdAt).toLocaleTimeString().split(' ')[1]}
                    </span>
                    {isSelf && (
                        <span className="ml-1 inline-block text-gray-500 font-semibold">
                            {msg.status === 'Sent' && '✓'}
                            {msg.status === 'Delivered' && '✓✓'}
                            {msg.status === 'Read' && (
                                <span className="text-green-400 ">✓✓</span> // style for 'seen'
                            )}
                        </span>
                    )}
                    {/* {" "+ new Date(msg.createdAt).toLocaleDateString()} */}
                </div>
            </motion.div>
            {showDate && <div className='text-xs self-center bg-gray-200 px-3 py-1 my-2 rounded-lg'>
                {display}
            </div>}
        </React.Fragment>
    );
};

export default ChatBubble;
