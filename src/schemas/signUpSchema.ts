import {z} from "zod";

// Here we are just performing validation on single username that's why we are not using the z.object()
export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20,"Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/,"Username must not contain any special characters except for underscore(_)")
    .trim();

// Here we are using z.object() because we are validating multiple fields in signUpSchema
export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:"Please enter a valid email address"}),
    password: z.string().min(6,{message:"Password must be at least 6 characters long"}).max(50,{message:"Password must be at most 50 characters long"})
})

