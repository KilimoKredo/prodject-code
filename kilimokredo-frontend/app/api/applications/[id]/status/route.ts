import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/lib/models';
import { ILoanApplication } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { status } = (await request.json()) as { status: 'Approved' | 'Rejected' };

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status provided. Must be "Approved" or "Rejected".' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      id,
      { 'others.loanStatus': status }, // Update the nested field
      { new: true } // This option returns the *updated* document
    );

    if (!updatedApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Failed to update application status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
