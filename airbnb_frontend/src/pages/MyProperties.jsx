import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function MyProperties() {
  const [properties, setProperties] = useState([]);

  const loadProperties = async () => {
    try {
      const res = await API.get("properties/my/");
      setProperties(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const deleteProperty = async (id) => {
    try {
      await API.delete(`properties/${id}/`);
      toast.success("Property deleted");
      loadProperties();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">My Properties</h1>
          <p className="text-slate-500 mt-2">Manage, edit, and organize your property listings.</p>
        </div>

        <Link
          to="/add-property"
          className="px-6 py-3 rounded-2xl bg-slate-900 text-white hover:bg-rose-500 transition font-semibold"
        >
          + Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
          <h3 className="text-2xl font-bold">No properties yet</h3>
          <p className="text-slate-500 mt-2">Add your first property to start hosting.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <img
                src={property.image || "https://via.placeholder.com/600x400"}
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h3 className="text-2xl font-bold">{property.title}</h3>
                <p className="text-slate-500 mt-1">{property.location}</p>
                <p className="text-rose-500 font-semibold mt-3">₹{property.price_per_night}/night</p>

                <div className="flex gap-3 mt-5">
                  <Link
                    to={`/edit-property/${property.id}`}
                    className="flex-1 text-center px-4 py-3 rounded-xl bg-blue-500 text-white font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProperty(property.id)}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;