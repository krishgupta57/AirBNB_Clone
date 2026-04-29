import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import { 
  Home, 
  User, 
  MessageSquare,
  Clock,
  ChevronRight,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";

function HostDataManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'properties';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [propRes, bookRes] = await Promise.all([
        API.get("properties/my/"),
        API.get("bookings/?as_host=true")
      ]);
      setProperties(propRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
              Host Portal
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Business</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed overview of your active listings and upcoming guests.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-4 md:px-8 bg-slate-50/50 overflow-x-auto hide-scrollbar">
          <button 
            className={`px-6 py-6 font-black text-sm uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'properties' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            onClick={() => setActiveTab('properties')}
          >
            <Home size={16} />
            My Properties
            <span className="ml-2 bg-slate-200 text-slate-500 py-0.5 px-2 rounded-full text-[10px]">{properties.length}</span>
          </button>
          <button 
            className={`px-6 py-6 font-black text-sm uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'bookings' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Clock size={16} />
            Guest Reservations
            <span className="ml-2 bg-slate-200 text-slate-500 py-0.5 px-2 rounded-full text-[10px]">{bookings.length}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-0 overflow-x-auto">
          {activeTab === "properties" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Listing</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price / Night</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm relative">
                          <img src={prop.image_file || prop.image} alt="" className={`w-full h-full object-cover ${!prop.is_active && 'grayscale'}`} />
                          {!prop.is_active && (
                              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                                  <EyeOff size={16}/>
                              </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm truncate max-w-[200px]">{prop.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{prop.property_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{prop.location}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900">₹{parseFloat(prop.price_per_night).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                        prop.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {prop.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bookings" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className={`transition-all duration-500 group ${
                    booking.unread_messages_count > 0 
                    ? 'bg-rose-50/30 border-l-4 border-l-rose-500' 
                    : 'hover:bg-slate-50/50'
                  }`}>
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
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{booking.trip_status}</p>
                          {booking.status !== 'cancelled' && booking.trip_status !== 'Completed' && (
                            <button 
                              onClick={() => setActiveChatBooking(booking)}
                              className={`mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg shadow-sm ${
                                booking.unread_messages_count > 0
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-500 hover:text-rose-500 bg-slate-100 hover:bg-rose-50'
                              }`}
                            >
                              <MessageSquare size={12} />
                              {booking.unread_messages_count > 0 ? `Message Guest (${booking.unread_messages_count} New)` : 'Message Guest'}
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
        </div>
      </div>

      {activeChatBooking && (
        <ChatModal 
          booking={activeChatBooking} 
          currentUser={currentUser} 
          onClose={() => setActiveChatBooking(null)} 
          mode="host"
        />
      )}
    </div>
  );
}

export default HostDataManagement;
