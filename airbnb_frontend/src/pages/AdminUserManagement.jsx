import { useState, useEffect } from "react";
import API from "../api";
import { 
  Users, 
  User, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Home, 
  Search, 
  Phone, 
  Wallet, 
  Info, 
  MessageCircle,
  Tag,
  Shield,
  Clock,
  Crown
} from "lucide-react";
import toast from "react-hot-toast";

function AdminUserManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hosts");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await API.get("admin/users/");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load user management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  if (!data) return null;

  const filteredList = (activeTab === "hosts" ? data.hosts : data.guests).filter(u => 
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toString().includes(searchTerm)
  );

  return (
    <div className="container-custom py-12">
      {/* Header & Global Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Management</h1>
           <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Platform Ecosystem Oversight</p>
        </div>
        
        <div className="bg-slate-100 p-1.5 rounded-3xl flex items-center shadow-inner w-full lg:w-auto">
           <button 
             onClick={() => { setActiveTab("hosts"); setSearchTerm(""); }}
             className={`flex-1 lg:w-40 flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
               activeTab === "hosts" ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
             }`}
           >
             <Shield size={18} />
             Hosts
           </button>
           <button 
             onClick={() => { setActiveTab("guests"); setSearchTerm(""); }}
             className={`flex-1 lg:w-40 flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
               activeTab === "guests" ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
             }`}
           >
             <User size={18} />
             Guests
           </button>
        </div>
      </div>

      {/* Dynamic Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder={`Search in ${activeTab}...`}
             className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                {activeTab === "hosts" ? `${data.hosts.length} Total Hosts` : `${data.guests.length} Total Guests`}
              </span>
           </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet & Activity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Tier</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black uppercase text-xl overflow-hidden border border-slate-50 shadow-sm shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                u.username?.[0] || "?"
                              )}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-base">{u.username || "Unknown"}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <Tag size={10} className="text-rose-500" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{u.id}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="space-y-1.5">
                           <div className="flex items-center gap-2 text-slate-600">
                              <Mail size={14} className="text-rose-500" />
                              <span className="text-xs font-bold">{u.email}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-500">
                              <Phone size={14} className="text-slate-400" />
                              <span className="text-xs font-bold">{u.phone || "No phone"}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-slate-900">
                              <Wallet size={14} className="text-emerald-500" />
                              <span className="font-black text-sm">₹{u.wallet_balance?.toLocaleString()}</span>
                           </div>
                           {activeTab === "hosts" && (
                             <div className="flex items-center gap-2">
                                <Home size={14} className="text-blue-500" />
                                <span className="text-xs font-black text-slate-600">{u.listing_count} Listings</span>
                             </div>
                           )}
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                             u.tier === 'ultimate' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' :
                             u.tier === 'premium' ? 'bg-slate-900 text-white' :
                             u.tier === 'standard' ? 'bg-blue-500 text-white' :
                             'bg-slate-100 text-slate-400'
                           }`}>
                              <Crown size={14} />
                           </div>
                           <span className={`text-xs font-black uppercase tracking-widest ${
                             u.tier === 'ultimate' ? 'text-amber-600' :
                             u.tier === 'premium' ? 'text-slate-900' :
                             'text-slate-500'
                           }`}>
                              {u.tier} Plan
                           </span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Clock size={14} />
                           <span className="text-[11px] font-black uppercase tracking-widest">
                              {new Date(u.date_joined).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}
                           </span>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
          {filteredList.length === 0 && (
            <div className="py-32 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-slate-200" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagement;
