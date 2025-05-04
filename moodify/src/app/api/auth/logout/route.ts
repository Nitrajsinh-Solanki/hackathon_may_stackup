// moodify\src\app\api\auth\logout\route.ts


import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await
        cookies()).set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, 
    path: '/',
  });
  
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
}
