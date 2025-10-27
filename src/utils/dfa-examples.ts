import type { DFA } from '../types/dfa'

/**
 * Example DFA Configurations
 * Pre-built DFAs for demonstration and testing
 */

/**
 * DFA that accepts binary strings ending in "01"
 */
export const binaryEndingIn01: DFA = {
  id: 'example-binary-01',
  name: 'Binary Strings Ending in 01',
  description: 'Accepts any binary string that ends with "01"',
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
  acceptingStateIds: ['q2'],
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * DFA that accepts binary strings with even number of 0s
 */
export const evenNumberOfZeros: DFA = {
  id: 'example-even-zeros',
  name: 'Even Number of 0s',
  description: 'Accepts binary strings containing an even number of 0s (including zero 0s)',
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
  acceptingStateIds: ['even'],
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * DFA that accepts strings containing "aba" as a substring
 */
export const containsABA: DFA = {
  id: 'example-contains-aba',
  name: 'Contains "aba"',
  description: 'Accepts any string over {a,b} that contains "aba" as a substring',
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
  acceptingStateIds: ['q3'],
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * DFA that accepts strings with length divisible by 3
 */
export const lengthDivisibleBy3: DFA = {
  id: 'example-length-div-3',
  name: 'Length Divisible by 3',
  description: 'Accepts strings over {0,1} whose length is divisible by 3',
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
  acceptingStateIds: ['q0'],
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Simple DFA that accepts only "a" or "b"
 */
export const simpleAorB: DFA = {
  id: 'example-simple-a-or-b',
  name: 'Accepts "a" or "b"',
  description: 'Accepts only single character strings: "a" or "b"',
  alphabet: ['a', 'b'],
  states: [
    { id: 'start', label: 'Start', isInitial: true, isAccepting: false, x: 200, y: 200 },
    { id: 'accept', label: 'Accept', isInitial: false, isAccepting: true, x: 400, y: 200 },
    { id: 'reject', label: 'Reject', isInitial: false, isAccepting: false, x: 300, y: 350 }
  ],
  transitions: [
    { id: 't1', fromStateId: 'start', toStateId: 'accept', symbol: 'a' },
    { id: 't2', fromStateId: 'start', toStateId: 'accept', symbol: 'b' },
    { id: 't3', fromStateId: 'accept', toStateId: 'reject', symbol: 'a' },
    { id: 't4', fromStateId: 'accept', toStateId: 'reject', symbol: 'b' },
    { id: 't5', fromStateId: 'reject', toStateId: 'reject', symbol: 'a' },
    { id: 't6', fromStateId: 'reject', toStateId: 'reject', symbol: 'b' }
  ],
  initialStateId: 'start',
  acceptingStateIds: ['accept'],
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * All example DFAs
 */
export const exampleDFAs: DFA[] = [
  binaryEndingIn01,
  evenNumberOfZeros,
  containsABA,
  lengthDivisibleBy3,
  simpleAorB
]

/**
 * Get an example DFA by ID
 */
export function getExampleDFA(id: string): DFA | undefined {
  return exampleDFAs.find(dfa => dfa.id === id)
}
