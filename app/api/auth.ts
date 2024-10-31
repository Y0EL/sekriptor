import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  // Replace this with your actual logic
  if (password === process.env.PASSWORD) {
    return NextResponse.json({ authenticated: true })
  } else {
    return NextResponse.json({ authenticated: false })
  }
}
