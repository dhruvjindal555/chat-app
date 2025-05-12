import { auth } from "@/lib/firebase/firebase.config";
import { toast } from "react-toastify";
import { create } from "zustand";

export type Contact = {
    _id: string
    chatId: string
    messages: string
    users: {
        _id: string
        firstName: string
        lastName: string
        email: string
        lastActive: string
        firebaseId: string
        profileUrl: string
        online?: boolean
    }[]
    lastMessage: {
        sender: string
        receiver: string
        message: string
        status: string
        createdAt: string
        updatedAt: string
    }
    updatedAt: string
    typing?: boolean
};

type ContactStoreType = {
    contacts: Contact[] | null
    setContacts: (contacts: Contact[]) => void

    fetchContacts: (email: string) => Promise<void>
    setTyping: (props: { from: string, isTyping: boolean }) => void

    newMessage: (message: string, fromId: string) => void

    partnerReadAllMessages: (partnerEmail: string, partnerId: string) => void

    partnerOnline: (partnerEmail: string, isOnline: boolean) => void
}

export const useContactStore = create<ContactStoreType>((set, get) => ({
    contacts: null,
    setContacts: (contacts: Contact[]) => {
        set({ contacts: contacts })
    },

    fetchContacts: async (email: string) => {
        try {
            // console.log('email',email);

            const res = await fetch(`/api/chat?userEmail=${email}`)
            // const raw = await res.text();
            // console.log('raw JSON:', raw);

            // const data = JSON.parse(raw);
            const data = await res.json();
            console.log('parsed chats:', data);


            if (!res.ok) throw new Error(data.message)

            get().setContacts(data.chats.chats)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.error(error);
            toast.error(message)
        }
    },

    setTyping: (props) => {

        const currentContacts = get().contacts;
        if (!currentContacts) return

        const newContacts = [...currentContacts]
        newContacts.forEach((e, i) => {
            const user = e.users[0].email == auth.currentUser?.email ? e.users[1] : e.users[0]

            if (user.email == props.from) {
                console.log('Got who is typing');
                newContacts[i].typing = props.isTyping
            }
        })

        set({ contacts: newContacts })
    },

    newMessage: (message: string, fromId: string) => {
        if (!auth.currentUser) return
        const chatId = fromId < auth.currentUser.uid ? fromId + auth.currentUser?.uid : auth.currentUser?.uid + fromId

        const currentContacts = get().contacts
        if (!currentContacts) return

        const contacts = [...currentContacts]
        const contactWithNewMessageIdx = currentContacts.findIndex((contact) => {
            return contact.chatId == chatId
        })

        contacts[contactWithNewMessageIdx] = {
            ...contacts[contactWithNewMessageIdx], lastMessage: {
                sender: fromId,
                receiver: auth.currentUser.uid,
                message: message,
                status: 'Delivered',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()

            }
        }

        set({ contacts: contacts })
    },

    partnerReadAllMessages: (partnerEmail: string, partnerId: string) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const chatId = partnerId < uid ? partnerId + uid : uid + partnerId;

        set((state) => {
            const contacts = state.contacts?.map(contact =>
                contact.chatId === chatId
                    ? {
                        ...contact,
                        lastMessage: { ...contact.lastMessage, status: 'Read' }
                    }
                    : contact
            );
            return contacts ? { contacts } : {};
        });

    },
    partnerOnline: (partnerEmail: string, isOnline: boolean) => {
        set((state) => {
            const updated = state.contacts?.map(contact => {
                console.log('partner is online');
                const lastMessage = { ...contact.lastMessage }
                const users = contact.users.map(user => {
                    if (user.email === partnerEmail) {
                        user.online = isOnline
                        if (isOnline) lastMessage.status = 'Delivered'
                    }
                    return user
                });
                return { ...contact, users, lastMessage };
            })

            return updated ? { contacts: [...updated] } : {}
        });
    }

}))
