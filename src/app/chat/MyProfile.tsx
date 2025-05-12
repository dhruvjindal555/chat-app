import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserUpdateSchema } from "@/models/UserUpdateSchema";
import React, { useEffect } from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { z } from 'zod';


type UserUpdateType = z.infer<typeof UserUpdateSchema>
interface MyProfileProps {
    imageUrl: string
    register: UseFormRegister<UserUpdateType>
    errors: FieldErrors<UserUpdateType>
}

const MyProfile = ({ register, imageUrl, errors }: MyProfileProps) => {

    return (
        <div className="p-6 bg-white flex-1 overflow-auto space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <img src={imageUrl || 'https://res.cloudinary.com/dclyvalfg/image/upload/v1745237151/f8y3pdelwag8hyun10ai.png'} alt="Me" className="w-24 h-24 rounded-full" />
            </div>
            <form  className="grid gap-4 max-w-md mx-auto">
                <div className="relative flex w-full flex-col space-y-2">
                    <Label htmlFor='firstName' className=' text-black'>First Name</Label>
                    <Input {...register('firstName')} className={`${errors.firstName?.message ? "focus-visible:ring-red-500" : "focus-visible:ring-neutral-400"}`} type= "text" id='firstName' />
                    <p className="absolute right-0 top-0 text-red-400">{errors.firstName?.message}</p>
                </div>
                <div className="relative flex w-full flex-col space-y-2">
                    <Label htmlFor='lastName' className='text-black'>Last Name</Label>
                    <Input  {...register('lastName')}
                    className={`${errors.lastName?.message ? "focus-visible:ring-red-500" : "focus-visible:ring-neutral-400"}`}
                     type="text" id='lastName' />
                    <p className="absolute right-0 top-0 text-red-400">{errors.lastName?.message}</p>
                </div>
                <div className="relative flex w-full flex-col space-y-2">
                    <Label htmlFor='about' className='text-black'>About</Label>
                    <textarea
                        {...register('about')}
                        rows={3}
                        className={`${errors.about?.message ? "focus-visible:ring-red-500" : "focus-visible:ring-neutral-400"} text-black shadow-input  flex w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 `}
                    />
                    <p className="absolute right-0 top-0 text-red-400">{errors.about?.message}</p>
                </div>
            </form>
        </div>
    )
}

export default MyProfile