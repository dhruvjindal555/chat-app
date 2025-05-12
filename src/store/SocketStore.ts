import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { Selection, useUserProfileStore } from "./UserProfileStore";
import { Message, useMessageStore } from "./MessageStore";
import { auth } from "@/lib/firebase/firebase.config";
import { useContactStore } from "./ContactStore";

type useSocketStoreType = {
    socket: Socket | null
    socketId: string | null
    isConnected: boolean

    sendMessage: (message: string) => null | Promise<{ status: string, data?: { to: string, date: string }, error: string }>
    connectSocket: (token: string) => void
    disconnectSocket: () => void

    sendTyping: (typing: boolean) => void

    notifyOnlineStatus: (isOnline: boolean, socketOverride?: Socket) => void

    userReadAllMessages: (partnerEmail: string) => void
}


export const useSocketStore = create<useSocketStoreType>((set, get) => ({
    socket: null,
    socketId: null,
    isConnected: false,

    connectSocket: (token: string) => {

        if (get().isConnected) {
            console.log('Socket already connected');
            return
        }

        const socket = io("http://localhost:5000", {
            auth: {
                token: token
            }
        })

        socket.on('connect', () => {
            console.log(socket);
            set({ socket: socket, socketId: socket.id, isConnected: true })

            const notifyOnlineStatus = useSocketStore.getState().notifyOnlineStatus
            notifyOnlineStatus(true, socket); // pass the socket


            console.log('fired to notify online');

            console.log('Connected with socket ID:', socket.id);
        })

        socket.on('someoneTyping', (props) => {
            const setTyping = useContactStore.getState().setTyping
            setTyping(props)

            const selected: Selection = useUserProfileStore.getState().selected

            if (!selected || selected == 'profile' || selected.email != props.from) return

            const setSelected = useUserProfileStore.getState().setSelected
            setSelected({ ...selected, isTyping: props.isTyping })

            console.log('someone is typing to you ', props);
        })

        socket.on('newMessage', (props: { message: string, fromId: string }, callback) => {
            console.log(`Whilst in socket server Received message form ${props.fromId}`);

            const newMessage = useMessageStore.getState().newMessage
            newMessage(props.message, props.fromId)
            useContactStore.getState().newMessage(props.message, props.fromId)

            const selected: Selection = useUserProfileStore.getState().selected

            console.log('Callback fired for notifying that i have read the message');
            console.log(selected && selected !== 'profile' && selected.firebaseId == props.fromId);

            callback({
                status: selected && selected !== 'profile' && selected.firebaseId == props.fromId ? 'Read' : 'Delivered',
                data: {
                    timestamp: Date.now().toString()
                }
            })
        })

        socket.on('disconnect', async () => {
            const user = useUserProfileStore.getState().user
            if (!user) return
            const fetchUser = useUserProfileStore.getState().fetchUser
            await fetchUser()

            const notifyOnlineStatus = useSocketStore.getState().notifyOnlineStatus
            console.log('fired to notify offline');
            notifyOnlineStatus(false)

            set({ isConnected: false, socketId: null })
        })

        socket.on('partner-online-status', (props) => {

            // const currentContacts = useContactStore.getState()
            // if (!currentContacts.contacts) return

            // const newContacts = [...currentContacts.contacts]
            // newContacts.forEach((e) => {
            //     const onlineUser = e.users[0].email === auth.currentUser?.email ? e.users[1] : e.users[0];

            //     if (onlineUser.email == props.partnerEmail) {
            //         onlineUser.online = props.isOnline
            //         onlineUser.lastActive = new Date().toISOString()
            //     }
            // })
            // useContactStore.getState().setContacts(newContacts)

            useContactStore.getState().partnerOnline(props.partnerEmail, props.isOnline)

            console.log('partner', props);

            const selected: Selection = useUserProfileStore.getState().selected
            if (!selected || selected == 'profile') return
            const setSelected = useUserProfileStore.getState().setSelected
            if (selected.email === props.partnerEmail) {
                // console.log('Seeing partner');           
                useMessageStore.getState().partnerOnline()
                setSelected({ ...selected, online: props.isOnline, lastActive: new Date().toISOString() })
            }
        })

        socket.on('partner-read-all-messages', (props) => {
            useContactStore.getState().partnerReadAllMessages(props.partnerEmail, props.partnerId)

            const selected = useUserProfileStore.getState().selected
            if (!selected || selected == 'profile' || selected.email != props.partnerEmail) return

            console.log('got to know someone read all my messages', props);
            useMessageStore.getState().partnerReadAllMessages(props.partnerEmail)
        })
    },

    disconnectSocket: () => {
        const s = get().socket
        if (s) {
            const notifyOnlineStatus = useSocketStore.getState().notifyOnlineStatus
            notifyOnlineStatus(false)

            console.log('Disconnecting with socket');
            s.disconnect()
            set({ isConnected: false, socket: null, socketId: null })
        }
    },

    sendMessage: (message: string) => {
        const selected: Selection = useUserProfileStore.getState().selected

        if (!selected || selected == 'profile') return null
        // console.log({
        //     receiverEmail: selected.email,
        //     message: message
        // });
        console.log(get().socketId);

        return new Promise((res) => {
            get().socket?.emit('sendMessage', { receiverEmail: selected.email, message: message }, (props: any) => {
                console.log('Callback working fine');
                res(props)
            })
        })
    },

    sendTyping: (isTyping: boolean) => {
        const selected: Selection = useUserProfileStore.getState().selected
        if (!selected || selected == 'profile') return

        const socket = get().socket
        if (!socket) return

        // console.log(auth.currentUser?.email, 'is typing');

        socket.emit('typing', {
            to: selected.email,
            isTyping: isTyping
        })
    },

    notifyOnlineStatus: (isOnline: boolean, socketOverride?: Socket) => {
        const contacts = useContactStore.getState().contacts;
        const user = useUserProfileStore.getState().user;
        const socket = socketOverride || get().socket;

        if (!contacts || !user || !socket) {
            console.log("Couldn't notify as no contacts/socket/user", { isOnline, contacts, socket, user });
            return;
        }

        // console.log(user);        

        const toNotify: string[] = [];

        contacts.forEach((contact) => {
            const partnerUser = contact.users[0].email === user.email ?
                contact.users[1] : contact.users[0];
            toNotify.push(partnerUser.email);
            // console.log(partnerUser.email,contact.users[0].email, user.email)
        });
        // console.log(contacts);



        if (toNotify.length === 0) return;

        socket.emit('notify-online-status', {
            isOnline,
            user: user.email,
            chatPartners: toNotify
        });
    },

    userReadAllMessages: (partnerEmail: string) => {
        const socket = get().socket
        if (!socket) return

        console.log('user read all messages of partner');
        socket.emit('user-read-all-messages', { partnerEmail })


    }

}))