import { getServerSession } from "next-auth";
// to use this we need to import the authOptions from the options file to configure the session 
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { User } from "next-auth";

// this route is toogle the user status for accepting messages
export async function POST(request:Request){
    await dbConnect();
    // etract the user from the session 
    const session = await getServerSession(authOptions);// we need to provide the authOptions
    const user:User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"User not Authenticated",
        },{status:400}
         );
    }
    
    const userId = user._id;// getting the user id from the session
    
    const {acceptingMessages} = await request.json();

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            {isAcceptingMessages:acceptingMessages},
            {new:true}
        );
        if(!updatedUser){
            return Response.json({
                success:false,
                message:"Failed to update the user status for accepting messages",
            },{status:401});
        }

        return Response.json({
            success:true,
            message:"User status for accepting messages updated successfully",
            updatedUser,
        },{status:200});
    }
    catch(error){
        console.log("Failed to update the user status for accepting messages",error);
        return Response.json({
            success:false,
            message:"Failed to update the user status for accepting messages",
        },{status:500});
    }
}

// this route is get the current user status for accepting messages
export async function GET(){
    await dbConnect();
    // extract the user from the session 
    const session = await getServerSession(authOptions);// we need to provide the authOptions
    const user:User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"User not Authenticated",
        },{status:400}
         );
    }
    
    const userId = user._id;// getting the user id from the session
    
    try{
        const findUser = await UserModel.findById(userId);
        if(!findUser){
            return Response.json({
                success:false,
                message:"User not found",
            },{status:404});
        }

        return Response.json({
            success:true,
            message:"User status for accepting messages fetched successfully",
            isAcceptingMessages:findUser.isAcceptingMessages
        },{status:200});
    }
    catch(error){
        console.log("Failed to get the user status for accepting messages",error);
        return Response.json({
            success:false,
            message:"Failed to get the user status for accepting messages",
        },{status:500});
    }
}
