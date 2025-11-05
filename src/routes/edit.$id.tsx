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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-8 pb-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            Edit DFA
          </h1>
          <p className="text-xl text-indigo-700">
            Modify your Deterministic Finite Automaton
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            DFA Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DFA Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Binary Ending in 01"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your DFA accepts..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Visual Editor
          </h2>
    {/* Import/Export Section */}
      <div className="bg-white border border-gray-300 rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Import/Export:</span>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-sm rounded font-medium bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1.5"
              title="Download DFA as JSON file"
            >
              <span>📥</span>
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleImportJSON}
              className="px-3 py-1.5 text-sm rounded font-medium bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              title="Load DFA from JSON file"
            >
              <span>📤</span>
              <span>Import JSON</span>
            </button>
            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 text-sm rounded font-medium bg-purple-50 border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
              title="Copy JSON to clipboard"
            >
              <span>📋</span>
              <span>Copy JSON</span>
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Save or load your DFA design
          </div>
        </div>
      </div>

          <p className="text-gray-600 mb-4">
            Edit your DFA visually. Drag states to reposition, add/remove states and transitions.
          </p>
          <DFAEditor initialDFA={currentDFA} onChange={setCurrentDFA} />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate({ to: '/view/$id', params: { id } })}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
