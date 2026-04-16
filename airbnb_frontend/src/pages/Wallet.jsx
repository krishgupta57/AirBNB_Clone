import { useState, useEffect } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Calendar, Info, ShieldCheck, Zap } from "lucide-react";

function Wallet() {
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileRes, txRes] = await Promise.all([
        API.get("profile/"),
        API.get("transactions/")
      ]);
      setBalance(profileRes.data.wallet_balance);
      setTransactions(txRes.data);
    } catch (error) {
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Balance</p>
                <h2 className="text-5xl font-black tracking-tighter mb-8">₹{parseFloat(balance).toLocaleString()}</h2>
                
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                  <Zap size={18} className="text-amber-400" />
                  <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider">
                    Credits apply automatically to your next plan change.
                  </p>
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
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Credits are generated when you downgrade a plan mid-cycle or through administrative adjustments.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 h-fit bg-slate-50 rounded-lg text-slate-400"><Info size={16} /></div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">Can I withdraw to bank?</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Direct withdrawals are currently processed manually. Contact support for payout requests.</p>
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
                  <span>Last 30 Days</span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-200">
                    <ArrowUpRight size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No transactions recorded</h3>
                  <p className="text-slate-500 mt-2 max-w-xs font-medium">Any plan changes or wallet adjustments will appear here in detail.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="group p-6 rounded-3xl border border-slate-50 bg-slate-50/20 hover:bg-white hover:border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl flex-shrink-0 ${
                          tx.transaction_type === 'purchase' ? 'bg-slate-900 text-white' : 
                          tx.transaction_type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 
                          tx.transaction_type === 'refund' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {tx.transaction_type === 'purchase' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 capitalize leading-none mb-1.5">{tx.transaction_type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm">{tx.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className={`text-2xl font-black tracking-tight ${
                          tx.transaction_type === 'purchase' || tx.transaction_type === 'adjustment' ? 'text-slate-900' : 'text-emerald-500'
                        }`}>
                          {tx.transaction_type === 'purchase' || tx.transaction_type === 'adjustment' ? '-' : '+'}₹{parseFloat(tx.amount).toLocaleString()}
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
