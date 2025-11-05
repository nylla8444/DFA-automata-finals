import { useEffect, useRef, useCallback } from 'react'
import type { DFA } from '../types/dfa'
import { HistoryManager } from '../utils/history-manager'

/**
 * Custom hook for managing undo/redo functionality
 */
export function useHistory(initialDFA: DFA) {
  const historyManagerRef = useRef<HistoryManager | null>(null)

  // Initialize history manager
  if (!historyManagerRef.current) {
    historyManagerRef.current = new HistoryManager(initialDFA)
  }

  const historyManager = historyManagerRef.current

  // Update history manager when initialDFA changes (e.g., loading new DFA)
  useEffect(() => {
    historyManager.reset(initialDFA)
  }, [initialDFA.id]) // Only reset when DFA ID changes

  const pushState = useCallback((newState: DFA) => {
    historyManager.pushState(newState)
  }, [historyManager])

  const undo = useCallback((): DFA | null => {
    return historyManager.undo()
  }, [historyManager])

  const redo = useCallback((): DFA | null => {
    return historyManager.redo()
  }, [historyManager])

  const canUndo = useCallback((): boolean => {
    return historyManager.canUndo()
  }, [historyManager])

  const canRedo = useCallback((): boolean => {
    return historyManager.canRedo()
  }, [historyManager])

  const getHistoryPreview = useCallback(() => {
    return historyManager.getHistoryPreview()
  }, [historyManager])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const previousState = undo()
        if (previousState) {
          // Trigger custom event with the previous state
          window.dispatchEvent(new CustomEvent('dfa-undo', { detail: previousState }))
        }
      }

      // Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z for Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        (e.ctrlKey && e.key === 'y')
      ) {
        e.preventDefault()
        const nextState = redo()
        if (nextState) {
          // Trigger custom event with the next state
          window.dispatchEvent(new CustomEvent('dfa-redo', { detail: nextState }))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    pushState,
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    getHistoryPreview
  }
}
