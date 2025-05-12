import { create } from "zustand"
import { auth } from '@/lib/firebase/firebase.config';
import { toast } from "react-toastify";
import { useSocketStore } from "./SocketStore";


export type User = {
    firstName: string;
    lastName: string;
    firebaseId: string;
    about?: string;
    profileUrl: string;
    email: string
    isTyping?: boolean
    lastActive: string
    online?: boolean
};

export type Selection = User | "profile" | null;

export const noProfile = 'https://res.cloudinary.com/dclyvalfg/image/upload/v1745237151/f8y3pdelwag8hyun10ai.png'


interface UserProfileStore {
    typing: boolean;
    setTyping: (type: boolean) => void

    user: User | null
    setUser: (user: User) => void

    selected: Selection;
    setSelected: (sel: Selection) => void;

    imageUrl: string;
    setImageUrl: (url: string) => void;

    handleProfileUpdate: (url: string) => Promise<void>;
    fetchUser: () => Promise<User | undefined>;
}

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
    typing: false,
    setTyping: (isTyping: boolean) => {
        const selected = get().selected;
        if (!selected || selected == 'profile') return

        const sendTyping = useSocketStore.getState().sendTyping;
        sendTyping(isTyping)
        set({ typing: isTyping })
    },

    user: null,
    setUser: (user: User) => set({ user: user }),

    selected: null,
    setSelected: (sel: Selection) => set({ selected: sel }),

    imageUrl: noProfile,
    setImageUrl: (url: string) => set({ imageUrl: url }),

    handleProfileUpdate: async (url: string) => {
        try {
            set({ imageUrl: url })

            if (!auth.currentUser) {
                throw new Error('Try logging in first')
            }

            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: auth.currentUser?.uid,
                    profileUrl: url
                }),
            });


            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(`Request failed: ${res.status} ${message}`);
            }

            const data = await res.json()
            console.log(data);

            await get().fetchUser();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            toast.error(message)
        }
    },

    fetchUser: async () => {
        if (!auth.currentUser) return

        try {
            const res = await fetch(`/api/user?email=${auth.currentUser?.email}`, {
                method: "GET",
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.message)
            console.log(data);



            const lastActiveResponse = await fetch(`/api/online`, {
                method: "POST",
                body: JSON.stringify({
                    email: auth.currentUser.email
                })
            })
            const lastActiveData = await lastActiveResponse.json()
            if (!lastActiveResponse.ok) throw new Error(lastActiveData.message)
            console.log(lastActiveData);

            set({ user: data })
            set({ imageUrl: data.user.profileUrl });

            return data.user;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(message)
        }
    }


}))