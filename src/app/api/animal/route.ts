import { NextRequest, NextResponse } from 'next/server'
import animals from '@/data/animals.json'

export async function GET(req: NextRequest) {
  const { url } = req
  const { searchParams } = new URL(url)
  const id = searchParams.get('id')
  const animal = animals.find((item) => item.id === Number(id))

  if (!animal) {
    return NextResponse.json(
      {
        error: '未找到该动物',
      },
      {
        status: 404,
      }
    )
  }

  return NextResponse.json(animal, {
    status: 200,
  })
}
