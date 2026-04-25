import { useState, useEffect } from "react";
import API from "../api";
import { Home, Search, MapPin, User, Star, CreditCard, ShieldCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function AdminListingManagement() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await API.get("properties/?admin_view=true");
        setProperties(res.data);
      } catch (err) {
        toast.error("Failed to load property listings");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  const filteredProperties = properties.filter(p => 
    (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.host_username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Home className="text-rose-500" size={32} />
            Inventory Audit
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Global Property Management</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search title or city..." 
              className="w-full md:w-64 bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-full py-3 px-6 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition appearance-none cursor-pointer pr-10"
            onChange={(e) => setSearchTerm(e.target.value)}
          >
             <option value="">All Hosts</option>
             {[...new Set(properties.map(p => p.host_username))].filter(Boolean).map(host => (
               <option key={host} value={host}>{host}</option>
             ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Host</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price / Night</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                        <img src={prop.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="max-w-[250px]">
                        <p className="font-black text-slate-900 text-sm truncate">{prop.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{prop.property_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase shadow-sm">
                          {prop.host_username?.[0] || "?"}
                       </div>
                       <p className="text-sm font-bold text-slate-700">{prop.host_username || "Unknown Host"}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="text-sm font-bold truncate max-w-[150px]">{prop.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900">₹{parseFloat(prop.price_per_night).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-amber-500">
                       <Star size={14} fill="currentColor" />
                       <span className="text-sm font-black text-slate-700">{prop.average_rating || "New"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {prop.is_active ? (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                            <ShieldCheck size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                            <ShieldAlert size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Private</span>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProperties.length === 0 && (
            <div className="py-24 text-center">
               <Home className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No properties found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminListingManagement;
