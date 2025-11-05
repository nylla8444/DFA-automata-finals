import { useState, useEffect } from 'react'
import type { DFA, SimulationStep } from '../../types/dfa'
import { DFAEngine } from '../../lib/dfa'
import { DFACanvas } from '../DFACanvas/DFACanvas'

interface DFASimulatorProps {
  dfa: DFA
  inputString: string
}

/**
 * DFASimulator - Interactive step-by-step simulator
 * Allows users to step through DFA execution with visual feedback
 */
export function DFASimulator({ dfa, inputString }: DFASimulatorProps) {
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highlightedTransitionId, setHighlightedTransitionId] = useState<string>()
  const [visitedTransitionIds, setVisitedTransitionIds] = useState<string[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(800) // milliseconds per step
  const [zoomLevel, setZoomLevel] = useState(1) // zoom scale (1 = 100%)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })

  const engine = new DFAEngine(dfa)

  // Generate simulation steps when input changes
  useEffect(() => {
    if (!inputString) {
      setSteps([])
      setCurrentStepIndex(0)
      setIsPlaying(false)
      setHighlightedTransitionId(undefined)
      setVisitedTransitionIds([])
      return
    }

    const simulationSteps = engine.getSimulationSteps(inputString)
    setSteps(simulationSteps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setHighlightedTransitionId(undefined)
    setVisitedTransitionIds([])
  }, [inputString, dfa])

  // Keyboard shortcuts for simulator controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
            setIsPlaying(false)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
            setIsPlaying(false)
          }
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (currentStepIndex >= steps.length - 1) {
            setCurrentStepIndex(0)
          }
          setIsPlaying(prev => !prev)
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setCurrentStepIndex(0)
          setIsPlaying(false)
          setVisitedTransitionIds([])
          break
        case 'Home':
          e.preventDefault()
          setCurrentStepIndex(0)
          setIsPlaying(false)
          break
        case 'End':
          e.preventDefault()
          setCurrentStepIndex(steps.length - 1)
          setIsPlaying(false)
          break
      }
    }

    if (steps.length > 0) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [steps.length, currentStepIndex])

  // Update highlighted transition when step changes
  useEffect(() => {
    if (currentStepIndex >= 1 && currentStepIndex < steps.length) {
      const previousStep = steps[currentStepIndex - 1]
      const currentStep = steps[currentStepIndex]

      // Find the exact transition with matching symbol
      const symbol = currentStep.symbol
      const fromStateId = previousStep.stateId
      const toStateId = currentStep.stateId

      const transition = dfa.transitions.find(
        t =>
          t.fromStateId === fromStateId &&
          t.toStateId === toStateId &&
          t.symbol === symbol
      )

      if (transition) {
        setHighlightedTransitionId(transition.id)
        
        // Add to visited transitions (build the path trail)
        setVisitedTransitionIds(prev => {
          if (!prev.includes(transition.id)) {
            return [...prev, transition.id]
          }
          return prev
        })
      } else {
        setHighlightedTransitionId(undefined)
      }
    } else {
      setHighlightedTransitionId(undefined)
    }
  }, [currentStepIndex, steps, dfa.transitions])

  // Auto-play functionality with adjustable speed
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1)
    }, animationSpeed)

    return () => clearTimeout(timer)
  }, [isPlaying, currentStepIndex, steps.length, animationSpeed])

  const currentStep = steps[currentStepIndex]
  const isComplete = currentStepIndex === steps.length - 1
  const result = inputString ? engine.processString(inputString) : null

  // Get visited states up to current step
  const visitedStateIds = steps.slice(0, currentStepIndex + 1).map(s => s.stateId)

  const handlePrevious = () => {
    setCurrentStepIndex(Math.max(0, currentStepIndex - 1))
    setIsPlaying(false)
  }

  const handleNext = () => {
    setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))
  }

  const handleReset = () => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setVisitedTransitionIds([])  // Clear the path trail
  }

  const handlePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0)
    }
    setIsPlaying(true)
  }

  if (!inputString) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-6">
          <p className="text-lg font-semibold">Enter a string above to start simulation</p>
        </div>
        <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-semibold mb-2">💡 Keyboard Shortcuts:</p>
          <div className="text-xs text-blue-800 space-y-1 text-left">
            <div><kbd className="px-2 py-1 bg-white rounded border">→</kbd> Next step</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">←</kbd> Previous step</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Space</kbd> or <kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> Play/Pause</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">R</kbd> Reset</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Home</kbd> Jump to start</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">End</kbd> Jump to end</div>
          </div>
        </div>
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Invalid input - cannot simulate</p>
      </div>
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true)
    setStartPan({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.2))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <div className="dfa-simulator">
      {/* Side-by-Side Layout: Diagram + Controls */}
      <div className="flex gap-4">
        {/* Left: Visualization - Takes remaining space */}
        <div 
          className={`flex-1 rounded-lg transition-all duration-500 relative ${
            isComplete && result
              ? result.accepted
                ? 'border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                : 'border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
              : 'border-2 border-gray-300'
          }`}
        >
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-300">
            <button
              onClick={handleZoomIn}
              className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded font-semibold text-sm transition-colors"
              title="Zoom In"
            >
              🔍+
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-xs transition-colors min-w-[50px]"
              title="Reset Zoom & Pan"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomOut}
              className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded font-semibold text-sm transition-colors"
              title="Zoom Out"
            >
              🔍-
            </button>
          </div>

          {/* Pan Instruction */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-full">
            🖱️ Click & drag to pan • Use zoom buttons
          </div>

          {/* Zoomable & Pannable Canvas Container */}
          <div
            className={`overflow-hidden w-full h-[600px] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                width: '100%',
                height: '600px'
              }}
            >
              <DFACanvas
                dfa={dfa}
                currentStateId={currentStep?.stateId}
                visitedStateIds={visitedStateIds}
                highlightedTransitionId={highlightedTransitionId}
                visitedTransitionIds={visitedTransitionIds}
                height={600}
              />
            </div>
          </div>
        </div>

        {/* Right: Step Information & Controls - Fixed width */}
        <div className="w-[380px] flex-shrink-0 space-y-4">
          {/* Step Information Card */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 ">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span className="font-semibold">Progress</span>
            <span className="font-bold">{Math.round((currentStepIndex / (steps.length - 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-indigo-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 font-medium mb-0.5">Step</p>
            <p className="text-xl font-bold text-indigo-600">
              {currentStepIndex + 1} / {steps.length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 font-medium mb-0.5">Current State</p>
            <p className="text-xl font-bold text-gray-800">{currentStep?.stateId}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 font-medium mb-0.5">Symbol Read</p>
            <p className="text-xl font-bold text-gray-800 font-mono">
              {currentStep?.symbol || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 font-medium mb-0.5">Remaining</p>
            <p className="text-lg font-bold text-gray-800 font-mono overflow-auto">
              {currentStep?.remainingInput || '∅'}
            </p>
          </div> 
        </div>

        {/* Input String Progress Visualization */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-semibold mb-2">Input String:</p>
          <div className="flex flex-wrap items-center justify-center gap-1 font-mono text-sm">
            {inputString.split('').map((char, idx) => {
              const isProcessed = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex - 1
              return (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold scale-110 shadow-lg'
                      : isProcessed
                      ? 'bg-indigo-200 text-indigo-900'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {char}
                </span>
              )
            })}
          </div>
        </div>

        {/* Animation Speed Control */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-600 font-semibold">
              Speed:
            </label>
            <span className="text-xs text-gray-700 font-bold">
              {animationSpeed === 200 ? '🚀 Fast' : 
               animationSpeed === 500 ? '⚡ Medium' :
               animationSpeed === 800 ? '🐢 Normal' :
               animationSpeed === 1200 ? '🐌 Slow' : 'Custom'}
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button
            onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
            disabled={isComplete && !isPlaying}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleReset}
              disabled={currentStepIndex === 0}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              title="Reset to beginning"
            >
              ↺ Reset
            </button>
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              title="Previous step"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex >= steps.length - 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              title="Next step"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

          {/* Final Result */}
          {isComplete && result && (
            <div 
              className={`rounded-lg border-2 p-4 transform transition-all duration-500 ${
                result.accepted 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500 shadow-lg shadow-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500 shadow-lg shadow-red-200'
              }`}
              style={{
                animation: 'fadeInScale 0.5s ease-out'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`text-2xl ${result.accepted ? 'animate-bounce' : 'animate-pulse'}`}>
                  {result.accepted ? '✅' : '❌'}
                </div>
                <h3 className={`text-lg font-bold ${
                  result.accepted ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.accepted ? 'Accepted!' : 'Rejected'}
                </h3>
              </div>
              
              <div className={`space-y-1.5 ${
                result.accepted ? 'text-green-900' : 'text-red-900'
              }`}>
                <p className="text-xs">
                  <strong>Input:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">{inputString}</span>
                </p>
                <p className="text-xs">
                  <strong>Final State:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">{result.currentState}</span>
                  {result.accepted && <span className="ml-1 text-xs font-semibold">⭐</span>}
                </p>
                <p className="text-xs">
                  <strong>Steps:</strong> {steps.length}
                </p>
              </div>

              <div className="mt-3 p-2 bg-white rounded border border-opacity-50">
                <p className={`text-xs ${result.accepted ? 'text-green-800' : 'text-red-800'}`}>
                  {result.accepted ? (
                    <>✨ The string matches the pattern!</>
                  ) : (
                    <>💡 State "{result.currentState}" is not accepting.</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Guide */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <details className="cursor-pointer">
              <summary className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
                ⌨️ Keyboard Shortcuts
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">→</kbd>
                  <span>Next</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">←</kbd>
                  <span>Previous</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">Space</kbd>
                  <span>Play/Pause</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">R</kbd>
                  <span>Reset</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">Home</kbd>
                  <span>Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">End</kbd>
                  <span>Finish</span>
                </div>
              </div>
            </details>
          </div>
        </div>
        {/* End of Right Column */}
      </div>
      {/* End of Grid Layout */}

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
