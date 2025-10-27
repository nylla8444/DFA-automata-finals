import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/subroute/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex h-screen items-center justify-center'>Hello "/subroute/test"!</div>
}
