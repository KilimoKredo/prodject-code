import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/lib/models';

export async function GET() {
  await dbConnect();

  try {
    const applications = await LoanApplication.find({})
      .sort({ createdAt: -1 }) // Get newest first
      
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}