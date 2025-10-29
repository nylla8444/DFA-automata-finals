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

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1)
    }, 800)

    return () => clearTimeout(timer)
  }, [isPlaying, currentStepIndex, steps.length])

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
      <div className="text-center py-12 text-gray-500">
        <p>Enter a string above to start simulation</p>
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

  return (
    <div className="dfa-simulator space-y-6">
      {/* Visualization */}
      <DFACanvas
        dfa={dfa}
        currentStateId={currentStep?.stateId}
        visitedStateIds={visitedStateIds}
        highlightedTransitionId={highlightedTransitionId}
        visitedTransitionIds={visitedTransitionIds}
        height={600}
      />

      {/* Step Information */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 font-medium">Step</p>
            <p className="text-2xl font-bold text-indigo-600">
              {currentStepIndex + 1} / {steps.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Current State</p>
            <p className="text-2xl font-bold text-gray-800">{currentStep?.stateId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Symbol Read</p>
            <p className="text-2xl font-bold text-gray-800 font-mono">
              {currentStep?.symbol || '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Remaining</p>
            <p className="text-xl font-bold text-gray-800 font-mono">
              {currentStep?.remainingInput || '∅'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={handleReset}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ↺ Reset
          </button>
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
            disabled={isComplete && !isPlaying}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= steps.length - 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Final Result */}
      {isComplete && result && (
        <div className={`p-6 rounded-lg border-2 ${
          result.accepted 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <h3 className={`text-xl font-bold mb-2 ${
            result.accepted ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.accepted ? '✅ String Accepted!' : '❌ String Rejected'}
          </h3>
          <p className="text-sm">
            <strong>Final State:</strong> {result.currentState}
            {result.accepted && ' (Accepting State)'}
          </p>
        </div>
      )}
    </div>
  )
}
