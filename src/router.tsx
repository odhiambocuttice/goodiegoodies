import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'
import CreateListingPage from '@/pages/CreateListingPage'
import SellerDashboardPage from '@/pages/SellerDashboardPage'
import MarketplacePage from '@/pages/MarketplacePage'
import ListingDetailPage from '@/pages/ListingDetailPage'

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

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: MarketplacePage,
})

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$id',
  component: function ListingDetailWrapper() {
    const { id } = listingDetailRoute.useParams()
    return <ListingDetailPage id={id} />
  },
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute, createListingRoute, dashboardRoute, marketplaceRoute, listingDetailRoute]),
})

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
