# DFA Automata Visualization Tool

A modern web application for visualizing and simulating **Deterministic Finite Automata (DFA)** built with React, TypeScript, and TanStack Router.

## 🎯 Project Overview

This application helps users understand DFA (Deterministic Finite Automaton) concepts through interactive visualization and simulation. Create, edit, and test DFAs with a beautiful, intuitive interface.

## ✨ Features

### Current (Phase 1 - Complete ✅)
- ✅ **DFA Engine** - Core processing logic with validation
- ✅ **Example DFAs** - 5 pre-built automata for learning
- ✅ **String Testing** - Live string acceptance/rejection
- ✅ **Path Visualization** - See state transitions in action
- ✅ **Comprehensive Testing** - 16 unit tests
- ✅ **Interactive Demo** - Beautiful UI with Tailwind CSS

### Coming Soon (Phase 2+)
- ⏳ **Visual Editor** - Drag-and-drop DFA creation
- ⏳ **Animated Simulator** - Step-by-step execution with animation
- ⏳ **State Management** - Create and save custom DFAs
- ⏳ **Export/Import** - Share DFAs via JSON
- ⏳ **Multiple Pages** - Gallery, editor, simulator routes

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run serve
```

## 📚 What is a DFA?

A **Deterministic Finite Automaton** is a theoretical machine consisting of:

- **States** - Nodes representing computation positions
- **Alphabet** - Set of valid input symbols
- **Transitions** - Rules for moving between states based on input
- **Initial State** - Starting point
- **Accept States** - States that indicate string acceptance

**Example:** A DFA that accepts binary strings ending in "01"

```
Input: "1001" → Accepted ✅
Path: q0 → q0 → q1 → q1 → q2 (accept state)

Input: "1010" → Rejected ❌
Path: q0 → q0 → q1 → q2 → q1 (not in accept state)
```

## 🧩 Tech Stack

- **React 19** - UI framework
- **TypeScript 5.7** - Type safety
- **TanStack Router 1.x** - File-based routing
- **Tailwind CSS 4** - Styling
- **Vite 6** - Build tool
- **Vitest 3** - Testing

## 📁 Project Structure

```
src/
├── types/
│   └── dfa.ts              # TypeScript type definitions
├── utils/
│   ├── dfa-engine.ts       # Core DFA processing engine
│   ├── dfa-examples.ts     # Pre-built example DFAs
│   └── dfa-engine.test.ts  # Test suite
├── lib/
│   └── dfa.ts              # Centralized exports
├── routes/
│   └── index.tsx           # Home page with demo
└── components/             # (Coming in Phase 2)
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

**Current Coverage:**
- String processing (acceptance/rejection)
- Invalid symbol detection
- Step-by-step simulation
- DFA validation
- Helper functions

All 16 tests passing! ✅

## 📖 Usage Example

```typescript
import { DFAEngine, binaryEndingIn01 } from './lib/dfa'

// Create DFA engine
const engine = new DFAEngine(binaryEndingIn01)

// Test a string
const result = engine.processString('1001')

console.log(result.accepted)     // true
console.log(result.path)         // ['q0', 'q0', 'q1', 'q1', 'q2']
console.log(result.currentState) // 'q2'

// Get step-by-step trace
const steps = engine.getSimulationSteps('01')
// Returns: [
//   { stateId: 'q0', symbol: null, remainingInput: '01', stepNumber: 0 },
//   { stateId: 'q1', symbol: '0', remainingInput: '1', stepNumber: 1 },
//   { stateId: 'q2', symbol: '1', remainingInput: '', stepNumber: 2 }
// ]

// Validate DFA structure
const validation = DFAEngine.validateDFA(myDFA)
console.log(validation.isValid)  // true/false
console.log(validation.errors)   // Array of error messages
```

## 🎓 Example DFAs Included

1. **Binary Ending in "01"** - Accepts binary strings ending with "01"
2. **Even Number of 0s** - Accepts strings with even count of '0's
3. **Contains "aba"** - Accepts strings containing "aba" substring
4. **Length Divisible by 3** - Accepts strings whose length is divisible by 3
5. **Simple "a" or "b"** - Accepts only single characters "a" or "b"

## 🗺️ Development Roadmap

- [x] **Phase 1: Foundation** (COMPLETE)
  - Core DFA engine
  - Type system
  - Example DFAs
  - Testing infrastructure
  - Interactive demo

- [ ] **Phase 2: Visualization**
  - SVG canvas component
  - State node rendering
  - Transition arrow rendering
  - Drag-and-drop positioning

- [ ] **Phase 3: Routes & Pages**
  - Gallery page
  - Editor page
  - Simulator page
  - Navigation

- [ ] **Phase 4: Features**
  - DFA creation/editing
  - Local storage persistence
  - Export/import
  - Animation system

## 🤝 Contributing

This is a learning project for automata theory visualization. Suggestions and improvements are welcome!

## 📄 License

MIT

## 🔗 Resources

- [Automata Theory Tutorial](https://www.tutorialspoint.com/automata_theory/deterministic_finite_automaton.htm)
- [DFA Video Explanation](https://www.youtube.com/watch?v=40i4PKpM0cI)
- [TanStack Router Docs](https://tanstack.com/router)

---

**Built with ❤️ using React, TypeScript, and TanStack**
