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
      {/* Shadow line for active transitions */}
      {isActive && (
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#4f46e5"
          strokeWidth={strokeWidth + 4}
          opacity="0.2"
          className="transition-all duration-300"
        />
      )}

      {/* Arrow line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isActive ? 'url(#arrowhead-active)' : isVisited ? 'url(#arrowhead-visited)' : 'url(#arrowhead)'}
        className="transition-all duration-300"
        style={{
          filter: isActive ? 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.6))' : 'none'
        }}
      />

      {/* Animated flow dot for active transition */}
      {isActive && (
        <circle r="4" fill="#fbbf24" className="animate-flow">
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            path={`M ${startX} ${startY} L ${endX} ${endY}`}
          />
        </circle>
      )}

      {/* Symbol label */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        <circle
          r={isActive ? "14" : "12"}
          fill="white"
          stroke={strokeColor}
          strokeWidth={isActive ? "2" : "1.5"}
          className="transition-all duration-300"
          style={{
            filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
          }}
        />
        <text
          textAnchor="middle"
          dy="0.35em"
          fontSize={isActive ? "14" : "13"}
          fontWeight={isActive ? "700" : "600"}
          fill={isActive ? '#4f46e5' : isVisited ? '#6366f1' : '#374151'}
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
      {/* Shadow circle for active transitions */}
      {isActive && (
        <circle
          cx={loopCenterX}
          cy={loopCenterY}
          r={loopRadius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={strokeWidth + 4}
          opacity="0.2"
          className="transition-all duration-300"
        />
      )}

      {/* Self-loop circle */}
      <circle
        cx={loopCenterX}
        cy={loopCenterY}
        r={loopRadius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isActive ? 'url(#arrowhead-active)' : isVisited ? 'url(#arrowhead-visited)' : 'url(#arrowhead)'}
        className="transition-all duration-300"
        style={{
          filter: isActive ? 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.6))' : 'none'
        }}
      />

      {/* Animated flow dot for active self-loop */}
      {isActive && (
        <circle r="4" fill="#fbbf24">
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            path={`M ${loopCenterX} ${loopCenterY - loopRadius} 
                   A ${loopRadius} ${loopRadius} 0 1 1 ${loopCenterX} ${loopCenterY - loopRadius}`}
          />
        </circle>
      )}

      {/* Symbol label */}
      <g transform={`translate(${loopCenterX}, ${loopCenterY - loopRadius - 5})`}>
        <circle 
          r={isActive ? "14" : "12"} 
          fill="white" 
          stroke={strokeColor} 
          strokeWidth={isActive ? "2" : "1.5"}
          className="transition-all duration-300"
          style={{
            filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
          }}
        />
        <text
          textAnchor="middle"
          dy="0.35em"
          fontSize={isActive ? "14" : "13"}
          fontWeight={isActive ? "700" : "600"}
          fill={isActive ? '#4f46e5' : isVisited ? '#6366f1' : '#374151'}
          className="select-none transition-all duration-300"
        >
          {symbol}
        </text>
      </g>
    </g>
  )
}
