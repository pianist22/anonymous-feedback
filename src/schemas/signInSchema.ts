import {z} from "zod";

export const signInSchema = z.object({
    identifier: z.string(), // email or username specifically used in production level environment
    password: z.string(),
})

