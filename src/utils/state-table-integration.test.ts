import { describe, it, expect } from 'vitest'
import type { DFA } from '../types/dfa'

/**
 * Integration tests for State Table View Component
 * These tests verify the accuracy of the state table with real DFA examples
 */

/**
 * Helper to simulate the StateTableView transition mapping logic
 */
function getTransitionTable(dfa: DFA): Map<string, Map<string, string>> {
  const transitionMap = new Map<string, Map<string, string>>()
  
  // Initialize map for all states
  dfa.states.forEach(state => {
    transitionMap.set(state.id, new Map())
  })
  
  // Fill in transitions
  dfa.transitions.forEach(transition => {
    const stateMap = transitionMap.get(transition.fromStateId)
    if (stateMap) {
      const existing = stateMap.get(transition.symbol)
      if (existing) {
        stateMap.set(transition.symbol, `${existing}, ${transition.toStateId}`)
      } else {
        stateMap.set(transition.symbol, transition.toStateId)
      }
    }
  })
  
  return transitionMap
}

/**
 * Validate that transition table matches expected behavior
 */
function validateTransitions(
  dfa: DFA,
  expectedTransitions: Record<string, Record<string, string | undefined>>
): boolean {
  const table = getTransitionTable(dfa)
  
  for (const [fromState, transitions] of Object.entries(expectedTransitions)) {
    const stateMap = table.get(fromState)
    if (!stateMap) return false
    
    for (const [symbol, expectedTo] of Object.entries(transitions)) {
      const actualTo = stateMap.get(symbol)
      if (actualTo !== expectedTo) {
        console.error(
          `Mismatch: δ(${fromState}, ${symbol}) = ${actualTo}, expected ${expectedTo}`
        )
        return false
      }
    }
  }
  
  return true
}

