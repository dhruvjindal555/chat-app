import dbConnect from "@/lib/dbConnect"
import User from "@/models/UserSchema"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const email = req.nextUrl.searchParams.get("email")
        if (!email) {
            return new Response(JSON.stringify({
                message: "Email query parameter is required"
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        await dbConnect()
        const user = await User.findOne({ email })
        console.log(email);        

        if (!user) {
            return new Response(JSON.stringify({
                message: "User doesn't exist with this email id"
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        return new Response(JSON.stringify({
            user: user
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })

    } catch (error) {
        return new Response(JSON.stringify({
            message: "An error occurred while fetching user data"
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}
