'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { auth } from "@/lib/firebase/firebase.config";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { motion } from "framer-motion";
import { useUserProfileStore } from '@/store/UserProfileStore';



const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})


type UserLoginForm = z.infer<typeof UserLoginSchema>


export default function LoginPage() {
    const fetchUser = useUserProfileStore((state) => state.fetchUser)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<UserLoginForm>({
        resolver: zodResolver(UserLoginSchema)
    })

    const onSubmit = async (data: UserLoginForm) => {
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                toast.info('Please verify your email address using the link sent to your inbox');

                await sendEmailVerification(user);
                toast.success("Verification email sent successfully");
            } else {
                toast.success("Login successful!");
                router.push('/');
            }
        } catch (error: any) {
            toast.error(error.message);
            console.log("ErrorCode:", error.code);
            console.log("ErrorMessage:", error.message);
        }
        setLoading(false)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user?.email) {
                await fetchUser();

            //     const token = await user.getIdToken()
            //     console.log('Request sent for connecting socket');
            //     connectSocket(token)
            }
        });

        return () => unsubscribe(); // Clean up listener on unmount
    }, []);

    return (
        <div className="w-screen h-screen flex justify-center items-center ">
            <Link href='/chat' className="flex items-center justify-center  ">
                <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                    Chat
                </button>
            </Link>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <div className="shadow-input mx-auto w-full max-w-md rounded-lg bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
                    <h2 className="text-xl font-bold dark:text-white  text-black ">
                        Welcome back!
                    </h2>
                    <form className="my-8 dark:text-white" onSubmit={handleSubmit(onSubmit)}>
                        <LabelInputContainer className="mb-4 ">
                            <Label htmlFor="email">Email Address</Label>
                            <Input className='dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 dark:placeholder-text-neutral-600' {...register('email')} id="email" placeholder="projectmayhem@fc.com" type="email" />
                            <p className="text-red-400">{errors.email?.message}</p>
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4 ">
                            <Label htmlFor="password">Password</Label>
                            <Input className='dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 dark:placeholder-text-neutral-600' {...register('password')} id="password" placeholder="••••••••" type="password" />
                            <p className="text-red-400">{errors.password?.message}</p>
                        </LabelInputContainer>
                        <button
                            disabled={loading}
                            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]
                        disabled:text-gray-600"
                            type="submit"
                        >
                            <div className="flex justify-center ">
                                <div className="w-1/4">

                                </div>
                                <div className="flex justify-between" >
                                    Log in &rarr;
                                    <div className="ml-36">
                                        {loading && <Spinner />}
                                    </div>

                                </div>
                            </div>

                            <BottomGradient />
                        </button>
                        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                        <div className="w-full text-center">
                            <span className="dark:text-white">New here?  </span>
                            <Link href='/register'
                                className="dark:text-blue-600 text-indigo-500 cursor-pointer hover:underline" >
                                Register now!
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
