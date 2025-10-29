import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { getAllDFAs, initializeExamples, deleteDFA } from '../utils/dfa-storage'
import { binaryEndingIn01, evenNumberOfZeros } from '../utils/dfa-examples'
import type { SavedDFA } from '../utils/dfa-storage'

export const Route = createFileRoute('/collection')({
  component: CollectionPage,
})

function CollectionPage() {
  const [dfas, setDfas] = useState<SavedDFA[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize with examples if empty
    initializeExamples([
      {
        name: 'Binary Ending in "01"',
        description: 'Accepts binary strings that end with "01"',
        dfa: binaryEndingIn01,
      },
      {
        name: 'Even Number of 0s',
        description: 'Accepts binary strings with an even number of 0s',
        dfa: evenNumberOfZeros,
      },
    ])

    // Load all DFAs
    const loaded = getAllDFAs()
    setDfas(loaded)
    setLoading(false)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this DFA?')) {
      deleteDFA(id)
      setDfas(getAllDFAs())
    }
  }

  if (loading) {
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
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            DFA Collection
          </h1>
          <p className="text-xl text-indigo-700">
            Browse and manage your saved DFAs
          </p>
        </header>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Saved DFAs ({dfas.length})
          </h2>
          <Link
            to="/create"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            + Create New DFA
          </Link>
        </div>

        {dfas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No DFAs saved yet</p>
            <Link
              to="/create"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Your First DFA
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dfas.map((savedDFA) => (
              <div
                key={savedDFA.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {savedDFA.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {savedDFA.description}
                </p>
                
                <div className="text-sm text-gray-500 mb-4 space-y-1">
                  <p>States: {savedDFA.dfa.states.length}</p>
                  <p>Transitions: {savedDFA.dfa.transitions.length}</p>
                  <p>Alphabet: {savedDFA.dfa.alphabet.join(', ')}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/view/$id"
                    params={{ id: savedDFA.id }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-center font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to="/edit/$id"
                    params={{ id: savedDFA.id }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(savedDFA.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Updated: {new Date(savedDFA.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
