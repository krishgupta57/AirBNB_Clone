import { useState, useEffect } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Info, 
  ShieldCheck, 
  Zap, 
  Plus, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

function Wallet() {
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, txRes] = await Promise.all([
        API.get("profile/"),
        API.get("transactions/")
      ]);
      setBalance(profileRes.data.wallet_balance);
      
      const walletTxs = (txRes.data.wallet_transactions || []).map(t => ({ ...t, source: 'wallet' }));
      const subTxs = (txRes.data.subscription_transactions || []).map(t => ({ ...t, source: 'sub' }));
      const allTxs = [...walletTxs, ...subTxs].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setTransactions(allTxs);
    } catch (error) {
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount");
    setProcessing(true);
    try {
      // 1. Create order on backend
      const orderRes = await API.post("payments/create-order/", { amount });
      const { order_id, key_id, amount: orderAmount } = orderRes.data;

      // 2. Open Razorpay modal
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: "INR",
        name: "AirBNB Clone",
        description: "Wallet Top-up",
        order_id: order_id,
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            const verifyRes = await API.post("payments/verify/", {
              ...response,
              amount,
              type: 'topup'
            });
            toast.success(verifyRes.data.message);
            setBalance(verifyRes.data.balance);
            setShowTopup(false);
            setAmount("");
            fetchData();
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user") || "{}").username || "",
          email: JSON.parse(localStorage.getItem("user") || "{}").email || "",
        },
        theme: { color: "#F43F5E" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initiate payment");
    } finally {
      setProcessing(false);
    }
  };

  const [bankDetails, setBankDetails] = useState("");

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount");
    if (!bankDetails) return toast.error("Please enter bank details or UPI ID");
    
    setProcessing(true);
    try {
      const res = await API.post("wallet/withdraw/", { 
        amount, 
        bank_details: bankDetails 
      });
      toast.success(res.data.message);
      setBalance(res.data.balance);
      setShowWithdraw(false);
      setAmount("");
      setBankDetails("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading your vault...</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Balance Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="bg-white/10 p-4 rounded-3xl">
                    <WalletIcon size={32} className="text-rose-500" />
                  </div>
                  <ShieldCheck size={24} className="text-slate-500" />
                </div>
                
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Available Balance</p>
                <h2 className="text-5xl font-black tracking-tighter mb-10">₹{parseFloat(balance).toLocaleString()}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowTopup(true)}
                    className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    Add Money
                  </button>
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/10"
                  >
                    <ExternalLink size={14} />
                    Withdraw
                  </button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-1">Quick FAQ</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 h-fit bg-slate-50 rounded-lg text-slate-400"><Info size={16} /></div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">Where did this credit come from?</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Credits are generated when you downgrade a plan mid-cycle or through booking refunds.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 h-fit bg-slate-50 rounded-lg text-slate-400"><Info size={16} /></div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">Withdrawal Time</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Withdrawals to bank accounts usually take 2-3 business days to process.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50 min-h-[600px]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Statement</h2>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <Calendar size={14} />
                  <span>Activity Log</span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-200">
                    <ArrowUpRight size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No transactions yet</h3>
                  <p className="text-slate-500 mt-2 max-w-xs font-medium">Add funds or book a property to see your activity here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const isCredit = ['refund', 'credit', 'adjustment', 'topup'].includes(tx.transaction_type);
                    const status = tx.status || 'completed';
                    
                    return (
                      <div key={`${tx.source}-${tx.id}`} className="group p-6 rounded-3xl border border-slate-50 bg-slate-50/20 hover:bg-white hover:border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl flex-shrink-0 ${
                            tx.transaction_type === 'purchase' || tx.transaction_type === 'subscription' ? 'bg-slate-900 text-white' : 
                            isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className="font-extrabold text-slate-900 capitalize leading-none">{tx.transaction_type.replace('_', ' ')}</p>
                              {status === 'pending' && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                                  <Clock size={10} /> Pending
                                </span>
                              )}
                              {status === 'completed' && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={10} /> Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm">{tx.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <p className={`text-2xl font-black tracking-tight ${
                            isCredit ? 'text-emerald-500' : 'text-slate-900'
                          }`}>
                            {isCredit ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                          </p>
                          <div className="mt-1">
                            {tx.tier_to && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                {tx.tier_from} to {tx.tier_to}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      {showTopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Add Funds</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">Top-up your wallet instantly using your card.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount to Add</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-6 py-5 font-black text-xl outline-none focus:border-rose-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Method</span>
                  <span className="text-slate-900">Visa ending in 4242</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Fee</span>
                  <span className="text-emerald-500">₹0.00 (Waived)</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setShowTopup(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTopup}
                  disabled={processing}
                  className="flex-3 bg-slate-900 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Top-up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Withdraw Money</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">Funds will be sent to your linked bank account.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-6 py-5 font-black text-xl outline-none focus:border-rose-500 focus:bg-white transition"
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-widest">Max available: ₹{parseFloat(balance).toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination Account (Bank / UPI)</label>
                <input 
                  type="text" 
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="Account Number, IFSC or UPI ID" 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Method</span>
                  <span className="text-slate-900 italic">Manual Bank Transfer</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>ETA</span>
                  <span className="text-amber-500">2-3 Business Days</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWithdraw}
                  disabled={processing}
                  className="flex-3 bg-slate-900 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Request Payout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Wallet;
