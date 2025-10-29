import { Link } from '@tanstack/react-router'

export function Navigation() {
  return (
    <nav className="bg-white shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              DFA Visualizer
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="[&.active]:text-indigo-600 [&.active]:font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Simulator
              </Link>
              <Link
                to="/collection"
                className="[&.active]:text-indigo-600 [&.active]:font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
