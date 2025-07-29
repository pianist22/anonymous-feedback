import dbConnect from "@/lib/dbConnect";
import { Message, UserModel } from "@/models/User";

// now message can be sent by anyone we don't have to check the session for it 
export async function POST(request:Request){
    await dbConnect();

    const {username,content} = await request.json();
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json({
                success:false,
                message:"User not found",
            },{status:404});
        }
        // check if user is accepting the messages or not 
        if(!user.isAcceptingMessages){
            return Response.json({
                success:false,
                message:"User is not accepting messages",
            },{status:403});
        }
        const newMessage = {content,createdAt:new Date()};

        // add this newMessage to userModel
        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json({
            success:true,
            message:"Message sent successfully",
        },{status:200});
    }
    catch(error){
        console.log(error);
        return Response.json({success:false,message:"Failed to send message"},{status:500});
    }
}