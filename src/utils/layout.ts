/**
 * Layout utilities for positioning DFA states
 * Uses hierarchical/linear layout for cleaner visualization
 */

export interface Position {
  x: number
  y: number
}

export interface GroupedTransition {
  fromStateId: string
  toStateId: string
  symbols: string[]
  transitionIds: string[]
  isBidirectional: boolean  // Has a reverse transition
  offset: number  // Offset amount for bidirectional arrows
}

/**
 * Group transitions by state pair (combines multiple symbols on same arrow)
 * Detects bidirectional transitions and calculates offsets to prevent overlap
 */
export function groupTransitionsByStatePair(
  transitions: Array<{ id: string; fromStateId: string; toStateId: string; symbol: string }>
): GroupedTransition[] {
  const groupMap = new Map<string, GroupedTransition>()
  const reverseMap = new Set<string>()
  
  // First pass: identify all transitions
  transitions.forEach((trans) => {
    const key = `${trans.fromStateId}->${trans.toStateId}`
    const reverseKey = `${trans.toStateId}->${trans.fromStateId}`
    
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        fromStateId: trans.fromStateId,
        toStateId: trans.toStateId,
        symbols: [],
        transitionIds: [],
        isBidirectional: false,
        offset: 0,
      })
    }
    
    const group = groupMap.get(key)!
    group.symbols.push(trans.symbol)
    group.transitionIds.push(trans.id)
    
    // Check if reverse transition exists
    if (groupMap.has(reverseKey) || reverseMap.has(reverseKey)) {
      group.isBidirectional = true
    }
    reverseMap.add(key)
  })
  
  // Second pass: assign offsets for bidirectional arrows
  const processedPairs = new Set<string>()
  for (const group of groupMap.values()) {
    if (group.isBidirectional) {
      const pairKey = [group.fromStateId, group.toStateId].sort().join('<->')
      if (!processedPairs.has(pairKey)) {
        // Offset the first arrow up
        group.offset = 15
        // Find and offset the reverse arrow down
        const reverseKey = `${group.toStateId}->${group.fromStateId}`
        const reverseGroup = groupMap.get(reverseKey)
        if (reverseGroup) {
          reverseGroup.isBidirectional = true
          reverseGroup.offset = -15
        }
        processedPairs.add(pairKey)
      }
    }
  }
  
  return Array.from(groupMap.values())
}

/**
 * Calculate positions using a circular layout
 * States are positioned in a circle for better visibility of all transitions
 */
export function calculateCircularLayout(
  stateIds: string[],
  initialStateId: string,
  canvasWidth: number,
  canvasHeight: number,
): Map<string, Position> {
  const positions = new Map<string, Position>()
  
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const radius = Math.min(canvasWidth, canvasHeight) * 0.35 // 35% of canvas size
  
  // Put initial state at top (12 o'clock position)
  const initialIndex = stateIds.indexOf(initialStateId)
  
  // Reorder so initial state is first
  const orderedStates = initialIndex >= 0
    ? [
        stateIds[initialIndex],
        ...stateIds.slice(0, initialIndex),
        ...stateIds.slice(initialIndex + 1),
      ]
    : stateIds
  
  // Calculate angle between each state
  const angleStep = (2 * Math.PI) / orderedStates.length
  const startAngle = -Math.PI / 2 // Start at top (12 o'clock)
  
  orderedStates.forEach((stateId, index) => {
    const angle = startAngle + index * angleStep
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    positions.set(stateId, { x, y })
  })
  
  return positions
}

/**
 * Calculate positions using a linear/hierarchical layout
 * States are positioned left to right based on their distance from initial state
 */
export function calculateLinearLayout(
  stateIds: string[],
  initialStateId: string,
  transitions: Array<{ fromStateId: string; toStateId: string }>,
  canvasWidth: number,
  canvasHeight: number,
): Map<string, Position> {
  const positions = new Map<string, Position>()
  
  // Calculate depth/level for each state using BFS
  const levels = new Map<string, number>()
  const visited = new Set<string>()
  const queue: string[] = [initialStateId]
  levels.set(initialStateId, 0)
  visited.add(initialStateId)
  
  while (queue.length > 0) {
    const current = queue.shift()!
    const currentLevel = levels.get(current)!
    
    // Find all states reachable from current
    for (const trans of transitions) {
      if (trans.fromStateId === current && !visited.has(trans.toStateId)) {
        visited.add(trans.toStateId)
        levels.set(trans.toStateId, currentLevel + 1)
        queue.push(trans.toStateId)
      }
    }
  }
  
  // Handle unreachable states (shouldn't happen in valid DFA, but be safe)
  for (const stateId of stateIds) {
    if (!levels.has(stateId)) {
      levels.set(stateId, 0)
    }
  }
  
  // Group states by level
  const statesByLevel = new Map<number, string[]>()
  for (const [stateId, level] of levels) {
    if (!statesByLevel.has(level)) {
      statesByLevel.set(level, [])
    }
    statesByLevel.get(level)!.push(stateId)
  }
  
  // Calculate positions
  const maxLevel = Math.max(...Array.from(levels.values()), 0)
  const horizontalSpacing = Math.min(250, (canvasWidth - 150) / Math.max(maxLevel + 1, 1))
  
  for (const [level, statesInLevel] of statesByLevel) {
    const x = 100 + level * horizontalSpacing
    const maxStatesInLevel = Math.max(...Array.from(statesByLevel.values()).map(s => s.length))
    const verticalSpacing = canvasHeight / (maxStatesInLevel + 1)
    
    statesInLevel.forEach((stateId, index) => {
      const y = verticalSpacing * (index + 1) + (canvasHeight - verticalSpacing * statesInLevel.length) / 2
      positions.set(stateId, { x, y })
    })
  }
  
  return positions
}

