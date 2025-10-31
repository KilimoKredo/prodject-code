import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/lib/models';
import type { FarmerInput } from '@/lib/types';

// Auth helper (you'll need to implement this based on your auth logic)
// For now, we'll assume a simple function that gets a farmer ID.
// In a real app, you'd verify a JWT token from the request headers.
async function getFarmerIdFromRequest(request: Request): Promise<string | null> {
  // This is a placeholder. You need to implement your JWT logic here.
  // For now, let's just assume you pass farmerId in the body for simplicity.
  // A real implementation would parse an Authorization header.
  return null; 
}

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_URL = process.env.RUNPOD_ENDPOINT_URL;

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { applicationData, loanAmountRequested, farmerId } = body;
    const farmerInput: FarmerInput = applicationData;

    // TODO: In production, get farmerId from a secure auth token, not the body!
    // const farmerId = await getFarmerIdFromRequest(request);
    if (!farmerId) {
      return NextResponse.json({ message: 'Not Authenticated' }, { status: 401 });
    }

    if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_URL) {
      return NextResponse.json({ message: 'Inference API not configured' }, { status: 500 });
    }

    // 1. Call the Runpod Inference API
    const runpodPayload = {
      input: farmerInput,
    };

    const apiResponse = await fetch(RUNPOD_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
      },
      body: JSON.stringify(runpodPayload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('Runpod API Error:', errorBody);
      return NextResponse.json({ message: 'Inference failed' }, { status: 502 });
    }

    const modelOutput = await apiResponse.json();
    
    // Check if the model itself returned an error
    if (modelOutput.error) {
       console.error('Model Inference Error:', modelOutput.error);
       return NextResponse.json({ message: modelOutput.error }, { status: 400 });
    }
    
    // 2. Save the complete application to MongoDB
    const newApplication = new LoanApplication({
      farmerId: farmerId,
      user: farmerInput,
      output: modelOutput.output, // The API returns { output: { ... } }
      others: {
        loanAmountRequested: loanAmountRequested,
        loanStatus: 'Pending', // All new applications are Pending
      },
    });

    await newApplication.save();

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
