import React, { RefObject } from 'react'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { auth } from '@/lib/firebase/firebase.config';
import { toast } from 'react-toastify';
import { useUserProfileStore } from '@/store/UserProfileStore';


const contacts = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", lastMessage: "Hi! How are you?", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", lastMessage: "Doing well, thanks!", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Charlie Lee", email: "charlie@example.com", lastMessage: "Are you free today?", avatar: "https://i.pravatar.cc/150?img=3" },
];


type Contact = typeof contacts[0];
type Selection = Contact | "profile" | null;

interface DropDownProps {
    handleProfileUpdate: (str: string) => void
    fileRef: RefObject<HTMLButtonElement | null>
    saveProfile: () => void
}

const DropDown = ({ handleProfileUpdate, fileRef, saveProfile }: DropDownProps) => {
    const selected = useUserProfileStore((state)=> state.selected)
    const noProfile = 'https://res.cloudinary.com/dclyvalfg/image/upload/v1745237151/f8y3pdelwag8hyun10ai.png'

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 hover:bg-gray-100 rounded-full">
                ⋮
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="bottom"
                    align="end"
                    sideOffset={4}
                    className="bg-white border border-gray-200 rounded-md shadow p-1 z-50"
                >
                    {selected === "profile" ? (
                        <>
                            <DropdownMenu.Item
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onSelect={() => {
                                    console.log(auth.currentUser);

                                    if (!auth.currentUser) toast.error('Try logging in first')
                                    else fileRef.current?.click()
                                }}
                            >
                                Upload New Photo
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onSelect={() => {
                                    handleProfileUpdate(noProfile)
                                }}
                            >
                                Remove Profile
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                onSelect={() => {
                                    saveProfile()
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                Save Profile
                            </DropdownMenu.Item>
                        </>
                    ) : (
                        <DropdownMenu.Item
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onSelect={() => alert(`Viewing profile of ${selected?.firstName}`)}
                        >
                            View Profile
                        </DropdownMenu.Item>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}

export default DropDown