import { createBrowserRouter, Outlet } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import { AuthProvider } from "./features/auth/auth.context";

// Create a Root Layout component that provides the Auth context to all routes
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/",
        element: <Protected><h1>Home page</h1></Protected>,
      },
    ],
  },
]);