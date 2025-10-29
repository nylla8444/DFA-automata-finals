import { createFileRoute } from '@tanstack/react-router'
import { DFAEngine, binaryEndingIn01 } from '../lib/dfa'
import { DFASimulator, Navigation } from '../components'
import { useState, useEffect } from 'react'
import { getAllDFAs } from '../utils/dfa-storage'
import { loadExampleDFAs } from '../utils/example-loader'
import type { SavedDFA } from '../utils/dfa-storage'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [input, setInput] = useState('')
  const [savedDFAs, setSavedDFAs] = useState<SavedDFA[]>([])
  const [selectedDFAId, setSelectedDFAId] = useState<string>('')
  const [showSimulator, setShowSimulator] = useState(true)
  
  // Load all saved DFAs from collection
  useEffect(() => {
    // Load example DFAs if localStorage is empty
    loadExampleDFAs()
    
    // Get all DFAs (including newly loaded examples)
    const dfas = getAllDFAs()
    setSavedDFAs(dfas)
    
    // If there are saved DFAs, select the first one by default
    if (dfas.length > 0) {
      setSelectedDFAId(dfas[0].id)
    }
  }, [])
  
  // Get the currently selected DFA (from saved or fallback to examples)
  const getCurrentDFA = () => {
    if (selectedDFAId) {
      const savedDFA = savedDFAs.find(d => d.id === selectedDFAId)
      if (savedDFA) return savedDFA.dfa
    }
    // Fallback to example DFA if no saved DFAs
    return binaryEndingIn01
  }
  
  const dfa = getCurrentDFA()
  const currentSavedDFA = savedDFAs.find(d => d.id === selectedDFAId)
  const engine = new DFAEngine(dfa)
  
  const result = input ? engine.processString(input) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-8 pb-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            DFA Visualization Tool
          </h1>
          <p className="text-xl text-indigo-700">
            Deterministic Finite Automaton Simulator
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Interactive DFA Simulator ✨
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select DFA from Collection:
            </label>
            {savedDFAs.length > 0 ? (
              <select
                value={selectedDFAId}
                onChange={(e) => setSelectedDFAId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
              >
                {savedDFAs.map((savedDFA) => (
                  <option key={savedDFA.id} value={savedDFA.id}>
                    {savedDFA.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No DFAs in your collection yet!</p>
                <a
                  href="/create"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Your First DFA
                </a>
              </div>
            )}
          </div>

          {savedDFAs.length > 0 && currentSavedDFA && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Current DFA: {currentSavedDFA.name}
                </h3>
                <p className="text-gray-600 mb-4">{currentSavedDFA.description}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Alphabet:</strong> {dfa.alphabet.map(s => `"${s}"`).join(', ')}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>States:</strong> {dfa.states.length}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Transitions:</strong> {dfa.transitions.length}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Input String:
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Enter a string (alphabet: ${dfa.alphabet.join(', ')})`}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg font-mono"
                />
              </div>

              {/* Toggle between quick test and step-by-step simulator */}
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setShowSimulator(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !showSimulator
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Quick Test
                </button>
                <button
                  onClick={() => setShowSimulator(true)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showSimulator
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Step-by-Step Simulator
                </button>
              </div>

              {/* Show either quick result or simulator */}
              {!showSimulator && result && (
                <div className={`p-6 rounded-lg ${
                  result.accepted 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <h3 className={`text-xl font-bold mb-3 ${
                    result.accepted ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.accepted ? '✅ String Accepted!' : '❌ String Rejected'}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <p className="font-mono">
                      <strong>Input:</strong> "{result.inputString}"
                    </p>
                    <p>
                      <strong>Path:</strong> {result.path.join(' → ')}
                    </p>
                    <p>
                      <strong>Final State:</strong> {result.currentState}
                    </p>
                    {result.error && (
                      <p className="text-red-700">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {showSimulator && input && (
                <DFASimulator dfa={dfa} inputString={input} />
              )}
              
              {showSimulator && !input && (
                <div className="text-center py-12 text-gray-500">
                  <p>Enter a string above to start simulation</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
