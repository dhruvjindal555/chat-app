import React, { useEffect, useRef, useState } from 'react'
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useUserProfileStore } from '@/store/UserProfileStore';
import { Message, useMessageStore } from '@/store/MessageStore';
import { auth } from '@/lib/firebase/firebase.config';
import ChatBubble from '@/components/ChatBubble';
import TypingBubble from '@/components/TypingBubble';

const ChatBox = (props: {
    getChatSeparator: (date: Date) => string
}) => {
    const completeChatDetails = useMessageStore((state) => state.completeChatDetails)
    const selected = useUserProfileStore((state) => state.selected)



    const bottomRef = useRef<HTMLDivElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const chatMessages = [...(completeChatDetails?.messages || [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );



    useEffect(() => {
        const c = containerRef.current;
        if (!c) return;

        const ro = new ResizeObserver(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
        ro.observe(c);

        return () => ro.disconnect();
    }, []);



    return (
        <div className="flex-1 overflow-auto bg-white">
            <div className="p-6 flex flex-col space-y-4">
                <div ref={containerRef} className='w-full flex flex-col' >
                    {selected ?
                        (chatMessages.length > 0 ?
                            (chatMessages.map((msg, i) => {
                                let showDate = false
                                let display = ""
                                if (i + 1 < chatMessages.length && new Date(msg.createdAt).getDate() != new Date(chatMessages[i + 1].createdAt).getDate()) {
                                    const nextDate = new Date(chatMessages[i + 1].createdAt);
                                    showDate = true;
                                    display = props.getChatSeparator(nextDate)
                                }
                                const isSelf = msg.sender === auth.currentUser?.uid;

                                return (
                                    <React.Fragment key={msg.createdAt + String(i)}>
                                        {i == 0 &&
                                            <div
                                                key={display}
                                                className='text-xs self-center bg-gray-200 px-3 py-1 my-2 rounded-lg'>
                                                {props.getChatSeparator(new Date(msg.createdAt))}
                                            </div>}
                                        <ChatBubble
                                            key={msg.createdAt}
                                            msg={msg}
                                            i={i}
                                            isSelf={isSelf}
                                            showDate={showDate}
                                            display={display}
                                        />
                                        {i == chatMessages.length - 1 && selected != "profile" &&
                                            selected.isTyping && <TypingBubble key={selected.firebaseId} />
                                        }
                                    </React.Fragment>
                                )
                            }))

                            :
                            (<div className="p-6 text-center text-gray-500">
                                Start chatting now.
                            </div>)
                        )
                        :
                        (<div className="p-6 text-center text-gray-500">
                            Choose a contact to start chatting.
                        </div>)}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatBox
