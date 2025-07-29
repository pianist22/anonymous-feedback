import { getServerSession } from "next-auth";
// to use this we need to import the authOptions from the options file to configure the session 
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

// we need to create a aggregation pipeline to get all messages
export async function GET(){
    await dbConnect();
    // etract the user from the session 
    const session = await getServerSession(authOptions);// we need to provide the authOptions
    const _user:User = session?.user as User;

    if(!session || !_user){
        return Response.json({
            success:false,
            message:"User not Authenticated",
        },{status:400}
         );
    }
    
    // const userId = user._id;// getting the user id from the session
    // Note here this userId is a string as itself change it into string type but this can create problem in the aggregation pipeline and this is not required when you are using findById or update but is beign handled by the mongodb automatically but in aggregation we need to handle this.

    const userId = new mongoose.Types.ObjectId(_user._id);// getting the user id from the session

    try{
        // Aggregation pipeline
        const user = await UserModel.aggregate([
            {$match:{_id:userId}},
            {$unwind:"$messages"},
            {$sort:{"messages.createdAt":-1}},
            {$group:{_id:"$_id",messages:{$push:"$messages"}}},
        ]).exec();

        // console.log(user);
        if(!user || user.length===0){
            return Response.json({
                success:false,
                message:"User not found",
            },{status:404});
        }
        return Response.json({
            success:true,
            message:"Messages fetched successfully",
            messages:user[0].messages,
        },{status:200});
    }
    catch(error){
        console.log("Failed to get message",error);
        return Response.json({
            success:false,
            message:"Failed to get messages",
        },{status:500});
    }

}
