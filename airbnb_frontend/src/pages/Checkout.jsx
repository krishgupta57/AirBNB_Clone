import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import { getUser } from "../utils/auth";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreditCard, Calendar, Users, ShieldCheck, ChevronLeft } from "lucide-react";

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();

  const propertyId = searchParams.get("property");
  
  // States for dynamic dates
  const [checkIn, setCheckIn] = useState(searchParams.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("check_out") || "");
  const [bookedDates, setBookedDates] = useState([]);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, datesRes] = await Promise.all([
          API.get(`properties/${propertyId}/`),
          API.get(`properties/${propertyId}/booked_dates/`)
        ]);
        setProperty(propRes.data);
        if (datesRes.data) {
          const disabledDates = datesRes.data.map(dateStr => new Date(`${dateStr}T00:00:00`));
          setBookedDates(disabledDates);
        }
      } catch (error) {
        toast.error("Error loading booking details");
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchData();
  }, [propertyId]);

  if (loading) return <div className="container-custom py-20 text-center animate-pulse text-xl font-bold">Preparing your secure checkout...</div>;
  if (!property) return <div className="container-custom py-20 text-center text-red-500">Property not found.</div>;

  // Real-time calculations based on state
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return { nights: 0, roomRent: 0, gst: 0, total: 0 };
    
    const dateIn = new Date(checkIn);
    const dateOut = new Date(checkOut);
    const diffTime = dateOut - dateIn;
    const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const roomRent = property.price_per_night * nights;
    const gst = roomRent * 0.18;
    const platformFee = 60; // User requested platform fee
    const total = roomRent + gst + platformFee;
    
    return { nights, roomRent, gst, platformFee, total };
  };

  const { nights, roomRent, gst, platformFee, total } = calculateTotal();

  const handleBooking = async () => {
    if (!user) return toast.error("Please login first");
    if (nights <= 0) return toast.error("Please select valid dates");

    setProcessing(true);
    try {
      await API.post("bookings/", {
        property: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        total_price: total,
      });
      toast.success("Booking confirmed successfully!");
      navigate("/my-bookings");
    } catch (error) {
      const msg = error.response?.data?.[0] || error.response?.data?.non_field_errors?.[0] || "Booking failed";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-8 font-medium">
          <ChevronLeft size={20} />
          Back to stay details
        </button>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-10 tracking-tight">Confirm and pay</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Editable Trip Details */}
          <div className="space-y-10">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-primary">Your trip</h2>
              
              <div className="space-y-6">
                {/* Check In Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">Check-in</p>
                    <p className="text-sm text-slate-500">Choose your start date</p>
                  </div>
                  <div className="w-full sm:w-48">
                    <DatePicker 
                      selected={checkIn ? new Date(`${checkIn}T00:00:00`) : null}
                      onChange={(date) => {
                        if (date) {
                          const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                          setCheckIn(localDate);
                        }
                      }}
                      excludeDates={bookedDates}
                      minDate={new Date()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 outline-none focus:border-rose-500 transition"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>

                {/* Check Out Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">Check-out</p>
                    <p className="text-sm text-slate-500">Choose your end date</p>
                  </div>
                  <div className="w-full sm:w-48">
                    <DatePicker 
                      selected={checkOut ? new Date(`${checkOut}T00:00:00`) : null}
                      onChange={(date) => {
                        if (date) {
                          const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                          setCheckOut(localDate);
                        }
                      }}
                      excludeDates={bookedDates}
                      minDate={checkIn ? new Date(`${checkIn}T00:00:00`) : new Date()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 outline-none focus:border-rose-500 transition"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-rose-50/50 p-4 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-800">Guests</p>
                    <p className="text-sm text-slate-500">Max {property.guests} guests allowed</p>
                  </div>
                  <Users className="text-rose-500" size={24} />
                </div>
              </div>
            </section>

            {/* Payment & Security (SaaS Styling) */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 font-primary">Payment method</h2>
                <CreditCard className="text-slate-400" />
              </div>
              <div className="p-6 border-2 border-slate-100 bg-slate-50 rounded-2xl flex items-center gap-4 group hover:border-rose-200 transition">
                <div className="bg-white p-3 rounded-xl shadow-sm group-hover:bg-rose-50 transition">
                  <CreditCard className="text-rose-500" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Credit or Debit Card</p>
                  <p className="text-xs text-slate-500">Payment processed securely via Stripe</p>
                </div>
              </div>
            </section>

            <div className="flex items-start gap-5 p-8 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-200">
              <ShieldCheck className="text-rose-400 flex-shrink-0" size={40} />
              <div>
                <p className="font-bold text-xl uppercase tracking-tighter italic">AirBNB Cover</p>
                <p className="text-slate-400 leading-relaxed mt-1">Your trip includes complete cancellation protection and 24/7 global customer support for total peace of mind.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Price Details */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
              <div className="p-8 flex gap-5 border-b border-slate-50 bg-slate-50/30">
                <img 
                  src={property.image_file || property.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"} 
                  className="w-24 h-24 object-cover rounded-2xl shadow-md" alt="" 
                />
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{property.property_type}</p>
                  <h3 className="font-bold text-slate-800 leading-tight text-lg">{property.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">⭐ {property.average_rating}</p>
                </div>
              </div>

              <div className="p-10 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Price Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span className="underline underline-offset-4 decoration-slate-100 italic">₹{property.price_per_night} x {nights} nights</span>
                    <span className="text-slate-900 font-bold">₹{roomRent.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1">GST (18%)</span>
                    <span className="text-slate-900 font-bold">₹{gst.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1">Platform fee</span>
                    <span className="text-slate-900 font-bold">₹{platformFee}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-1">INR</p>
                </div>
              </div>

              <div className="p-8 pt-0">
                <button 
                  onClick={handleBooking}
                  disabled={processing || nights <= 0}
                  className={`w-full py-5 rounded-2xl bg-rose-500 text-white font-black text-xl hover:bg-slate-900 transition-all shadow-xl shadow-rose-200 transform active:scale-95 ${processing || nights <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  {processing ? 'Processing...' : 'Confirm and pay'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure SSL Connection Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
