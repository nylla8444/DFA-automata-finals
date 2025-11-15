import { Link } from '@tanstack/react-router'

export function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg mb-8 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-blue-100 transition-all hover:scale-105"
            >
              <span>DFA Visualizer</span>
            </Link>
            <div className="hidden md:flex space-x-2">
              <Link
                to="/"
                className="[&.active]:bg-blue-500 [&.active]:text-white text-blue-50 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Simulator
              </Link>
              <Link
                to="/collection"
                className="[&.active]:bg-blue-500 [&.active]:text-white text-blue-50 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Collection
              </Link>
              <Link
                to="/create"
                className="[&.active]:bg-blue-500 [&.active]:text-white text-blue-50 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                ➕ Create
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
