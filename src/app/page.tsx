'use client'
import Tabs from '@/components/Tabs'
import React, { useEffect, useState } from 'react'
import { HexGrid, Layout, Hexagon, Text } from 'react-hexgrid'

interface HexagonItem {
  q: number
  r: number
  s: number
}
interface HexPoint extends Pattern, HexagonItem {}
enum FieldType {
  // 山丘
  Mountain = 'Mountain',
  // 平原
  Field = 'Field',
  // 树
  Tree = 'Tree',
  // 水
  Water = 'Water',
  // 建筑
  Building = 'Building',
}
const filedTypeColorMap: Record<string, string> = {
  [FieldType.Mountain]: '#757273',
  [FieldType.Field]: '#E3AF23',
  [FieldType.Tree]: '#868B27',
  [FieldType.Water]: '#247D8C',
  [FieldType.Building]: '#B2313F',
}

interface Pattern {
  kind: string
  animal?: boolean
  height: number
  delta_q?: number
  delta_r?: number
}

interface Animal {
  id: number
  name: string
  enName: string
  kind: string
  scores: number[]
  pattern: Pattern[]
}

const CreateMap = () => {
  const [animalList, setAnimalList] = useState<Animal[]>([])
  const [points, setPoints] = useState<HexPoint[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<number>()

  const handleAnimalChange = (id: number) => {
    setSelectedAnimal(id)
    // 获取动物列表
    fetch(`/api/animal?id=${id}`)
      .then((response) => response.json())
      .then((data: Animal) => {
        const { pattern } = data
        const hexPoints: HexPoint[] = []
        pattern.forEach((p) => {
          const q = p.delta_q || 0
          const r = p.delta_r || 0
          const s = -q - r
          hexPoints.push({
            q: q,
            r: r,
            s: s,
            ...p,
          })
        })
        setPoints(hexPoints)
      })
      .catch((error) => {
        console.error('Error fetching animal list:', error)
      })
  }

  useEffect(() => {
    // 获取动物列表
    fetch('/api/animal-list')
      .then((response) => response.json())
      .then((data: Animal[]) => {
        setAnimalList(data)
        if (data.length > 0) {
          // 默认选中第一个动物
          handleAnimalChange(data[0].id)
          setSelectedAnimal(data[0].id)
        }
      })
      .catch((error) => {
        console.error('Error fetching animal list:', error)
      })
  }, [])

  // const hexagons = useMemo(() => {
  //   // 创建一个5x5的六边形网格
  //   const width = 5
  //   const height = 5
  //   const hexagons: HexagonItem[] = []

  //   for (let i = -2; i < width + 2; i++) {
  //     // 从0开始
  //     const isOdd = Math.abs(i % 2) === 1
  //     const rowNum = isOdd ? height - 1 : height
  //     const rStart = Math.ceil(-(i / 2))
  //     for (let j = -2; j < rowNum; j++) {
  //       // 偶数列竖向5个，奇数列竖向4个
  //       const q = i
  //       const r = rStart + j
  //       const s = -q - r
  //       hexagons.push({ q, r, s })
  //     }
  //   }
  //   return hexagons
  // }, [])

  return (
    <div className="flex h-screen p-4">
      <div className="flex-1/2 flex-grow-0">
        <h1 className="text-2xl font-bold mb-4">动物列表</h1>
        {/* 横向排列动物，单选框 */}
        <div className="flex flex-wrap">
          {animalList.map((animal) => (
            <div key={animal.id} className="mr-4 mb-1">
              <input
                checked={selectedAnimal === animal.id}
                onChange={() => {
                  handleAnimalChange(animal.id)
                }}
                type="radio"
                id={`animal-${animal.id}`}
                name="animal"
                value={animal.id}
                className="mr-2"
              />
              <label htmlFor={`animal-${animal.id}`} className="text-lg">
                {animal.name} ({animal.enName})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1/2">
        <Tabs
          items={[
            {
              key: 'details',
              label: '详情',
              children: (
                <div className="border-2 border-dashed flex items-center justify-center h-full">
                  <HexGrid width={600} height={400} viewBox="-60 -60 120 120">
                    <Layout size={{ x: 8, y: 8 }} flat={true} origin={{ x: 0, y: 0 }}>
                      {/* 渲染六边形 */}
                      {points.map((hex, index) => {
                        return (
                          <Hexagon
                            key={index}
                            q={hex.q}
                            r={hex.r}
                            s={hex.s}
                            style={{
                              fill: filedTypeColorMap[hex.kind!],
                              stroke: '#666',
                              strokeWidth: 1,
                            }}
                          >
                            {hex.height && hex.height > 1 ? (
                              <Text x="0.3em" fill="black" stroke="none" style={{ fontSize: '0.5em' }}>
                                {hex.height}
                              </Text>
                            ) : null}
                            {hex.animal ? (
                              <Text x="-0.3em" fill="red" stroke="none" style={{ fontSize: '0.5em' }}>
                                *
                              </Text>
                            ) : null}
                          </Hexagon>
                        )
                      })}
                    </Layout>
                  </HexGrid>
                </div>
              ),
            },
            {
              key: 'layouts',
              label: '布局',
              children: <div>null</div>,
            },
          ]}
          defaultActiveKey="details"
        />
      </div>
    </div>
  )
}

export default CreateMap

// function checkHasHex(hex: HexagonItem, hexList: HexPoint[]): HexPoint | undefined {
//   // 检查 hex 是否在 hexList 中
//   return hexList.find((h) => h.q === hex.q && h.r === hex.r && h.s === hex.s)
// }
