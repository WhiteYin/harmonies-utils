'use client'
import { HexPoint } from '@/app/page'
import React, { ReactElement } from 'react'
import { HexGrid, Layout, Hexagon, Text } from 'react-hexgrid'

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

interface PropTypes {
  points?: HexPoint[]
  width?: number
  height?: number
  viewBox?: string
}
function AnimalGrid({ points, width = 600, height = 800, viewBox = '-60 -60 120 120' }: PropTypes): ReactElement {
  return (
    <HexGrid width={width} height={height} viewBox={viewBox}>
      <Layout size={{ x: 8, y: 8 }} flat={true} origin={{ x: 0, y: 0 }}>
        {/* 渲染六边形 */}
        {points?.map((hex, index) => {
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
  )
}

export default AnimalGrid
