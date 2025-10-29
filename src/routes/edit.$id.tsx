import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { DFAEditor } from '../components/DFAEditor/DFAEditor'
import { getDFAById, updateDFA } from '../utils/dfa-storage'
import type { SavedDFA } from '../utils/dfa-storage'
import type { DFA } from '../types/dfa'

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
