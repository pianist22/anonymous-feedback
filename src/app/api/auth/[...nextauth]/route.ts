import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions); // Now if you want to add any other type of provider you can add that can use you just need to providers to authOptions
export { handler as GET, handler as POST };