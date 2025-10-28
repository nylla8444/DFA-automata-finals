import { useEffect, useState } from 'react'
import type { DFA } from '../../types/dfa'
import { 
  calculateCircularLayout,
  calculateSelfLoopPath,
} from '../../utils/layout'

interface DFACanvasProps {
  dfa: DFA
  currentStateId?: string
  visitedStateIds?: string[]
  highlightedTransitionId?: string
  visitedTransitionIds?: string[]  // New: show the path trail
  width?: number
  height?: number
  onStateClick?: (stateId: string) => void
}

/**
 * DFACanvas - Main SVG canvas for rendering DFA visualization
 * Uses linear layout for clearer visualization with grouped transitions
 */
export function DFACanvas({
  dfa,
  currentStateId,
  visitedStateIds = [],
  highlightedTransitionId,
  visitedTransitionIds = [],
  width = 1000,
  height = 400,
  onStateClick
}: DFACanvasProps) {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const stateRadius = 30

  // Calculate circular layout when DFA changes
  useEffect(() => {
    const newPositions = calculateCircularLayout(
      dfa.states.map(s => s.id),
      dfa.initialStateId,
      width,
      height,
    )
    setPositions(newPositions)
  }, [dfa, width, height])

  if (positions.size === 0) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Loading visualization...</div>
  }

  const initialPos = positions.get(dfa.initialStateId)

  return (
    <div className="dfa-canvas-container border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white"
        style={{ minHeight: height }}
      >
        {/* Define arrowhead markers */}
        <defs>
          {/* Default arrowhead */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
          </marker>

          {/* Active arrowhead */}
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>

          {/* Visited arrowhead */}
          <marker
            id="arrowhead-visited"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#818cf8" />
          </marker>
        </defs>

        {/* Initial state arrow */}
        {initialPos && (
          <g>
            <line
              x1={20}
              y1={initialPos.y}
              x2={initialPos.x - stateRadius - 10}
              y2={initialPos.y}
              stroke="#666"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <text
              x={25}
              y={initialPos.y - 12}
              fontSize="12"
              fill="#666"
              fontWeight="600"
              fontStyle="italic"
            >
              start
            </text>
          </g>
        )}

        {/* Render transitions - iterate by individual transitions for highlighting */}
        <g className="transitions">
          {dfa.transitions.map((transition) => {
            const fromPos = positions.get(transition.fromStateId)
            const toPos = positions.get(transition.toStateId)

            if (!fromPos || !toPos) return null

            const isSelfLoop = transition.fromStateId === transition.toStateId
            
            // Check if this specific transition is highlighted
            const isHighlighted = highlightedTransitionId === transition.id
            const isVisited = visitedTransitionIds.includes(transition.id)
            
            // Default styling
            let strokeColor = '#999'
            let strokeWidth = 1.5
            let markerEnd = 'url(#arrowhead)'
            
            // Override if visited (but not current)
            if (isVisited && !isHighlighted) {
              strokeColor = '#a5b4fc'  // Light blue for visited path
              strokeWidth = 2
              markerEnd = 'url(#arrowhead-visited)'
            }
            
            // Override if highlighted (current)
            if (isHighlighted) {
              strokeColor = '#3b82f6'
              strokeWidth = 3
              markerEnd = 'url(#arrowhead-active)'
            }

            const groupKey = `${transition.fromStateId}-${transition.toStateId}-${transition.symbol}`

            if (isSelfLoop) {
              const selfLoopPath = calculateSelfLoopPath(fromPos.x, fromPos.y, stateRadius)
              return (
                <g key={groupKey}>
                  <path
                    d={selfLoopPath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={markerEnd}
                    className="transition-all duration-300"
                  />
                  {/* Label with background */}
                  <rect
                    x={fromPos.x + 25}
                    y={fromPos.y - 68}
                    width={30}
                    height={20}
                    fill="white"
                    stroke={isHighlighted ? '#3b82f6' : '#e5e7eb'}
                    strokeWidth={isHighlighted ? '2' : '1'}
                    rx="3"
                  />
                  <text
                    x={fromPos.x + 40}
                    y={fromPos.y - 55}
                    fontSize="14"
                    fontWeight="600"
                    fill={strokeColor}
                    textAnchor="middle"
                    className="transition-all duration-300"
                  >
                    {transition.symbol}
                  </text>
                </g>
              )
            }

            // Calculate simple curved path
            const dx = toPos.x - fromPos.x
            const dy = toPos.y - fromPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const unitDx = dx / distance
            const unitDy = dy / distance

            // Start and end at edge of circles
            const startX = fromPos.x + unitDx * stateRadius
            const startY = fromPos.y + unitDy * stateRadius
            const endX = toPos.x - unitDx * stateRadius
            const endY = toPos.y - unitDy * stateRadius

            // Simple quadratic curve control point (slight curve)
            const midX = (startX + endX) / 2
            const midY = (startY + endY) / 2
            const curvature = 0.15
            const controlX = midX - unitDy * distance * curvature
            const controlY = midY + unitDx * distance * curvature

            const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
            
            // Label at curve midpoint
            const labelX = 0.25 * startX + 0.5 * controlX + 0.25 * endX
            const labelY = 0.25 * startY + 0.5 * controlY + 0.25 * endY

            return (
              <g key={groupKey}>
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={markerEnd}
                  className="transition-all duration-300"
                />
                
                {/* Label with clean background */}
                <rect
                  x={labelX - 20}
                  y={labelY - 10}
                  width={40}
                  height={20}
                  fill="white"
                  stroke={isHighlighted ? '#3b82f6' : '#e5e7eb'}
                  strokeWidth={isHighlighted ? '2' : '1'}
                  rx="3"
                />
                <text
                  x={labelX}
                  y={labelY + 4}
                  fontSize="14"
                  fontWeight="600"
                  fill={strokeColor}
                  textAnchor="middle"
                  className="transition-all duration-300"
                >
                  {transition.symbol}
                </text>
              </g>
            )
          })}
        </g>

        {/* Render states on top of transitions */}
        <g className="states">
          {dfa.states.map((state) => {
            const pos = positions.get(state.id)
            if (!pos) return null

            const isActive = currentStateId === state.id
            const isVisited = visitedStateIds.includes(state.id)
            const isAccepting = dfa.acceptingStateIds.includes(state.id)

            return (
              <g
                key={state.id}
                onClick={() => onStateClick?.(state.id)}
                style={{ cursor: onStateClick ? 'pointer' : 'default' }}
                className="transition-all duration-300"
              >
                {/* Outer circle for accepting states */}
                {isAccepting && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={stateRadius + 5}
                    fill="none"
                    stroke={isActive ? '#3b82f6' : isVisited ? '#818cf8' : '#374151'}
                    strokeWidth={2}
                    className="transition-all duration-300"
                  />
                )}

                {/* Main state circle with shadow */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={stateRadius}
                  fill={isActive ? '#3b82f6' : isVisited ? '#dbeafe' : '#ffffff'}
                  stroke={isActive ? '#2563eb' : isVisited ? '#93c5fd' : '#374151'}
                  strokeWidth={isActive ? 2.5 : 2}
                  filter={isActive ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' : 'none'}
                  className="transition-all duration-300"
                />

                {/* State label */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="600"
                  fill={isActive ? '#ffffff' : '#1f2937'}
                  className="pointer-events-none select-none transition-all duration-300"
                >
                  {state.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
