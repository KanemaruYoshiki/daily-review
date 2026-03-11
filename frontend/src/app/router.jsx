import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import PricingPage from "../pages/public/PricingPage";
import DashboardPage from "../pages/app/DashboardPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
]);