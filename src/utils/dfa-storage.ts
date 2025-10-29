import type { DFA } from '../types/dfa'

const STORAGE_KEY = 'dfa-collection'

export interface SavedDFA {
  id: string
  name: string
  description: string
  dfa: DFA
  createdAt: string
  updatedAt: string
}

/**
 * Get all saved DFAs from LocalStorage
 */
export function getAllDFAs(): SavedDFA[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading DFAs:', error)
    return []
  }
}

/**
 * Get a single DFA by ID
 */
export function getDFAById(id: string): SavedDFA | null {
  const dfas = getAllDFAs()
  return dfas.find(d => d.id === id) || null
}

/**
 * Save a new DFA
 */
export function saveDFA(name: string, description: string, dfa: DFA): SavedDFA {
  const dfas = getAllDFAs()
  const now = new Date().toISOString()
  
  const savedDFA: SavedDFA = {
    id: `dfa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    dfa,
    createdAt: now,
    updatedAt: now,
  }
  
  dfas.push(savedDFA)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dfas))
  
  return savedDFA
}

/**
 * Update an existing DFA
 */
export function updateDFA(id: string, name: string, description: string, dfa: DFA): SavedDFA | null {
  const dfas = getAllDFAs()
  const index = dfas.findIndex(d => d.id === id)
  
  if (index === -1) return null
  
  dfas[index] = {
    ...dfas[index],
    name,
    description,
    dfa,
    updatedAt: new Date().toISOString(),
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dfas))
  return dfas[index]
}

/**
 * Delete a DFA
 */
export function deleteDFA(id: string): boolean {
  const dfas = getAllDFAs()
  const filtered = dfas.filter(d => d.id !== id)
  
  if (filtered.length === dfas.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Initialize with example DFAs if storage is empty
 */
export function initializeExamples(exampleDFAs: Array<{ name: string; description: string; dfa: DFA }>) {
  const existing = getAllDFAs()
  if (existing.length > 0) return // Already has data
  
  exampleDFAs.forEach(example => {
    saveDFA(example.name, example.description, example.dfa)
  })
}
