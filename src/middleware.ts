import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './lib/dbConnect';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // console.log("pathname",pathname); 
  
  return NextResponse.next(); // continue to the next handler
}
