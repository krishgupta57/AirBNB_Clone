import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { CreditCard, ChevronLeft, ShieldCheck, Zap, Star, Crown, Wallet as WalletIcon, ArrowRight, Info, CheckCircle2, Lock } from "lucide-react";


function SubscriptionCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("plan");

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [downgradeAction, setDowngradeAction] = useState("credit"); // 'credit' or 'refund'
  const [selectedMethod, setSelectedMethod] = useState("upi");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await API.post("subscription/quote/", { plan: planId });
        setQuote(res.data);
      } catch (error) {
        toast.error("Failed to calculate proration");
        navigate("/pricing");
      } finally {
        setLoading(false);
      }
    };
    if (planId) fetchQuote();
  }, [planId, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Calculating your plan adjustment...</div>;
  if (!quote) return null;

  const adjustment = parseFloat(quote.total_adjustment);
  const isDowngrade = adjustment < 0;
  const walletBalance = parseFloat(quote.wallet_balance);
  
  // Logic for final amount to pay
  const basePrice = isDowngrade ? 0 : adjustment;
  const gstOnBase = basePrice * 0.18;
  const totalBeforeWallet = basePrice + gstOnBase;
  
  let netToPay = totalBeforeWallet;
  let balanceUsed = 0;

  if (!isDowngrade && walletBalance > 0) {
    balanceUsed = Math.min(walletBalance, totalBeforeWallet);
    netToPay = totalBeforeWallet - balanceUsed;
  }

  const finalTotal = netToPay;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      if (isDowngrade || finalTotal <= 0) {
        const payload = {
          plan: planId,
          amount: isDowngrade ? adjustment : 0,
          action: isDowngrade ? downgradeAction : "purchase",
          balance_used: balanceUsed
        };
        const res = await API.post("subscription/", payload);
        updateUserLocal(res.data);
        toast.success(res.data.message || "Plan updated!");
        navigate("/host-dashboard");
        return;
      }

      // 1. Create real Razorpay order
      const orderRes = await API.post("payments/create-order/", { amount: finalTotal });
      const { order_id, key_id, amount: orderAmount } = orderRes.data;

      // 2. Configure real Razorpay
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: "INR",
        name: "AirBNB Clone",
        description: `Upgrade to ${planId} plan`,
        order_id: order_id,
        handler: async (response) => {
          await verifyPayment(response, finalTotal, planId, balanceUsed);
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user") || "{}").username || "",
          email: JSON.parse(localStorage.getItem("user") || "{}").email || "",
          method: selectedMethod, // Pre-select the method in Razorpay
        },
        theme: { color: "#F43F5E" },
      };

      if (key_id === 'rzp_test_placeholder') {
        toast.error("Invalid Razorpay Key! Please add real keys to .env file.");
        setProcessing(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error(error.response?.data?.error || "Transaction failed");
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async (response, amount, plan, balanceUsed) => {
    try {
      const verifyRes = await API.post("payments/verify/", {
        ...response,
        amount,
        type: 'subscription',
        plan: plan,
        balance_used: balanceUsed
      });
      updateUserLocal(verifyRes.data);
      toast.success(verifyRes.data.message);
      navigate("/host-dashboard");
    } catch (err) {
      toast.error("Payment verification failed");
    }
  };

  const updateUserLocal = (data) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    userData.subscription_tier = data.tier;
    userData.role = data.role;
    userData.wallet_balance = data.balance;
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-8 font-black text-[10px] tracking-[0.2em] uppercase">
          <ChevronLeft size={16} />
          Back to Plans
        </button>

        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Checkout</h1>
        <p className="text-slate-500 font-medium mb-10 uppercase text-xs tracking-widest">{quote.current_plan} <ArrowRight className="inline mx-2" size={14} /> {quote.new_plan}</p>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            {isDowngrade ? (
              <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 ring-4 ring-rose-500/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-rose-500/10 p-4 rounded-3xl">
                    <Zap className="text-rose-500" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Plan Downgrade</h2>
                    <p className="text-slate-500 text-sm font-medium">You have ₹{Math.abs(adjustment)} credit remaining.</p>
                  </div>
                </div>

                <p className="text-slate-600 font-medium leading-relaxed mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  How would you like to handle your remaining balance from the {quote.current_plan} plan?
                </p>

                <div className="grid gap-4">
                  <button 
                    onClick={() => setDowngradeAction("credit")}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${downgradeAction === 'credit' ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-3 rounded-2xl ${downgradeAction === 'credit' ? 'bg-rose-500 text-white' : 'bg-white text-slate-400'}`}>
                        <WalletIcon size={20} />
                      </div>
                      <div>
                        <p className={`font-black uppercase tracking-widest text-[10px] mb-0.5 ${downgradeAction === 'credit' ? 'text-rose-600' : 'text-slate-400'}`}>Option A</p>
                        <p className="font-bold text-slate-800">Add to Wallet</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Apply to future upgrades or renewals</p>
                      </div>
                    </div>
                    {downgradeAction === 'credit' && <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center"><Zap size={12} fill="white" className="text-white" /></div>}
                  </button>

                  <button 
                    onClick={() => setDowngradeAction("refund")}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${downgradeAction === 'refund' ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-3 rounded-2xl ${downgradeAction === 'refund' ? 'bg-rose-500 text-white' : 'bg-white text-slate-400'}`}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className={`font-black uppercase tracking-widest text-[10px] mb-0.5 ${downgradeAction === 'refund' ? 'text-rose-600' : 'text-slate-400'}`}>Option B</p>
                        <p className="font-bold text-slate-800">Request Refund</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Return to original payment method (Simulated)</p>
                      </div>
                    </div>
                    {downgradeAction === 'refund' && <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center"><Zap size={12} fill="white" className="text-white" /></div>}
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Select Payment Method</h2>
                
                <div className="grid gap-4">
                  {[
                    { id: 'upi', name: 'UPI / QR', icon: <Zap size={20} />, desc: 'Google Pay, PhonePe, etc.' },
                    { id: 'card', name: 'Cards', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard, RuPay' },
                    { id: 'netbanking', name: 'Netbanking', icon: <ShieldCheck size={20} />, desc: 'All Indian Banks' },
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${selectedMethod === method.id ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`p-3 rounded-2xl ${selectedMethod === method.id ? 'bg-rose-500 text-white' : 'bg-white text-slate-400'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{method.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1.5">{method.desc}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center animate-in zoom-in duration-200"><CheckCircle2 size={12} className="text-white" /></div>}
                    </button>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                   <Lock size={20} className="text-slate-400" />
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">Your payment is secured by Razorpay. We do not store your card or bank details.</p>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-32 transition-all">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col items-center text-center">
                <div className="p-6 bg-white rounded-[2rem] shadow-xl mb-6 scale-110">
                  {planId === 'ultimate' ? <Crown className="text-rose-500" size={32} /> : 
                   planId === 'premium' ? <Star className="text-amber-500" size={32} /> : <Zap className="text-blue-500" size={32} />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{planId} Adjustment</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{quote.days_remaining} Days remaining in cycle</p>
              </div>

              <div className="p-10 space-y-5">
                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>Prorated Cost</span>
                  <span className="text-slate-900 tracking-tight">₹{quote.new_cost_remaining}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>GST (18%)</span>
                  <span className="text-slate-900 tracking-tight">₹{gstOnBase.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Credit</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Available: ₹{walletBalance.toFixed(2)}</span>
                  </div>
                  
                  {balanceUsed > 0 && (
                    <div className="flex justify-between text-emerald-600 font-black text-xs uppercase tracking-widest">
                      <span>Applied to bill</span>
                      <span className="tracking-tight">- ₹{balanceUsed.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Amount</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{Math.max(0, finalTotal).toFixed(2)}</span>
                  </div>
                </div>

                {isDowngrade && (
                  <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex items-start gap-3">
                    <Info className="text-emerald-500 mt-1" size={16} />
                    <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                      This change will release ₹{Math.abs(adjustment)} credit. No payment required today.
                    </p>
                  </div>
                )}

                <button 
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full py-6 rounded-3xl bg-slate-900 text-white font-black text-lg uppercase tracking-widest mt-6 hover:bg-rose-500 transition-all shadow-2xl shadow-slate-200 active:scale-95 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Processing...' : (isDowngrade ? 'CONFIRM DOWNGRADE' : 'PAY & UPGRADE')}
                </button>
                <div className="flex items-center justify-center gap-2 mt-6">
                   <ShieldCheck size={14} className="text-slate-400" />
                   <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Secure Prorated Transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCheckout;
