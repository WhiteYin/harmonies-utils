type Hexagon = {
  q: number
  r: number
  s: number
  kind: string
  animal: boolean
  height: number
}

type ReferenceNode = {
  kind: string
  animal: boolean
  delta_q: number
  delta_r: number
  height: number
}
interface ReferencePattern {
  kind: string
  animal?: boolean // 是否动物节点（可选）
  delta_q?: number // 相对于动物节点的q轴偏移量（可选）
  delta_r?: number // 相对于动物节点的r轴偏移量（可选）
  height: number // 地形高度（必选）
}

class HexagonPlanner {
  private reference: ReferenceNode[]
  private N: number
  private solutions: Hexagon[][] = []
  private rotationPatterns: { deltas: number[][] }[] = []

  constructor(reference: ReferencePattern[], N: number) {
    this.N = N
    this.reference = this.normalizeReference(reference)
    this.prepareRotationPatterns()
  }

  // 算法步骤一：初始化参考形状
  private normalizeReference(patterns: ReferencePattern[]): ReferenceNode[] {
    const animalIndex = patterns.findIndex((p) => p.animal)
    const animalPattern = patterns[animalIndex]

    // 将参考形状重新排序，动物节点作为第一个元素
    return [
      {
        kind: animalPattern.kind,
        animal: true,
        delta_q: 0,
        delta_r: 0,
        height: animalPattern.height,
      },
      ...patterns
        .filter((_, i) => i !== animalIndex)
        .map((p) => ({
          kind: p.kind,
          animal: false,
          delta_q: p.delta_q || 0,
          delta_r: p.delta_r || 0,
          height: p.height,
        })),
    ]
  }

  // 预生成旋转模式
  private prepareRotationPatterns() {
    const ROTATIONS = [
      (q: number, r: number) => [q, r] as [number, number],
      (q: number, r: number) => [-r, q + r],
      (q: number, r: number) => [-q - r, q],
      (q: number, r: number) => [-q, -r],
      (q: number, r: number) => [r, -q - r],
      (q: number, r: number) => [q + r, -q],
    ]

    this.rotationPatterns = ROTATIONS.map((rotate) => ({
      deltas: this.reference.slice(1).map((node) => rotate(node.delta_q, node.delta_r)),
    }))
  }

  // 算法步骤二：深度优先搜索
  public generateSolutions(): Hexagon[][] {
    const initialNodes = this.createInitialNodes()
    this.dfs(initialNodes, 0, 1)
    return this.postProcess()
  }

  private dfs(grid: Map<string, Hexagon>, placedIndex: number, animalCount: number) {
    if (animalCount === this.N) {
      this.solutions.push(this.pruneNodes(grid))
      return
    } else if (animalCount > this.N) {
      return
    }

    const currentNode = this.reference[placedIndex]
    const candidates = this.getCandidates(grid, currentNode)

    for (const [q, r] of candidates) {
      const newGrid = new Map(grid)

      // 放置当前节点
      newGrid.set(`${q},${r}`, {
        q,
        r,
        s: -q - r,
        kind: currentNode.kind,
        animal: currentNode.animal,
        height: currentNode.height,
      })

      // 有效性验证（仅动物节点需要验证）
      if (currentNode.animal) {
        if (!this.validateStructure(q, r, newGrid)) {
          continue
        } else {
          this.dfs(newGrid, 0, animalCount + 1) // 重置索引从0开始
        }
      } else {
        this.dfs(newGrid, placedIndex + 1, animalCount)
      }
    }
  }

  // 结构有效性验证
  private validateStructure(q: number, r: number, grid: Map<string, Hexagon>): boolean {
    return this.rotationPatterns.some((pattern) =>
      pattern.deltas.every(([dq, dr], idx) => {
        const target = this.reference[idx + 1]
        const hex = grid.get(`${q + dq},${r + dr}`)
        return hex?.kind === target.kind && hex?.height === target.height
      })
    )
  }

  // 获取候选位置
  private getCandidates(grid: Map<string, Hexagon>, node: ReferenceNode): [number, number][] {
    if (node.animal) {
      return (
        Array.from(grid.values())
          .filter((h) => !h.animal)
          .flatMap(
            (h) =>
              [
                [h.q + 1, h.r],
                [h.q + 1, h.r - 1],
                [h.q, h.r - 1],
                [h.q - 1, h.r],
                [h.q - 1, h.r + 1],
                [h.q, h.r + 1],
              ] as [number, number][]
          )
          // 过滤掉已经放置的动物节点
          .filter(([q, r]) => !grid.has(`${q},${r}`))
      )
    }
    return Array.from(grid.values())
      .filter((h) => h.animal)
      .flatMap((h) => [[h.q + node.delta_q, h.r + node.delta_r]])
  }

  // 算法步骤三：结果精简
  private postProcess(): Hexagon[][] {
    // 去重（基于规范化坐标）
    const seen = new Set<string>()
    return this.solutions
      .filter((solution) => {
        const normalized = this.normalizeSolution(solution)
        const key = JSON.stringify(normalized)
        return !seen.has(key) && seen.add(key)
      })
      .sort((a, b) => {
        return a.length - b.length
      })
  }

  // 规范化解决方案表示
  private normalizeSolution(solution: Hexagon[]): Hexagon[] {
    // 找到最小坐标作为基准点
    const minQ = Math.min(...solution.map((h) => h.q))
    const minR = Math.min(...solution.map((h) => h.r))

    return solution
      .map((h) => ({
        ...h,
        q: h.q - minQ,
        r: h.r - minR,
        s: -h.q - h.r - (-minQ - minR),
      }))
      .sort((a, b) => a.q - b.q || a.r - b.r || a.s - b.s)
  }

  // 剪枝操作（保留关联节点）
  private pruneNodes(grid: Map<string, Hexagon>): Hexagon[] {
    const animalNodes = Array.from(grid.values()).filter((h) => h.animal)
    const relatedNodes = animalNodes.flatMap((animal) => Array.from(grid.values()).filter((node) => this.isRelated(animal, node)))

    return Array.from(new Set([...animalNodes, ...relatedNodes]))
  }

  private isRelated(animal: Hexagon, node: Hexagon): boolean {
    return this.reference.some((refNode) => node.q === animal.q + refNode.delta_q && node.r === animal.r + refNode.delta_r)
  }

  // 初始化画布
  private createInitialNodes(): Map<string, Hexagon> {
    const grid = new Map<string, Hexagon>()
    const referenceOrigin = this.reference[0] // 动物节点

    // 1. 放置动物节点
    grid.set('0,0', {
      q: 0,
      r: 0,
      s: 0,
      kind: referenceOrigin.kind,
      animal: true,
      height: referenceOrigin.height,
    })

    // 2. 放置所有辅助节点
    for (const node of this.reference.slice(1)) {
      const absoluteQ = node.delta_q // 相对于原点的偏移
      const absoluteR = node.delta_r

      grid.set(`${absoluteQ},${absoluteR}`, {
        q: absoluteQ,
        r: absoluteR,
        s: -absoluteQ - absoluteR,
        kind: node.kind,
        animal: false,
        height: node.height,
      })
    }

    return grid
  }
}

export { HexagonPlanner }
