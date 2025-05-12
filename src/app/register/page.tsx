"use client";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from './../../lib/firebase/firebase.config'
import EmailVerificationNotice from "./EmailVerificationNotice";
import { useForm, SubmitHandler } from 'react-hook-form';
import { Label } from "./../../components/ui/label";
import { Input } from "./../../components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema } from "@/models/SignUpSchema";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { toast } from "react-toastify";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { motion } from "framer-motion";


type UserRegisterForm = z.infer<typeof SignUpSchema>;

export default function SignupFormDemo() {
    const { register, handleSubmit, formState: { errors } } = useForm<UserRegisterForm>({
        resolver: zodResolver(SignUpSchema),
    });
    const [email, setEmail] = useState<string | null>("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit: SubmitHandler<UserRegisterForm> = async (data) => {
        setEmail(data.email);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            console.log(user);            
            
            const databaseResponse = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    firebaseId: user.uid
                }),
                headers: {
                    'Content-Type': 'aplication/json'
                }
            })
            const databaseData = await databaseResponse.json()
            console.log(databaseData);              
            if (!databaseResponse.ok) {
                throw new Error(databaseData.message)
            }
            console.log('User created successfully!');
            
            setIsVerifying(true);
            await sendEmailVerification(user); // ✅ wait here
            toast.success("Verification email sent!");
        } catch (error: any) {
            toast.error(error.message);
            console.log("ErrorCode:", error.code);
            console.log("ErrorMessage:", error.message);
        } finally {
            setLoading(false); // ✅ this always runs, even if error happens
        }
        setLoading(false)
    };


    return (
        <>

            {!isVerifying &&
                <div className="h-screen flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className=""
                    >
                        <div className="shadow-input mx-auto w-full max-w-2xl rounded-lg  p-4 md:rounded-2xl md:p-8 dark:bg-black">
                            <h2 className="text-xl font-bold  dark:text-white text-black ">
                                Welcome!
                            </h2>
                            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-4 flex text-black flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                                    <LabelInputContainer>
                                        <Label htmlFor="firstname">First name</Label>
                                        <Input id="firstname" placeholder="Tyler" type="text" {...register('firstName')} />
                                    </LabelInputContainer>
                                    <p className="text-red-400">{errors.firstName?.message}</p>
                                    <LabelInputContainer>
                                        <Label htmlFor="lastname">Last name</Label>
                                        <Input id="lastname" placeholder="Durden" type="text" {...register('lastName')} />
                                        <p className="text-red-400">{errors.lastName?.message}</p>
                                    </LabelInputContainer>
                                </div>
                                <LabelInputContainer className="mb-4">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" placeholder="projectmayhem@fc.com" type="email" {...register('email')} />
                                    <p className="text-red-400">{errors.email?.message}</p>
                                </LabelInputContainer>
                                <LabelInputContainer className="mb-4">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" placeholder="••••••••" type="password" {...register('password')} />
                                    <p className="text-red-400">{errors.password?.message}</p>
                                </LabelInputContainer>
                                <LabelInputContainer className="mb-8">
                                    <Label htmlFor="confirmPassword">Confirm password</Label>
                                    <Input
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        type="password" 
                                        {...register('confirmPassword')}
                                    />
                                    <p className="text-red-400">{errors.confirmPassword?.message}</p>
                                </LabelInputContainer>

                                <button
                                    disabled={loading}
                                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:text-gray-600"
                                    type="submit"
                                >
                                    <div className="flex justify-center ">
                                        <div className="w-1/4">

                                        </div>
                                        <div className="flex justify-between" >
                                            Sign up &rarr;
                                            <div className="ml-36">
                                                {loading && <Spinner />}
                                            </div>

                                        </div>
                                    </div>
                                    <BottomGradient />
                                </button>

                                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                                <div className="w-full text-center">
                                    <span className="dark:text-white">Already signed up?  </span>
                                    <Link href='/login'
                                        className="dark:text-blue-600 text-indigo-500 cursor-pointer hover:underline" >
                                        Login Here!
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>}
            {isVerifying && <EmailVerificationNotice email={email} />}
        </>
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
