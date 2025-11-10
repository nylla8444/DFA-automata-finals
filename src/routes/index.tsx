import { createFileRoute } from '@tanstack/react-router'
import { DFAEngine, binaryEndingIn01 } from '../lib/dfa'
import { DFASimulator, Navigation } from '../components'
import { useState, useEffect } from 'react'
import { getAllDFAs } from '../utils/dfa-storage'
import { loadExampleDFAs } from '../utils/example-loader'
import type { SavedDFA } from '../utils/dfa-storage'
import type { DFA } from '../types/dfa'

export const Route = createFileRoute('/')({
  component: App,
})

/**
 * StateTableView - Shows transition table in tabular format
 */
function StateTableView({ dfa }: { dfa: DFA }) {
  // Build transition table
  const transitionMap = new Map<string, Map<string, string>>()
  
  // Initialize map for all states
  dfa.states.forEach(state => {
    transitionMap.set(state.id, new Map())
  })
  
  // Fill in transitions
  dfa.transitions.forEach(transition => {
    const stateMap = transitionMap.get(transition.fromStateId)
    if (stateMap) {
      const existing = stateMap.get(transition.symbol)
      if (existing) {
        stateMap.set(transition.symbol, `${existing}, ${transition.toStateId}`)
      } else {
        stateMap.set(transition.symbol, transition.toStateId)
      }
    }
  })

  return (
    <div className="space-y-4">
      {/* Table Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Transition Table (δ)</h3>
        <p className="text-sm text-blue-800">
          This table shows the transition function δ(state, symbol) → next state for all states and input symbols.
        </p>
      </div>

      {/* Transition Table */}
      <div className="overflow-x-auto bg-white rounded-lg border-2 border-gray-300 shadow-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gradient-to-r from-indigo-100 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-r-2 border-gray-300">
                State
              </th>
              {dfa.alphabet.map(symbol => (
                <th
                  key={symbol}
                  className="px-6 py-4 text-center text-sm font-bold text-gray-900 border-r border-gray-200"
                >
                  <span className="font-mono text-base">{symbol}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {dfa.states.map((state, idx) => {
              const isInitial = state.id === dfa.initialStateId
              const isAccepting = dfa.acceptingStateIds.includes(state.id)
              const stateTransitions = transitionMap.get(state.id)

              return (
                <tr
                  key={state.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-900">
                        {state.label}
                      </span>
                      {isInitial && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                          Start
                        </span>
                      )}
                      {isAccepting && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                          Accept
                        </span>
                      )}
                    </div>
                  </td>
                  {dfa.alphabet.map(symbol => {
                    const nextState = stateTransitions?.get(symbol)
                    return (
                      <td
                        key={symbol}
                        className="px-6 py-4 text-center border-r border-gray-200"
                      >
                        {nextState ? (
                          <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-300 rounded font-mono text-sm text-indigo-900 font-semibold">
                            {nextState}
                          </span>
                        ) : (
                          <span className="text-red-400 text-xl">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Start</span>
            <span className="text-gray-600">Initial state</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">Accept</span>
            <span className="text-gray-600">Accepting state</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xl">—</span>
            <span className="text-gray-600">No transition defined</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 border border-indigo-300 rounded px-2 py-0.5 font-mono text-xs">q0</span>
            <span className="text-gray-600">Next state</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState('')
  const [savedDFAs, setSavedDFAs] = useState<SavedDFA[]>([])
  const [selectedDFAId, setSelectedDFAId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'quick' | 'table' | 'simulator'>('quick')
  
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

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === 'quick'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Quick Test
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === 'table'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  State Table
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === 'simulator'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Step-by-Step Simulator
                </button>
              </div>

              {/* Show either quick result or simulator */}
              {activeTab === 'quick' && result && (
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

              {activeTab === 'quick' && !result && (
                <div className="text-center py-12 text-gray-500">
                  <p>Enter a string above to test</p>
                </div>
              )}

              {activeTab === 'table' && (
                <StateTableView dfa={dfa} />
              )}

              {activeTab === 'simulator' && input && (
                <DFASimulator dfa={dfa} inputString={input} />
              )}
              
              {activeTab === 'simulator' && !input && (
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
