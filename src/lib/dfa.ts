/**
 * DFA Library - Main export file
 * 
 * This file provides a centralized export for all DFA-related
 * types, utilities, and examples
 */

// Types
export type {
  DFA,
  DFAState,
  DFATransition,
  ProcessingResult,
  SimulationStep,
  ValidationResult,
  EditorMode,
  SelectionState
} from '../types/dfa'

// Engine and utilities
export {
  DFAEngine,
  createEmptyDFA,
  generateStateId,
  generateTransitionId
} from '../utils/dfa-engine'

// Example DFAs
export {
  exampleDFAs,
  binaryEndingIn01,
  evenNumberOfZeros,
  containsABA,
  lengthDivisibleBy3,
  simpleAorB,
  getExampleDFA
} from '../utils/dfa-examples'
