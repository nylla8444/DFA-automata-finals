/**
 * Utility functions for importing and exporting DFAs
 */

import type { DFA } from '../types/dfa'
import { getAllDFAs } from './dfa-storage'

/**
 * Export a single DFA to JSON file
 */
export function exportDFAToJSON(dfa: DFA): void {
  const json = JSON.stringify(dfa, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${dfa.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dfa.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import DFA from JSON file
 */
export function importDFAFromJSON(file: File): Promise<DFA> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const dfa = JSON.parse(json) as DFA
        
        // Validate basic DFA structure
        if (!dfa.id || !dfa.name || !dfa.states || !dfa.transitions || !dfa.alphabet) {
          throw new Error('Invalid DFA structure')
        }
        
        // Convert date strings back to Date objects
        if (dfa.createdAt) {
          dfa.createdAt = new Date(dfa.createdAt)
        }
        if (dfa.updatedAt) {
          dfa.updatedAt = new Date(dfa.updatedAt)
        }
        
        resolve(dfa)
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Copy DFA JSON to clipboard
 */
export async function copyDFAToClipboard(dfa: DFA): Promise<void> {
  const json = JSON.stringify(dfa, null, 2)
  
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(json)
  } else {
    throw new Error('Clipboard API not available')
  }
}

/**
 * Import DFA from clipboard
 */
export async function importDFAFromClipboard(): Promise<DFA> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available')
  }
  
  const text = await navigator.clipboard.readText()
  const dfa = JSON.parse(text) as DFA
  
  // Validate basic DFA structure
  if (!dfa.id || !dfa.name || !dfa.states || !dfa.transitions || !dfa.alphabet) {
    throw new Error('Invalid DFA structure in clipboard')
  }
  
  // Convert date strings back to Date objects
  if (dfa.createdAt) {
    dfa.createdAt = new Date(dfa.createdAt)
  }
  if (dfa.updatedAt) {
    dfa.updatedAt = new Date(dfa.updatedAt)
  }
  
  return dfa
}

/**
 * Export all DFAs to JSON file (for backup)
 */
export function exportAllDFAsToJSON(): void {
  const dfas = getAllDFAs()
  const json = JSON.stringify(dfas, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `dfa_collection_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Legacy function for console use
export function exportDFAs() {
  const dfas = getAllDFAs()
  const json = JSON.stringify(dfas, null, 2)
  
  console.log('=== Copy this JSON ===')
  console.log(json)
  console.log('======================')
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Copied to clipboard!')
    }).catch(() => {
      console.log('⚠️ Could not copy to clipboard, please copy from console')
    })
  }
  
  return json
}

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).exportDFAs = exportDFAs
}
