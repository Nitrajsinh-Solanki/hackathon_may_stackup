// hackathon_may_stackup\moodify\src\app\api\user\summary\route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { generateUserSummary, generateDataHash } from '@/lib/gemini-user-summary';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // generating a hash of the current user data
    const currentDataHash = generateDataHash(user);
    
    if (user.userSummary && user.userSummary.dataHash === currentDataHash) {
      return NextResponse.json({
        summary: user.userSummary.summary,
        generatedAt: user.userSummary.generatedAt,
        isNew: false
      }, { status: 200 });
    }
    
    // generating a new summary if we don't have one or if the data has changed
    const summary = await generateUserSummary(user);
    
    // saving the new summary
    user.userSummary = {
      summary,
      generatedAt: new Date(),
      dataHash: currentDataHash
    };
    
    await user.save();
    
    return NextResponse.json({
      summary,
      generatedAt: user.userSummary.generatedAt,
      isNew: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user summary:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user summary', error: String(error) },
      { status: 500 }
    );
  }
}
