import TypingDots from '@/components/TypingDots';
import { auth } from '@/lib/firebase/firebase.config';
import { cn } from '@/lib/utils';
import { Contact, useContactStore } from '@/store/ContactStore';
import { useMessageStore } from '@/store/MessageStore';
import { useSocketStore } from '@/store/SocketStore';
import { noProfile, Selection, useUserProfileStore } from '@/store/UserProfileStore';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'


const Sidebar = () => {
    const selected: Selection = useUserProfileStore((state) => state.selected)
    const setSelected = useUserProfileStore((state) => state.setSelected)

    const userReadAllMessages = useMessageStore((state)=> state.userReadAllMessages)
    const getAllMessages = useMessageStore((state) => state.getAllMessages)

    const contacts: Contact[] | null = useContactStore((state) => state.contacts)

    const [search, setSearch] = useState("");
    // const filtered = contacts.filter(c =>
    //     c.email.toLowerCase().includes(search.toLowerCase()) ||
    //     c.name.toLowerCase().includes(search.toLowerCase())
    // );




    return (
        <div className="w-1/3 flex flex-col h-full bg-gray-50 border-l border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Search contacts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="flex-1 overflow-auto">
                {contacts && contacts.map(contact => {
                    const lastMessageCreatedAt = new Date(contact.lastMessage.createdAt)
                    const user = contact.users[0].email == auth.currentUser?.email ? contact.users[1] : contact.users[0]

                    const lastMessageDay = lastMessageCreatedAt.toDateString().split(' ')[0]
                    const lastMessageDate = lastMessageCreatedAt.toLocaleDateString()

                    const lastMessageTime = lastMessageCreatedAt.toLocaleTimeString().split(':')[0] + ":" + lastMessageCreatedAt.toLocaleTimeString().split(':')[1] + " " + lastMessageCreatedAt.toLocaleTimeString().split(' ')[1]

                    let lastMessageTimeDisplay = lastMessageDay + " " + lastMessageDate.split('/').join('-');

                    if (lastMessageDay == new Date().toDateString().split(' ')[0]) {
                        lastMessageTimeDisplay = lastMessageTime
                    }

                    return (
                        <div
                            key={contact._id}
                            onClick={async () => {
                                await getAllMessages(user.email, auth.currentUser?.email || "")
                                setSelected({ ...user, online: user.online ? user.online : false, isTyping : contact.typing })
                                console.log(user);
                                userReadAllMessages(user.email)
                            }}
                            className={cn('px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center gap-x-3'
                                , `${selected !== 'profile' && user.email == selected?.email ? "bg-blue-200 hover:bg-blue-100 " : ""}`)}
                        >
                            <img src={user.profileUrl ? user.profileUrl : noProfile}
                                alt={user.firstName} className="w-10 h-10 rounded-full" />
                            <div className='w-full '>
                                <div className='flex justify-between items-center'>
                                    <div className="font-medium">{user.firstName + " " + user.lastName}</div>
                                    <div className='text-xs text-gray-600'>{lastMessageTimeDisplay} </div>
                                </div>
                                {!contact.typing
                                    &&
                                    <>
                                        {contact.lastMessage.sender == auth.currentUser?.uid && (
                                            <span className="mr-1 inline-block text-gray-500 font-semibold">
                                                {contact.lastMessage.status === 'Sent' && '✓'}
                                                {contact.lastMessage.status === 'Delivered' && '✓✓'}
                                                {contact.lastMessage.status === 'Read' && (
                                                    <span className="text-green-400 ">✓✓</span>
                                                )}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 truncate">
                                            {String(contact.lastMessage.message).length > 30 ? String(contact.lastMessage.message).slice(0, 30) + "..." : contact.lastMessage.message}
                                        </span>
                                    </>
                                }
                                {contact.typing && <TypingDots />}
                                {/* <div className="text-sm text-gray-500 truncate">{user.email}</div> */}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => setSelected("profile")}
                    className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                    My Profile
                </button>
            </div>
        </div>
    )
}

export default Sidebar