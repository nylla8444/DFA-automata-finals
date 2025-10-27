import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

// only show in dev
const isDev = import.meta.env.DEV

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {isDev && (
        <TanstackDevtools
          config={{ position: 'bottom-left' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  ),
})