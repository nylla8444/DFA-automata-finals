import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { DFAEditor } from '../components/DFAEditor/DFAEditor'
import { saveDFA } from '../utils/dfa-storage'
import { createEmptyDFA } from '../utils/dfa-engine'
import { exportDFAToJSON, importDFAFromJSON, copyDFAToClipboard } from '../utils/export-helper'
import type { DFA } from '../types/dfa'

export const Route = createFileRoute('/create')({
  component: CreatePage,
})

function CreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Start with empty DFA
  const [dfa, setDFA] = useState<DFA>(() => createEmptyDFA())

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name for your DFA')
      return
    }

    setSaving(true)
    
    try {
      const saved = saveDFA(name, description, dfa)
      alert(`DFA "${saved.name}" saved successfully!`)
      navigate({ to: '/collection' })
    } catch (error) {
      console.error('Error saving DFA:', error)
      alert('Failed to save DFA. Please try again.')
      setSaving(false)
    }
  }

  // Export DFA to JSON file
  const handleExportJSON = () => {
    try {
      // Update name before exporting if provided
      const dfaToExport = name.trim() ? { ...dfa, name: name } : dfa
      exportDFAToJSON(dfaToExport)
      alert('DFA exported successfully!')
    } catch (error) {
      alert('Failed to export DFA: ' + (error as Error).message)
    }
  }

  // Import DFA from JSON file
  const handleImportJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const importedDFA = await importDFAFromJSON(file)
        // Keep the current ID for new DFA
        importedDFA.id = dfa.id
        setDFA(importedDFA)
        // Optionally update name field with imported name
        if (importedDFA.name && !name) {
          setName(importedDFA.name)
        }
        alert('DFA imported successfully!')
      } catch (error) {
        alert('Failed to import DFA: ' + (error as Error).message)
      }
    }
    
    input.click()
  }

  // Copy DFA JSON to clipboard
  const handleCopyJSON = async () => {
    try {
      await copyDFAToClipboard(dfa)
      alert('DFA JSON copied to clipboard!')
    } catch (error) {
      alert('Failed to copy to clipboard: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900">
      {/* Diagonal Grid with Light */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10">
        <Navigation />
      </div>
      <div className="max-w-6xl mx-auto px-8 pb-8 relative z-10">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Create New DFA
          </h1>
          <p className="text-xl text-blue-700 font-medium">
            Build your Deterministic Finite Automaton
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            DFA Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">
                🏷️ DFA Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Binary Ending in 01"
                className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg transition-all shadow-sm hover:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">
                📄 Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your DFA accepts..."
                rows={3}
                className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg transition-all shadow-sm hover:border-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">🎨</span>
            Visual Editor
          </h2>
          
          {/* Import/Export Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 mb-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-bold text-gray-800">💾 Import/Export:</span>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 text-sm rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  title="Download DFA as JSON file"
                >
                  <span>📥</span>
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={handleImportJSON}
                  className="px-4 py-2.5 text-sm rounded-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  title="Load DFA from JSON file"
                >
                  <span>📤</span>
                  <span>Import JSON</span>
                </button>
                <button
                  onClick={handleCopyJSON}
                  className="px-4 py-2.5 text-sm rounded-lg font-bold bg-purple-500 text-white hover:bg-purple-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  title="Copy JSON to clipboard"
                >
                  <span>📋</span>
                  <span>Copy JSON</span>
                </button>
              </div>
              <div className="text-sm text-blue-800 font-medium">
                Save or load your DFA design
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 text-base font-medium bg-blue-50 p-4 rounded-lg border border-blue-200">
            💡 <strong>Tip:</strong> Click "Add State" to start building your DFA. You can drag states to reposition them.
          </p>
          <DFAEditor initialDFA={dfa} onChange={setDFA} />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate({ to: '/collection' })}
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? '💾 Saving...' : '✅ Save DFA'}
          </button>
        </div>
      </div>
    </div>
  )
}
