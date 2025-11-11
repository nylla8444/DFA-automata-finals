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
      <div className="text-center py-16 text-gray-500 bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-200">
        <p className="text-lg font-medium">Enter a string above to test</p>
      </div>
    )
  }

  const engine = new DFAEngine(dfa)
  const result = engine.processString(inputString)

  return (
    <div className="space-y-6">
      {/* Result Card */}
      <div
        className={`p-8 rounded-2xl border-2 shadow-lg ${
          result.accepted
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500'
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className={`text-6xl ${result.accepted ? 'animate-bounce' : 'animate-pulse'}`}>
            {result.accepted ? '✅' : '❌'}
          </div>
          <div>
            <h3
              className={`text-4xl font-bold ${
                result.accepted ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.accepted ? 'String Accepted!' : 'String Rejected'}
            </h3>
            <p className="text-base text-gray-700 mt-2 font-medium">
              {result.accepted
                ? 'This string matches the pattern defined by the DFA'
                : 'This string does not match the pattern'}
            </p>
          </div>
        </div>

        <div className="bg-white bg-opacity-80 rounded-xl p-6 space-y-3 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Input String:</span>
            <span className="font-mono bg-white px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 font-bold shadow-sm">
              "{inputString}"
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Final State:</span>
            <span className="font-mono bg-white px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 font-bold shadow-sm">
              {result.currentState}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">State Type:</span>
            <span
              className={`px-4 py-2 rounded-lg font-bold shadow-sm ${
                result.accepted
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {result.accepted ? 'Accepting State ⭐' : 'Non-accepting State'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-sm">
        <p className="text-base text-blue-900 font-medium">
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
        <header className="mb-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                {savedDFA.name}
              </h1>
              <p className="text-xl text-blue-700 font-medium">
                {savedDFA.description}
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/collection' })}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
            >
              ← Back
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            DFA Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
              <p className="text-5xl font-extrabold text-blue-600">
                {savedDFA.dfa.states.length}
              </p>
              <p className="text-base text-gray-700 mt-2 font-bold">⭕ States</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-300 shadow-lg">
              <p className="text-5xl font-extrabold text-green-600">
                {savedDFA.dfa.transitions.length}
              </p>
              <p className="text-base text-gray-700 mt-2 font-bold">➡️ Transitions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-300 shadow-lg">
              <p className="text-5xl font-extrabold text-purple-600">
                {savedDFA.dfa.acceptingStateIds.length}
              </p>
              <p className="text-base text-gray-700 mt-2 font-bold">⭐ Accepting</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-300 shadow-lg">
              <p className="text-5xl font-extrabold text-orange-600">
                {savedDFA.dfa.alphabet.length}
              </p>
              <p className="text-base text-gray-700 mt-2 font-bold">🔤 Alphabet</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🧪</span>
            Test This DFA
          </h2>
          
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              ⌨️ Input String:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder={`Enter a string (alphabet: ${savedDFA.dfa.alphabet.join(', ')})`}
              className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg font-mono transition-all shadow-sm hover:border-blue-400"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8 border-b-2 border-blue-200 bg-blue-50/50 rounded-t-xl p-2">
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

          {/* Quick Test Tab Content */}
          {activeTab === 'quick' && (
            <div className="mt-8">
              <QuickTestResult dfa={savedDFA.dfa} inputString={inputString} />
            </div>
          )}

          {/* State Table Tab Content */}
          {activeTab === 'table' && (
            <div className="mt-8">
              <StateTableView dfa={savedDFA.dfa} />
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Simulator Section */}
      {activeTab === 'simulator' && (
        <div className="bg-white/50 backdrop-blur-sm py-12 border-t-4 border-blue-300 relative z-10">
          <div className="max-w-[1600px] mx-auto px-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <span className="text-5xl">🎮</span>
                  Step-by-Step Simulator
                </h2>
                <p className="text-gray-700 text-lg font-medium">
                  Watch how the DFA processes your input string step by step
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate({ to: '/edit/$id', params: { id } })}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-xl">✏️</span>
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
