import type { DFA } from '../../types/dfa'
import { DFACanvas } from '../DFACanvas/DFACanvas'

interface DFAViewerProps {
  dfa: DFA
  currentStateId?: string
  visitedStateIds?: string[]
}

/**
 * DFAViewer - Read-only wrapper for DFA visualization
 * Provides a clean interface for displaying DFAs without editing capabilities
 */
export function DFAViewer({ dfa, currentStateId, visitedStateIds }: DFAViewerProps) {
  return (
    <div className="dfa-viewer">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{dfa.name}</h3>
        {dfa.description && (
          <p className="text-sm text-gray-600 mt-1">{dfa.description}</p>
        )}
      </div>

      <DFACanvas
        dfa={dfa}
        currentStateId={currentStateId}
        visitedStateIds={visitedStateIds}
        width={1000}
        height={400}
      />

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 font-medium">States</p>
          <p className="text-2xl font-bold text-gray-800">{dfa.states.length}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 font-medium">Transitions</p>
          <p className="text-2xl font-bold text-gray-800">{dfa.transitions.length}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 font-medium">Alphabet Size</p>
          <p className="text-2xl font-bold text-gray-800">{dfa.alphabet.length}</p>
        </div>
      </div>
    </div>
  )
}
