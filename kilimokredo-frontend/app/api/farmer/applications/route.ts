import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/lib/models';
import type { FarmerInput } from '@/lib/types';


const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_URL = process.env.RUNPOD_ENDPOINT_URL;

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    // This reads the farmerId from the URL (e.g., ...?farmerId=123)
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json({ message: 'Farmer ID is required' }, { status: 400 });
    }

    // Find all applications matching the farmerId
    const applications = await LoanApplication.find({ farmerId: farmerId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(applications);

  } catch (error: any) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}


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
