import type { DFAState } from '../../types/dfa'

interface StateNodeProps {
  state: DFAState
  isActive?: boolean
  isVisited?: boolean
  onStateClick?: (stateId: string) => void
}

/**
 * StateNode - Visual representation of a DFA state
 * Renders as a circle with label, special styling for initial/accepting states
 */
export function StateNode({ state, isActive = false, isVisited = false, onStateClick }: StateNodeProps) {
  const radius = 30
  const strokeWidth = 2

  const handleClick = () => {
    if (onStateClick) {
      onStateClick(state.id)
    }
  }

  return (
    <g
      className="state-node"
      transform={`translate(${state.x}, ${state.y})`}
      onClick={handleClick}
      style={{ cursor: onStateClick ? 'pointer' : 'default' }}
    >
      {/* Main circle */}
      <circle
        r={radius}
        fill={isActive ? '#4f46e5' : isVisited ? '#e0e7ff' : '#ffffff'}
        stroke={isActive ? '#312e81' : '#4b5563'}
        strokeWidth={strokeWidth}
        className="transition-all duration-300"
      />

      {/* Double circle for accepting states */}
      {state.isAccepting && (
        <circle
          r={radius - 6}
          fill="none"
          stroke={isActive ? '#312e81' : '#4b5563'}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />
      )}

      {/* State label */}
      <text
        textAnchor="middle"
        dy="0.35em"
        fontSize="14"
        fontWeight="600"
        fill={isActive ? '#ffffff' : '#1f2937'}
        className="select-none transition-all duration-300"
      >
        {state.label}
      </text>

      {/* Initial state indicator (arrow pointing to state) */}
      {state.isInitial && (
        <g transform={`translate(-${radius + 40}, 0)`}>
          <line
            x1="0"
            y1="0"
            x2={radius + 10}
            y2="0"
            stroke="#4b5563"
            strokeWidth={2}
            markerEnd="url(#arrowhead-initial)"
          />
          <text
            x="-10"
            y="0"
            textAnchor="end"
            dy="0.35em"
            fontSize="12"
            fill="#6b7280"
            fontStyle="italic"
          >
            start
          </text>
        </g>
      )}

      {/* Hover effect circle */}
      {onStateClick && (
        <circle
          r={radius + 5}
          fill="transparent"
          className="hover:fill-indigo-50 transition-all duration-200"
        />
      )}
    </g>
  )
}
