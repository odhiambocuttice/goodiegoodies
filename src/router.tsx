import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'

const rootRoute = createRootRoute()

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute]),
})

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
