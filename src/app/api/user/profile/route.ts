import dbConnect from "@/lib/dbConnect";
import User from "@/models/UserSchema";
import { NextRequest } from "next/server";

interface requestForProfileUpdate {
    uid: string
    profileUrl: string
}

export async function POST(req: NextRequest) {

    try {
        await dbConnect()
        const body: requestForProfileUpdate = await req.json();
        const { uid, profileUrl } = body;

        const user = await User.findOne({ firebaseId: uid })
        if (!user) {
            console.log('working');
            throw new Error('User does not exists')
        }

        user.profileUrl = profileUrl
        await user.save()

        return new Response(JSON.stringify({
            message: 'Profile picture updated successfully',
            user
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        })

    } catch (error) {
        return new Response(JSON.stringify({
            message: 'An error occured while updating profile picture',
            error
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

}

