// this is a decleration file 
import 'next-auth';
import { DefaultSession } from 'next-auth';

// we are modifying next-auth module to handle the user in callback section of authOptions 
declare module 'next-auth'{
    interface User{
        _id?:string; // after this _id will be added to next-auth module user which was not there before 
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
    interface Session{
        user:{
            _id?:string;
            isVerified?:boolean;
            isAcceptingMessages?:boolean;
            username?:string;            
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt'{
    interface JWT{
        _id?:string;
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
}