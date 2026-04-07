import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function Wishlist() {
  const [items, setItems] = useState([]);

  const loadWishlist = async () => {
    try {
      const res = await API.get("wishlist/");
      setItems(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load wishlist");
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (propertyId) => {
    try {
      await API.delete("wishlist/", {
        data: { property: propertyId },
      });
      toast.success("Removed from wishlist");
      loadWishlist();
    } catch (error) {
      console.log(error);
      toast.error("Remove failed");
    }
  };

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-2">Wishlist</h1>
      <p className="text-slate-500 mb-8">Your saved properties for future booking.</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center">
          <h3 className="text-2xl font-bold">Your wishlist is empty</h3>
          <p className="text-slate-500 mt-2">Save your favorite stays here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <img
                src={item.property_detail.image || "https://via.placeholder.com/600x400"}
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h3 className="text-2xl font-bold">{item.property_detail.title}</h3>
                <p className="text-slate-500 mt-1">{item.property_detail.location}</p>
                <p className="text-rose-500 font-semibold mt-3">₹{item.property_detail.price_per_night}/night</p>

                <div className="flex gap-3 mt-5">
                  <Link
                    to={`/property/${item.property_detail.id}`}
                    className="flex-1 text-center py-3 rounded-xl bg-slate-900 text-white"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeItem(item.property_detail.id)}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white"
                  >
                    Remove
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

export default Wishlist;