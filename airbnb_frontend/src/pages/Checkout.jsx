import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import { getUser } from "../utils/auth";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreditCard, Calendar, Users, ShieldCheck, ChevronLeft, Zap, CheckCircle2, Lock } from "lucide-react";

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
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, datesRes, userRes] = await Promise.all([
          API.get(`properties/${propertyId}/`),
          API.get(`properties/${propertyId}/booked_dates/`),
          API.get("profile/")
        ]);
        setProperty(propRes.data);
        setWalletBalance(parseFloat(userRes.data.wallet_balance || 0));
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
    if (!checkIn || !checkOut) return { nights: 0, roomRent: 0, gst: 0, total: 0, balanceUsed: 0, finalTotal: 0 };
    
    const dateIn = new Date(checkIn);
    const dateOut = new Date(checkOut);
    const diffTime = dateOut - dateIn;
    const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const roomRent = property.price_per_night * nights;
    const gst = roomRent * 0.18;
    const platformFee = 60; 
    const total = roomRent + gst + platformFee;
    
    let balanceUsed = 0;
    if (useWallet && walletBalance > 0) {
      balanceUsed = Math.min(walletBalance, total);
    }
    const finalTotal = total - balanceUsed;
    
    return { nights, roomRent, gst, platformFee, total, balanceUsed, finalTotal };
  };

  const { nights, roomRent, gst, platformFee, total, balanceUsed, finalTotal } = calculateTotal();

  const handleBooking = async () => {
    if (!user) return toast.error("Please login first");
    if (nights <= 0) return toast.error("Please select valid dates");

    setProcessing(true);
    try {
      // 1. Create a PENDING booking first
      const bookingRes = await API.post("bookings/", {
        property: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        total_price: total,
      });
      const bookingId = bookingRes.data.id;

      // Special Case: Fully paid by wallet
      if (finalTotal <= 0) {
        await verifyBookingPayment({ razorpay_order_id: 'order_wallet_only' }, total, bookingId, balanceUsed);
        return;
      }

      // 2. Create Razorpay Order
      const orderRes = await API.post("payments/create-order/", { amount: finalTotal });
      const { order_id, key_id, amount: orderAmount } = orderRes.data;

      // 3. Configure Razorpay Modal
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: "INR",
        name: "AirBNB Clone",
        description: `Booking for ${property.title}`,
        order_id: order_id,
        handler: async (response) => {
          await verifyBookingPayment(response, finalTotal, bookingId, balanceUsed);
        },
        prefill: {
          name: user.username || "",
          email: user.email || "",
          method: selectedMethod,
        },
        theme: { color: "#F43F5E" },
      };

      if (key_id === 'rzp_test_placeholder') {
        toast.error("Invalid Razorpay Configuration! Using Mock Verification.");
        await verifyBookingPayment({ razorpay_order_id: 'order_mock_123' }, finalTotal, bookingId, balanceUsed);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.[0] || "Booking failed";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const verifyBookingPayment = async (response, amount, bookingId, balanceUsed) => {
    try {
      await API.post("payments/verify/", {
        ...response,
        amount,
        type: 'booking',
        booking_id: bookingId,
        balance_used: balanceUsed
      });
      toast.success("Booking confirmed successfully!");
      navigate("/my-bookings");
    } catch (err) {
      toast.error("Payment verification failed. Please contact support.");
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
              {walletBalance > 0 && (
                <div className="mb-8 p-6 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className="text-rose-400 fill-rose-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Available Balance</p>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter">₹{walletBalance.toLocaleString()}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-3 relative z-10">
                    <button 
                      onClick={() => setUseWallet(!useWallet)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${useWallet ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-white text-slate-900 shadow-white/10'}`}
                    >
                      {useWallet ? 'Applied ✓' : 'Apply to Stay'}
                    </button>
                    <p className="text-[10px] font-medium text-slate-400">Deduct from total</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 font-primary">Select Payment Method</h2>
                <ShieldCheck className="text-rose-500" />
              </div>
              
              <div className="grid gap-4">
                {[
                  { id: 'upi', name: 'UPI / QR', icon: <Zap size={20} />, desc: 'Google Pay, PhonePe, WhatsApp' },
                  { id: 'card', name: 'Debit/Credit Card', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard, RuPay, Amex' },
                  { id: 'netbanking', name: 'Netbanking', icon: <ShieldCheck size={20} />, desc: 'All Indian Banks' },
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${selectedMethod === method.id ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedMethod === method.id ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{method.name}</p>
                        <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{method.desc}</p>
                      </div>
                    </div>
                    {selectedMethod === method.id && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center animate-in zoom-in duration-200"><CheckCircle2 size={10} className="text-white" /></div>}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                 <Lock size={18} className="text-slate-400" />
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">
                   Payment secured by Razorpay. Your details are never stored on our servers.
                 </p>
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

                  {balanceUsed > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold bg-rose-50/50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-top-2 duration-300">
                      <span className="flex items-center gap-1 italic">Wallet Credit</span>
                      <span>-₹{balanceUsed.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{finalTotal > 0 ? 'Remaining to Pay' : 'Grand Total'}</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{finalTotal.toLocaleString()}</span>
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
