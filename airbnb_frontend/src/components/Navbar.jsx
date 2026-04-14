import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Search, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getUser, logoutUser } from "../utils/auth";
import toast from "react-hot-toast";
import axios from "axios";

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchSuggestions(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?search=${encodeURIComponent(search)}`);
      setShowSuggestions(false);
      e.target.querySelector('input')?.blur();
    }
  };

  const onSelectCity = (cityName) => {
    setSearch(cityName);
    setShowSuggestions(false);
    navigate(`/search?search=${encodeURIComponent(cityName)}`);
  };

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
        <Link to="/" className="text-2xl font-extrabold text-rose-500 flex-shrink-0">
            Air<span className="text-slate-900">BNB</span> 
        </Link>

        {/* Global Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-4 py-2 hover:bg-white hover:shadow-md transition">
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 px-2"
              />
              <button type="submit" className="bg-rose-500 p-1.5 rounded-full text-white hover:bg-rose-600 transition">
                <Search size={16} />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onSelectCity(item.display_name.split(',')[0])}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                  >
                    <MapPin size={16} className="text-rose-500 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-xs text-slate-800">{item.display_name.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-slate-700 font-medium">
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
        <div className="md:hidden border-t border-slate-200 bg-white absolute top-full left-0 w-full shadow-lg">
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