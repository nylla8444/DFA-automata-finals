import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { getAllDFAs, deleteDFA } from '../utils/dfa-storage'
import { loadExampleDFAs } from '../utils/example-loader'
import type { SavedDFA } from '../utils/dfa-storage'

export const Route = createFileRoute('/collection')({
  component: CollectionPage,
})

function CollectionPage() {
  const [dfas, setDfas] = useState<SavedDFA[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load example DFAs if localStorage is empty
    loadExampleDFAs()

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
            <p className="text-gray-600 text-lg font-medium">Loading collection...</p>
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
        <header className="text-center mb-12 pt-8">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            DFA Collection
          </h1>
          <p className="text-xl text-blue-700 font-medium">
            Browse and manage your saved DFAs
          </p>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Saved DFAs ({dfas.length})
          </h2>
          <Link
            to="/create"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Create New DFA
          </Link>
        </div>

        {dfas.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center border border-blue-100">
            <div className="text-6xl mb-6">📂</div>
            <p className="text-gray-600 text-xl mb-6 font-medium">No DFAs saved yet</p>
            <Link
              to="/create"
              className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            >
              ➕ Create Your First DFA
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dfas.map((savedDFA) => (
              <div
                key={savedDFA.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-200 border border-blue-100 hover:border-blue-300 transform hover:scale-105"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  {savedDFA.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-base">
                  {savedDFA.description}
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 text-sm space-y-2 border border-blue-200">
                  <p className="flex items-center gap-2 font-medium text-gray-800">
                    <span>⭕</span>
                    <strong>States:</strong> {savedDFA.dfa.states.length}
                  </p>
                  <p className="flex items-center gap-2 font-medium text-gray-800">
                    <span>➡️</span>
                    <strong>Transitions:</strong> {savedDFA.dfa.transitions.length}
                  </p>
                  <p className="flex items-center gap-2 font-medium text-gray-800">
                    <span>🔤</span>
                    <strong>Alphabet:</strong> {savedDFA.dfa.alphabet.join(', ')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/view/$id"
                    params={{ id: savedDFA.id }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-center font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    👁️ View
                  </Link>
                  <Link
                    to="/edit/$id"
                    params={{ id: savedDFA.id }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-center font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(savedDFA.id)}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                    title="Delete DFA"
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
