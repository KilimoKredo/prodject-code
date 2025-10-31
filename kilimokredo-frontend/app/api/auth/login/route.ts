// import { type NextRequest, NextResponse } from "next/server"
// import { MongoClient } from "mongodb"
// import bcrypt from "bcryptjs"
// import jwt from "jsonwebtoken"

// const MONGODB_URI = process.env.MONGODB_URI
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// if (!MONGODB_URI) {
//   throw new Error("MONGODB_URI environment variable is not set")
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { email, password } = body

//     // Validate required fields
//     if (!email || !password) {
//       return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
//     }

//     const client = new MongoClient(MONGODB_URI)
//     await client.connect()

//     try {
//       const db = client.db("farmer_credit_system")
//       const farmersCollection = db.collection("farmers")

//       // Find farmer by email
//       const farmer = await farmersCollection.findOne({ email })
//       if (!farmer) {
//         return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
//       }

//       // Verify password
//       const passwordMatch = await bcrypt.compare(password, farmer.password)
//       if (!passwordMatch) {
//         return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
//       }

//       // Generate JWT token
//       const token = jwt.sign({ farmerId: farmer._id, email: farmer.email }, JWT_SECRET, { expiresIn: "7d" })

//       // Return farmer data (without password)
//       const { password: _, ...farmerData } = farmer

//       return NextResponse.json(
//         {
//           message: "Login successful",
//           token,
//           farmer: farmerData,
//         },
//         { status: 200 },
//       )
//     } finally {
//       await client.close()
//     }
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb"; // Import our Mongoose connection
import { Farmer } from "@/lib/models"; // Import our Mongoose Farmer model

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    await dbConnect(); // Use our cached Mongoose connection

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Find farmer by email using the Mongoose model
    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, farmer.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { farmerId: farmer._id, email: farmer.email }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Convert Mongoose doc to plain object
    const farmerData = farmer.toObject();
    
    // Remove password from the returned object
    delete farmerData.password;

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        farmer: farmerData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
  // No client.close() needed
}
