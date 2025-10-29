import { useState, useRef, useEffect } from 'react'
import type { DFA, DFAState, DFATransition } from '../../types/dfa'
import { generateStateId } from '../../utils/dfa-engine'

interface DFAEditorProps {
  initialDFA: DFA
  onChange: (dfa: DFA) => void
  width?: number
  height?: number
}

interface TransitionCreation {
  fromStateId: string
  x: number
  y: number
}

/**
 * Interactive DFA Editor - Visual builder for creating/editing DFAs
 */
export function DFAEditor({ initialDFA, onChange, width = 1000, height = 600 }: DFAEditorProps) {
  const [dfa, setDFA] = useState<DFA>(initialDFA)
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)
  const [draggingStateId, setDraggingStateId] = useState<string | null>(null)
  const [creatingTransition, setCreatingTransition] = useState<TransitionCreation | null>(null)
  const [mode, setMode] = useState<'select' | 'addState' | 'addTransition'>('select')
  
  const svgRef = useRef<SVGSVGElement>(null)
  const stateRadius = 30

  // Initialize positions from state data or calculate if not set
  useEffect(() => {
    if (positions.size === 0 && dfa.states.length > 0) {
      const newPositions = new Map<string, { x: number; y: number }>()
      dfa.states.forEach((state, index) => {
        // Use saved positions if available, otherwise arrange in a circle
        if (state.x !== undefined && state.y !== undefined && state.x !== 0 && state.y !== 0) {
          newPositions.set(state.id, { x: state.x, y: state.y })
        } else {
          const angle = (index / dfa.states.length) * 2 * Math.PI - Math.PI / 2
          const radius = Math.min(width, height) * 0.3
          const centerX = width / 2
          const centerY = height / 2
          newPositions.set(state.id, {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          })
        }
      })
      setPositions(newPositions)
    }
  }, [dfa.states, positions.size, width, height])

  // Update parent when DFA changes
  useEffect(() => {
    onChange(dfa)
  }, [dfa, onChange])

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a state
    const clickedStateId = Array.from(positions.entries()).find(([_, pos]) => {
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2)
      return distance <= stateRadius
    })?.[0]

    if (mode === 'addState' && !clickedStateId) {
      // Add new state
      const newStateId = generateStateId(dfa.states)
      const newState: DFAState = {
        id: newStateId,
        label: `q${dfa.states.length}`,
        isInitial: false,
        isAccepting: false,
        x: x,
        y: y,
      }

      setDFA({
        ...dfa,
        states: [...dfa.states, newState],
      })

      setPositions(new Map(positions).set(newStateId, { x, y }))
      setMode('select')
    } else if (mode === 'addTransition' && clickedStateId) {
      if (!creatingTransition) {
        // Start creating transition
        setCreatingTransition({ fromStateId: clickedStateId, x, y })
      } else {
        // Complete transition (allow self-loops)
        // Prompt for symbol
        const symbol = prompt('Enter transition symbol:')
        if (symbol && symbol.length === 1) {
          const newTransition: DFATransition = {
            id: `t${dfa.transitions.length}`,
            fromStateId: creatingTransition.fromStateId,
            toStateId: clickedStateId,
            symbol,
          }

          // Add symbol to alphabet if not present
          const newAlphabet = dfa.alphabet.includes(symbol)
            ? dfa.alphabet
            : [...dfa.alphabet, symbol].sort()

          setDFA({
            ...dfa,
            alphabet: newAlphabet,
            transitions: [...dfa.transitions, newTransition],
          })
        }
        setCreatingTransition(null)
        setMode('select')
      }
    } else if (mode === 'select') {
      setSelectedStateId(clickedStateId || null)
    }
  }

  const handleMouseDown = (stateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === 'select') {
      setDraggingStateId(stateId)
      setSelectedStateId(stateId)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !draggingStateId) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(stateRadius, Math.min(width - stateRadius, e.clientX - rect.left))
    const y = Math.max(stateRadius, Math.min(height - stateRadius, e.clientY - rect.top))

    setPositions(new Map(positions).set(draggingStateId, { x, y }))
  }

  const handleMouseUp = () => {
    if (draggingStateId) {
      // Update the DFA state positions when dragging ends
      const pos = positions.get(draggingStateId)
      if (pos) {
        const updatedStates = dfa.states.map(state =>
          state.id === draggingStateId
            ? { ...state, x: pos.x, y: pos.y }
            : state
        )
        setDFA({ ...dfa, states: updatedStates })
      }
    }
    setDraggingStateId(null)
  }

  const deleteState = (stateId: string) => {
    if (!confirm('Delete this state?')) return

    setDFA({
      ...dfa,
      states: dfa.states.filter(s => s.id !== stateId),
      transitions: dfa.transitions.filter(t => t.fromStateId !== stateId && t.toStateId !== stateId),
      initialStateId: dfa.initialStateId === stateId ? dfa.states.find(s => s.id !== stateId)?.id || '' : dfa.initialStateId,
      acceptingStateIds: dfa.acceptingStateIds.filter(id => id !== stateId),
    })

    const newPositions = new Map(positions)
    newPositions.delete(stateId)
    setPositions(newPositions)
    setSelectedStateId(null)
  }

  const deleteTransition = (transitionId: string) => {
    if (!confirm('Delete this transition?')) return

    setDFA({
      ...dfa,
      transitions: dfa.transitions.filter(t => t.id !== transitionId),
    })
  }

  const toggleInitialState = (stateId: string) => {
    setDFA({
      ...dfa,
      initialStateId: stateId,
    })
  }

  const toggleAcceptingState = (stateId: string) => {
    const isAccepting = dfa.acceptingStateIds.includes(stateId)
    setDFA({
      ...dfa,
      acceptingStateIds: isAccepting
        ? dfa.acceptingStateIds.filter(id => id !== stateId)
        : [...dfa.acceptingStateIds, stateId],
    })
  }

  const updateStateLabel = (stateId: string, newLabel: string) => {
    setDFA({
      ...dfa,
      states: dfa.states.map(s => s.id === stateId ? { ...s, label: newLabel } : s),
    })
  }

  return (
    <div className="dfa-editor">
      {/* Toolbar */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('select')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'select'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🖱️ Select
            </button>
            <button
              onClick={() => setMode('addState')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'addState'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ➕ Add State
            </button>
            <button
              onClick={() => setMode('addTransition')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'addTransition'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ➡️ Add Transition
            </button>
          </div>

          <div className="border-l border-gray-300 pl-4 flex gap-2 text-sm">
            <span className="text-gray-600">States: {dfa.states.length}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-600">Transitions: {dfa.transitions.length}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-600">Alphabet: {dfa.alphabet.join(', ') || 'empty'}</span>
          </div>
        </div>

        {mode === 'addState' && (
          <p className="text-sm text-gray-600 mt-2">
            💡 Click anywhere on the canvas to add a new state
          </p>
        )}
        {mode === 'addTransition' && (
          <p className="text-sm text-gray-600 mt-2">
            💡 Click a state to start, then click another state to create a transition
          </p>
        )}
      </div>

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair"
          style={{ minHeight: height }}
        >
          <defs>
            <marker
              id="arrowhead-editor"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#666" />
            </marker>
          </defs>

          {/* Render transitions */}
          {dfa.transitions.map((transition) => {
            const fromPos = positions.get(transition.fromStateId)
            const toPos = positions.get(transition.toStateId)

            if (!fromPos || !toPos) return null

            const isSelfLoop = transition.fromStateId === transition.toStateId

            if (isSelfLoop) {
              // Self-loop - curves outward from the top of the state
              const loopRadius = stateRadius * 1.5
              const path = `M ${fromPos.x - stateRadius * 0.5} ${fromPos.y - stateRadius * 0.7} 
                           C ${fromPos.x - loopRadius * 1.2} ${fromPos.y - loopRadius * 1.5}
                             ${fromPos.x + loopRadius * 1.2} ${fromPos.y - loopRadius * 1.5}
                             ${fromPos.x + stateRadius * 0.5} ${fromPos.y - stateRadius * 0.7}`

              return (
                <g key={transition.id}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-editor)"
                  />
                  <text
                    x={fromPos.x}
                    y={fromPos.y - loopRadius * 1.7}
                    fontSize="14"
                    fontWeight="600"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {transition.symbol}
                  </text>
                  <circle
                    cx={fromPos.x}
                    cy={fromPos.y - loopRadius * 1.5}
                    r="8"
                    fill="red"
                    opacity="0"
                    className="cursor-pointer hover:opacity-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTransition(transition.id)
                    }}
                  />
                </g>
              )
            }

            // Regular transition
            const dx = toPos.x - fromPos.x
            const dy = toPos.y - fromPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const unitDx = dx / distance
            const unitDy = dy / distance

            // Check if there's a reverse transition
            const hasReverseTransition = dfa.transitions.some(
              t => t.fromStateId === transition.toStateId && t.toStateId === transition.fromStateId
            )

            if (hasReverseTransition) {
              // Use curved path for bidirectional arrows
              const perpDx = -unitDy
              const perpDy = unitDx
              const curveOffset = 25  // How much to curve

              const startX = fromPos.x + unitDx * stateRadius
              const startY = fromPos.y + unitDy * stateRadius
              const endX = toPos.x - unitDx * stateRadius
              const endY = toPos.y - unitDy * stateRadius

              // Control point for quadratic curve, offset to the side
              const midX = (fromPos.x + toPos.x) / 2 + perpDx * curveOffset
              const midY = (fromPos.y + toPos.y) / 2 + perpDy * curveOffset

              const curvePath = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`

              // Label position along the curve
              const t = 0.5  // Midpoint of curve
              const labelX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX
              const labelY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY

              return (
                <g key={transition.id}>
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-editor)"
                  />
                  <rect
                    x={labelX - 20}
                    y={labelY - 10}
                    width={40}
                    height={20}
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    rx="3"
                  />
                  <text
                    x={labelX}
                    y={labelY + 4}
                    fontSize="14"
                    fontWeight="600"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {transition.symbol}
                  </text>
                  <circle
                    cx={labelX}
                    cy={labelY}
                    r="15"
                    fill="red"
                    opacity="0"
                    className="cursor-pointer hover:opacity-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTransition(transition.id)
                    }}
                  />
                </g>
              )
            }

            // Single direction - use straight line
            const startX = fromPos.x + unitDx * stateRadius
            const startY = fromPos.y + unitDy * stateRadius
            const endX = toPos.x - unitDx * stateRadius
            const endY = toPos.y - unitDy * stateRadius

            const midX = (startX + endX) / 2
            const midY = (startY + endY) / 2

            return (
              <g key={transition.id}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#666"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead-editor)"
                />
                <rect
                  x={midX - 20}
                  y={midY - 10}
                  width={40}
                  height={20}
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  fontSize="14"
                  fontWeight="600"
                  fill="#666"
                  textAnchor="middle"
                >
                  {transition.symbol}
                </text>
                <circle
                  cx={midX}
                  cy={midY}
                  r="15"
                  fill="red"
                  opacity="0"
                  className="cursor-pointer hover:opacity-20"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTransition(transition.id)
                  }}
                />
              </g>
            )
          })}

          {/* Creating transition preview */}
          {creatingTransition && (
            <line
              x1={positions.get(creatingTransition.fromStateId)?.x}
              y1={positions.get(creatingTransition.fromStateId)?.y}
              x2={creatingTransition.x}
              y2={creatingTransition.y}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Render states */}
          {dfa.states.map((state) => {
            const pos = positions.get(state.id)
            if (!pos) return null

            const isSelected = selectedStateId === state.id
            const isInitial = dfa.initialStateId === state.id
            const isAccepting = dfa.acceptingStateIds.includes(state.id)

            return (
              <g
                key={state.id}
                onMouseDown={(e) => handleMouseDown(state.id, e)}
                className="cursor-move"
              >
                {/* Accepting state outer circle */}
                {isAccepting && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={stateRadius + 5}
                    fill="none"
                    stroke={isSelected ? '#3b82f6' : '#374151'}
                    strokeWidth="2"
                  />
                )}

                {/* Main state circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={stateRadius}
                  fill={isSelected ? '#dbeafe' : '#ffffff'}
                  stroke={isSelected ? '#3b82f6' : '#374151'}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* State label */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="600"
                  fill="#1f2937"
                  className="pointer-events-none select-none"
                >
                  {state.label}
                </text>

                {/* Initial state arrow */}
                {isInitial && (
                  <>
                    <line
                      x1={pos.x - stateRadius - 40}
                      y1={pos.y}
                      x2={pos.x - stateRadius - 10}
                      y2={pos.y}
                      stroke="#666"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-editor)"
                    />
                    <text
                      x={pos.x - stateRadius - 50}
                      y={pos.y - 12}
                      fontSize="12"
                      fill="#666"
                      fontWeight="600"
                      fontStyle="italic"
                    >
                      start
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* State properties panel */}
      {selectedStateId && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            State Properties: {dfa.states.find(s => s.id === selectedStateId)?.label}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label:
              </label>
              <input
                type="text"
                value={dfa.states.find(s => s.id === selectedStateId)?.label || ''}
                onChange={(e) => updateStateLabel(selectedStateId, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleInitialState(selectedStateId)}
                className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                  dfa.initialStateId === selectedStateId
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dfa.initialStateId === selectedStateId ? '✓' : ''} Initial State
              </button>

              <button
                onClick={() => toggleAcceptingState(selectedStateId)}
                className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                  dfa.acceptingStateIds.includes(selectedStateId)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dfa.acceptingStateIds.includes(selectedStateId) ? '✓' : ''} Accepting State
              </button>
            </div>

            <button
              onClick={() => deleteState(selectedStateId)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
            >
              🗑️ Delete State
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
