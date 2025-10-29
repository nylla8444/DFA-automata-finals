import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { DFASimulator } from '../components/DFASimulator/DFASimulator'
import { getDFAById } from '../utils/dfa-storage'
import type { SavedDFA } from '../utils/dfa-storage'

export const Route = createFileRoute('/view/$id')({
  component: ViewPage,
})

function ViewPage() {
  const { id } = useParams({ from: '/view/$id' })
  const navigate = useNavigate()
  const [savedDFA, setSavedDFA] = useState<SavedDFA | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputString, setInputString] = useState('')

  useEffect(() => {
    const dfa = getDFAById(id)
    if (!dfa) {
      alert('DFA not found')
      navigate({ to: '/collection' })
      return
    }
    setSavedDFA(dfa)
    setLoading(false)
  }, [id, navigate])

  if (loading || !savedDFA) {
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
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-indigo-900 mb-2">
                {savedDFA.name}
              </h1>
              <p className="text-xl text-indigo-700">
                {savedDFA.description}
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/collection' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            DFA Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">
                {savedDFA.dfa.states.length}
              </p>
              <p className="text-sm text-gray-600">States</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {savedDFA.dfa.transitions.length}
              </p>
              <p className="text-sm text-gray-600">Transitions</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {savedDFA.dfa.acceptingStateIds.length}
              </p>
              <p className="text-sm text-gray-600">Accepting States</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {savedDFA.dfa.alphabet.length}
              </p>
              <p className="text-sm text-gray-600">Alphabet Size</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Test This DFA
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input String:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder={`Enter a string (alphabet: ${savedDFA.dfa.alphabet.join(', ')})`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg font-mono"
            />
          </div>

          <DFASimulator dfa={savedDFA.dfa} inputString={inputString} />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate({ to: '/edit/$id', params: { id } })}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Edit DFA
          </button>
        </div>
      </div>
    </div>
  )
}
