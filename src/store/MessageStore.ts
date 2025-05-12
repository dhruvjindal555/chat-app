import { auth } from "@/lib/firebase/firebase.config";
import { toast } from "react-toastify";
import { create } from "zustand";
import { Selection, useUserProfileStore } from "./UserProfileStore";
import { useSocketStore } from "./SocketStore";
import { useContactStore } from "./ContactStore";


export type Message = {
  _id?: string
  sender: string
  receiver: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export type ChatDetails = {
  _id: string
  chatId: string
  messages: Message[]
  users: {
    _id: string
    firstName: string
    lastName: string
    email: string
    lastActive: string
    firebaseId: string
    profileUrl: string
  }[]
  lastMessage: string
  updatedAt: string
}

type useMessageStoreType = {
  completeChatDetails: ChatDetails | null
  getAllMessages: (email1: string, email2: string) => Promise<void>
  sendMessage: (message: string) => void
  newMessage: (message: string, fromId: string) => Promise<void>

  userReadAllMessages: (partnerEmail: string) => void

  partnerReadAllMessages: (partnerEmail: string) => void
}

export const useMessageStore = create<useMessageStoreType>((set, get) => ({
  completeChatDetails: null,
  getAllMessages: async (email1, email2) => {
    try {
      const res = await fetch(`/api/chat/${email1}/${email2}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      console.log('working...');

      // console.log(data.chat);

      set({ completeChatDetails: data.chat })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(message);
      toast.error(message)
    }
  },

  sendMessage: async (message) => {

    try {
      const selected: Selection = useUserProfileStore.getState().selected
      if (!selected || selected == 'profile') {
        console.log('Selection error');
        return
      }
      if (!auth.currentUser?.uid) {
        console.log('user login error');
        return
      }

      const newMessage: Message = {
        sender: auth.currentUser.uid,
        receiver: selected.firebaseId,
        message: message,
        status: 'Sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const currentContacts = useContactStore.getState().contacts
      if (!currentContacts) {
        console.log('currentContacts', currentContacts);
        return;
      }

      const chatId = selected.firebaseId < auth.currentUser?.uid ?
        selected.firebaseId + auth.currentUser?.uid :
        auth.currentUser?.uid + selected.firebaseId

      let newchatIdx = currentContacts.findIndex((e) => String(e.chatId) == String(chatId))
      if (newchatIdx == -1) {
        console.log('currentContacts', currentContacts);
        console.log('Chat ID:', chatId);
        console.log('New chat index not found');
        return
      }

      const current = get().completeChatDetails;
      if (!current) {
        console.log('Complete Chat Details not found');
        return;
      }
      set({
        completeChatDetails: {
          ...current,
          messages: [...current.messages, newMessage]
        }
      });

      console.log('Message sent to server');
      const response = await useSocketStore.getState().sendMessage(message)
      if (response?.status !== 'error') {
        console.log('got response', response);

        // message log update
        set({
          completeChatDetails: {
            ...current,
            messages: [...current.messages, { ...newMessage, status: response?.status || '' }]
          }
        });

        // sidebar chat update
        const newContacts = [...currentContacts]
        newContacts[newchatIdx] = { ...currentContacts[newchatIdx], lastMessage: { ...newMessage, status: response?.status || '' } }
        useContactStore.setState({ contacts: newContacts })
        // console.log(currentContacts);


        // store message to the backend
        const res = await fetch(`/api/chat/send`, {
          method: 'POST',
          body: JSON.stringify({
            sender: auth.currentUser?.email,
            receiver: selected.email,
            message: message,
            status: response?.status,
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()

        if (!res.ok) {
          set({ completeChatDetails: current })
          throw new Error(data.error)
        }

        get().getAllMessages(auth.currentUser?.email || "", selected.email)
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(message);
      toast.error(message)
    }
  },

  newMessage: async (message, fromId) => {
    const selected: Selection = useUserProfileStore.getState().selected
    console.log(`Received message form ${fromId}`);

    const newMessage: Message = {
      receiver: auth.currentUser?.uid || "",
      sender: fromId,
      message: message,
      status: 'Sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (!selected || selected == 'profile' || selected.firebaseId != fromId) return


    const current = get().completeChatDetails;
    if (!current) return;
    set({
      completeChatDetails: {
        ...current,
        messages: [...current.messages, newMessage]
      }
    });


  },

  userReadAllMessages: async (partnerEmail: string) => {
    try {
      const selected = useUserProfileStore.getState().selected
      if (!selected || selected == 'profile') return

      const idsOfNonReadMessages: string[] = []
      const completeChatDetails = get().completeChatDetails
      if (!completeChatDetails) return

      completeChatDetails.messages.forEach((message) => {
        if (message.receiver == auth.currentUser?.uid && message.status != 'Read' && message._id) {
          idsOfNonReadMessages.push(message._id)
        }
      })

      if (idsOfNonReadMessages.length == 0) {
        console.log('nothing to tell which is read');
        return
      }
      console.log('Saying to the user that i read all messages');
      useSocketStore.getState().userReadAllMessages(partnerEmail)

      const updateMessageStatusResponse = await fetch('/api/chat/message/update', {
        method: "PUT",
        body: JSON.stringify({
          id: idsOfNonReadMessages,
          status: 'Read'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const updateMessageStatusData = await updateMessageStatusResponse.json()
      if (!updateMessageStatusResponse.ok) throw new Error(updateMessageStatusData.error)

    } catch (error) {
      console.error(error);
      const errMessage = error instanceof Error ? error.message : String(error)
      toast.error(errMessage)
    }
  },

  partnerReadAllMessages: (partnerEmail) => {
    try {

      console.log('got to know someone read all my messages');


      const selected = useUserProfileStore.getState().selected
      if (!selected || selected == 'profile' || selected.email !== partnerEmail) return

      const completeChatDetails = get().completeChatDetails
      if (!completeChatDetails) return



      const newChatDetails = { ...completeChatDetails }

      newChatDetails.messages.forEach((message) => {
        if (message.sender == auth.currentUser?.uid) {
          message.status = 'Read'
        }
      })

      set({ completeChatDetails: newChatDetails })


    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error)
      console.error(errMessage);
      toast.error(errMessage)
    }
  }
}))