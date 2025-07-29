import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}; // we can store the connection object as empty as we have used the optional parameter in connectionObject

// dbConnect function returns a promise and i have used void to show that i don;t care what type of value will it return 
async function dbConnect():Promise<void>{
    if(connection.isConnected){
        console.log("Already Connected to database");
        return;
    }
    try{
        const db = await mongoose.connect(process.env.MONGODB_URI || '',{}); // we can also pass other connected options as well

        connection.isConnected = db.connections[0].readyState;

        console.log("Connected to Database Successfully");
    }
    catch(error){
        console.log("Database connection failed",error);
        process.exit(1);
    }
}

export default dbConnect;
// import mongoose from "mongoose";

// type ConnectionObject = {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// };

// // Cache connection globally to handle hot reloads in dev
// let cached = (global as any).mongoose as ConnectionObject;

// if (!cached) {
//   cached = (global as any).mongoose = {
//     conn: null,
//     promise: null,
//   };
// }

// async function dbConnect(): Promise<typeof mongoose> {
//   if (cached.conn) {
//     console.log("✅ Reusing existing database connection");
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const MONGODB_URI = process.env.MONGODB_URI;
//     if (!MONGODB_URI) {
//       console.error("❌ MONGODB_URI is not defined in environment variables.");
//       throw new Error("MONGODB_URI is not defined");
//     }

//     console.log("📡 Connecting to MongoDB...");
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//     console.log("✅ MongoDB connected successfully");
//   } catch (err) {
//     cached.promise = null;
//     console.error("❌ MongoDB connection failed:", err);
//     throw err;
//   }

//   return cached.conn;
// }

// export default dbConnect;
