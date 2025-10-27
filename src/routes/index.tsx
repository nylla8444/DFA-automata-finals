import { createFileRoute } from '@tanstack/react-router'
import '../App.css'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <h1 className='font-bold text-2xl'>Hello World!</h1>
  </div>
  )
}
