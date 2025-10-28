import type { DFAState, DFATransition } from '../../types/dfa'

interface TransitionEdgeProps {
  transition: DFATransition
  fromState: DFAState
  toState: DFAState
  isActive?: boolean
  isVisited?: boolean
}

/**
 * TransitionEdge - Visual representation of a state transition
 * Renders as an arrow with symbol label
 */
export function TransitionEdge({ 
  transition, 
  fromState, 
  toState, 
  isActive = false,
  isVisited = false 
}: TransitionEdgeProps) {
  const isSelfLoop = fromState.id === toState.id

  if (isSelfLoop) {
    return <SelfLoopEdge state={fromState} symbol={transition.symbol} isActive={isActive} isVisited={isVisited} />
  }

  // Calculate arrow path
  const dx = toState.x - fromState.x
  const dy = toState.y - fromState.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Normalize direction
  const nx = dx / distance
  const ny = dy / distance

  // Offset from state centers (account for state radius)
  const radius = 30
  const startX = fromState.x + nx * radius
  const startY = fromState.y + ny * radius
  const endX = toState.x - nx * radius
  const endY = toState.y - ny * radius

  // Calculate midpoint for label
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  // Calculate label offset (perpendicular to arrow)
  const offsetDistance = 15
  const labelX = midX - ny * offsetDistance
  const labelY = midY + nx * offsetDistance

  const strokeColor = isActive ? '#4f46e5' : isVisited ? '#818cf8' : '#9ca3af'
  const strokeWidth = isActive ? 3 : 2

  return (
    <g className="transition-edge">
      {/* Arrow line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
        className="transition-all duration-300"
      />

      {/* Symbol label */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        <circle
          r="12"
          fill="white"
          stroke={strokeColor}
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
        <text
          textAnchor="middle"
          dy="0.35em"
          fontSize="13"
          fontWeight="600"
          fill={isActive ? '#4f46e5' : '#374151'}
          className="select-none transition-all duration-300"
        >
          {transition.symbol}
        </text>
      </g>
    </g>
  )
}

/**
 * SelfLoopEdge - Special case for transitions from a state to itself
 */
function SelfLoopEdge({ 
  state, 
  symbol, 
  isActive, 
  isVisited 
}: { 
  state: DFAState
  symbol: string
  isActive: boolean
  isVisited: boolean
}) {
  const radius = 30
  const loopRadius = 25

  // Position loop above the state
  const loopCenterX = state.x
  const loopCenterY = state.y - radius - loopRadius

  const strokeColor = isActive ? '#4f46e5' : isVisited ? '#818cf8' : '#9ca3af'
  const strokeWidth = isActive ? 3 : 2

  return (
    <g className="self-loop-edge">
      {/* Self-loop circle */}
      <circle
        cx={loopCenterX}
        cy={loopCenterY}
        r={loopRadius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
        className="transition-all duration-300"
      />

      {/* Symbol label */}
      <g transform={`translate(${loopCenterX}, ${loopCenterY - loopRadius - 5})`}>
        <circle r="12" fill="white" stroke={strokeColor} strokeWidth="1.5" />
        <text
          textAnchor="middle"
          dy="0.35em"
          fontSize="13"
          fontWeight="600"
          fill={isActive ? '#4f46e5' : '#374151'}
          className="select-none"
        >
          {symbol}
        </text>
      </g>
    </g>
  )
}
