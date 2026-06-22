import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import { HeroUIProvider } from "@heroui/react";
import { ItineraryPage } from "../pages/itinerary-page";

const rootRoute = createRootRoute({
  component: () => (
    <HeroUIProvider>
      <Outlet />
    </HeroUIProvider>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ItineraryPage
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const AppRouter = () => <RouterProvider router={router} />;