/**
 * Calculate curved arrow path with offset for bidirectional arrows
 * Returns path and label position that won't overlap
 */
export function calculateOffsetCurvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number = 30,
  offset: number = 0, // Offset amount for bidirectional arrows
): { path: string; labelX: number; labelY: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance === 0) return { path: `M ${x1} ${y1}`, labelX: x1, labelY: y1 }
  
  // Normalize direction
  const unitDx = dx / distance
  const unitDy = dy / distance
  
  // Perpendicular for offset
  const perpDx = -unitDy * offset
  const perpDy = unitDx * offset
  
  // Start and end points with offset
  const startX = x1 + unitDx * radius + perpDx
  const startY = y1 + unitDy * radius + perpDy
  const endX = x2 - unitDx * radius + perpDx
  const endY = y2 - unitDy * radius + perpDy
  
  // Control point for gentle curve (at midpoint, offset perpendicular)
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const controlX = midX + perpDx * (offset === 0 ? 0 : 0.5)
  const controlY = midY + perpDy * (offset === 0 ? 0 : 0.5)
  
  // Calculate label position on the curve at t=0.5
  const t = 0.5
  const oneMinusT = 1 - t
  const labelX = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * controlX + t * t * endX
  const labelY = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * controlY + t * t * endY
  
  return {
    path: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`,
    labelX,
    labelY,
  }
}

/**
 * Calculate curved arrow path for circular layouts
 * Creates a quadratic bezier curve that bends away from the center
 */
export function calculateCurvedPathForCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  centerX: number,
  centerY: number,
  radius: number = 30,
  curvature: number = 0.3,
): { path: string; labelX: number; labelY: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance === 0) return { path: `M ${x1} ${y1}`, labelX: x1, labelY: y1 }
  
  // Normalize
  const unitDx = dx / distance
  const unitDy = dy / distance
  
  // Start and end points (accounting for circle radius)
  const startX = x1 + unitDx * radius
  const startY = y1 + unitDy * radius
  const endX = x2 - unitDx * radius
  const endY = y2 - unitDy * radius
  
  // Midpoint
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  
  // Direction away from center for control point
  const toCenterX = centerX - midX
  const toCenterY = centerY - midY
  const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY)
  
  // Control point pushes away from center
  const controlX = midX - (toCenterX / toCenterDist) * distance * curvature
  const controlY = midY - (toCenterY / toCenterDist) * distance * curvature
  
  // Label position: calculate actual point on Bezier curve at t=0.5
  // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
  const t = 0.5
  const oneMinusT = 1 - t
  const labelX = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * controlX + t * t * endX
  const labelY = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * controlY + t * t * endY
  
  return {
    path: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`,
    labelX,
    labelY,
  }
}

/**
 * Calculate straight arrow path with optional offset for bidirectional arrows
 * Returns both the path and the label position
 */
export function calculateStraightPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number = 30,
  offset: number = 0,
): { path: string; labelX: number; labelY: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance === 0) return { path: `M ${x1} ${y1}`, labelX: x1, labelY: y1 }
  
  // Normalize
  const unitDx = dx / distance
  const unitDy = dy / distance
  
  // Perpendicular offset for bidirectional arrows
  const perpDx = -unitDy * offset
  const perpDy = unitDx * offset
  
  // Start and end points (accounting for circle radius and offset)
  const startX = x1 + unitDx * radius + perpDx
  const startY = y1 + unitDy * radius + perpDy
  const endX = x2 - unitDx * radius + perpDx
  const endY = y2 - unitDy * radius + perpDy
  
  // Label position (slightly above the line)
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const labelOffsetX = -unitDy * 20  // Perpendicular to line
  const labelOffsetY = unitDx * 20
  
  return {
    path: `M ${startX},${startY} L ${endX},${endY}`,
    labelX: midX + labelOffsetX,
    labelY: midY + labelOffsetY,
  }
}

/**
 * Calculate curved arrow path between two points
 * Used as fallback for complex layouts
 */
export function calculateCurvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number = 30,
  curvature: number = 0.2,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance === 0) return `M ${x1} ${y1}`
  
  // Normalize and shorten by radius
  const unitDx = dx / distance
  const unitDy = dy / distance
  
  const startX = x1 + unitDx * radius
  const startY = y1 + unitDy * radius
  const endX = x2 - unitDx * radius
  const endY = y2 - unitDy * radius
  
  // Create curve control point (perpendicular offset)
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const perpX = -dy / distance * distance * curvature
  const perpY = dx / distance * distance * curvature
  
  return `M ${startX},${startY} Q ${midX + perpX},${midY + perpY} ${endX},${endY}`
}

/**
 * Calculate self-loop path
 */
export function calculateSelfLoopPath(
  x: number,
  y: number,
  radius: number = 30,
  loopSize: number = 40,
): string {
  const startAngle = -50 * (Math.PI / 180)
  const endAngle = 50 * (Math.PI / 180)
  
  const startX = x + Math.cos(startAngle) * radius
  const startY = y + Math.sin(startAngle) * radius
  const endX = x + Math.cos(endAngle) * radius
  const endY = y + Math.sin(endAngle) * radius
  
  const controlX = x + loopSize
  const controlY = y - loopSize - 10
  
  return `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`
}
