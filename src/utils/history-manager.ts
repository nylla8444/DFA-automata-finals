import type { DFA } from '../types/dfa'

/**
 * Command interface for undo/redo pattern
 */
export interface Command {
  execute(): DFA
  undo(): DFA
  description: string
}

/**
 * History Manager for Undo/Redo functionality
 * Implements the Command pattern for DFA state management
 */
export class HistoryManager {
  private history: DFA[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  constructor(initialState: DFA, maxSize: number = 50) {
    this.maxHistorySize = maxSize
    this.history = [initialState]
    this.currentIndex = 0
  }

  /**
   * Push a new state to history
   */
  pushState(newState: DFA): void {
    // Remove any states after current index (when user makes new change after undo)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // Add new state
    this.history.push(newState)
    this.currentIndex++

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
  }

  /**
   * Undo to previous state
   */
  undo(): DFA | null {
    if (!this.canUndo()) {
      return null
    }

    this.currentIndex--
    return this.history[this.currentIndex]
  }

  /**
   * Redo to next state
   */
  redo(): DFA | null {
    if (!this.canRedo()) {
      return null
    }

    this.currentIndex++
    return this.history[this.currentIndex]
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Get current state
   */
  getCurrentState(): DFA {
    return this.history[this.currentIndex]
  }

  /**
   * Get history size
   */
  getHistorySize(): number {
    return this.history.length
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * Clear all history and set new initial state
   */
  reset(initialState: DFA): void {
    this.history = [initialState]
    this.currentIndex = 0
  }

  /**
   * Get history preview for UI
   */
  getHistoryPreview(): { index: number; total: number; canUndo: boolean; canRedo: boolean } {
    return {
      index: this.currentIndex,
      total: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }
}
