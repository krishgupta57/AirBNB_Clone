import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { getUser, logoutUser } from "../utils/auth";
import toast from "react-hot-toast";

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
    window.location.reload();
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-rose-500 transition">Home</Link>

      {user?.role === "host" && (
        <>
          <Link to="/host-dashboard" className="hover:text-rose-500 transition">Dashboard</Link>
          <Link to="/add-property" className="hover:text-rose-500 transition">Add Property</Link>
          <Link to="/my-properties" className="hover:text-rose-500 transition">My Properties</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/my-bookings" className="hover:text-rose-500 transition">My Bookings</Link>
          <Link to="/wishlist" className="hover:text-rose-500 transition">Wishlist</Link>
          <Link to="/profile" className="hover:text-rose-500 transition">Profile</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="container-custom flex items-center justify-between h-20">
        <Link to="/" className="text-2xl font-extrabold text-rose-500">
            Air<span className="text-slate-900">BNB</span> 
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-slate-700 font-medium">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-rose-400 hover:text-rose-500 transition">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-slate-900 text-white transition">
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "host" && (
                <Link
                  to="/host-dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-rose-500 transition"
                >
                  <LayoutDashboard size={18} />
                  Host Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-custom py-4 flex flex-col gap-4 text-slate-700 font-medium">
            <NavLinks />
            {!user ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            ) : (
              <button onClick={logout} className="text-left text-red-500">Logout</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;