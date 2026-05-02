import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
