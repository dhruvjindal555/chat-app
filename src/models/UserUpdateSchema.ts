import { z } from "zod";

export const UserUpdateSchema  =  z.object({
    firstName: z.string().nonempty("Required").min(2, "Length must greater than 2"),
    lastName : z.string().nonempty("Required"),
    about : z.string()
})

