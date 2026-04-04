import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'
import CreateListingPage from '@/pages/CreateListingPage'
import SellerDashboardPage from '@/pages/SellerDashboardPage'

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

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: SellerDashboardPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute, createListingRoute, dashboardRoute]),
})

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
