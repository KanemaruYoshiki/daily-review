import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import PricingPage from "../pages/public/PricingPage";
import SignupPage from "../pages/public/SignupPage";
import LoginPage from "../pages/public/LoginPage";    
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
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
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