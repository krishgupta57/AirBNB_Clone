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
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
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

  const listingChartData = [
    { name: "Active", count: stats.listings.active },
    { name: "Inactive", count: stats.listings.inactive },
  ];

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-rose-500" size={32} />
            Command Center
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Platform Overview & Analytics</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">System Live</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Booking Revenue" 
          value={`₹${parseFloat(stats.financials.total_booking_revenue).toLocaleString()}`}
          icon={<DollarSign className="text-emerald-600" />}
          color="bg-emerald-50"
          trend="+12% vs last month"
        />
        <StatCard 
          title="Platform Fee Income" 
          value={`₹${parseFloat(stats.financials.platform_fee_income).toLocaleString()}`}
          icon={<TrendingUp className="text-blue-600" />}
          color="bg-blue-50"
          subValue="10% Commission"
        />
        <StatCard 
          title="Subscription Revenue" 
          value={`₹${parseFloat(stats.financials.subscription_revenue).toLocaleString()}`}
          icon={<CreditCard className="text-purple-600" />}
          color="bg-purple-50"
          trend="Plan Upgrades"
        />
        <StatCard 
          title="Total Users" 
          value={stats.users.total_users}
          icon={<Users className="text-rose-600" />}
          color="bg-rose-50"
          subValue={`${stats.users.total_hosts} Hosts / ${stats.users.total_guests} Guests`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* User Distribution Chart */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
          <h3 className="text-xl font-black mb-6 text-slate-800">User Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userChartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
               <div key={item.name} className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-sm font-bold text-slate-500">{item.name}</span>
                 </div>
                 <span className="font-black text-slate-800">{item.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Listing Status Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800">Listing Inventory</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                 <span className="text-xs font-bold text-slate-400">Total: {stats.listings.total}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={listingChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-rose-500" />
              Recent Bookings
            </h3>
            <Link to="/admin/all-data" className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-slate-900 transition underline underline-offset-4 decoration-rose-500/20">View All</Link>
          </div>
          <div className="space-y-6">
            {stats.recent_activity.bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition cursor-default">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                      <img src={booking.property_detail.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=100"} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900 text-sm truncate w-40">{booking.property_detail.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{booking.user.username}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-slate-900 text-sm">₹{parseFloat(booking.total_price).toLocaleString()}</p>
                   <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Confirmed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newest Listings */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Home size={20} className="text-rose-500" />
              New Listings
            </h3>
            <Link to="/admin/all-data" className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-slate-900 transition underline underline-offset-4 decoration-rose-500/20">Manage</Link>
          </div>
          <div className="space-y-6">
            {stats.recent_activity.properties.map((prop) => (
              <div key={prop.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition cursor-default">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
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
