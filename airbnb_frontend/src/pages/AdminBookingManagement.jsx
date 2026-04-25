import { useState, useEffect } from "react";
import API from "../api";
import { Calendar, Search, MapPin, User, Home, CreditCard, Tag } from "lucide-react";
import toast from "react-hot-toast";

function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("bookings/?admin_view=true");
        setBookings(res.data);
      } catch (err) {
        toast.error("Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  const filteredBookings = bookings.filter(b => 
    (b.property_detail.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.property_detail.host_username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toString().includes(searchTerm)
  );

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Calendar className="text-rose-500" size={32} />
            Global Bookings
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Platform-wide reservation history</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search booking or ID..." 
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
             {[...new Set(bookings.map(b => b.property_detail.host_username))].filter(Boolean).map(host => (
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property & Host</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in/out</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
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
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={booking.property_detail.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm truncate max-w-[200px]">{booking.property_detail.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Tag size={10} className="text-slate-400" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{booking.property_detail.host_username}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase">
                          {booking.user.username[0]}
                       </div>
                       <p className="text-sm font-bold text-slate-700">{booking.user.username}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{new Date(booking.check_in).toLocaleDateString('en-GB')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">to {new Date(booking.check_out).toLocaleDateString('en-GB')}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900">₹{parseFloat(booking.total_price).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                      booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="py-24 text-center">
               <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBookingManagement;
