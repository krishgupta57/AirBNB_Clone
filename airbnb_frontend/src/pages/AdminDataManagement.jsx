import { useState, useEffect } from "react";
import API from "../api";
import { 
  Calendar, 
  Home, 
  Search, 
  MapPin, 
  User, 
  Star, 
  Tag, 
  ShieldCheck, 
  ShieldAlert,
  ClipboardList,
  Building2,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
  LayoutGrid
} from "lucide-react";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";

function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookRes, propRes, revRes] = await Promise.all([
          API.get("bookings/?admin_view=true"),
          API.get("properties/?admin_view=true"),
          API.get("reviews/?admin_view=true")
        ]);
        setBookings(bookRes.data);
        setProperties(propRes.data);
        setReviews(revRes.data);
      } catch (err) {
        toast.error("Failed to load management data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  const filteredBookings = bookings.filter(b => 
    (b.property_detail?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.property_detail?.host_username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toString().includes(searchTerm)
  );

  const filteredProperties = properties.filter(p => 
    (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.host_username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(r => 
    (r.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  // Stats Calculations
  const now = new Date();
  
  const bookingStats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'confirmed' && new Date(b.check_out) < now).length,
    staying: bookings.filter(b => b.status === 'confirmed' && new Date(b.check_in) <= now && new Date(b.check_out) >= now).length,
    canceled: bookings.filter(b => b.status === 'cancelled').length
  };

  const propertyStats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
    inactive: properties.filter(p => p.status === 'inactive').length
  };

  return (
    <div className="container-custom py-12">
      {/* Header & Global Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Audit</h1>
           <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Master Oversight & Management</p>
        </div>
        
        <div className="bg-slate-100 p-1.5 rounded-3xl flex items-center shadow-inner w-full lg:w-auto">
           <button 
             onClick={() => { setActiveTab("bookings"); setSearchTerm(""); }}
             className={`flex-1 lg:w-40 flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
               activeTab === "bookings" ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
             }`}
           >
             <ClipboardList size={18} />
             Bookings
           </button>
           <button 
             onClick={() => { setActiveTab("listings"); setSearchTerm(""); }}
             className={`flex-1 lg:w-40 flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
               activeTab === "listings" ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
             }`}
           >
             <Building2 size={18} />
             Listings
           </button>
           <button 
             onClick={() => { setActiveTab("reviews"); setSearchTerm(""); }}
             className={`flex-1 lg:w-40 flex items-center justify-center gap-3 py-3 rounded-[1.25rem] font-black text-sm transition-all duration-300 ${
               activeTab === "reviews" ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
             }`}
           >
             <MessageSquare size={18} />
             Reviews
           </button>
        </div>
      </div>

      {/* KPI Cards (Conditional based on Tab) */}
      {activeTab === "bookings" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AuditStatCard title="Total Bookings" value={bookingStats.total} icon={<ClipboardList size={20} />} color="bg-slate-50 text-slate-600" />
          <AuditStatCard title="Completed" value={bookingStats.completed} icon={<CheckCircle size={20} />} color="bg-emerald-50 text-emerald-600" />
          <AuditStatCard title="Currently Staying" value={bookingStats.staying} icon={<Users size={20} />} color="bg-blue-50 text-blue-600" />
          <AuditStatCard title="Canceled" value={bookingStats.canceled} icon={<ShieldAlert size={20} />} color="bg-rose-50 text-rose-600" />
        </div>
      )}

      {activeTab === "listings" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AuditStatCard title="Total Inventory" value={propertyStats.total} icon={<LayoutGrid size={20} />} color="bg-slate-50 text-slate-600" />
          <AuditStatCard title="Live Listings" value={propertyStats.active} icon={<ShieldCheck size={20} />} color="bg-emerald-50 text-emerald-600" />
          <AuditStatCard title="In Maintenance" value={propertyStats.maintenance} icon={<Clock size={20} />} color="bg-amber-50 text-amber-600" />
          <AuditStatCard title="Inactive/Hidden" value={propertyStats.inactive} icon={<ShieldAlert size={20} />} color="bg-slate-100 text-slate-400" />
        </div>
      )}

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
                {activeTab === "bookings" ? `${bookings.length} Bookings` : 
                 activeTab === "listings" ? `${properties.length} Listings` : 
                 `${reviews.length} Reviews`}
              </span>
           </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "bookings" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property & Host</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-400">#{booking.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                          <img src={booking.property_detail?.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm truncate max-w-[180px]">{booking.property_detail?.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <User size={10} className="text-rose-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.property_detail?.host?.username || "Host"}</span>
                          </div>
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => setActiveChatBooking(booking)}
                              className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
                            >
                              <MessageSquare size={12} />
                              Message Guest
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase shadow-sm">
                            {booking.user?.avatar ? (
                                <img src={booking.user.avatar} className="w-full h-full object-cover" />
                            ) : (
                                booking.user?.username?.[0] || "?"
                            )}
                         </div>
                         <p className="text-sm font-bold text-slate-700">{booking.user?.username}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                           <p className="text-xs font-black text-slate-800">{new Date(booking.check_in).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}</p>
                        </div>
                        <ChevronRight size={12} className="text-slate-300" />
                        <div className="text-center">
                           <p className="text-xs font-black text-slate-800">{new Date(booking.check_out).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900">₹{parseFloat(booking.total_price).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "listings" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Host</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price / Night</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm border border-slate-50">
                          <img src={prop.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="max-w-[220px]">
                          <p className="font-black text-slate-900 text-sm truncate">{prop.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{prop.property_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase shadow-md">
                            {prop.host_username?.[0] || "?"}
                         </div>
                         <p className="text-sm font-bold text-slate-700">{prop.host_username || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={14} className="text-rose-500" />
                        <span className="text-sm font-bold truncate max-w-[150px]">{prop.location}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900">₹{parseFloat(prop.price_per_night).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5">
                         <Star size={14} fill={prop.average_rating ? "#f59e0b" : "none"} className={prop.average_rating ? "text-amber-500" : "text-slate-300"} />
                         <span className="text-sm font-black text-slate-700">{prop.average_rating || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       {prop.status === 'active' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                             <ShieldCheck size={12} /> Active
                          </span>
                       ) : prop.status === 'maintenance' ? (
                         <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} /> Maintenance
                         </span>
                       ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                             <ShieldAlert size={12} /> Inactive
                          </span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "reviews" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comment</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black uppercase text-sm">
                            {rev.user?.username?.[0] || "?"}
                         </div>
                         <p className="font-black text-slate-900">{rev.user?.username || "Deleted User"}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-400">#{rev.property}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit">
                          <Star size={12} fill="#f59e0b" className="text-amber-500" />
                          <span className="text-xs font-black text-amber-700">{rev.rating}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-slate-600 max-w-md line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={14} />
                          <span className="text-xs font-bold">{new Date(rev.created_at).toLocaleDateString()}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {((activeTab === "bookings" && filteredBookings.length === 0) || 
            (activeTab === "listings" && filteredProperties.length === 0) ||
            (activeTab === "reviews" && filteredReviews.length === 0)) && (
            <div className="py-32 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-slate-200" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {activeChatBooking && (
        <ChatModal 
          booking={activeChatBooking} 
          currentUser={currentUser} 
          onClose={() => setActiveChatBooking(null)} 
        />
      )}
    </div>
  );
}

function AuditStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 flex items-center gap-5 group hover:scale-[1.02] transition-all cursor-default">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-xl font-black text-slate-900">{value}</h4>
      </div>
    </div>
  );
}

export default AdminDataManagement;
