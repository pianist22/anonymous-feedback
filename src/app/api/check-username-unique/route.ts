import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import {z} from "zod";

// Remember we have made schemas during Zod which we will use for the validation part 
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
})


export async function GET(request:Request){
    // this particular set of code is not required in the current version of NextJS it is already beign taken care of by NextJS
    // if(request.method !== "GET"){
    //     return Response.json({
    //         success:false,
    //         message:"Method not allowed",
    //     },{status:405});
    // }
    await dbConnect();
    //URL: localhost:3000/api/check-username-unique?username=priyanshu?phone=android
    // we will need to fetch the query params from the url itself 
    try{
        // first get the url name 
        const {searchParams} = new URL(request.url);
        // now we had not created the variable directly instead created the object with username as this queryParams will be validated using zod which excepts an object always 
        const queryParams = {
            username: searchParams.get("username")
        }

        const result = UsernameQuerySchema.safeParse(queryParams);
        // for better understanding we need to log this result
        // console.log(result);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];

            return Response.json({
                success:false,
                message: usernameErrors.length >0? usernameErrors.join(", ") : "Invalid username",
            },{status:400});
        }
        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username,isVerified:true});

        if(existingVerifiedUser){
            return Response.json({
                success:false,
                message:"Username is already taken",
            },{status:400});            
        }
        return Response.json({
            success:true,
            message:"Username is available",
        },{status:200});          
    }
    catch(error){
        console.log("Error checking Username ",error);
        return Response.json({
            success:false,
            message:"Error Checking Username",
        },{status:500});
    }
}
