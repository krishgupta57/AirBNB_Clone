import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { CreditCard, ChevronLeft, ShieldCheck, Zap, Star, Crown, Wallet as WalletIcon, ArrowRight, Info } from "lucide-react";

function SubscriptionCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("plan");

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [downgradeAction, setDowngradeAction] = useState("credit"); // 'credit' or 'refund'

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
  let netToPay = isDowngrade ? 0 : adjustment;
  let balanceUsed = 0;

  if (!isDowngrade && walletBalance > 0) {
    balanceUsed = Math.min(walletBalance, netToPay);
    netToPay -= balanceUsed;
  }

  const gst = netToPay * 0.18;
  const total = netToPay + gst;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const payload = {
        plan: planId,
        amount: isDowngrade ? adjustment : netToPay, // Adjustment is negative for downgrades
        action: isDowngrade ? downgradeAction : "purchase",
        balance_used: balanceUsed
      };

      const res = await API.post("subscription/", payload);
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.subscription_tier = planId;
      userData.wallet_balance = res.data.balance;
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success(res.data.message || "Subscription updated!");
      navigate("/host-dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Transaction failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-8 font-black text-[10px] tracking-[0.2em] uppercase">
          <ChevronLeft size={16} />
          Back to Plans
        </button>

        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Review Adjustment</h1>
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
              <>
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Payment Method</h2>
                  <div className="p-6 border-2 border-rose-100 bg-rose-50/20 rounded-[2rem] flex items-center gap-4 mb-6">
                    <div className="bg-white p-4 rounded-3xl shadow-sm">
                      <CreditCard className="text-rose-500" size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 uppercase tracking-tighter">Mock Secured Card</p>
                      <p className="text-xs text-rose-600 font-bold uppercase tracking-[0.2em] mt-0.5">Instant Processor</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <input placeholder="Cardholder Name" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition" />
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="MM/YY" className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition" />
                      <input placeholder="CVV" className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition" />
                    </div>
                  </div>
                </section>

                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex gap-6 items-center">
                  <div className="p-4 bg-white/10 rounded-3xl flex-shrink-0">
                    <ShieldCheck className="text-emerald-400" size={32} />
                  </div>
                  <div>
                    <p className="font-black text-lg mb-1 tracking-tight">Financial Shield Active</p>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">Proration logic ensures you never pay for the same day twice. Only the usage difference is billed.</p>
                  </div>
                </div>
              </>
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
                  <span>Usage Credit</span>
                  <span className="text-emerald-600 tracking-tight">- ₹{quote.current_credit}</span>
                </div>
                
                {balanceUsed > 0 && (
                  <div className="flex justify-between text-rose-500 font-black text-xs uppercase tracking-widest pt-2 border-t border-slate-50">
                    <span>Wallet Applied</span>
                    <span className="tracking-tight">- ₹{balanceUsed.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>GST (18%)</span>
                  <span className="text-slate-900 tracking-tight">₹{gst.toFixed(2)}</span>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Amount</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{Math.max(0, total).toFixed(2)}</span>
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
                  {processing ? 'Processing...' : (isDowngrade ? 'CONFIRM DOWNGRADE' : 'UPGRADE PLAN')}
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
