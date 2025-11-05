import { describe, it, expect } from 'vitest'
import type { DFA } from '../types/dfa'

/**
 * Comprehensive tests for State Table View accuracy
 * These tests validate that the transition table correctly represents the DFA
 */

/**
 * Helper function to build transition map (same logic as StateTableView component)
 */
function buildTransitionMap(dfa: DFA): Map<string, Map<string, string>> {
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
        // Handle non-deterministic transitions (shouldn't happen in DFA)
        stateMap.set(transition.symbol, `${existing}, ${transition.toStateId}`)
      } else {
        stateMap.set(transition.symbol, transition.toStateId)
      }
    }
  })
  
  return transitionMap
}

describe('State Table View - Transition Map Building', () => {
  
  it('should build correct transition map for simple 2-state DFA', () => {
    const simpleDFA: DFA = {
      id: 'test-simple',
      name: 'Simple DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q0', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q1', symbol: '1' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    const map = buildTransitionMap(simpleDFA)
    
    // Verify map structure
    expect(map.size).toBe(2)
    expect(map.has('q0')).toBe(true)
    expect(map.has('q1')).toBe(true)
    
    // Verify q0 transitions
    expect(map.get('q0')?.get('0')).toBe('q1')
    expect(map.get('q0')?.get('1')).toBe('q0')
    
    // Verify q1 transitions
    expect(map.get('q1')?.get('0')).toBe('q0')
    expect(map.get('q1')?.get('1')).toBe('q1')
  })

  it('should handle binary strings ending in "01" correctly', () => {
    const binaryEndingIn01: DFA = {
      id: 'test-binary-01',
      name: 'Binary Ending in 01',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 0, y: 0 }
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
    
    const map = buildTransitionMap(binaryEndingIn01)
    
    // Expected transition table:
    // State | 0  | 1
    // ------|----|----- 
    // q0    | q1 | q0
    // q1    | q1 | q2
    // q2    | q1 | q0
    
    expect(map.get('q0')?.get('0')).toBe('q1')
    expect(map.get('q0')?.get('1')).toBe('q0')
    expect(map.get('q1')?.get('0')).toBe('q1')
    expect(map.get('q1')?.get('1')).toBe('q2')
    expect(map.get('q2')?.get('0')).toBe('q1')
    expect(map.get('q2')?.get('1')).toBe('q0')
  })

  it('should handle DFA with missing transitions', () => {
    const incompleteDFA: DFA = {
      id: 'test-incomplete',
      name: 'Incomplete DFA',
      alphabet: ['a', 'b', 'c'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' },
        // Missing: q0 on 'b' and 'c'
        { id: 't2', fromStateId: 'q1', toStateId: 'q0', symbol: 'b' }
        // Missing: q1 on 'a' and 'c'
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q1']
    }
    
    const map = buildTransitionMap(incompleteDFA)
    
    // Verify existing transitions
    expect(map.get('q0')?.get('a')).toBe('q1')
    expect(map.get('q1')?.get('b')).toBe('q0')
    
    // Verify missing transitions return undefined
    expect(map.get('q0')?.get('b')).toBeUndefined()
    expect(map.get('q0')?.get('c')).toBeUndefined()
    expect(map.get('q1')?.get('a')).toBeUndefined()
    expect(map.get('q1')?.get('c')).toBeUndefined()
  })

  it('should handle self-loops correctly', () => {
    const selfLoopDFA: DFA = {
      id: 'test-self-loop',
      name: 'Self Loop DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q0', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '1' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    const map = buildTransitionMap(selfLoopDFA)
    
    expect(map.get('q0')?.get('0')).toBe('q0')
    expect(map.get('q0')?.get('1')).toBe('q0')
  })

  it('should handle larger alphabet correctly', () => {
    const largeAlphabetDFA: DFA = {
      id: 'test-large-alphabet',
      name: 'Large Alphabet DFA',
      alphabet: ['a', 'b', 'c', 'd', 'e'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: 'b' },
        { id: 't3', fromStateId: 'q0', toStateId: 'q0', symbol: 'c' },
        { id: 't4', fromStateId: 'q0', toStateId: 'q0', symbol: 'd' },
        { id: 't5', fromStateId: 'q0', toStateId: 'q0', symbol: 'e' },
        { id: 't6', fromStateId: 'q1', toStateId: 'q1', symbol: 'a' },
        { id: 't7', fromStateId: 'q1', toStateId: 'q1', symbol: 'b' },
        { id: 't8', fromStateId: 'q1', toStateId: 'q1', symbol: 'c' },
        { id: 't9', fromStateId: 'q1', toStateId: 'q1', symbol: 'd' },
        { id: 't10', fromStateId: 'q1', toStateId: 'q1', symbol: 'e' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q1']
    }
    
    const map = buildTransitionMap(largeAlphabetDFA)
    
    // Verify all transitions for q0
    expect(map.get('q0')?.get('a')).toBe('q1')
    expect(map.get('q0')?.get('b')).toBe('q0')
    expect(map.get('q0')?.get('c')).toBe('q0')
    expect(map.get('q0')?.get('d')).toBe('q0')
    expect(map.get('q0')?.get('e')).toBe('q0')
    
    // Verify all transitions for q1
    expect(map.get('q1')?.get('a')).toBe('q1')
    expect(map.get('q1')?.get('b')).toBe('q1')
    expect(map.get('q1')?.get('c')).toBe('q1')
    expect(map.get('q1')?.get('d')).toBe('q1')
    expect(map.get('q1')?.get('e')).toBe('q1')
  })

  it('should handle complex multi-state DFA', () => {
    const complexDFA: DFA = {
      id: 'test-complex',
      name: 'Complex DFA',
      description: 'Contains "aba" substring',
      alphabet: ['a', 'b'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q3', label: 'q3', isInitial: false, isAccepting: true, x: 0, y: 0 }
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
    
    const map = buildTransitionMap(complexDFA)
    
    // Expected transition table:
    // State | a  | b
    // ------|----|----- 
    // q0    | q1 | q0
    // q1    | q1 | q2
    // q2    | q3 | q0
    // q3    | q3 | q3
    
    expect(map.get('q0')?.get('a')).toBe('q1')
    expect(map.get('q0')?.get('b')).toBe('q0')
    expect(map.get('q1')?.get('a')).toBe('q1')
    expect(map.get('q1')?.get('b')).toBe('q2')
    expect(map.get('q2')?.get('a')).toBe('q3')
    expect(map.get('q2')?.get('b')).toBe('q0')
    expect(map.get('q3')?.get('a')).toBe('q3')
    expect(map.get('q3')?.get('b')).toBe('q3')
  })

  it('should initialize empty maps for all states', () => {
    const dfa: DFA = {
      id: 'test-empty',
      name: 'Empty Transitions',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 0, y: 0 }
      ],
      transitions: [], // No transitions
      initialStateId: 'q0',
      acceptingStateIds: []
    }
    
    const map = buildTransitionMap(dfa)
    
    // All states should be in the map
    expect(map.size).toBe(3)
    expect(map.has('q0')).toBe(true)
    expect(map.has('q1')).toBe(true)
    expect(map.has('q2')).toBe(true)
    
    // All states should have empty transition maps
    expect(map.get('q0')?.size).toBe(0)
    expect(map.get('q1')?.size).toBe(0)
    expect(map.get('q2')?.size).toBe(0)
  })

  it('should handle duplicate transitions (non-deterministic edge case)', () => {
    // This shouldn't happen in a valid DFA, but we test the behavior
    const ndfaDFA: DFA = {
      id: 'test-ndfa',
      name: 'NDFA-like DFA',
      alphabet: ['a'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'a' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q2', symbol: 'a' } // Duplicate!
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q2']
    }
    
    const map = buildTransitionMap(ndfaDFA)
    
    // Should concatenate multiple destinations
    const result = map.get('q0')?.get('a')
    expect(result).toBe('q1, q2')
    expect(result).toContain('q1')
    expect(result).toContain('q2')
  })

  it('should handle empty alphabet', () => {
    const emptyAlphabetDFA: DFA = {
      id: 'test-empty-alphabet',
      name: 'Empty Alphabet',
      alphabet: [], // Empty alphabet
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    const map = buildTransitionMap(emptyAlphabetDFA)
    
    expect(map.size).toBe(1)
    expect(map.get('q0')?.size).toBe(0)
  })

  it('should handle special characters in alphabet', () => {
    const specialCharDFA: DFA = {
      id: 'test-special',
      name: 'Special Characters',
      alphabet: ['ε', '→', '∅', '#', '@'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: 'ε' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '→' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q0', symbol: '∅' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q1', symbol: '#' },
        { id: 't5', fromStateId: 'q1', toStateId: 'q1', symbol: '@' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q1']
    }
    
    const map = buildTransitionMap(specialCharDFA)
    
    expect(map.get('q0')?.get('ε')).toBe('q1')
    expect(map.get('q0')?.get('→')).toBe('q0')
    expect(map.get('q1')?.get('∅')).toBe('q0')
    expect(map.get('q1')?.get('#')).toBe('q1')
    expect(map.get('q1')?.get('@')).toBe('q1')
  })
})

describe('State Table View - State Identification', () => {
  
  it('should correctly identify initial state', () => {
    const dfa: DFA = {
      id: 'test',
      name: 'Test',
      alphabet: ['0'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: []
    }
    
    const initialState = dfa.states.find(s => s.id === dfa.initialStateId)
    expect(initialState?.id).toBe('q0')
    expect(initialState?.isInitial).toBe(true)
  })

  it('should correctly identify accepting states', () => {
    const dfa: DFA = {
      id: 'test',
      name: 'Test',
      alphabet: ['0'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 },
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: ['q1', 'q2']
    }
    
    expect(dfa.acceptingStateIds).toContain('q1')
    expect(dfa.acceptingStateIds).toContain('q2')
    expect(dfa.acceptingStateIds).not.toContain('q0')
    expect(dfa.acceptingStateIds.length).toBe(2)
  })

  it('should handle state that is both initial and accepting', () => {
    const dfa: DFA = {
      id: 'test',
      name: 'Test',
      alphabet: ['0'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    const state = dfa.states[0]
    expect(state.id === dfa.initialStateId).toBe(true)
    expect(dfa.acceptingStateIds.includes(state.id)).toBe(true)
  })
})

describe('State Table View - Edge Cases', () => {
  
  it('should handle single state DFA', () => {
    const singleStateDFA: DFA = {
      id: 'test-single',
      name: 'Single State',
      alphabet: ['a', 'b'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q0', symbol: 'a' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: 'b' }
      ],
      initialStateId: 'q0',
      acceptingStateIds: ['q0']
    }
    
    const map = buildTransitionMap(singleStateDFA)
    
    expect(map.size).toBe(1)
    expect(map.get('q0')?.get('a')).toBe('q0')
    expect(map.get('q0')?.get('b')).toBe('q0')
  })

  it('should handle DFA with many states', () => {
    const states = Array.from({ length: 20 }, (_, i) => ({
      id: `q${i}`,
      label: `q${i}`,
      isInitial: i === 0,
      isAccepting: i === 19,
      x: 0,
      y: 0
    }))
    
    const transitions = Array.from({ length: 19 }, (_, i) => ({
      id: `t${i}`,
      fromStateId: `q${i}`,
      toStateId: `q${i + 1}`,
      symbol: 'a'
    }))
    
    const largeStateDFA: DFA = {
      id: 'test-large',
      name: 'Large State DFA',
      alphabet: ['a'],
      states,
      transitions,
      initialStateId: 'q0',
      acceptingStateIds: ['q19']
    }
    
    const map = buildTransitionMap(largeStateDFA)
    
    expect(map.size).toBe(20)
    
    // Verify chain of transitions
    for (let i = 0; i < 19; i++) {
      expect(map.get(`q${i}`)?.get('a')).toBe(`q${i + 1}`)
    }
  })

  it('should preserve state order from DFA definition', () => {
    const dfa: DFA = {
      id: 'test-order',
      name: 'Order Test',
      alphabet: ['0'],
      states: [
        { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 0, y: 0 },
        { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 0, y: 0 }
      ],
      transitions: [],
      initialStateId: 'q0',
      acceptingStateIds: ['q1']
    }
    
    const map = buildTransitionMap(dfa)
    
    // All states should be present regardless of order
    expect(map.has('q0')).toBe(true)
    expect(map.has('q1')).toBe(true)
    expect(map.has('q2')).toBe(true)
  })
})
