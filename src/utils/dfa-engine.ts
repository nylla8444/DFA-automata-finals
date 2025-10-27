import type { DFA, DFAState, ProcessingResult, SimulationStep, ValidationResult } from '../types/dfa'

/**
 * DFA Engine - Core logic for DFA operations
 * Handles string processing, validation, and state transitions
 */
export class DFAEngine {
  private dfa: DFA

  constructor(dfa: DFA) {
    this.dfa = dfa
  }

  /**
   * Process a complete input string through the DFA
   */
  processString(input: string): ProcessingResult {
    // Validate input against alphabet
    const invalidSymbols = this.getInvalidSymbols(input)
    if (invalidSymbols.length > 0) {
      return {
        accepted: false,
        inputString: input,
        path: [],
        currentState: this.dfa.initialStateId,
        remainingInput: input,
        error: `Invalid symbols in input: ${invalidSymbols.join(', ')}`
      }
    }

    // Process string step by step
    let currentStateId = this.dfa.initialStateId
    const path: string[] = [currentStateId]
    
    for (let i = 0; i < input.length; i++) {
      const symbol = input[i]
      const nextStateId = this.getNextState(currentStateId, symbol)
      
      if (nextStateId === null) {
        return {
          accepted: false,
          inputString: input,
          path,
          currentState: currentStateId,
          remainingInput: input.slice(i),
          error: `No transition found from state '${currentStateId}' with symbol '${symbol}'`
        }
      }
      
      currentStateId = nextStateId
      path.push(currentStateId)
    }

    // Check if final state is accepting
    const accepted = this.dfa.acceptingStateIds.includes(currentStateId)

    return {
      accepted,
      inputString: input,
      path,
      currentState: currentStateId,
      remainingInput: '',
      error: accepted ? undefined : `String rejected: ended in non-accepting state '${currentStateId}'`
    }
  }

  /**
   * Get step-by-step execution trace for visualization
   */
  getSimulationSteps(input: string): SimulationStep[] {
    const steps: SimulationStep[] = []
    
    // Initial state
    steps.push({
      stateId: this.dfa.initialStateId,
      symbol: null,
      remainingInput: input,
      stepNumber: 0
    })

    let currentStateId = this.dfa.initialStateId
    
    for (let i = 0; i < input.length; i++) {
      const symbol = input[i]
      const nextStateId = this.getNextState(currentStateId, symbol)
      
      if (nextStateId === null) {
        break // Invalid transition
      }
      
      currentStateId = nextStateId
      steps.push({
        stateId: currentStateId,
        symbol,
        remainingInput: input.slice(i + 1),
        stepNumber: i + 1
      })
    }

    return steps
  }

  /**
   * Get the next state given current state and input symbol
   */
  getNextState(currentStateId: string, symbol: string): string | null {
    const transition = this.dfa.transitions.find(
      t => t.fromStateId === currentStateId && t.symbol === symbol
    )
    
    return transition ? transition.toStateId : null
  }

  /**
   * Check if a string is valid against the DFA's alphabet
   */
  isValidString(input: string): boolean {
    return this.getInvalidSymbols(input).length === 0
  }

  /**
   * Get symbols in input that are not in alphabet
   */
  getInvalidSymbols(input: string): string[] {
    const invalidSymbols: string[] = []
    const alphabetSet = new Set(this.dfa.alphabet)
    
    for (const symbol of input) {
      if (!alphabetSet.has(symbol) && !invalidSymbols.includes(symbol)) {
        invalidSymbols.push(symbol)
      }
    }
    
    return invalidSymbols
  }

  /**
   * Validate DFA structure
   */
  static validateDFA(dfa: DFA): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if there's at least one state
    if (dfa.states.length === 0) {
      errors.push('DFA must have at least one state')
    }

    // Check if initial state exists
    const initialState = dfa.states.find(s => s.id === dfa.initialStateId)
    if (!initialState) {
      errors.push(`Initial state '${dfa.initialStateId}' not found in states`)
    }

    // Check if all accepting states exist
    for (const acceptingId of dfa.acceptingStateIds) {
      if (!dfa.states.find(s => s.id === acceptingId)) {
        errors.push(`Accepting state '${acceptingId}' not found in states`)
      }
    }

    // Check if alphabet is not empty
    if (dfa.alphabet.length === 0) {
      warnings.push('Alphabet is empty - DFA can only accept empty string')
    }

    // Check for duplicate state IDs
    const stateIds = new Set<string>()
    for (const state of dfa.states) {
      if (stateIds.has(state.id)) {
        errors.push(`Duplicate state ID: '${state.id}'`)
      }
      stateIds.add(state.id)
    }

    // Check if transitions reference valid states
    for (const transition of dfa.transitions) {
      if (!dfa.states.find(s => s.id === transition.fromStateId)) {
        errors.push(`Transition '${transition.id}' references non-existent from state '${transition.fromStateId}'`)
      }
      if (!dfa.states.find(s => s.id === transition.toStateId)) {
        errors.push(`Transition '${transition.id}' references non-existent to state '${transition.toStateId}'`)
      }
      if (!dfa.alphabet.includes(transition.symbol)) {
        errors.push(`Transition '${transition.id}' uses symbol '${transition.symbol}' not in alphabet`)
      }
    }

    // Check for determinism (no duplicate transitions from same state with same symbol)
    const transitionMap = new Map<string, string>()
    for (const transition of dfa.transitions) {
      const key = `${transition.fromStateId}-${transition.symbol}`
      if (transitionMap.has(key)) {
        errors.push(`Non-deterministic: multiple transitions from state '${transition.fromStateId}' with symbol '${transition.symbol}'`)
      }
      transitionMap.set(key, transition.toStateId)
    }

    // Check for completeness (all states should have transitions for all alphabet symbols)
    for (const state of dfa.states) {
      for (const symbol of dfa.alphabet) {
        const hasTransition = dfa.transitions.some(
          t => t.fromStateId === state.id && t.symbol === symbol
        )
        if (!hasTransition) {
          warnings.push(`Incomplete: state '${state.id}' has no transition for symbol '${symbol}'`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

/**
 * Helper function to create a new DFA
 */
export function createEmptyDFA(name: string = 'New DFA'): DFA {
  const initialStateId = 'q0'
  
  return {
    id: crypto.randomUUID(),
    name,
    description: '',
    alphabet: [],
    states: [
      {
        id: initialStateId,
        label: 'q0',
        isInitial: true,
        isAccepting: false,
        x: 300,
        y: 200
      }
    ],
    transitions: [],
    initialStateId,
    acceptingStateIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Generate a unique state ID
 */
export function generateStateId(existingStates: DFAState[]): string {
  let index = existingStates.length
  let id = `q${index}`
  
  while (existingStates.some(s => s.id === id)) {
    index++
    id = `q${index}`
  }
  
  return id
}

/**
 * Generate a unique transition ID
 */
export function generateTransitionId(): string {
  return `t-${crypto.randomUUID()}`
}
