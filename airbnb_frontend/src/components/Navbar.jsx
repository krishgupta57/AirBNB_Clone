import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, User, Wallet as WalletIcon, LogOut, LayoutDashboard, Home, Heart, UserCircle, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getUser, logoutUser } from "../utils/auth";
import toast from "react-hot-toast";
import axios from "axios";

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (search) fetchSuggestions(search); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?search=${encodeURIComponent(search)}`);
      setShowSuggestions(false);
    }
  };

  const logout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="professional-header shadow-sm bg-white">
      <div className="container-custom w-full flex items-center justify-between">
        
        {/* 1. Logo Section */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="text-rose-500 transition-transform group-hover:scale-110">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 fill-current" aria-hidden="true" role="presentation" focusable="false">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.392 3.42-6.72 3.636l-.233.015-.223.01c-3.48 0-6.358-2.416-6.358-6.478 0-1.541.326-2.719 1.121-4.17l.145-.272c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 24.1c1.1 0 2.053-.513 3.16-1.503.208-.184.417-.383.627-.596-3.08-3.386-3.788-7.913-3.788-11.41 0-.3 0-.5 0-.5s0 .2 0 .5c0 3.109 1.154 6.704 3.394 9.172.18-.179.314-.306.402-.387l.255-.245C17.653 18.995 19 15.176 19 11.233c0-1.508-1.292-2.333-3-2.333s-3 .825-3 2.333c0 3.943 1.347 7.762 2.945 10.972l.255.245c.088.081.222.208.402.387 2.24-2.468 3.394-6.063 3.394-9.172 0-.3 0-.5 0-.5s0 .2 0 .5c0 3.497-.708 8.024-3.788 11.41.21.213.419.412.627.596 1.107.99 2.06 1.503 3.16 1.503zm.471-1.23l-.17-.183-.342.348c-.2.203-.4.402-.6.59C13.253 23.36 10.5 19.467 10.5 15.5c0-1.785.836-3 2.5-3s2.5 1.215 2.5 3c0 3.109-1.372 6.574-3.394 9.172l.394.328z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 hidden lg:block">
            Air<span className="text-rose-500">BNB</span>
          </span>
        </Link>

        {/* 2. Refined Search Pill (Desktop) */}
        <div className="hidden md:block flex-1 max-w-md mx-8" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className={`flex items-center bg-white border border-slate-200 rounded-full py-2.5 pl-6 pr-2 shadow-sm transition-all pill-transition hover:shadow-md ${showSuggestions ? 'ring-4 ring-rose-500/5' : ''}`}>
              <div className="flex-1 flex flex-col justify-center">
                 <input 
                    type="text" 
                    placeholder="Search destinations"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                 />
              </div>
              <button type="submit" className="bg-rose-500 p-2.5 rounded-full text-white hover:bg-rose-600 transition shadow-sm ml-2">
                <Search size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white mt-4 rounded-3xl airbnb-shadow border border-slate-100 overflow-hidden animate-in">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { setSearch(item.display_name.split(',')[0]); setShowSuggestions(false); navigate(`/search?search=${item.display_name.split(',')[0]}`); }}
                    className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 group"
                  >
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                      <Search size={14} strokeWidth={3} />
                    </div>
                    <div className="truncate text-left">
                      <p className="font-bold text-sm text-slate-800 leading-tight">{item.display_name.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* 3. Global Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link to="/pricing" className="hidden sm:block text-sm font-bold text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-full transition">
            Become a host
          </Link>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-3 pr-1.5 py-1.5 transition-all hover:shadow-md cursor-pointer group"
            >
              <Menu size={16} className="text-slate-600 ml-1" />
              <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm">
                {user ? <span className="text-xs font-black uppercase">{user.username[0]}</span> : <User size={16} />}
              </div>
            </button>

            {/* Account Dropdown */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl airbnb-shadow border border-slate-100 py-3 overflow-hidden animate-in text-left">
                {!user ? (
                  <>
                    <Link to="/login" className="block px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="block px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <Link to="/pricing" className="block px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>Host your home</Link>
                    <Link to="/help" className="block px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>Help Center</Link>
                  </>
                ) : (
                  <>
                    <div className="px-6 py-4 bg-slate-50/50 mb-2 border-b border-slate-100">
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Authenticated</p>
                       <p className="text-lg font-black text-slate-900 truncate tracking-tight">{user.username}</p>
                    </div>

                    {user.role === 'host' && (
                      <div className="mx-4 my-3 p-4 bg-slate-900 rounded-xl flex justify-between items-center group cursor-pointer" onClick={() => { navigate('/wallet'); setIsMenuOpen(false); }}>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
                          <p className="text-sm font-black text-white">₹{parseFloat(user.wallet_balance || 0).toLocaleString()}</p>
                        </div>
                        <WalletIcon size={14} className="text-rose-500" />
                      </div>
                    )}

                    <Link to={user.role === 'host' ? "/host-dashboard" : "/my-bookings"} className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard size={16} className="text-slate-400" />
                      {user.role === 'host' ? 'Host Dashboard' : 'My Trips'}
                    </Link>
                    
                    <Link to="/wishlist" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>
                      <Heart size={16} className="text-slate-400" />
                      Wishlist
                    </Link>

                    <div className="h-px bg-slate-100 my-2 mx-6"></div>
                    
                    <Link to="/profile" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition" onClick={() => setIsMenuOpen(false)}>
                      <UserCircle size={16} className="text-slate-400" />
                      Profile Settings
                    </Link>

                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition group"
                    >
                      <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                      Log out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Search - Simplified View */}
      <div className="md:hidden fixed top-20 left-0 w-full px-4 py-3 bg-white border-b border-slate-100 airbnb-shadow">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm">
               <Search size={18} className="text-rose-500" strokeWidth={3} />
               <input 
                  type="text" 
                  placeholder="Where to?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ml-3 bg-transparent text-sm font-bold underline-offset-4 outline-none"
               />
            </div>
          </form>
      </div>

    </header>
  );
}

export default Navbar;