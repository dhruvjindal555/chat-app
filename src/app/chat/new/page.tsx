"use client";
import { useState, useEffect, useRef, } from "react";
import { toast } from 'react-toastify';
import { auth } from '@/lib/firebase/firebase.config';
import UploadProfile from "../UploadProfile";
import { onAuthStateChanged } from "firebase/auth";
import ChatBox from "../ChatBox";
import Sidebar from "../Sidebar";
import MyProfile from "../MyProfile";
import DropDown from "../DropDown";
import { useForm } from "react-hook-form";
import { UserUpdateSchema } from "@/models/UserUpdateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Selection, useUserProfileStore } from "@/store/UserProfileStore";
import { useSocketStore } from "@/store/SocketStore";
import { useMessageStore } from "@/store/MessageStore";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons'
import { useContactStore } from "@/store/ContactStore";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type UserUpdateType = z.infer<typeof UserUpdateSchema>

export default function ChatUI() {
  const connectSocket = useSocketStore((state) => state.connectSocket)

  const sendMessage = useMessageStore((state) => state.sendMessage)

  const imageUrl = useUserProfileStore((state) => state.imageUrl)
  const fetchUser = useUserProfileStore((state) => state.fetchUser)
  const setTyping = useUserProfileStore((state) => state.setTyping)
  const selected: Selection = useUserProfileStore((state) => state.selected)
  const handleProfileUpdate = useUserProfileStore((state) => state.handleProfileUpdate)

  const fetchContacts = useContactStore((state) => state.fetchContacts)

  const { register, setValue, trigger, getValues, formState: { errors } } = useForm<UserUpdateType>({
    resolver: zodResolver(UserUpdateSchema),
    mode: "onChange",
  });

  const fileRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false)

  const getChatSeparator = (nextDate: Date) => {
    const today = new Date()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (nextDate.getFullYear() == today.getFullYear()) {
      if (nextDate.getMonth() == today.getMonth()) {
        if (nextDate.getDate() == today.getDate()) {
          return 'Today'
        } else if (nextDate.getDate() + 1 == today.getDate()) {
          return 'Yesterday'
        } else if (nextDate.getDate() < today.getDate() && nextDate.getDate() > today.getDate() - 7) {
          return dayNames[nextDate.getDay()]
        }
      }
    }
    return nextDate.toDateString()
  }

  const saveProfile = async () => {
    const isValid = await trigger(); // Triggers validation for all fields

    if (isValid) {
      const values = getValues(); // Get all form values
      console.log("Manual submit values:", values);
      // do your custom logic, API call etc.
    } else {
      console.log("Validation failed");
    }
  };


  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji)
  };

  const onOutsideEmojiclick = (e: MouseEvent) => {
    if (emojiRef && !emojiButtonRef.current?.contains(e.target as Node) && !emojiRef.current?.contains(e.target as Node)) {
      // console.log('emoji status change');
      setShowEmojis(false)
    }
  }

  useEffect(() => {
    const handleUnload = () => {
      console.log('Reload');      
      useSocketStore.getState().disconnectSocket();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);


  useEffect(() => {
    const handleVisibilityChange = async () => {
      console.log('Visibility change');      
      if (document.visibilityState === "hidden") {
        useSocketStore.getState().notifyOnlineStatus(false);
      } else {
        useSocketStore.getState().notifyOnlineStatus(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);


  useEffect(() => {
    document.addEventListener('mousedown', onOutsideEmojiclick)
    const unsubscribe = onAuthStateChanged(auth, async (client) => {
      if (client?.email) {
        console.log('Request sent for connecting socket');
        const token = await client.getIdToken()
        const data = await fetchUser()
        await fetchContacts(client.email)

        connectSocket(token)

        if (data) {
          console.log('got user');
          setValue('firstName', data.firstName);
          setValue('lastName', data.lastName);
          setValue('about', data.about || "");
        }
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [connectSocket]);


  return (
    <div className=" min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div
        ref={emojiRef}
      >
        <AnimatePresence>
          {showEmojis &&
            <motion.div
              className="fixed z-10 top-65 right-100 shadow-xl "
              key="emoji-picker"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 325, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              style={{ overflow: "hidden" }}
            >
              <EmojiPicker
                width={400}
                height={325}
                onEmojiClick={handleEmojiClick}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled={false}
              />
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-xl flex relative">
        {/* Chat or Profile Panel */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-10">
            <div className="flex items-center gap-3">
              {selected === "profile" ? (
                <>
                  <img src={imageUrl} alt="Me" className="w-8 h-8 rounded-full" />
                  <h2 className="text-xl font-semibold">Edit My Profile</h2>
                </>
              ) : selected ? (
                <>
                  <img src={selected.profileUrl} alt={selected.firstName} className="w-8 h-8 rounded-full" />
                  <div>
                    <h2 className="text-xl font-semibold">{selected.firstName + selected.lastName}</h2>
                    <p className={cn("text-xs font-semibold", selected.online ? 'text-green-500' : " text-gray-500")}>
                      {selected.online == true ? "online" : 'last login ' + getChatSeparator(new Date(selected.lastActive)).toLowerCase() + " at " + new Date(selected.lastActive).toLocaleTimeString().split(':')[0] +
                        ":" + new Date(selected.lastActive).toLocaleTimeString().split(':')[1] +
                        " " + new Date(selected.lastActive).toLocaleTimeString().split(' ')[1]}
                    </p>
                  </div>
                </>
              ) : (
                <h2 className="text-xl font-semibold">Select a conversation</h2>
              )}
            </div>

            {selected && (
              <DropDown
                saveProfile={saveProfile}
                handleProfileUpdate={handleProfileUpdate}
                fileRef={fileRef}
              />
            )}
          </div>
          <UploadProfile
            fileRef={fileRef}
            handleProfileUpdate={handleProfileUpdate}
          />
          {/* Main content */}
          {selected === "profile" ? (
            <MyProfile
              imageUrl={imageUrl}
              register={register}
              errors={errors}
            />
          ) : (
            <>
              <ChatBox getChatSeparator={getChatSeparator} />

              {selected && (
                <div className="flex items-center gap-2 px-6 py-4 bg-white border-t border-gray-200">
                  <div ref={emojiButtonRef} className="cursor-pointer">
                    <FontAwesomeIcon
                      onClick={() => {
                        setShowEmojis((prev) => !prev)
                        console.log('emoji status change');
                      }}
                      size='xl'
                      icon={faFaceSmile}
                      style={{ color: "#5e5e5e", }} />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={e => {
                      setTyping(e.target.value.length > 0 ? true : false)
                      setInput(e.target.value)
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        if (input.trim() != "") {
                          setInput("")
                          setTyping(false)
                          sendMessage(input)
                        } else toast.error('Try writing something first!')
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => {
                      if (input.trim() != "") {
                        setInput("")
                        setTyping(false)
                        sendMessage(input)
                      } else toast.error('Try writing something first!')
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
