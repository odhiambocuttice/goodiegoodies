import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'
import CreateListingPage from '@/pages/CreateListingPage'

const rootRoute = createRootRoute()

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-listing',
  component: CreateListingPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute, createListingRoute]),
})

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
