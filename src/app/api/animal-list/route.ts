import { NextResponse } from 'next/server'
import animals from '@/data/animals.json'

export async function GET() {
  return NextResponse.json(animals)
}
