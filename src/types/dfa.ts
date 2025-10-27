/**
 * DFA (Deterministic Finite Automaton) Type Definitions
 * 
 * These types define the core data structures for representing and working with DFAs
 */

/**
 * Represents a single state in the DFA
 */
export interface DFAState {
  id: string
  label: string
  isInitial: boolean
  isAccepting: boolean
  x: number // X position for visualization
  y: number // Y position for visualization
}

/**
 * Represents a transition between two states
 */
export interface DFATransition {
  id: string
  fromStateId: string
  toStateId: string
  symbol: string // The input symbol that triggers this transition
}

/**
 * Represents a complete DFA
 */
export interface DFA {
  id: string
  name: string
  description?: string
  alphabet: string[] // Valid input symbols
  states: DFAState[]
  transitions: DFATransition[]
  initialStateId: string
  acceptingStateIds: string[]
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Result of processing a string through the DFA
 */
export interface ProcessingResult {
  accepted: boolean
  inputString: string
  path: string[] // Array of state IDs traversed
  currentState: string
  remainingInput: string
  error?: string
}

/**
 * Step-by-step execution state for visualization
 */
export interface SimulationStep {
  stateId: string
  symbol: string | null // null for initial state
  remainingInput: string
  stepNumber: number
}

/**
 * Validation result for DFA structure
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * DFA creation/editing modes
 */
export type EditorMode = 'view' | 'edit' | 'simulate'

/**
 * UI selection state
 */
export interface SelectionState {
  selectedStateId?: string
  selectedTransitionId?: string
  mode: EditorMode
}
