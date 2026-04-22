import { useState, useEffect } from "react";
import API from "../api";
import { Users, User, ShieldCheck, Mail, Calendar, Home, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

function AdminUserManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hosts");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  if (!data) return null;

  const filteredList = (activeTab === "hosts" ? data.hosts : data.guests).filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toString().includes(searchTerm)
  );

  return (
    <div className="container-custom py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <Users className="text-rose-500" size={32} />
          User Management
        </h1>
        <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Manage platform ecosystem & members</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Filters */}
        <div className="lg:w-64 space-y-2">
           <TabButton 
             active={activeTab === "hosts"} 
             onClick={() => setActiveTab("hosts")} 
             label="Hosts" 
             count={data.hosts.length} 
             icon={<ShieldCheck size={18} />} 
           />
           <TabButton 
             active={activeTab === "guests"} 
             onClick={() => setActiveTab("guests")} 
             label="Guests" 
             count={data.guests.length} 
             icon={<User size={18} />} 
           />
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
           <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                 <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab} Directory</h2>
                 <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search name, email or ID..." 
                      className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">ID</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">User Details</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Email</th>
                          {activeTab === "hosts" && <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Listings</th>}
                          {activeTab === "hosts" && <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Tier</th>}
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Joined</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition group">
                             <td className="px-8 py-6">
                                <span className="text-xs font-black text-slate-400">#{u.id}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black uppercase text-sm">
                                      {u.username[0]}
                                   </div>
                                   <p className="font-black text-slate-900">{u.username}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-slate-500">
                                   <Mail size={14} className="text-slate-300" />
                                   <span className="text-sm font-bold">{u.email}</span>
                                </div>
                             </td>
                             {activeTab === "hosts" && (
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                        <Home size={14} />
                                     </div>
                                     <span className="font-black text-slate-900">{u.listing_count}</span>
                                  </div>
                               </td>
                             )}
                             {activeTab === "hosts" && (
                               <td className="px-8 py-6">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-900 text-white rounded-full">
                                     {u.tier}
                                  </span>
                               </td>
                             )}
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-slate-400">
                                   <Calendar size={14} />
                                   <span className="text-xs font-bold">{new Date(u.date_joined).toLocaleDateString()}</span>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {filteredList.length === 0 && (
                    <div className="py-20 text-center">
                       <Users className="mx-auto text-slate-200 mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No users found matching your search</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
        active 
          ? "bg-rose-500 text-white shadow-lg shadow-rose-200" 
          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
         {icon}
         {label}
      </div>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
         {count}
      </span>
    </button>
  );
}

export default AdminUserManagement;
