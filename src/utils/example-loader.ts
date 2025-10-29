import exampleDFAs from '../data/example-dfas.json'
import type { SavedDFA } from './dfa-storage'

const STORAGE_KEY = 'dfa-collection'
const VERSION_KEY = 'dfa-examples-version'
const CURRENT_VERSION = '1.0.0' // Increment this when you update example-dfas.json

/**
 * Load example DFAs from JSON and seed localStorage if empty or outdated
 */
export function loadExampleDFAs(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const storedVersion = localStorage.getItem(VERSION_KEY)
    
    // Load examples if:
    // 1. localStorage is empty, OR
    // 2. Version has changed (you updated the JSON file)
    if (!stored || stored === '[]' || storedVersion !== CURRENT_VERSION) {
      console.log('Loading example DFAs from JSON...')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exampleDFAs))
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      console.log(`✅ Loaded ${exampleDFAs.length} example DFAs (version ${CURRENT_VERSION})`)
    }
  } catch (error) {
    console.error('Error loading example DFAs:', error)
  }
}

/**
 * Get all example DFAs from JSON (without modifying localStorage)
 */
export function getExampleDFAs(): SavedDFA[] {
  return exampleDFAs as unknown as SavedDFA[]
}