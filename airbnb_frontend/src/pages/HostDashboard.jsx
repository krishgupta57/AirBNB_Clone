import { useEffect, useState } from "react";
import API from "../api";
import DashboardStat from "../components/DashboardStat";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap, Crown, EyeOff, Plus, Wallet as WalletIcon, ArrowUpRight } from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);

  const loadData = async () => {
    try {
      const [propRes, analyticsRes, profileRes] = await Promise.all([
        API.get("properties/my/"),
        API.get("properties/analytics/"),
        API.get("profile/")
      ]);
      setProperties(propRes.data);
      setAnalytics(analyticsRes.data);
      setUser(profileRes.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProperties = properties.length;
  const activeCount = properties.filter(p => p.is_active).length;
  
  const limits = { trial: 2, standard: 10, premium: 50, ultimate: 1000 };
  const currentLimit = user ? limits[user.subscription_tier] : 2;
  const usagePercent = Math.min(100, (activeCount / currentLimit) * 100);

  const totalGuestsCapacity = properties.reduce(
    (sum, item) => sum + Number(item.guests),
    0
  );

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="bg-slate-900 rounded-[2.5rem] text-white p-8 md:p-12 mb-10 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-rose-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                Host Account
              </span>
              <span className="bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/10">
                <Crown size={12} className="text-amber-400" />
                {user?.subscription_tier} Plan
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your Business At A Glance</h1>
            <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-md">
              Monitor your property performance, revenue growth, and subscription status in one professional command center.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 font-bold">Listing Usage</p>
                <h3 className="text-3xl font-black">{activeCount} / {currentLimit === 1000 ? '∞' : currentLimit}</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link to="/pricing" className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition flex items-center gap-2">
                  <Zap size={12} fill="currentColor" />
                  Upgrade
                </Link>
                <Link to="/wallet" className="text-slate-400 hover:text-white transition text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <WalletIcon size={12} />
                  Wallet: ₹{parseFloat(user?.wallet_balance || 0).toLocaleString()}
                </Link>
              </div>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${usagePercent > 90 ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold text-slate-500">{currentLimit - activeCount} spots remaining in your current plan</p>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <DashboardStat title="Total Earnings" value={`₹${analytics.total_revenue.toLocaleString()}`} hint="Confirmed revenue" />
            <DashboardStat title="Total Bookings" value={analytics.total_bookings} hint="History" />
            <DashboardStat title="Active Listings" value={activeCount} hint={`${totalProperties - activeCount} hidden`} />
            <DashboardStat title="Capacity" value={totalGuestsCapacity} hint="Max guests" />
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all shadow-sm">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Balance</p>
                <div>
                    <p className="text-2xl font-black text-slate-900">₹{parseFloat(user?.wallet_balance || 0).toLocaleString()}</p>
                    <Link to="/wallet" className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 hover:text-slate-900 transition flex items-center gap-1">
                        Go to Wallet <ArrowUpRight size={10} />
                    </Link>
                </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 mb-10 w-full overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Analytics</h2>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth per month</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              {analytics.chart_data && analytics.chart_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 'bold', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 'bold', fontSize: 10}} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}} />
                    <Bar dataKey="revenue" fill="#F43F5E" radius={[10, 10, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-50 rounded-3xl">
                  Not enough booking data to display chart.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Portfolio</h2>
          <p className="text-slate-500 font-medium">Manage and optimize your active properties.</p>
        </div>
        <Link
          to="/add-property"
          className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-slate-900 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-100 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Plus size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No properties yet</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            Ready to become a host? Create your first listing and start earning today.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {properties.map((item) => (
            <div key={item.id} className={`bg-white rounded-[2.5rem] border-2 transition-all group relative ${!item.is_active ? 'border-slate-100 grayscale opacity-80' : 'border-slate-50 hover:border-rose-100 hover:shadow-2xl'}`}>
              <div className="relative">
                <img
                  src={item.image_file || item.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"}
                  className="w-full h-64 object-cover"
                />
                {!item.is_active && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 text-center">
                    <EyeOff size={40} className="mb-3 text-rose-500" />
                    <p className="font-black text-sm uppercase tracking-widest mb-1">Hidden Listing</p>
                    <p className="text-xs text-slate-300 font-medium">Upgrade to active this property.</p>
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{item.title}</h3>
                  <p className="text-sm font-black text-rose-500">₹{item.price_per_night}</p>
                </div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">{item.location}</p>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to={`/property/${item.id}`}
                    className="py-4 rounded-2xl bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-rose-500 hover:text-white transition-all text-center"
                  >
                    View
                  </Link>
                  <Link
                    to={`/edit-property/${item.id}`}
                    className="py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all text-center"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HostDashboard;