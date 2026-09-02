import  {createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { ErrorPage } from "./ui/ErrorPage";
import { DashboardPage } from "./pages/DashboardPage";
/*import { BillingPage } from "./pages/BillingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UserProfilePage } from "./pages/UserProfilePage";*/
import { CabinsPage } from "./pages/CabinsPage.jsx";
import { BookingsPage } from "./pages/BookingsPage.jsx";
import { BookingDetailsPage } from "./pages/BookingDetailsPage.jsx";
import { CheckInPage } from "./pages/CheckInPage.jsx";
import { LoginPage } from "./pages/LoginPage"; 
import { LogoutPage } from "./pages/LogoutPage.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";
import { Toaster } from "react-hot-toast";
import { SettingsPage } from "./pages/SettingsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
       {
        path: "/",
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },     
      {
        path: "/dashboard",
        index: true,
        element: <DashboardPage />,
      },      
      {
        path: "/cabins",
        element: <CabinsPage />,
      },
      {
        path: "/bookings",
        element: <BookingsPage />,
      },
      {
        path: "/bookings/:bookingId",
        element: <BookingDetailsPage />,
      },
      {
        path: "/checkin/:bookingId",
        element: <CheckInPage />,
      },
     /* {
        path: "/billing",
        element: <BillingPage />,
      }, */
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/logout",
        element: <LogoutPage />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ] 
   }
]); 
function App() {
  return (<>
  <Toaster position="top-center"
  gutter={12}
  containerStyle={{ top: 50 }}
  toastOptions={{
    style: {
      backgroundColor: "#363636",
      color: "#fff",
      fontSize: "16px",
      maxWidth: "400px",
      padding: "16px",
      borderRadius: "8px",
    },
    loading: {
      duration: 3000,
      theme: {
        primary: "blue",
        secondary: "black",
      },
    },
    success: {
      duration: 3000,
      theme: {
        primary: "green",
        secondary: "black",
      },
    },
    error: {
      duration: 10000,
      theme: {
        primary: "red",
        secondary: "black",
      },
    },
  }}
   reverseOrder={false} / >
  <RouterProvider router={router}/>  
  </> 
  )
}

export default App
