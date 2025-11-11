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
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2 text-lg flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Transition Table (δ)
        </h3>
        <p className="text-sm text-blue-800">
          This table shows the transition function δ(state, symbol) → next state for all states and input symbols.
        </p>
      </div>

      {/* Transition Table */}
      <div className="overflow-x-auto bg-white rounded-xl border-2 border-blue-200 shadow-xl">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-white border-r-2 border-blue-400">
                State
              </th>
              {dfa.alphabet.map(symbol => (
                <th
                  key={symbol}
                  className="px-6 py-4 text-center text-sm font-bold text-white border-r border-blue-400"
                >
                  <span className="font-mono text-base">{symbol}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 bg-white">
            {dfa.states.map((state, idx) => {
              const isInitial = state.id === dfa.initialStateId
              const isAccepting = dfa.acceptingStateIds.includes(state.id)
              const stateTransitions = transitionMap.get(state.id)

              return (
                <tr
                  key={state.id}
                  className={`hover:bg-blue-50 transition-all duration-150 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 text-base">
                        {state.label}
                      </span>
                      {isInitial && (
                        <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
                          Start
                        </span>
                      )}
                      {isAccepting && (
                        <span className="text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
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
                        className="px-6 py-4 text-center border-r border-blue-100"
                      >
                        {nextState ? (
                          <span className="inline-block px-4 py-1.5 bg-blue-100 border-2 border-blue-400 rounded-lg font-mono text-sm text-blue-900 font-bold shadow-sm hover:bg-blue-200 transition-colors">
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
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-3 text-base">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">Start</span>
            <span className="text-gray-700 font-medium">Initial state</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">Accept</span>
            <span className="text-gray-700 font-medium">Accepting state</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xl">—</span>
            <span className="text-gray-700 font-medium">No transition</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 border-2 border-blue-400 rounded-lg px-2.5 py-1 font-mono text-xs font-bold">q0</span>
            <span className="text-gray-700 font-medium">Next state</span>
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
            DFA Visualization Tool
          </h1>
          <p className="text-xl text-blue-700 font-medium">
            Deterministic Finite Automaton Simulator
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">✨</span>
            Interactive DFA Simulator
          </h2>
          
          <div className="mb-8">
            <label className="block text-base font-bold text-gray-800 mb-3">
              📚 Select DFA from Collection:
            </label>
            {savedDFAs.length > 0 ? (
              <select
                value={selectedDFAId}
                onChange={(e) => setSelectedDFAId(e.target.value)}
                className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg font-medium transition-all shadow-sm hover:border-blue-400"
              >
                {savedDFAs.map((savedDFA) => (
                  <option key={savedDFA.id} value={savedDFA.id}>
                    {savedDFA.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 shadow-inner">
                <p className="text-gray-700 mb-4 text-lg font-medium">No DFAs in your collection yet!</p>
                <a
                  href="/create"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ➕ Create Your First DFA
                </a>
              </div>
            )}
          </div>

          {savedDFAs.length > 0 && currentSavedDFA && (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🎯 Current DFA: {currentSavedDFA.name}
                </h3>
                <p className="text-gray-600 mb-4 text-base">{currentSavedDFA.description}</p>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔤</span>
                      <div>
                        <p className="text-xs text-blue-700 font-semibold uppercase">Alphabet</p>
                        <p className="text-sm text-gray-900 font-mono font-bold">
                          {dfa.alphabet.map(s => `"${s}"`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭕</span>
                      <div>
                        <p className="text-xs text-blue-700 font-semibold uppercase">States</p>
                        <p className="text-sm text-gray-900 font-bold">{dfa.states.length} total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">➡️</span>
                      <div>
                        <p className="text-xs text-blue-700 font-semibold uppercase">Transitions</p>
                        <p className="text-sm text-gray-900 font-bold">{dfa.transitions.length} defined</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-base font-bold text-gray-800 mb-3">
                  ⌨️ Test Input String:
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Enter a string (alphabet: ${dfa.alphabet.join(', ')})`}
                  className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg font-mono transition-all shadow-sm hover:border-blue-400"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8 border-b-2 border-blue-200 bg-blue-50/50 rounded-t-xl p-2">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`px-6 py-3 font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'quick'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  ⚡ Quick Test
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-6 py-3 font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'table'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  📊 State Table
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-6 py-3 font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'simulator'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  🎮 Step-by-Step Simulator
                </button>
              </div>

              {/* Show either quick result or simulator */}
              {activeTab === 'quick' && result && (
                <div className={`p-8 rounded-xl shadow-lg border-2 ${
                  result.accepted 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500' 
                    : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
                }`}>
                  <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
                    result.accepted ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <span className="text-3xl">{result.accepted ? '✅' : '❌'}</span>
                    {result.accepted ? 'String Accepted!' : 'String Rejected'}
                  </h3>
                  
                  <div className="space-y-3 text-base">
                    <p className="font-mono bg-white/70 p-3 rounded-lg border border-gray-300">
                      <strong className="text-gray-700">Input:</strong> <span className="text-gray-900 font-bold">"{result.inputString}"</span>
                    </p>
                    <p className="bg-white/70 p-3 rounded-lg border border-gray-300">
                      <strong className="text-gray-700">Path:</strong> <span className="font-mono font-bold text-blue-700">{result.path.join(' → ')}</span>
                    </p>
                    <p className="bg-white/70 p-3 rounded-lg border border-gray-300">
                      <strong className="text-gray-700">Final State:</strong> <span className="font-mono font-bold text-gray-900">{result.currentState}</span>
                    </p>
                    {result.error && (
                      <p className="text-red-800 bg-white/70 p-3 rounded-lg border border-red-300">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'quick' && !result && (
                <div className="text-center py-16 text-gray-500 bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-200">
                  <p className="text-lg font-medium">Enter a string above to test</p>
                </div>
              )}

              {activeTab === 'table' && (
                <StateTableView dfa={dfa} />
              )}

              {activeTab === 'simulator' && input && (
                <DFASimulator dfa={dfa} inputString={input} />
              )}
              
              {activeTab === 'simulator' && !input && (
                <div className="text-center py-16 text-gray-500 bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-200">
                  <p className="text-lg font-medium">Enter a string above to start simulation</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
