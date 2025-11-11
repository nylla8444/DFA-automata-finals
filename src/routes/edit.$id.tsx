import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { DFAEditor } from '../components/DFAEditor/DFAEditor'
import { getDFAById, updateDFA } from '../utils/dfa-storage'
import type { SavedDFA } from '../utils/dfa-storage'
import type { DFA } from '../types/dfa'
import { exportDFAToJSON, importDFAFromJSON, copyDFAToClipboard } from '../utils/export-helper'


export const Route = createFileRoute('/edit/$id')({
  component: EditPage,
})

function EditPage() {
  const { id } = useParams({ from: '/edit/$id' })
  const navigate = useNavigate()
  const [savedDFA, setSavedDFA] = useState<SavedDFA | null>(null)
  const [currentDFA, setCurrentDFA] = useState<DFA | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const dfa = getDFAById(id)
    if (!dfa) {
      alert('DFA not found')
      navigate({ to: '/collection' })
      return
    }
    setSavedDFA(dfa)
    setCurrentDFA(dfa.dfa)
    setName(dfa.name)
    setDescription(dfa.description)
    setLoading(false)
  }, [id, navigate])

  const handleSave = () => {
    if (!name.trim() || !currentDFA) {
      alert('Please enter a name for your DFA')
      return
    }

    setSaving(true)
    
    try {
      const updated = updateDFA(id, name, description, currentDFA)
      if (updated) {
        alert(`DFA "${updated.name}" updated successfully!`)
        navigate({ to: '/view/$id', params: { id } })
      } else {
        alert('Failed to update DFA')
        setSaving(false)
      }
    } catch (error) {
      console.error('Error updating DFA:', error)
      alert('Failed to update DFA. Please try again.')
      setSaving(false)
    }
  }

  // Export DFA to JSON file
  const handleExportJSON = () => {
    if (!currentDFA) return
    try {
      // Update name before exporting
      const dfaToExport = { ...currentDFA, name: name || currentDFA.name }
      exportDFAToJSON(dfaToExport)
      alert('DFA exported successfully!')
    } catch (error) {
      alert('Failed to export DFA: ' + (error as Error).message)
    }
  }

  // Import DFA from JSON file
  const handleImportJSON = () => {
    if (!currentDFA) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const importedDFA = await importDFAFromJSON(file)
        // Keep the current ID to maintain editor state
        importedDFA.id = currentDFA.id
        setCurrentDFA(importedDFA)
        alert('DFA imported successfully!')
      } catch (error) {
        alert('Failed to import DFA: ' + (error as Error).message)
      }
    }
    
    input.click()
  }

  // Copy DFA JSON to clipboard
  const handleCopyJSON = async () => {
    if (!currentDFA) return
    try {
      await copyDFAToClipboard(currentDFA)
      alert('DFA JSON copied to clipboard!')
    } catch (error) {
      alert('Failed to copy to clipboard: ' + (error as Error).message)
    }
  }


  if (loading || !savedDFA || !currentDFA) {
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
        <div className="flex items-center justify-center h-96 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading...</p>
          </div>
        </div>
      </div>
    )
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
      <div className="max-w-7xl mx-auto px-6 pb-12 relative z-10">
        <header className="text-center mb-10 pt-8">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Edit DFA
          </h1>
          <p className="text-xl text-blue-700 font-medium">
            Modify your Deterministic Finite Automaton
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            DFA Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-base font-bold text-gray-800 mb-3">
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
              <label className="block text-base font-bold text-gray-800 mb-3">
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

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🎨</span>
            Visual Editor
          </h2>
    {/* Import/Export Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 mb-6 shadow-sm">
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

          <p className="text-gray-700 mb-6 text-base font-medium bg-blue-50 p-4 rounded-lg border border-blue-200">
            💡 <strong>Tip:</strong> Edit your DFA visually. Drag states to reposition, add/remove states and transitions.
          </p>
          <DFAEditor initialDFA={currentDFA} onChange={setCurrentDFA} />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate({ to: '/view/$id', params: { id } })}
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? '💾 Saving...' : '✅ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
