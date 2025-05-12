import dbConnect from "@/lib/dbConnect";
import User from "@/models/UserSchema";

export async function POST(req: Request) {
    try {
        const body: {
            email: string,
            firstName: string,
            lastName: string,
            firebaseId: string
        } = await req.json();

        await dbConnect()
        console.log("body", body);
        let user = await User.findOne({ email: body.email })
        if (user) {
            return new Response(JSON.stringify({ message: 'User Already exists' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        user = await User.create({
            ...body,
            lastActive: new Date().toISOString(),
        })
        await user.save()

        return new Response(JSON.stringify({ user: user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            message: 'An error occured while creating the user',
            error: error
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
