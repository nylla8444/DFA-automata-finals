import { createFileRoute } from '@tanstack/react-router'
import { DFAEngine, binaryEndingIn01, evenNumberOfZeros } from '../lib/dfa'
import { DFASimulator, Navigation } from '../components'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [input, setInput] = useState('')
  const [selectedExample, setSelectedExample] = useState<'binary01' | 'evenZeros'>('binary01')
  const [showSimulator, setShowSimulator] = useState(false)
  
  const dfa = selectedExample === 'binary01' ? binaryEndingIn01 : evenNumberOfZeros
  const engine = new DFAEngine(dfa)
  
  const result = input ? engine.processString(input) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-4xl mx-auto px-8 pb-8">
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
              Select Example DFA:
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedExample('binary01')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedExample === 'binary01'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Binary Ending in "01"
              </button>
              <button
                onClick={() => setSelectedExample('evenZeros')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedExample === 'evenZeros'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Even Number of 0s
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Current DFA: {dfa.name}
            </h3>
            <p className="text-gray-600 mb-4">{dfa.description}</p>
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

          {showSimulator && (
            <DFASimulator dfa={dfa} inputString={input} />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Development Progress
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Phase 1: Core DFA Engine & Types</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Phase 2: Visualization Components</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Phase 3: Routes & LocalStorage</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Phase 4: Interactive DFA Editor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <span className="text-gray-500">Phase 5: Polish & Advanced Features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

