/**
 * Save Transaction API
 * SERVER-SIDE ONLY - Saves to GaussDB or Firebase
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json();
    
    // Dynamically import server-side only module
    const { dataService } = await import('@/lib/data-service');
    
    const id = await dataService.createTransaction(transaction);
    
    return NextResponse.json({ 
      success: true, 
      id,
      database: dataService.getActiveDatabase(),
    });
  } catch (error) {
    console.error('Failed to save transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

