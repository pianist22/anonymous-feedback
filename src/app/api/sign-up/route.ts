import dbConnect  from "@/lib/dbConnect"; // dbConnect will be imported in every route as Next is a server side framework which works on edge runtime evniroment
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";


import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req:Request){
    await dbConnect();
    try{
        const {username,email,password} = await req.json(); // always make sure to always use await with request object in nextJS

        // Check by username
        const existingUserVerifiedByUsername  = await UserModel.findOne({
                username,
                isVerified:true,
            });

        // console.log("Hello");
        // console.log(existingUserVerifiedByUsername);

        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:"Username is already taken",
            },{status:400});
        }

        // Check by email
        const existingUserByEmail = await UserModel.findOne({
            email
        });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success:false,
                    message:"User already exists with this email",
                },{status:400});
            }
            else{
                const hashedPassword = await bcrypt.hash(password,10);
                // Update the existing user with new password
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else{
            // User has come to register for the first time
            const hashedPassword = await bcrypt.hash(password,10);
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getHours() + 1); // expired in 1 hour

            const newuser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],           
            });
            await newuser.save();
        }

        // send verification mail
        const emailResponse = await sendVerificationEmail(email,username,verifyCode);

        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:emailResponse.message,
            },{status:500});
        }

        return Response.json({
            success:true,
            message:"User registered successfully,Please verify your email",
        },{status:201});

    }
    catch(error){
        console.error("Error Registering User",error);
        return Response.json({
            success:false,
            message:"Error registering User",
        },
        {
            status:400
        }
    );
    }
}