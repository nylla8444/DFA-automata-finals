import { describe, it, expect } from 'vitest'
import { DFAEngine, createEmptyDFA, generateStateId } from './dfa-engine'
import { binaryEndingIn01, evenNumberOfZeros, simpleAorB } from './dfa-examples'

describe('DFAEngine', () => {
  describe('processString', () => {
    it('should accept strings ending in "01"', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      const result1 = engine.processString('01')
      expect(result1.accepted).toBe(true)
      expect(result1.path).toEqual(['q0', 'q1', 'q2'])
      
      const result2 = engine.processString('1001')
      expect(result2.accepted).toBe(true)
      
      const result3 = engine.processString('0101')
      expect(result3.accepted).toBe(true)
    })

    it('should reject strings not ending in "01"', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      const result1 = engine.processString('10')
      expect(result1.accepted).toBe(false)
      
      const result2 = engine.processString('11')
      expect(result2.accepted).toBe(false)
      
      const result3 = engine.processString('00')
      expect(result3.accepted).toBe(false)
    })

    it('should accept strings with even number of 0s', () => {
      const engine = new DFAEngine(evenNumberOfZeros)
      
      const result1 = engine.processString('')
      expect(result1.accepted).toBe(true) // Zero 0s is even
      
      const result2 = engine.processString('11')
      expect(result2.accepted).toBe(true)
      
      const result3 = engine.processString('00')
      expect(result3.accepted).toBe(true)
      
      const result4 = engine.processString('0110')
      expect(result4.accepted).toBe(true)
    })

    it('should reject strings with odd number of 0s', () => {
      const engine = new DFAEngine(evenNumberOfZeros)
      
      const result1 = engine.processString('0')
      expect(result1.accepted).toBe(false)
      
      const result2 = engine.processString('011')
      expect(result2.accepted).toBe(false)
      
      const result3 = engine.processString('000')
      expect(result3.accepted).toBe(false)
    })

    it('should handle invalid symbols', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      const result = engine.processString('012')
      expect(result.accepted).toBe(false)
      expect(result.error).toContain('Invalid symbols')
      expect(result.error).toContain('2')
    })

    it('should accept only "a" or "b"', () => {
      const engine = new DFAEngine(simpleAorB)
      
      expect(engine.processString('a').accepted).toBe(true)
      expect(engine.processString('b').accepted).toBe(true)
      expect(engine.processString('aa').accepted).toBe(false)
      expect(engine.processString('ab').accepted).toBe(false)
      expect(engine.processString('').accepted).toBe(false)
    })
  })

  describe('getSimulationSteps', () => {
    it('should return correct step-by-step trace', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      const steps = engine.getSimulationSteps('01')
      
      expect(steps).toHaveLength(3)
      expect(steps[0]).toEqual({
        stateId: 'q0',
        symbol: null,
        remainingInput: '01',
        stepNumber: 0
      })
      expect(steps[1]).toEqual({
        stateId: 'q1',
        symbol: '0',
        remainingInput: '1',
        stepNumber: 1
      })
      expect(steps[2]).toEqual({
        stateId: 'q2',
        symbol: '1',
        remainingInput: '',
        stepNumber: 2
      })
    })
  })

  describe('getNextState', () => {
    it('should return correct next state', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      expect(engine.getNextState('q0', '0')).toBe('q1')
      expect(engine.getNextState('q0', '1')).toBe('q0')
      expect(engine.getNextState('q1', '1')).toBe('q2')
    })

    it('should return null for non-existent transition', () => {
      const emptyDFA = createEmptyDFA()
      const engine = new DFAEngine(emptyDFA)
      
      expect(engine.getNextState('q0', 'a')).toBe(null)
    })
  })

  describe('isValidString', () => {
    it('should validate strings against alphabet', () => {
      const engine = new DFAEngine(binaryEndingIn01)
      
      expect(engine.isValidString('01010')).toBe(true)
      expect(engine.isValidString('012')).toBe(false)
      expect(engine.isValidString('abc')).toBe(false)
    })
  })

  describe('validateDFA', () => {
    it('should validate correct DFA', () => {
      const result = DFAEngine.validateDFA(binaryEndingIn01)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing initial state', () => {
      const invalidDFA = {
        ...binaryEndingIn01,
        initialStateId: 'nonexistent'
      }
      
      const result = DFAEngine.validateDFA(invalidDFA)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Initial state'))).toBe(true)
    })

    it('should detect invalid accepting state', () => {
      const invalidDFA = {
        ...binaryEndingIn01,
        acceptingStateIds: ['nonexistent']
      }
      
      const result = DFAEngine.validateDFA(invalidDFA)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Accepting state'))).toBe(true)
    })

    it('should warn about incomplete transitions', () => {
      const incompleteDFA = createEmptyDFA()
      incompleteDFA.alphabet = ['a', 'b']
      
      const result = DFAEngine.validateDFA(incompleteDFA)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('Incomplete'))).toBe(true)
    })
  })
})

describe('Helper Functions', () => {
  describe('createEmptyDFA', () => {
    it('should create a valid empty DFA', () => {
      const dfa = createEmptyDFA('Test DFA')
      
      expect(dfa.name).toBe('Test DFA')
      expect(dfa.states).toHaveLength(1)
      expect(dfa.states[0].id).toBe('q0')
      expect(dfa.states[0].isInitial).toBe(true)
      expect(dfa.initialStateId).toBe('q0')
      expect(dfa.transitions).toHaveLength(0)
    })
  })

  describe('generateStateId', () => {
    it('should generate unique state IDs', () => {
      const dfa = createEmptyDFA()
      
      const id1 = generateStateId(dfa.states)
      expect(id1).toBe('q1')
      
      dfa.states.push({
        id: id1,
        label: id1,
        isInitial: false,
        isAccepting: false,
        x: 0,
        y: 0
      })
      
      const id2 = generateStateId(dfa.states)
      expect(id2).toBe('q2')
    })
  })
})
