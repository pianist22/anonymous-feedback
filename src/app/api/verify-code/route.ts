import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";

export async function POST(request:Request){
    await dbConnect();
    try{
        const {username,verifyCode} = await request.json();
        // note lets suppose we are fetching the username and verifyCode form url itself so it is better to decode it properly
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({username:decodedUsername});

        if(!user){
            return Response.json({
                success:false,
                message:"User not found",
            },
            {status:400});
        }

        const isCodeValid = user.verifyCode === verifyCode;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();

            return Response.json({
                success:true,
                message:"User Verified successfully",
            },
            {status:200});
        }
        else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                message:"Verification code expired has please signup again to get a new code",
            },
            {status:400});
        }
        else{
            return Response.json({
                success:false,
                message:"Invalid Verification code",
            },
            {status:400});
        }
    }
    catch(error){
        console.log("Error verifying User",error);
        return Response.json({
            success:false,
            message:"Error verifying user",
        },
        {status:400});
    }
}