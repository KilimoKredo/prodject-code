// import { type NextRequest, NextResponse } from "next/server"
// import { MongoClient } from "mongodb"
// import bcrypt from "bcryptjs"

// const MONGODB_URI = process.env.MONGODB_URI

// if (!MONGODB_URI) {
//   throw new Error("MONGODB_URI environment variable is not set")
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { farmerName, email, password, farmSize, farmLocation, phoneNumber } = body

//     // Validate required fields
//     if (!farmerName || !email || !password || !farmSize || !farmLocation || !phoneNumber) {
//       return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
//     }

//     const client = new MongoClient(MONGODB_URI)
//     await client.connect()

//     try {
//       const db = client.db("farmer_credit_system")
//       const farmersCollection = db.collection("farmers")

//       // Check if farmer already exists
//       const existingFarmer = await farmersCollection.findOne({ email })
//       if (existingFarmer) {
//         return NextResponse.json({ message: "Email already registered" }, { status: 409 })
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10)

//       // Create farmer document
//       const farmer = {
//         farmerName,
//         email,
//         password: hashedPassword,
//         farmSize,
//         farmLocation,
//         phoneNumber,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       const result = await farmersCollection.insertOne(farmer)

//       return NextResponse.json(
//         {
//           message: "Farmer registered successfully",
//           farmerId: result.insertedId,
//         },
//         { status: 201 },
//       )
//     } finally {
//       await client.close()
//     }
//   } catch (error) {
//     console.error("Signup error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb"; // Import our Mongoose connection
import { Farmer } from "@/lib/models"; // Import our Mongoose Farmer model

export async function POST(request: NextRequest) {
  try {
    await dbConnect(); // Use our cached Mongoose connection

    const body = await request.json();
    const { farmerName, email, password, farmSize, farmLocation, phoneNumber } = body;

    // Validate required fields
    if (!farmerName || !email || !password || !farmSize || !farmLocation || !phoneNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ email });
    if (existingFarmer) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new farmer document using the Mongoose model
    const newFarmer = new Farmer({
      farmerName,
      email,
      password: hashedPassword,
      farmSize,
      farmLocation,
      phoneNumber,
      createdAt: new Date(),
    });

    // Save the new farmer to the database
    const savedFarmer = await newFarmer.save();

    return NextResponse.json(
      {
        message: "Farmer registered successfully",
        farmerId: savedFarmer._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
  // No client.close() needed, Mongoose handles the connection
}
