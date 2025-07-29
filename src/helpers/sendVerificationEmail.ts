import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/VerificationEmail";
import { ApiResponse} from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try{
        await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: 'Mystery Message | Verification Code',
        react: VerificationEmail({username, otp: verifyCode}),
    });

        return {
            success: true,
            message: "Verification Email Send Succesfully",
        };
    }
    catch(error){
        console.error("Error sending verification email", error);
        return {
            success: false,
            message: "Error sending verification email",
        };
    }
}