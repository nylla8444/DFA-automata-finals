import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation/Navigation'
import { DFASimulator } from '../components/DFASimulator/DFASimulator'
import { getDFAById } from '../utils/dfa-storage'
import { DFAEngine } from '../lib/dfa'
import type { SavedDFA } from '../utils/dfa-storage'
import type { DFA } from '../types/dfa'

export const Route = createFileRoute('/view/$id')({
  component: ViewPage,
})

/**
 * QuickTestResult - Shows instant accept/reject result
 */
function QuickTestResult({ dfa, inputString }: { dfa: DFA; inputString: string }) {
  if (!inputString) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Enter a string above to test</p>
      </div>
    )
  }

  const engine = new DFAEngine(dfa)
  const result = engine.processString(inputString)

  return (
    <div className="space-y-4">
      {/* Result Card */}
      <div
        className={`p-6 rounded-xl border-2 ${
          result.accepted
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500'
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
        }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-5xl ${result.accepted ? 'animate-bounce' : 'animate-pulse'}`}>
            {result.accepted ? '✅' : '❌'}
          </div>
          <div>
            <h3
              className={`text-3xl font-bold ${
                result.accepted ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.accepted ? 'String Accepted!' : 'String Rejected'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {result.accepted
                ? 'This string matches the pattern defined by the DFA'
                : 'This string does not match the pattern'}
            </p>
          </div>
        </div>

        <div className="bg-white bg-opacity-70 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Input String:</span>
            <span className="font-mono bg-white px-3 py-1 rounded border text-gray-900">
              {inputString}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Final State:</span>
            <span className="font-mono bg-white px-3 py-1 rounded border text-gray-900">
              {result.currentState}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">State Type:</span>
            <span
              className={`px-3 py-1 rounded font-semibold ${
                result.accepted
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {result.accepted ? 'Accepting State ⭐' : 'Non-accepting State'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Switch to "Step-by-Step Simulator" tab to see how the DFA
          processes this string step by step with visual feedback.
        </p>
      </div>
    </div>
  )
}

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

function ViewPage() {
  const { id } = useParams({ from: '/view/$id' })
  const navigate = useNavigate()
  const [savedDFA, setSavedDFA] = useState<SavedDFA | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputString, setInputString] = useState('')
  const [activeTab, setActiveTab] = useState<'quick' | 'table' | 'simulator'>('simulator')

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
          
          <div>
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

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b-2 border-gray-200">
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

          {/* Quick Test Tab Content */}
          {activeTab === 'quick' && (
            <div className="mt-6">
              <QuickTestResult dfa={savedDFA.dfa} inputString={inputString} />
            </div>
          )}

          {/* State Table Tab Content */}
          {activeTab === 'table' && (
            <div className="mt-6">
              <StateTableView dfa={savedDFA.dfa} />
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Simulator Section */}
      {activeTab === 'simulator' && (
        <div className="bg-white  py-8">
          <div className="max-w-[1600px] mx-auto px-10">
            <div className="mb-6 flex items-center">
              <div className='mr-20'>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Step-by-Step Simulator
              </h2>
              <p className="text-gray-600">
                Watch how the DFA processes your input string step by step
              </p>
              </div>

              <div>
                
                    <button
            onClick={() => navigate({ to: '/edit/$id', params: { id } })}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Edit DFA
          </button>
              </div>
            </div>
            
            <DFASimulator dfa={savedDFA.dfa} inputString={inputString} />
          </div>
        </div>
      )}

    </div>
  )
}
