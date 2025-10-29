/**
 * Utility to export current localStorage DFAs to JSON
 * Run this in browser console: window.exportDFAs()
 */

import { getAllDFAs } from './dfa-storage'

export function exportDFAs() {
  const dfas = getAllDFAs()
  const json = JSON.stringify(dfas, null, 2)
  
  console.log('=== Copy this JSON ===')
  console.log(json)
  console.log('======================')
  
  // Also copy to clipboard if available
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
