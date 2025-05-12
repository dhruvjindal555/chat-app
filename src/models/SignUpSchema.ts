import { z } from "zod"


export const SignUpSchema = z
    .object({
        firstName: z.string().min(3, "First name must be at least 3 chars"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Must be a valid email"),
        password: z.string().min(6, "Password must be at least 6 chars"),
        confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"], // show error under confirmPassword
    });

