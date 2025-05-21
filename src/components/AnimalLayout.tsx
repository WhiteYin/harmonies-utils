import React, { ReactElement, useEffect, useState } from 'react'
import AnimalGrid from './AnimalGrid'

interface AnimalLayoutProps {
  id: number
}
interface Res {
  q: number
  r: number
  s: number
  kind: string
  animal: boolean
  height: number
}
function AnimalLayout({ id }: AnimalLayoutProps): ReactElement {
  const [layouts, setLayouts] = useState<Res[][]>([])

  useEffect(() => {
    setLayouts([])
    // 获取动物列表
    fetch(`/api/animal-layout?id=${id}`)
      .then((response) => response.json())
      .then((data: Res[][]) => {
        setLayouts(data)
      })
      .catch((error) => {
        console.error('Error fetching animal layout:', error)
      })
  }, [id])

  return (
    <div className="flex flex-wrap">
      {layouts.map((layout, index) => (
        <div key={index} className="flex items-center justify-center w-1/2 flex-1/2">
          <AnimalGrid width={380} height={380} points={layout} />
        </div>
      ))}
    </div>
  )
}

export default AnimalLayout
