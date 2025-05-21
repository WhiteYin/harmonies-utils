import { NextRequest, NextResponse } from 'next/server'
import animals from '@/data/animals.json'
import { HexagonPlanner } from '@/utils'

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
  const { pattern, scores } = animal
  // 使用示例
  const planner = new HexagonPlanner(pattern, scores.length)

  const data = planner.generateSolutions()

  return NextResponse.json(data, {
    status: 200,
  })
}
