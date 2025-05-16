// hackathon_may_stackup\moodify\src\app\api\user\search-history\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// getting user's search history
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
    
    // ensuring searchHistory exists
    if (!user.searchHistory) {
      user.searchHistory = [];
      await user.save();
    }
    
    return NextResponse.json(
      { searchHistory: user.searchHistory || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch search history', error: String(error) },
      { status: 500 }
    );
  }
}

// saving search query to history
export async function POST(request: NextRequest) {
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
    
    const { query } = await request.json();
    
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // finding user and update search history
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.searchHistory) {
      user.searchHistory = [];
    }
    
    const existingIndex = user.searchHistory.findIndex(
      (item: { query: string; }) => item.query.toLowerCase() === query.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      user.searchHistory.splice(existingIndex, 1);
    }
    
    // adding new search query at the beginning with current timestamp
    user.searchHistory.unshift({
      query,
      timestamp: new Date(),
    });
    
    if (user.searchHistory.length > 20) {
      user.searchHistory = user.searchHistory.slice(0, 20);
    }
    
    await user.save();
    
    return NextResponse.json(
      { message: 'Search history updated', searchHistory: user.searchHistory },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { message: 'Failed to save search history', error: String(error) },
      { status: 500 }
    );
  }
}

// clearing search history
export async function DELETE(request: NextRequest) {
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
    
    user.searchHistory = [];
    await user.save();
    
    return NextResponse.json(
      { message: 'Search history cleared' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing search history:', error);
    return NextResponse.json(
      { message: 'Failed to clear search history', error: String(error) },
      { status: 500 }
    );
  }
}
