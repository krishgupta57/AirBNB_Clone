import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

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
            <div key={booking.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
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
                  <p className={`mt-2 text-sm font-medium capitalize ${booking.status === 'cancelled' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {booking.status}
                  </p>
                  
                  {booking.status !== 'cancelled' && (
                    <button 
                      onClick={() => cancelBooking(booking.id)}
                      className="mt-4 px-4 py-2 border border-rose-500 text-rose-500 text-sm font-semibold rounded-xl hover:bg-rose-50 transition w-full"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;