describe('State Table View - Integration Tests', () => {
  
  it('should correctly represent binary ending in "01" DFA', () => {
    const binaryEndingIn01: DFA = {
      id: 'test-binary-01',
      name: 'Binary Ending in 01',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 150, y: 200 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 350, y: 200 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 550, y: 200 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q1', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q2', symbol: '1' },
        { id: 't5', fromStateId: 'q2', toStateId: 'q1', symbol: '0' },
        { id: 't6', fromStateId: 'q2', toStateId: 'q0', symbol: '1' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q2']
    }
    
    const expectedTable = {
      'q0': { '0': 'q1', '1': 'q0' },
      'q1': { '0': 'q1', '1': 'q2' },
      'q2': { '0': 'q1', '1': 'q0' }
    }
    
    expect(validateTransitions(binaryEndingIn01, expectedTable)).toBe(true)
    
    // Verify initial state
    expect(binaryEndingIn01.initialStateId).toBe('q0')
    
    // Verify accepting states
    expect(binaryEndingIn01.acceptingStateIds).toContain('q2')
    expect(binaryEndingIn01.acceptingStateIds).toHaveLength(1)
  })

  it('should correctly represent even number of 0s DFA', () => {
    const evenZeros: DFA = {
      id: 'test-even-zeros',
      name: 'Even 0s',
      alphabet: ['0', '1'],
      states: [
        { id: 'even', label: 'Even', isInitial: true, isAccepting: true, x: 250, y: 150 },
        { id: 'odd', label: 'Odd', isInitial: false, isAccepting: false, x: 450, y: 150 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'even', toStateId: 'odd', symbol: '0' },
        { id: 't2', fromStateId: 'even', toStateId: 'even', symbol: '1' },
        { id: 't3', fromStateId: 'odd', toStateId: 'even', symbol: '0' },
        { id: 't4', fromStateId: 'odd', toStateId: 'odd', symbol: '1' }
      ],
      initialStateId: 'even',
      acceptingStateIds: ['even']
    }
    
    const expectedTable = {
      'even': { '0': 'odd', '1': 'even' },
      'odd': { '0': 'even', '1': 'odd' }
    }
    
    expect(validateTransitions(evenZeros, expectedTable)).toBe(true)
    
    // Verify state is both initial and accepting
    expect(evenZeros.initialStateId).toBe('even')
    expect(evenZeros.acceptingStateIds).toContain('even')
  })

  it('should correctly represent "contains aba" DFA', () => {
    const containsABA: DFA = {
      id: 'test-contains-aba',
      name: 'Contains aba',
      alphabet: ['a', 'b'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 100, y: 200 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 250, y: 200 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 400, y: 200 },
        { id: 'q3', label: 'q3', isInitial: false, isAccepting: true, x: 550, y: 200 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: 'b' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q1', symbol: 'a' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q2', symbol: 'b' },
        { id: 't5', fromStateId: 'q2', toStateId: 'q3', symbol: 'a' },
        { id: 't6', fromStateId: 'q2', toStateId: 'q0', symbol: 'b' },
        { id: 't7', fromStateId: 'q3', toStateId: 'q3', symbol: 'a' },
        { id: 't8', fromStateId: 'q3', toStateId: 'q3', symbol: 'b' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q3']
    }
    
    const expectedTable = {
      'q0': { 'a': 'q1', 'b': 'q0' },
      'q1': { 'a': 'q1', 'b': 'q2' },
      'q2': { 'a': 'q3', 'b': 'q0' },
      'q3': { 'a': 'q3', 'b': 'q3' }
    }
    
    expect(validateTransitions(containsABA, expectedTable)).toBe(true)
  })

  it('should handle length divisible by 3 DFA', () => {
    const lengthDiv3: DFA = {
      id: 'test-length-div-3',
      name: 'Length Divisible by 3',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 350, y: 100 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 200, y: 250 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 500, y: 250 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q1', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q2', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q2', symbol: '1' },
        { id: 't5', fromStateId: 'q2', toStateId: 'q0', symbol: '0' },
        { id: 't6', fromStateId: 'q2', toStateId: 'q0', symbol: '1' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    // Note: q0 on both '0' and '1' goes to q1, but only first transition is stored
    // This tests that we handle the map correctly
    const table = getTransitionTable(lengthDiv3)
    
    // Due to how Map works, only first transition per symbol is stored
    expect(table.get('q0')?.get('0')).toBe('q1')
    expect(table.get('q0')?.get('1')).toBe('q1')
    expect(table.get('q1')?.get('0')).toBe('q2')
    expect(table.get('q1')?.get('1')).toBe('q2')
    expect(table.get('q2')?.get('0')).toBe('q0')
    expect(table.get('q2')?.get('1')).toBe('q0')
  })

  it('should correctly show missing transitions', () => {
    const partialDFA: DFA = {
      id: 'test-partial',
      name: 'Partial Transitions',
      alphabet: ['a', 'b', 'c'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' },
        // Missing: q0 on 'b', q0 on 'c'
        { id: 't2', fromStateId: 'q1', toStateId: 'q0', symbol: 'c' }
        // Missing: q1 on 'a', q1 on 'b'
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q1']
    }
    
    const table = getTransitionTable(partialDFA)
    
    // Verify defined transitions
    expect(table.get('q0')?.get('a')).toBe('q1')
    expect(table.get('q1')?.get('c')).toBe('q0')
    
    // Verify missing transitions return undefined (will show as "—" in UI)
    expect(table.get('q0')?.get('b')).toBeUndefined()
    expect(table.get('q0')?.get('c')).toBeUndefined()
    expect(table.get('q1')?.get('a')).toBeUndefined()
    expect(table.get('q1')?.get('b')).toBeUndefined()
  })

  it('should correctly handle all states in alphabet order', () => {
    const dfa: DFA = {
      id: 'test-alphabet',
      name: 'Alphabet Order',
      alphabet: ['0', '1', '2', '3'],
      states: [
        { id: 's0', label: 's0', isInitial: true, isAccepting: false, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't0', fromStateId: 's0', toStateId: 's0', symbol: '0' },
        { id: 't1', fromStateId: 's0', toStateId: 's0', symbol: '1' },
        { id: 't2', fromStateId: 's0', toStateId: 's0', symbol: '2' },
        { id: 't3', fromStateId: 's0', toStateId: 's0', symbol: '3' }
      ],
      initialStateId: 's0',
      acceptingStateIds: []
    }
    
    const table = getTransitionTable(dfa)
    
    // Verify all alphabet symbols are mapped
    for (const symbol of dfa.alphabet) {
      expect(table.get('s0')?.get(symbol)).toBe('s0')
    }
  })

  it('should maintain accuracy with complex state labels', () => {
    const dfa: DFA = {
      id: 'test-labels',
      name: 'Complex Labels',
      alphabet: ['x', 'y'],
      states: [
        { id: 'state_0', label: 'Start', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'state_1', label: 'Middle', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'state_2', label: 'End', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'state_0', toStateId: 'state_1', symbol: 'x' },
        { id: 't2', fromStateId: 'state_0', toStateId: 'state_0', symbol: 'y' },
        { id: 't3', fromStateId: 'state_1', toStateId: 'state_2', symbol: 'x' },
        { id: 't4', fromStateId: 'state_1', toStateId: 'state_0', symbol: 'y' },
        { id: 't5', fromStateId: 'state_2', toStateId: 'state_2', symbol: 'x' },
        { id: 't6', fromStateId: 'state_2', toStateId: 'state_2', symbol: 'y' }
      ],
      initialStateId: 'state_0',
      acceptingStateIds: ['state_2']
    }
    
    const expectedTable = {
      'state_0': { 'x': 'state_1', 'y': 'state_0' },
      'state_1': { 'x': 'state_2', 'y': 'state_0' },
      'state_2': { 'x': 'state_2', 'y': 'state_2' }
    }
    
    expect(validateTransitions(dfa, expectedTable)).toBe(true)
  })
})

describe('State Table View - Completeness Verification', () => {
  
  it('should verify that all states are included in the table', () => {
    const dfa: DFA = {
      id: 'test',
      name: 'Test',
      alphabet: ['a'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q2']
    }
    
    const table = getTransitionTable(dfa)
    
    // All states should be in the table
    expect(table.has('q0')).toBe(true)
    expect(table.has('q1')).toBe(true)
    expect(table.has('q2')).toBe(true)
    expect(table.size).toBe(dfa.states.length)
  })

  it('should verify that all alphabet symbols are represented', () => {
    const dfa: DFA = {
      id: 'test',
      name: 'Test',
      alphabet: ['a', 'b', 'c', 'd', 'e'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    // In the UI, the table should have columns for all alphabet symbols
    // Even if there are no transitions, the columns should be present
    expect(dfa.alphabet.length).toBe(5)
    expect(dfa.alphabet).toContain('a')
    expect(dfa.alphabet).toContain('b')
    expect(dfa.alphabet).toContain('c')
    expect(dfa.alphabet).toContain('d')
    expect(dfa.alphabet).toContain('e')
  })
})
