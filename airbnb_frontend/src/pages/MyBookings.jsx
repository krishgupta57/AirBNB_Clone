import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";
import { MessageSquare } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const loadBookings = async () => {
    try {
      const res = await API.get("bookings/");
      setBookings(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load bookings");
    }
  };

  const cancelBooking = async (id) => {
    toast.promise(
      API.post(`bookings/${id}/cancel/`),
      {
        loading: "Cancelling booking...",
        success: () => {
          loadBookings();
          return "Booking cancelled successfully";
        },
        error: (err) => err.response?.data?.error || "Failed to cancel booking",
      }
    );
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
      <p className="text-slate-500 mb-8">Track your reserved stays and travel plans.</p>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center">
          <h3 className="text-2xl font-bold">No bookings found</h3>
          <p className="text-slate-500 mt-2">Start exploring properties and reserve your stay.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className={`bg-white rounded-3xl border transition-all duration-500 p-6 shadow-sm ${
                booking.unread_messages_count > 0 
                ? 'border-rose-500 shadow-xl shadow-rose-200/50 ring-2 ring-rose-500/20 bg-rose-50/10' 
                : 'border-slate-100'
              }`}>
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <img
                  src={booking.property_detail.image_file || booking.property_detail.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"}
                  className="w-full h-40 object-cover rounded-2xl"
                />
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold">{booking.property_detail.title}</h2>
                  <p className="text-slate-500 mt-1">{booking.property_detail.location}</p>
                  <p className="mt-3">Check In: <strong>{booking.check_in}</strong></p>
                  <p>Check Out: <strong>{booking.check_out}</strong></p>
                </div>
                <div>
                  <p className="text-slate-500">Total Amount</p>
                  <h3 className="text-3xl font-bold text-rose-500">₹{booking.total_price}</h3>
                  
                  <div className="flex flex-col gap-2 mt-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-center ${
                      booking.trip_status === 'Upcoming' ? 'bg-blue-100 text-blue-600' :
                      booking.trip_status === 'Staying' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                      booking.trip_status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {booking.trip_status}
                    </span>

                    {booking.status !== 'cancelled' && booking.trip_status !== 'Completed' && (
                      <button 
                        onClick={() => setActiveChatBooking(booking)}
                        className={`mt-2 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all w-full shadow-lg ${
                          booking.unread_messages_count > 0
                          ? 'bg-rose-600 text-white scale-105'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <MessageSquare size={14} />
                        {booking.unread_messages_count > 0 ? `Message Host (${booking.unread_messages_count} New)` : 'Message Host'}
                      </button>
                    )}

                    {booking.trip_status === 'Upcoming' && booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => cancelBooking(booking.id)}
                        className="mt-2 px-4 py-2 border-2 border-rose-500 text-rose-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all w-full"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default MyBookings;