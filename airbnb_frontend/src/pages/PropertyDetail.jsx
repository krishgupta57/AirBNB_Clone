import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";

function PropertyDetail() {
  const { id } = useParams();
  const user = getUser();

  const [property, setProperty] = useState(null);
  const [booking, setBooking] = useState({
    property: id,
    check_in: "",
    check_out: "",
  });
  const [review, setReview] = useState({
    property: id,
    rating: 5,
    comment: "",
  });

  const loadProperty = async () => {
    try {
      const res = await API.get(`properties/${id}/`);
      setProperty(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load property");
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const bookNow = async (e) => {
    e.preventDefault();
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      await API.post("bookings/", booking);
      toast.success("Booking successful");
      setBooking({ property: id, check_in: "", check_out: "" });
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Booking failed");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      await API.post("reviews/", review);
      toast.success("Review submitted");
      setReview({ property: id, rating: 5, comment: "" });
      loadProperty();
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Review failed");
    }
  };

  const addWishlist = async () => {
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      await API.post("wishlist/", { property: id });
      toast.success("Added to wishlist");
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Wishlist action failed");
    }
  };

  if (!property) {
    return <div className="container-custom py-20 text-center">Loading...</div>;
  }

  return (
    <div className="container-custom py-12">
      <img
        src={property.image_file || property.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"}
        className="w-full h-[450px] object-cover rounded-[2rem] shadow-lg"
      />

      <div className="grid lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h1 className="text-4xl font-bold">{property.title}</h1>
            <p className="text-slate-500 mt-2">{property.location}</p>
            <p className="mt-6 text-lg leading-8 text-slate-600">{property.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Bedrooms</p>
                <h3 className="text-xl font-bold mt-1">{property.bedrooms}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Bathrooms</p>
                <h3 className="text-xl font-bold mt-1">{property.bathrooms}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Guests</p>
                <h3 className="text-xl font-bold mt-1">{property.guests}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Rating</p>
                <h3 className="text-xl font-bold mt-1">{property.average_rating}</h3>
              </div>
            </div>

            <button
              onClick={addWishlist}
              className="mt-8 px-6 py-3 rounded-2xl bg-pink-500 text-white font-semibold"
            >
              Add to Wishlist
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mt-8">
            <h2 className="text-3xl font-bold mb-6">Guest Reviews</h2>

            {property.reviews?.length === 0 ? (
              <p className="text-slate-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl p-5">
                    <h3 className="font-bold">{item.user.username}</h3>
                    <p className="text-amber-500 mt-1">⭐ {item.rating}</p>
                    <p className="text-slate-600 mt-2">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mt-8">
            <h2 className="text-3xl font-bold mb-6">Add Review</h2>

            <form onSubmit={submitReview} className="space-y-4">
              <input
                type="number"
                min="1"
                max="5"
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              />

              <textarea
                rows="5"
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Write your review here..."
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              />

              <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold">
                Submit Review
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100 sticky top-24">
            <h2 className="text-3xl font-bold">₹{property.price_per_night}</h2>
            <p className="text-slate-500">per night</p>

            <form onSubmit={bookNow} className="space-y-4 mt-6">
              <div>
                <label className="block mb-2 font-medium">Check In</label>
                <input
                  type="date"
                  value={booking.check_in}
                  onChange={(e) => setBooking({ ...booking, check_in: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Check Out</label>
                <input
                  type="date"
                  value={booking.check_out}
                  onChange={(e) => setBooking({ ...booking, check_out: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3"
                  required
                />
              </div>

              <button className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-slate-900 text-white font-semibold transition">
                Reserve Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;