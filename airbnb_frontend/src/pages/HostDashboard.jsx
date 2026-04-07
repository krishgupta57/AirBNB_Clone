import { useEffect, useState } from "react";
import API from "../api";
import DashboardStat from "../components/DashboardStat";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function HostDashboard() {
  const [properties, setProperties] = useState([]);

  const loadData = async () => {
    try {
      const res = await API.get("properties/my/");
      setProperties(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProperties = properties.length;
  const averagePrice =
    totalProperties > 0
      ? Math.round(
          properties.reduce((sum, item) => sum + Number(item.price_per_night), 0) /
            totalProperties
        )
      : 0;

  const totalGuestsCapacity = properties.reduce(
    (sum, item) => sum + Number(item.guests),
    0
  );

  return (
    <div className="container-custom py-12">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-[2rem] text-white p-10 mb-10">
        <h1 className="text-4xl font-bold">Host Dashboard</h1>
        <p className="text-slate-300 mt-3">
          Manage your listings, review your hosting portfolio, and keep your properties updated.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <DashboardStat title="Total Properties" value={totalProperties} hint="Active listings under your account" />
        <DashboardStat title="Average Price" value={`₹${averagePrice}`} hint="Average nightly price across listings" />
        <DashboardStat title="Guest Capacity" value={totalGuestsCapacity} hint="Combined guests your listings can host" />
      </div>

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