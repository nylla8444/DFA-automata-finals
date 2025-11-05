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

function ViewPage() {
  const { id } = useParams({ from: '/view/$id' })
  const navigate = useNavigate()
  const [savedDFA, setSavedDFA] = useState<SavedDFA | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputString, setInputString] = useState('')
  const [activeTab, setActiveTab] = useState<'quick' | 'simulator'>('simulator')

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
