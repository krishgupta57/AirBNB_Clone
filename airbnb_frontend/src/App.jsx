import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HostRoute from "./components/HostRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetail from "./pages/PropertyDetail";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import MyProperties from "./pages/MyProperties";
import MyBookings from "./pages/MyBookings";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import HostDashboard from "./pages/HostDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOTP from "./pages/VerifyOTP";
import Search from "./pages/Search";
import Checkout from "./pages/Checkout";
import Pricing from "./pages/Pricing";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route 
            path="/subscription-checkout" 
            element={
              <ProtectedRoute>
                <SubscriptionCheckout />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/host-dashboard"
            element={
              <HostRoute>
                <HostDashboard />
              </HostRoute>
            }
          />

          <Route
            path="/add-property"
            element={
              <HostRoute>
                <AddProperty />
              </HostRoute>
            }
          />
          
          <Route
            path="/wallet"
            element={
              <HostRoute>
                <Wallet />
              </HostRoute>
            }
          />

          <Route
            path="/edit-property/:id"
            element={
              <HostRoute>
                <EditProperty />
              </HostRoute>
            }
          />

          <Route
            path="/my-properties"
            element={
              <HostRoute>
                <MyProperties />
              </HostRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;