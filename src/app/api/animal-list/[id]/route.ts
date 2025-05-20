import { NextRequest, NextResponse } from 'next/server'
import animals from '@/data/animals.json'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const animal = animals.find((item) => item.id === Number(id))

  if (!animal) {
    return NextResponse.json(
      {
        error: '未找到该动物',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(animal)
}
