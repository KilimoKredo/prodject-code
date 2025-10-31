import { NextResponse } from 'next/server';
import type { FarmerInput } from '@/lib/types';

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_URL = process.env.RUNPOD_ENDPOINT_URL;

export async function POST(request: Request) {
  const farmerData: FarmerInput = await request.json();

  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_URL) {
    return NextResponse.json(
      { error: 'API keys not configured on server' },
      { status: 500 }
    );
  }

  const payload = {
    input: farmerData,
  };

  try {
    const response = await fetch(RUNPOD_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Runpod API Error:', errorBody);
      return NextResponse.json(
        { error: 'Failed to fetch from inference API' },
        { status: response.status }
      );
    }

    const result = await response.json();

    // The Runpod /runsync endpoint returns an object with "output"
    // We just want to return the model's output
    return NextResponse.json(result.output);
    
  } catch (error) {
    console.error('Inference call failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}