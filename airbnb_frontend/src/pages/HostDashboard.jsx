import { useEffect, useState } from "react";
import API from "../api";
import DashboardStat from "../components/DashboardStat";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const loadData = async () => {
    try {
      const [propRes, analyticsRes] = await Promise.all([
        API.get("properties/my/"),
        API.get("properties/analytics/")
      ]);
      setProperties(propRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProperties = properties.length;
  const totalGuestsCapacity = properties.reduce(
    (sum, item) => sum + Number(item.guests),
    0
  );

  return (
    <div className="container-custom py-12">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-[2rem] text-white p-10 mb-10">
        <h1 className="text-4xl font-bold">Host Dashboard</h1>
        <p className="text-slate-300 mt-3">
          Manage your listings, review your hosting portfolio, and track your business analytics.
        </p>
      </div>

      {analytics && (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <DashboardStat title="Total Earnings" value={`₹${analytics.total_revenue.toLocaleString()}`} hint="From all confirmed bookings" />
            <DashboardStat title="Total Bookings" value={analytics.total_bookings} hint="Confirmed & pending" />
            <DashboardStat title="Cancellations" value={analytics.cancelled_bookings} hint="Total cancelled orders" />
            <DashboardStat title="Active Listings" value={totalProperties} hint={`Capacity: ${totalGuestsCapacity} guests`} />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-10">
            <h2 className="text-2xl font-bold mb-6">Revenue Overview</h2>
            <div className="h-[300px] w-full">
              {analytics.chart_data && analytics.chart_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="revenue" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <p>Not enough data to display revenue chart yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <h2 className="text-3xl font-bold">Recent Listings</h2>
        <Link
          to="/add-property"
          className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-semibold"
        >
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100">
          <h3 className="text-2xl font-bold">No listings available</h3>
          <p className="text-slate-500 mt-2">
            Start by adding your first property to the platform.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {properties.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <img
                src={item.image_file || item.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"}
                className="w-full h-56 object-cover"
              />
              <div className="p-5">
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-slate-500 mt-1">{item.location}</p>
                <p className="text-rose-500 font-semibold mt-3">₹{item.price_per_night}/night</p>

                <div className="flex gap-3 mt-5">
                  <Link
                    to={`/property/${item.id}`}
                    className="flex-1 text-center py-3 rounded-xl bg-slate-900 text-white"
                  >
                    View
                  </Link>
                  <Link
                    to={`/edit-property/${item.id}`}
                    className="flex-1 text-center py-3 rounded-xl bg-blue-500 text-white"
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