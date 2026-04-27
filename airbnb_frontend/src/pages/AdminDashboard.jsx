import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("admin/stats/");
        setStats(res.data);
      } catch (err) {
        toast.error("Failed to load admin statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  if (!stats) return null;

  const userChartData = [
    { name: "Hosts", value: stats.users.total_hosts, color: "#f43f5e" },
    { name: "Guests", value: stats.users.total_guests, color: "#10b981" },
  ];

  // Revenue History Data
  const revenueHistory = stats.financials.history || [];

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-rose-500" size={32} />
            Financial Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Revenue Analysis & Growth</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Revenue Live</span>
           </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Platform Revenue" 
          value={`₹${parseFloat(stats.financials.total_platform_revenue).toLocaleString()}`}
          icon={<DollarSign className="text-emerald-600" />}
          color="bg-emerald-50"
          trend="+15.4% Growth"
        />
        <StatCard 
          title="Commission Income" 
          value={`₹${parseFloat(stats.financials.platform_fee_income).toLocaleString()}`}
          icon={<TrendingUp className="text-blue-600" />}
          color="bg-blue-50"
          subValue="10% Booking Fee"
        />
        <StatCard 
          title="Subscription Revenue" 
          value={`₹${parseFloat(stats.financials.subscription_revenue).toLocaleString()}`}
          icon={<CreditCard className="text-purple-600" />}
          color="bg-purple-50"
          subValue="Tiered Plan Income"
        />
        <StatCard 
          title="Active Listings" 
          value={stats.listings.active}
          icon={<Home className="text-rose-600" />}
          color="bg-rose-50"
          subValue={`${stats.listings.maintenance} In Maintenance`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Revenue Performance</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 6 Months Trend</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Sub</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Comm</span>
               </div>
            </div>
          </div>
          
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '1.5rem'}}
                />
                <Area type="monotone" dataKey="subscriptions" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorSubs)" />
                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Pie */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col">
          <h3 className="text-xl font-black mb-2 text-slate-800">User Base</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Host vs Guest Ratio</p>
          
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userChartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4 mt-4">
             {userChartData.map(item => (
               <div key={item.name} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                 </div>
                 <span className="font-black text-slate-900">{item.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Financial Activity */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-rose-500" />
              Latest Bookings
            </h3>
            <Link to="/admin/all-data" className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-slate-900 transition underline underline-offset-4 decoration-rose-500/20">Audit Records</Link>
          </div>
          <div className="space-y-6">
            {stats.recent_activity.bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition cursor-default border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                      <img src={booking.property_detail.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=100"} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900 text-sm truncate w-40">{booking.property_detail.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Users size={10} /> {booking.user.username}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-slate-900 text-sm">₹{parseFloat(booking.total_price).toLocaleString()}</p>
                   <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Settled</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Inventory */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ArrowUpRight size={20} className="text-rose-500" />
              Inventory Growth
            </h3>
            <Link to="/admin/all-data" className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-slate-900 transition underline underline-offset-4 decoration-rose-500/20">Manage</Link>
          </div>
          <div className="space-y-6">
            {stats.recent_activity.properties.map((prop) => (
              <div key={prop.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition cursor-default border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                      <img src={prop.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=100"} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900 text-sm truncate w-40">{prop.title}</p>
                      <div className="flex items-center gap-1">
                         <MapPin size={10} className="text-slate-400" />
                         <p className="text-[10px] text-slate-400 font-bold">{prop.location}</p>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-slate-900 text-sm">₹{parseFloat(prop.price_per_night).toLocaleString()}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{prop.property_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subValue, trend }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 group hover:scale-[1.02] transition-all cursor-default">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 mb-2">{value}</h4>
      {subValue && <p className="text-xs font-bold text-slate-400">{subValue}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
           <Activity size={12} className="text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
