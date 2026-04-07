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
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
          <Route path="/property/:id" element={<PropertyDetail />} />

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